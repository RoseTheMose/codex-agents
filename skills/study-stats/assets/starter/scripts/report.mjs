import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { getAttempts, getProgress, loadBanks, openDatabase } from '../lib/core.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const banks = loadBanks(root);
const db = openDatabase(root, { readOnly: true });
const report = { fetchedAt: new Date().toISOString(), store: 'local SQLite', banks: [] };
for (const bank of banks.values()) {
  const attempts = getAttempts(db, bank);
  const first = [], repeat = [], seen = new Set();
  const topics = new Map();
  for (const attempt of attempts) {
    (seen.has(attempt.questionId) ? repeat : first).push(attempt);
    seen.add(attempt.questionId);
    const topic = topics.get(attempt.topic) || { topic: attempt.topic, attempts: 0, wrong: 0 };
    topic.attempts++;
    if (attempt.gradeable && !attempt.correct) topic.wrong++;
    topics.set(attempt.topic, topic);
  }
  const score = rows => ({ count: rows.length, graded: rows.filter(x => x.gradeable).length, correct: rows.filter(x => x.gradeable && x.correct).length });
  report.banks.push({ id: bank.id, title: bank.title, keyVersion: bank.keyVersion, questions: bank.questions.length,
    answered: seen.size, first: score(first), repeat: score(repeat), topics: [...topics.values()].sort((a, b) => b.wrong - a.wrong),
    due: Object.values(getProgress(db, bank.id)).filter(x => x.due <= Date.now()).length,
    changedKeyAttempts: attempts.filter(x => x.needsReview).map(x => x.attemptId),
    feedback: db.prepare('SELECT f.comment, f.created_at AS createdAt, a.question_id AS questionId FROM feedback f JOIN attempts a USING(attempt_id) WHERE a.bank=? ORDER BY f.created_at').all(bank.id) });
}
db.close();
console.log(JSON.stringify(report, null, 2));
