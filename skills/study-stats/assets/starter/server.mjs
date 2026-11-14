import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAttempts, getProgress, loadBanks, openDatabase, saveAttempt, saveFeedback } from './lib/core.mjs';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const banks = loadBanks(root);
const db = openDatabase(root);
const port = Number(process.env.STUDY_PORT || 4322);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 20_000) { reject(new Error('Invalid request size')); req.destroy(); }
    });
    req.on('end', () => { try { resolveBody(JSON.parse(raw)); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}
function publicQuestion(q) {
  return { id: q.id, number: q.number, topic: q.topic || '', text: q.text, options: q.options, gradeable: q.gradeable !== false };
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (req.method === 'GET' && url.pathname === '/api/banks')
      return json(res, 200, [...banks.values()].map(({ id, title, multiSelect, questions }) => ({ id, title, multiSelect, count: questions.length })));
    if (req.method === 'GET' && ['/api/questions', '/api/progress', '/api/stats'].includes(url.pathname)) {
      const bank = banks.get(url.searchParams.get('bank'));
      if (!bank) throw new Error('Invalid bank');
      if (url.pathname === '/api/questions') return json(res, 200, { id: bank.id, title: bank.title, multiSelect: bank.multiSelect, questions: bank.questions.map(publicQuestion) });
      if (url.pathname === '/api/progress') return json(res, 200, getProgress(db, bank.id));
      return json(res, 200, { bank: bank.id, title: bank.title, keyVersion: bank.keyVersion, questions: bank.questions.map(publicQuestion), attempts: getAttempts(db, bank), progress: getProgress(db, bank.id), feedback: db.prepare('SELECT f.feedback_id AS feedbackId, f.attempt_id AS attemptId, f.comment, f.created_at AS createdAt FROM feedback f JOIN attempts a USING(attempt_id) WHERE a.bank=? ORDER BY f.created_at').all(bank.id) });
    }
    if (req.method === 'POST' && url.pathname === '/api/attempt') return json(res, 200, saveAttempt(db, banks, await readBody(req)));
    if (req.method === 'POST' && url.pathname === '/api/feedback') return json(res, 200, saveFeedback(db, await readBody(req)));
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed' });
    const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    if (!/^\/(?:index|quiz|stats)\.html$/.test(pathname) && !/^\/assets\/[a-z0-9-]+\.(?:css|js)$/.test(pathname)) return json(res, 404, { error: 'Not found' });
    const file = resolve(root, '.' + pathname);
    if (!file.startsWith(root + sep) || !existsSync(file) || !mime[extname(file)]) return json(res, 404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': mime[extname(file)], 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
  } catch (error) {
    console.error(error);
    json(res, error.message.startsWith('Invalid') ? 400 : 500, { error: error.message });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Study: http://127.0.0.1:${port}/`));
function stop() { server.close(() => db.close()); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
