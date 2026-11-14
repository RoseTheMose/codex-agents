import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function install(project, ...args) { return spawnSync(process.execPath, [path.join(root, 'install-study-stats.mjs'), '--project', project, ...args], { encoding: 'utf8', windowsHide: true }); }

test('single-skill installer installs, repeats, previews, and stops on conflicts', () => {
  const scratch = mkdtempSync(path.join(tmpdir(), 'study-stats-install-'));
  try {
    const project = path.join(scratch, 'Study česky');
    const first = install(project);
    assert.equal(first.status, 0, first.stderr);
    assert.deepEqual(readFileSync(path.join(project, '.agents/skills/study-stats/SKILL.md')), readFileSync(path.join(root, 'skills/study-stats/SKILL.md')));
    assert.ok(existsSync(path.join(project, '.agents/skills/study-stats/assets/starter/server.mjs')));
    assert.ok(existsSync(path.join(project, 'START-STUDY-STATS.md')));
    assert.equal(existsSync(path.join(project, '.codex/agents/study-builder.toml')), false);
    assert.equal(JSON.parse(install(project).stdout.split('\n')[0]).added, 0);
    const dry = path.join(scratch, 'dry');
    assert.equal(install(dry, '--dry-run').status, 0);
    assert.equal(existsSync(dry), false);
    const conflict = path.join(scratch, 'conflict');
    mkdirSync(conflict);
    writeFileSync(path.join(conflict, 'START-STUDY-STATS.md'), 'Existing custom instructions');
    const blocked = install(conflict);
    assert.notEqual(blocked.status, 0);
    assert.equal(existsSync(path.join(conflict, '.agents')), false);
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});
