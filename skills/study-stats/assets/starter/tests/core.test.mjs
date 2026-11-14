import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getAttempts, getProgress, loadBanks, openDatabase, saveAttempt, saveFeedback } from '../lib/core.mjs';

test('attempts persist, retry once, and key corrections flag affected history', () => {
  const root = mkdtempSync(join(tmpdir(), 'study-stats-'));
  const priorDir = process.env.STUDY_DATA_DIR;
  delete process.env.STUDY_DATA_DIR;
  try {
    mkdirSync(join(root, 'banks'));
    const file = join(root, 'banks', 'one.json');
    const bank = correct => ({ id: 'one', title: 'One', multiSelect: false, questions: [{ id: 'one-1', number: 1, topic: 'Topic', text: 'Question?', options: { A: 'First', B: 'Second' }, correct: [correct], gradeable: true }] });
    writeFileSync(file, JSON.stringify(bank('B')));
    let banks = loadBanks(root);
    let db = openDatabase(root);
    const body = { attemptId: '11111111-1111-4111-8111-111111111111', bank: 'one', questionId: 'one-1', selected: ['A'] };
    assert.equal(saveAttempt(db, banks, body).correct, false);
    assert.equal(saveAttempt(db, banks, body).duplicate, true);
    assert.equal(getProgress(db, 'one')['one-1'].seen, 1);
    assert.equal(saveFeedback(db, { feedbackId: '22222222-2222-4222-8222-222222222222', attemptId: body.attemptId, comment: 'Why?' }).saved, true);
    assert.equal(db.prepare('SELECT count(*) AS n FROM feedback').get().n, 1);
    assert.throws(() => saveAttempt(db, banks, { ...body, selected: ['B'] }), /Invalid duplicate/);
    db.close();
    writeFileSync(file, JSON.stringify(bank('A')));
    banks = loadBanks(root);
    db = openDatabase(root);
    const attempts = getAttempts(db, banks.get('one'));
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].correct, 0);
    assert.equal(attempts[0].needsReview, true);
    assert.equal(getProgress(db, 'one')['one-1'].wrong, 1);
    db.close();
  } finally {
    if (priorDir === undefined) delete process.env.STUDY_DATA_DIR; else process.env.STUDY_DATA_DIR = priorDir;
    rmSync(root, { recursive: true, force: true });
  }
});
