#!/usr/bin/env node
import { constants, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const projectIndex = args.indexOf('--project');
const dryRun = args.includes('--dry-run');
if (projectIndex < 0 || !args[projectIndex + 1] || args[projectIndex + 1].startsWith('--')) {
  console.error('Usage: node install-study-stats.mjs --project <directory> [--dry-run]');
  process.exit(1);
}
const unknown = args.filter((arg, index) => index !== projectIndex && index !== projectIndex + 1 && arg !== '--dry-run');
if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(', ')}`);
const project = path.resolve(args[projectIndex + 1]);
const files = [{ source: path.join(root, 'START-STUDY-STATS.md'), relative: 'START-STUDY-STATS.md' }];
function collect(source, relative) {
  const stat = lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error(`Refusing source link: ${source}`);
  if (stat.isDirectory()) for (const entry of readdirSync(source).sort()) collect(path.join(source, entry), path.join(relative, entry));
  else files.push({ source, relative });
}
collect(path.join(root, 'skills/study-stats'), '.agents/skills/study-stats');
for (const file of files) {
  const target = path.join(project, file.relative);
  for (let current = target; ; current = path.dirname(current)) {
    if (existsSync(current)) {
      const info = lstatSync(current);
      if (info.isSymbolicLink()) throw new Error(`Refusing destination link: ${current}`);
      if (current !== target && !info.isDirectory()) throw new Error(`Destination parent is not a directory: ${current}`);
    }
    if (path.dirname(current) === current) break;
  }
  if (existsSync(target) && (!lstatSync(target).isFile() || !readFileSync(target).equals(readFileSync(file.source))))
    throw new Error(`Existing file differs; nothing has been installed: ${target}`);
}
let added = 0;
for (const file of files) {
  const target = path.join(project, file.relative);
  if (existsSync(target)) continue;
  added++;
  if (!dryRun) { mkdirSync(path.dirname(target), { recursive: true }); copyFileSync(file.source, target, constants.COPYFILE_EXCL); }
}
console.log(JSON.stringify({ status: dryRun ? 'dry-run' : 'installed', project, added, total: files.length }));
console.log('Open the project in Codex, start a new session, and follow START-STUDY-STATS.md.');
