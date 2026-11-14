import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

const source = resolve(fileURLToPath(new URL('../', import.meta.url)));
async function freePort() {
  const server = createServer();
  await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
  const port = server.address().port;
  await new Promise(resolveClosed => server.close(resolveClosed));
  return port;
}

test('local server serves study, saves answers, and reports results', async () => {
  const root = mkdtempSync(join(tmpdir(), 'study-api-'));
  let child;
  try {
    cpSync(source, root, { recursive: true });
    mkdirSync(join(root, 'banks'), { recursive: true });
    writeFileSync(join(root, 'banks', 'demo.json'), JSON.stringify({ id: 'demo', title: 'Demo', multiSelect: false, questions: [{ id: 'demo-1', number: 1, topic: 'Basics', text: 'Two plus two?', options: { A: 'Three', B: 'Four' }, correct: ['B'], gradeable: true, explanation: 'Two pairs make four.' }] }));
    const port = await freePort();
    child = spawn(process.execPath, [join(root, 'server.mjs')], { cwd: root, env: { ...process.env, STUDY_PORT: String(port), STUDY_DATA_DIR: join(root, 'test-data') }, windowsHide: true });
    await Promise.race([
      new Promise((resolveReady, reject) => { child.stdout.on('data', chunk => { if (chunk.toString().includes('Study:')) resolveReady(); }); child.on('exit', code => reject(new Error(`Server exited ${code}`))); }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Server start timeout')), 5000)),
    ]);
    const base = `http://127.0.0.1:${port}`;
    assert.equal((await fetch(base)).status, 200);
    assert.deepEqual(await (await fetch(`${base}/api/banks`)).json(), [{ id: 'demo', title: 'Demo', multiSelect: false, count: 1 }]);
    const questions = await (await fetch(`${base}/api/questions?bank=demo`)).json();
    assert.equal(questions.questions[0].correct, undefined);
    const body = { attemptId: '33333333-3333-4333-8333-333333333333', bank: 'demo', questionId: 'demo-1', selected: ['B'] };
    const post = (path, value) => fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });
    assert.equal((await (await post('/api/attempt', body)).json()).correct, true);
    assert.equal((await (await post('/api/attempt', body)).json()).duplicate, true);
    assert.equal((await post('/api/attempt', { ...body, selected: ['A'] })).status, 400);
    assert.equal((await (await post('/api/feedback', { feedbackId: '44444444-4444-4444-8444-444444444444', attemptId: body.attemptId, comment: 'I see it now.' })).json()).saved, true);
    const stats = await (await fetch(`${base}/api/stats?bank=demo`)).json();
    assert.equal(stats.attempts.length, 1);
    assert.equal(stats.feedback.length, 1);
    assert.equal(stats.progress['demo-1'].seen, 1);
    assert.equal((await fetch(`${base}/banks/demo.json`)).status, 404);
    const report = spawnSync(process.execPath, [join(root, 'scripts/report.mjs')], { cwd: root, env: { ...process.env, STUDY_DATA_DIR: join(root, 'test-data') }, encoding: 'utf8', windowsHide: true });
    assert.equal(report.status, 0, report.stderr);
    assert.equal(JSON.parse(report.stdout).banks[0].first.correct, 1);
  } finally {
    if (child && child.exitCode === null) {
      await new Promise(resolveExit => { child.once('exit', resolveExit); child.kill(); });
    }
    rmSync(root, { recursive: true, force: true });
  }
});
