import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validationRoot = path.join(root, '.validation');
mkdirSync(validationRoot, { recursive: true });
const scratch = mkdtempSync(path.join(validationRoot, 'installer-'));
function install(project, ...extra) {
  return spawnSync(process.execPath, [path.join(root, 'install-study.mjs'), '--project', project, ...extra], { encoding: 'utf8', windowsHide: true });
}
function compareTree(source, target) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const a = path.join(source, entry.name), b = path.join(target, entry.name);
    if (entry.isDirectory()) compareTree(a, b);
    else assert.deepEqual(readFileSync(b), readFileSync(a));
  }
}
test('study kit installation', async (t) => {
  try {
    await t.test('installs the complete study pair into a path with spaces and Unicode', () => {
      const project = path.join(scratch, 'My Study česky');
      const result = install(project);
      assert.equal(result.status, 0, result.stderr);
      compareTree(path.join(root, 'skills/teach'), path.join(project, '.agents/skills/teach'));
      assert.deepEqual(readFileSync(path.join(project, '.codex/agents/study-builder.toml')), readFileSync(path.join(root, 'agents/study-builder.toml')));
      assert.ok(existsSync(path.join(project, 'START-STUDY.md')));
      assert.equal(existsSync(path.join(project, '.codex/agents/skeptic.toml')), false);
      const repeated = install(project);
      assert.equal(repeated.status, 0, repeated.stderr);
      assert.equal(JSON.parse(repeated.stdout.split('\n')[0]).added, 0);
    });
    await t.test('a dry run creates no project files', () => {
      const project = path.join(scratch, 'dry-run');
      const result = install(project, '--dry-run');
      assert.equal(result.status, 0, result.stderr);
      assert.equal(existsSync(project), false);
    });
    await t.test('a conflicting existing file prevents every new write', () => {
      const project = path.join(scratch, 'conflict');
      const folder = path.join(project, '.codex/agents');
      mkdirSync(folder, { recursive: true });
      const existing = path.join(folder, 'study-builder.toml');
      writeFileSync(existing, 'Existing custom agent');
      const result = install(project);
      assert.notEqual(result.status, 0);
      assert.equal(readFileSync(existing, 'utf8'), 'Existing custom agent');
      assert.equal(existsSync(path.join(project, '.agents')), false);
      assert.equal(existsSync(path.join(project, 'START-STUDY.md')), false);
    });
    await t.test('a late conflict also prevents earlier files from being created', () => {
      const project = path.join(scratch, 'late-conflict');
      mkdirSync(project);
      writeFileSync(path.join(project, 'START-STUDY.md'), 'Existing instructions');
      const result = install(project);
      assert.notEqual(result.status, 0);
      assert.equal(existsSync(path.join(project, '.codex')), false);
      assert.equal(existsSync(path.join(project, '.agents')), false);
    });
  } finally {
    if (path.dirname(scratch) !== validationRoot || !path.basename(scratch).startsWith('installer-')) throw new Error('Unsafe test cleanup path');
    rmSync(scratch, { recursive: true, force: true });
  }
});
