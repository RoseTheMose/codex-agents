(() => {
  const $ = id => document.getElementById(id);
  const bankSelect = $('bank'), topicSelect = $('topic'), stage = $('stage');
  let bank, progress = {}, queue = [], index = 0, score = 0, gradedCount = 0;
  const node = (tag, value) => { const el = document.createElement(tag); if (value !== undefined) el.textContent = value; return el; };
  async function api(path, body) { const r = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
  function option(select, value, label) { const el = node('option', label); el.value = value; select.append(el); }
  function shuffle(items) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  async function chooseBank() {
    bank = await api(`/api/questions?bank=${encodeURIComponent(bankSelect.value)}`);
    progress = await api(`/api/progress?bank=${encodeURIComponent(bank.id)}`);
    topicSelect.replaceChildren(); option(topicSelect, '', 'All topics');
    for (const topic of [...new Set(bank.questions.map(q => q.topic).filter(Boolean))].sort()) option(topicSelect, topic, topic);
    $('summary').textContent = `${Object.keys(progress).length} of ${bank.questions.length} questions answered`;
    $('start').disabled = !bank.questions.length;
    stage.replaceChildren();
  }
  function start() {
    const mode = $('mode').value;
    queue = shuffle(bank.questions.filter(q => (!topicSelect.value || q.topic === topicSelect.value) && (mode === 'all' || (mode === 'new' && !progress[q.id]) || (mode === 'due' && progress[q.id]?.due <= Date.now()))));
    if ($('count').value !== 'all') queue = queue.slice(0, Number($('count').value));
    index = score = gradedCount = 0;
    render();
  }
  function render() {
    stage.replaceChildren();
    if (!queue.length) { stage.append(node('p', 'No questions match this selection.')); return; }
    if (index >= queue.length) { stage.append(node('h2', 'Complete'), node('p', `${score} correct of ${gradedCount} graded questions.`)); return; }
    const q = queue[index], attemptId = crypto.randomUUID();
    stage.append(node('small', `${index + 1} of ${queue.length} · ${q.topic || 'No topic'} · ${q.number ?? q.id}`));
    const heading = node('h2', q.text); heading.className = 'question'; stage.append(heading);
    const form = node('div');
    for (const [letter, text] of Object.entries(q.options)) { const label = node('label'); label.className = 'choice'; const input = node('input'); input.type = bank.multiSelect ? 'checkbox' : 'radio'; input.name = 'answer'; input.value = letter; label.append(input, node('strong', `${letter}.`), node('span', text)); form.append(label); }
    stage.append(form);
    const row = node('div'); row.className = 'action-row';
    const check = node('button', 'Check and save'); row.append(check); stage.append(row);
    const status = node('p'); status.setAttribute('role', 'status'); stage.append(status);
    check.addEventListener('click', async () => {
      const selected = [...form.querySelectorAll('input:checked')].map(x => x.value).sort();
      if (!selected.length) { status.textContent = 'Choose an answer first.'; return; }
      check.disabled = true; status.textContent = 'Saving…';
      let saved;
      try { saved = await api('/api/attempt', { attemptId, bank: bank.id, questionId: q.id, selected }); }
      catch { check.disabled = false; check.textContent = 'Retry save'; status.textContent = 'Answer was not saved. Check the server and retry.'; return; }
      if (saved.progress) progress[q.id] = saved.progress;
      if (saved.gradeable) { gradedCount++; if (saved.correct) score++; }
      for (const input of form.querySelectorAll('input')) input.disabled = true;
      check.remove(); status.textContent = 'Answer saved.';
      const feedback = node('div'); feedback.className = `feedback${saved.gradeable && !saved.correct ? ' bad' : ''}`;
      feedback.append(node('strong', saved.gradeable ? saved.correct ? 'Correct.' : 'Review this one.' : 'This question is ungraded.'));
      feedback.append(node('p', `Source key: ${saved.correctAnswers.length ? saved.correctAnswers.join(', ') : 'Unresolved'}`));
      if (saved.explanation) feedback.append(node('p', saved.explanation));
      if (saved.source?.url) { const link = node('a', saved.source.label || 'Open source'); link.href = saved.source.url; link.target = '_blank'; link.rel = 'noopener'; feedback.append(link); }
      stage.append(feedback);
      const comment = node('textarea'); comment.placeholder = 'What was confusing? Optional comment for the next lesson.'; stage.append(comment);
      const send = node('button', 'Save comment'); send.className = 'secondary'; stage.append(send);
      const feedbackId = crypto.randomUUID();
      send.addEventListener('click', async () => { if (!comment.value.trim()) return; send.disabled = true; try { await api('/api/feedback', { feedbackId, attemptId, comment: comment.value }); send.textContent = 'Comment saved'; comment.disabled = true; } catch { send.disabled = false; send.textContent = 'Retry comment save'; } });
      const next = node('button', index + 1 < queue.length ? 'Next question' : 'Show result'); next.className = 'button'; next.addEventListener('click', () => { index++; render(); }); row.append(next);
      $('summary').textContent = `${Object.keys(progress).length} of ${bank.questions.length} questions answered`;
    });
  }
  async function init() {
    try { const banks = await api('/api/banks'); bankSelect.replaceChildren(); for (const item of banks) option(bankSelect, item.id, item.title); if (!banks.length) { $('summary').textContent = 'Add a verified bank in banks/ and restart the server.'; return; } const requested = new URLSearchParams(location.search).get('bank'); if (banks.some(x => x.id === requested)) bankSelect.value = requested; await chooseBank(); }
    catch { $('summary').textContent = 'Could not load the study server.'; }
  }
  bankSelect.addEventListener('change', () => chooseBank().catch(() => { $('summary').textContent = 'Could not load this bank.'; }));
  $('start').addEventListener('click', start);
  init();
})();
