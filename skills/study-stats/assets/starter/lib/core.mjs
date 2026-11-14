import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function loadBanks(root) {
  const dir = join(root, 'banks');
  if (!existsSync(dir)) return new Map();
  const banks = new Map();
  for (const file of readdirSync(dir).filter(name => name.endsWith('.json')).sort()) {
    const bank = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (!/^[a-z0-9][a-z0-9-]*$/.test(bank.id) || !bank.title || !Array.isArray(bank.questions) || typeof bank.multiSelect !== 'boolean') throw new Error(`Invalid bank header: ${file}`);
    if (banks.has(bank.id)) throw new Error(`Duplicate bank ID: ${bank.id}`);
    const byId = new Map();
    for (const q of bank.questions) {
      const letters = Object.keys(q.options || {});
      if (typeof q.id !== 'string' || !q.id || byId.has(q.id) || typeof q.text !== 'string' || !q.text ||
          !letters.length || !letters.every(x => /^[A-Z]$/.test(x) && typeof q.options[x] === 'string' && q.options[x]) ||
          !Array.isArray(q.correct) || (q.gradeable !== false && !q.correct.length) ||
          q.correct.some(x => !letters.includes(x)) || new Set(q.correct).size !== q.correct.length ||
          (!bank.multiSelect && q.correct.length > 1)) throw new Error(`Invalid question in ${file}: ${q.id}`);
      byId.set(q.id, q);
    }
    const gradingKey = bank.questions.map(q => [q.id, q.gradeable !== false, [...q.correct].sort()]);
    bank.keyVersion = createHash('sha256').update(JSON.stringify(gradingKey)).digest('hex').slice(0, 16);
    bank.byId = byId;
    banks.set(bank.id, bank);
  }
  return banks;
}

export function openDatabase(root, { readOnly = false } = {}) {
  const dir = process.env.STUDY_DATA_DIR || join(root, 'data');
  if (!readOnly) mkdirSync(dir, { recursive: true });
  const file = join(dir, 'progress.sqlite');
  if (readOnly && !existsSync(file)) throw new Error(`No results database: ${file}`);
  const db = new DatabaseSync(file, { readOnly });
  if (!readOnly) db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS attempts (
      attempt_id TEXT PRIMARY KEY,
      bank TEXT NOT NULL,
      question_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      selected TEXT NOT NULL,
      correct INTEGER,
      gradeable INTEGER NOT NULL,
      key_version TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS attempts_bank_time ON attempts(bank, created_at);
    CREATE TABLE IF NOT EXISTS progress (
      bank TEXT NOT NULL,
      question_id TEXT NOT NULL,
      seen INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      wrong INTEGER NOT NULL,
      streak INTEGER NOT NULL,
      due INTEGER NOT NULL,
      PRIMARY KEY(bank, question_id)
    );
    CREATE TABLE IF NOT EXISTS feedback (
      feedback_id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES attempts(attempt_id),
      comment TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  return db;
}

export function getProgress(db, bankId) {
  return Object.fromEntries(db.prepare('SELECT question_id, seen, correct, wrong, streak, due FROM progress WHERE bank=?')
    .all(bankId).map(({ question_id, ...row }) => [question_id, row]));
}

export function getAttempts(db, bank) {
  return db.prepare('SELECT attempt_id AS attemptId, question_id AS questionId, topic, selected, correct, gradeable, key_version AS keyVersion, created_at AS createdAt FROM attempts WHERE bank=? ORDER BY created_at, rowid')
    .all(bank.id).map(row => {
      const q = bank.byId.get(row.questionId);
      const selected = JSON.parse(row.selected);
      const gradeableNow = q?.gradeable !== false;
      const correctNow = q && selected.slice().sort().join(',') === [...q.correct].sort().join(',');
      return { ...row, selected, needsReview: !q || (row.keyVersion !== bank.keyVersion && (Boolean(row.gradeable) !== gradeableNow || (gradeableNow && Boolean(row.correct) !== correctNow))) };
    });
}

export function saveAttempt(db, banks, body) {
  const bank = banks.get(body?.bank);
  const q = bank?.byId.get(body?.questionId);
  const selected = body?.selected;
  if (!q || typeof body.attemptId !== 'string' || !/^[A-Za-z0-9-]{20,80}$/.test(body.attemptId) ||
      !Array.isArray(selected) || !selected.length || selected.length > Object.keys(q.options).length ||
      selected.some(x => typeof x !== 'string' || !Object.hasOwn(q.options, x)) || new Set(selected).size !== selected.length ||
      (!bank.multiSelect && selected.length !== 1)) throw new Error('Invalid attempt');
  const selectedJson = JSON.stringify([...selected].sort());
  const old = db.prepare('SELECT bank, question_id, selected, correct, gradeable FROM attempts WHERE attempt_id=?').get(body.attemptId);
  if (old) {
    if (old.bank !== bank.id || old.question_id !== q.id || old.selected !== selectedJson) throw new Error('Invalid duplicate attempt');
    return answer(bank, q, Boolean(old.correct), Boolean(old.gradeable), getProgress(db, bank.id)[q.id], true);
  }
  const gradeable = q.gradeable !== false;
  const correct = selected.slice().sort().join(',') === [...q.correct].sort().join(',');
  const now = Date.now();
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('INSERT INTO attempts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(body.attemptId, bank.id, q.id, q.topic || '', selectedJson, gradeable ? Number(correct) : null, Number(gradeable), bank.keyVersion, now);
    if (gradeable) {
      const oldProgress = db.prepare('SELECT streak FROM progress WHERE bank=? AND question_id=?').get(bank.id, q.id);
      const streak = correct ? (oldProgress?.streak || 0) + 1 : 0;
      const days = [1, 1, 3, 7, 14, 30][Math.min(streak, 5)];
      const due = correct ? now + days * 86_400_000 : now;
      db.prepare(`INSERT INTO progress VALUES (?, ?, 1, ?, ?, ?, ?)
        ON CONFLICT(bank, question_id) DO UPDATE SET seen=seen+1, correct=correct+excluded.correct,
        wrong=wrong+excluded.wrong, streak=excluded.streak, due=excluded.due`)
        .run(bank.id, q.id, Number(correct), Number(!correct), streak, due);
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  return answer(bank, q, correct, gradeable, getProgress(db, bank.id)[q.id], false);
}

function answer(bank, q, correct, gradeable, progress, duplicate) {
  return { correct, gradeable, correctAnswers: q.correct, explanation: q.explanation || '', source: q.source || null, progress: progress || null, duplicate, keyVersion: bank.keyVersion };
}

export function saveFeedback(db, body) {
  if (typeof body?.feedbackId !== 'string' || !/^[A-Za-z0-9-]{20,80}$/.test(body.feedbackId) ||
      typeof body.attemptId !== 'string' || typeof body.comment !== 'string' ||
      !body.comment.trim() || body.comment.length > 2000) throw new Error('Invalid feedback');
  if (!db.prepare('SELECT 1 FROM attempts WHERE attempt_id=?').get(body.attemptId)) throw new Error('Invalid attempt reference');
  const old = db.prepare('SELECT attempt_id, comment FROM feedback WHERE feedback_id=?').get(body.feedbackId);
  if (old) {
    if (old.attempt_id !== body.attemptId || old.comment !== body.comment.trim()) throw new Error('Invalid duplicate feedback');
    return { saved: true, duplicate: true };
  }
  db.prepare('INSERT INTO feedback VALUES (?, ?, ?, ?)').run(body.feedbackId, body.attemptId, body.comment.trim(), Date.now());
  return { saved: true, duplicate: false };
}
