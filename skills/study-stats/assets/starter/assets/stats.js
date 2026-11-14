(() => {
  const $ = id => document.getElementById(id);
  const node = (tag, text) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = String(text); return el; };
  const pct = rows => rows.length ? `${Math.round(100 * rows.filter(x => x.correct).length / rows.length)}%` : '—';
  let data;
  function card(label, value, detail) { const el = node('article'); el.className = 'stat-card'; el.append(node('strong', value), node('span', label), node('p', detail)); $('cards').append(el); }
  function bars(id, attempts, count, week) {
    const root = $(id); root.replaceChildren();
    const day = 86_400_000, today = new Date(); today.setHours(0, 0, 0, 0);
    if (week) today.setDate(today.getDate() - (today.getDay() + 6) % 7);
    const span = week ? day * 7 : day;
    const rows = Array.from({ length: count }, (_, i) => { const start = today.getTime() - (count - 1 - i) * span; return { start, attempts: attempts.filter(a => a.createdAt >= start && a.createdAt < start + span) }; });
    const max = Math.max(1, ...rows.map(x => x.attempts.length));
    for (const row of rows) { const el = node('div'); el.className = 'bar'; el.title = `${new Date(row.start).toLocaleDateString()}: ${row.attempts.length} attempts, ${pct(row.attempts.filter(x => x.gradeable))} correct`; const fill = node('i'); fill.style.height = `${Math.max(2, row.attempts.length / max * 95)}px`; el.append(node('span', row.attempts.length), fill, node('span', new Date(row.start).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }))); root.append(el); }
  }
  function ranking() {
    const topic = $('filter-topic').value, status = $('filter-status').value, sort = $('sort').value;
    const rows = data.questions.map(q => { const attempts = data.attempts.filter(a => a.questionId === q.id); return { ...q, attempts, correct: attempts.filter(a => a.gradeable && a.correct).length, wrong: attempts.filter(a => a.gradeable && !a.correct).length, review: attempts.some(a => a.needsReview) }; }).filter(q => (!topic || q.topic === topic) && (status === 'all' || (status === 'unanswered' && !q.attempts.length) || (status === 'wrong' && q.wrong)));
    rows.sort((a, b) => sort === 'number' ? String(a.number ?? a.id).localeCompare(String(b.number ?? b.id), undefined, { numeric: true }) : sort === 'errors' ? b.wrong - a.wrong || b.attempts.length - a.attempts.length : b.attempts.length - a.attempts.length || b.wrong - a.wrong);
    const body = $('ranking'); body.replaceChildren();
    for (const q of rows) { const tr = node('tr'); for (const value of [`${q.number ?? q.id}. ${q.text}`, q.topic, q.attempts.length, q.correct, q.wrong, q.review ? 'Key changed: review' : q.attempts.length ? 'Answered' : 'Unanswered']) tr.append(node('td', value)); body.append(tr); }
  }
  function render() {
    const first = [], repeat = [], seen = new Set();
    for (const a of data.attempts) { (seen.has(a.questionId) ? repeat : first).push(a); seen.add(a.questionId); }
    const graded = rows => rows.filter(x => x.gradeable);
    $('cards').replaceChildren(); card('Questions covered', `${seen.size} / ${data.questions.length}`, 'Distinct questions answered'); card('First attempts', pct(graded(first)), `${graded(first).length} graded`); card('Repeat attempts', pct(graded(repeat)), `${graded(repeat).length} graded`); card('Due for review', Object.values(data.progress).filter(x => x.due <= Date.now()).length, 'From the review schedule');
    bars('daily', data.attempts, 14, false); bars('weekly', data.attempts, 8, true);
    const topics = new Map(); for (const q of data.questions) topics.set(q.topic, { total: (topics.get(q.topic)?.total || 0) + 1, answered: 0, wrong: 0 });
    for (const [topic, v] of topics) { v.answered = data.questions.filter(q => q.topic === topic && seen.has(q.id)).length; v.wrong = data.attempts.filter(a => a.topic === topic && a.gradeable && !a.correct).length; }
    $('topics').replaceChildren(); for (const [topic, v] of topics) $('topics').append(node('p', `${topic || 'No topic'}: ${v.answered}/${v.total} covered · ${v.wrong} wrong attempts`));
    $('filter-topic').replaceChildren(); const all = node('option', 'All topics'); all.value = ''; $('filter-topic').append(all); for (const topic of [...topics.keys()].sort()) { const option = node('option', topic || 'No topic'); option.value = topic; $('filter-topic').append(option); }
    ranking(); $('comments').replaceChildren(); for (const f of data.feedback) $('comments').append(node('li', `${new Date(f.createdAt).toLocaleString()}: ${f.comment}`)); if (!data.feedback.length) $('comments').append(node('li', 'No comments yet.'));
    $('dashboard').hidden = false; $('status').textContent = `Updated ${new Date().toLocaleTimeString()}. ${data.attempts.filter(a => a.needsReview).length} historical attempts need review after a key change.`;
  }
  async function load() { try { const r = await fetch(`/api/stats?bank=${encodeURIComponent($('bank').value)}`); if (!r.ok) throw new Error(); data = await r.json(); render(); } catch { $('dashboard').hidden = true; $('status').textContent = 'Could not load results from the study server.'; } }
  async function init() { try { const r = await fetch('/api/banks'); if (!r.ok) throw new Error(); const banks = await r.json(); for (const b of banks) { const option = node('option', b.title); option.value = b.id; $('bank').append(option); } if (!banks.length) { $('status').textContent = 'No banks yet.'; return; } const requested = new URLSearchParams(location.search).get('bank'); if (banks.some(x => x.id === requested)) $('bank').value = requested; await load(); } catch { $('status').textContent = 'Could not load the study server.'; } }
  $('bank').addEventListener('change', load); $('refresh').addEventListener('click', load); for (const id of ['filter-topic', 'filter-status', 'sort']) $(id).addEventListener('change', ranking);
  init();
})();
