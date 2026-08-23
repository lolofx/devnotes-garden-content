#!/usr/bin/env node
/**
 * Audit du devnotes-garden.
 *
 *   node .claude/scripts/audit-garden.mjs
 *
 * Zéro dépendance : ni package.json, ni gray-matter. Le frontmatter est parsé à la main.
 * Sort en code 1 dès qu'un contrôle bloquant (🔴) échoue, 0 sinon.
 *
 * Les conventions contrôlées sont celles de .claude/skills/write-devnote/SKILL.md.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const NOTES_DIR = 'notes';

const DOMAIN_TAGS = new Set([
  'ddd', 'cqrs', 'hexagonal', 'bff', 'event-storming', 'messaging',
  'dotnet', 'testing', 'infrastructure', 'agents', 'orchestration', 'aidd',
]);
const BANNED_TAGS = new Set(['architecture']);
const MAX_TAGS = 5;
const REQUIRED_FIELDS = ['title', 'slug', 'tags', 'created', 'updated', 'summary'];
const VERIFIED_MAX_MONTHS = 6;
const UPDATED_MAX_MONTHS = 18;

const findings = [];
const add = (severity, file, rule, message) => findings.push({ severity, file, rule, message });

// ---------------------------------------------------------------- lecture

function collectMarkdown(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectMarkdown(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

/** Parse le frontmatter YAML plat entre les deux `---`. Scalaires et listes inline seulement. */
function parseFrontMatter(raw) {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return { data: {}, body: raw };
  const end = lines.indexOf('---', 1);
  if (end === -1) return { data: {}, body: raw };

  const data = {};
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!match) continue;
    const [, key] = match;
    let value = match[2].trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }
    value = value.replace(/^["']|["']$/g, '');
    if (value === 'true' || value === 'false') data[key] = value === 'true';
    else data[key] = value;
  }
  return { data, body: lines.slice(end + 1).join('\n') };
}

/** Même règle que deriveTheme() du repo app : le 1er segment sous notes/. */
function deriveTheme(relPath) {
  const parts = relPath.split(sep);
  return parts[parts.indexOf(NOTES_DIR) + 1] ?? 'uncategorized';
}

function monthsSince(dateStr) {
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return null;
  return (Date.now() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

// ---------------------------------------------------------------- collecte

try {
  statSync(NOTES_DIR);
} catch {
  console.error(`notes/ introuvable — lancer le script depuis la racine du repo.`);
  process.exit(1);
}

const notes = collectMarkdown(NOTES_DIR).map((filePath) => {
  const rel = relative('.', filePath);
  const { data, body } = parseFrontMatter(readFileSync(filePath, 'utf-8'));
  const fileName = rel.split(sep).pop().replace(/\.md$/, '');
  return { rel, fileName, data, body, theme: deriveTheme(rel) };
});

const knownSlugs = new Set(notes.map((n) => n.data.slug).filter(Boolean));
const knownPaths = new Set(notes.map((n) => `${n.theme}/${n.fileName}`));

// ---------------------------------------------------------------- contrôles

// 🔴 champs requis manquants — le build de l'app ignore silencieusement la note
for (const note of notes) {
  const missing = REQUIRED_FIELDS.filter((f) => note.data[f] === undefined || note.data[f] === null);
  if (missing.length) {
    add('error', note.rel, 'champ requis', `${missing.join(', ')} manquant — le build ignorera la note`);
  }
}

// 🔴 nom de fichier ≠ slug
for (const note of notes) {
  if (note.data.slug && note.data.slug !== note.fileName) {
    add('error', note.rel, 'slug/fichier', `slug "${note.data.slug}" ≠ nom de fichier "${note.fileName}"`);
  }
}

// 🔴 collision de slug — la note la plus ancienne disparaît du site sans erreur
const bySlug = new Map();
for (const note of notes) {
  if (!note.data.slug) continue;
  if (!bySlug.has(note.data.slug)) bySlug.set(note.data.slug, []);
  bySlug.get(note.data.slug).push(note.rel);
}
for (const [slug, files] of bySlug) {
  if (files.length > 1) {
    add('error', files[0], 'collision de slug', `slug "${slug}" partagé avec ${files.slice(1).join(', ')} — une note disparaîtra du site`);
  }
}

// 🔴 liens internes : cassés ou avec extension .md
const LINK_RE = /\]\(\.\.\/([^)\s]+)\)/g;
const linkTargets = new Map(); // slug cible -> notes qui pointent dessus
for (const note of notes) {
  for (const [, target] of note.body.matchAll(LINK_RE)) {
    if (target.endsWith('.md')) {
      add('error', note.rel, 'extension interdite', `lien "../${target}" porte l'extension .md — l'app ne naviguera pas`);
      continue;
    }
    if (!knownPaths.has(target)) {
      add('error', note.rel, 'lien cassé', `lien "../${target}" ne correspond à aucune note`);
      continue;
    }
    const targetSlug = target.split('/').pop();
    if (!linkTargets.has(targetSlug)) linkTargets.set(targetSlug, []);
    linkTargets.get(targetSlug).push(note.data.slug);
  }
}

// 🟡 tags
for (const note of notes) {
  const tags = Array.isArray(note.data.tags) ? note.data.tags : [];
  if (tags.length > MAX_TAGS) {
    add('warn', note.rel, 'tags', `${tags.length} tags — le plafond est ${MAX_TAGS}`);
  }
  const banned = tags.filter((t) => BANNED_TAGS.has(t));
  if (banned.length) {
    add('warn', note.rel, 'tags', `tag banni : ${banned.join(', ')}`);
  }
  const domains = tags.filter((t) => DOMAIN_TAGS.has(t));
  if (domains.length === 0) {
    add('warn', note.rel, 'tags', `aucun tag de domaine — en attendre exactement 1`);
  } else if (domains.length > 1) {
    add('warn', note.rel, 'tags', `${domains.length} tags de domaine (${domains.join(', ')}) — en attendre exactement 1`);
  }
}

// 🟡 draft absent = note publiée par défaut
for (const note of notes) {
  if (note.data.draft === undefined) {
    add('warn', note.rel, 'draft', `champ draft absent — la note sera publiée (le build ne teste que draft === true)`);
  }
}

// 🟡 related désynchronisé du footer
for (const note of notes) {
  if (note.data.related === undefined) continue;
  const declared = Array.isArray(note.data.related) ? note.data.related : [];
  const footerSlugs = [...note.body.matchAll(LINK_RE)]
    .map(([, target]) => target.split('/').pop())
    .filter((s) => knownSlugs.has(s));
  const unique = [...new Set(footerSlugs)];
  const missing = unique.filter((s) => !declared.includes(s));
  const extra = declared.filter((s) => !unique.includes(s));
  if (missing.length || extra.length) {
    const parts = [];
    if (missing.length) parts.push(`absent(s) de related : ${missing.join(', ')}`);
    if (extra.length) parts.push(`déclaré(s) sans lien dans le corps : ${extra.join(', ')}`);
    add('warn', note.rel, 'related', parts.join(' · '));
  }
}

// 🟡 notes orphelines
for (const note of notes) {
  if (!note.data.slug) continue;
  const linkedFrom = linkTargets.get(note.data.slug) ?? [];
  const relatedFrom = notes.filter(
    (n) => n.data.slug !== note.data.slug && Array.isArray(n.data.related) && n.data.related.includes(note.data.slug),
  );
  if (linkedFrom.length === 0 && relatedFrom.length === 0) {
    add('warn', note.rel, 'orpheline', `aucune autre note ne pointe vers "${note.data.slug}"`);
  }
}

// 🟡 fraîcheur
for (const note of notes) {
  if (note.data.verified) {
    const age = monthsSince(note.data.verified);
    if (age !== null && age > VERIFIED_MAX_MONTHS) {
      add('warn', note.rel, 'fraîcheur', `verified: ${note.data.verified} — ${Math.floor(age)} mois, revérifier l'outillage`);
    }
  }
  if (note.data.updated) {
    const age = monthsSince(note.data.updated);
    if (age !== null && age > UPDATED_MAX_MONTHS) {
      add('warn', note.rel, 'fraîcheur', `updated: ${note.data.updated} — ${Math.floor(age)} mois sans relecture`);
    }
  }
}

// ---------------------------------------------------------------- rapport

const CONTROLS = [
  'champ requis', 'slug/fichier', 'collision de slug', 'lien cassé', 'extension interdite',
  'tags', 'draft', 'related', 'orpheline', 'fraîcheur',
];

const errors = findings.filter((f) => f.severity === 'error');
const warnings = findings.filter((f) => f.severity === 'warn');

console.log(`\nAudit du garden — ${notes.length} note(s) analysée(s)\n`);

if (errors.length) {
  console.log('🔴 Bloquant');
  for (const f of errors) console.log(`   ${f.file} — [${f.rule}] ${f.message}`);
  console.log('');
}
if (warnings.length) {
  console.log('🟡 À améliorer');
  for (const f of warnings) console.log(`   ${f.file} — [${f.rule}] ${f.message}`);
  console.log('');
}

console.log('Contrôles');
for (const rule of CONTROLS) {
  const hits = findings.filter((f) => f.rule === rule).length;
  console.log(`   ${hits === 0 ? '✅' : '⚠️ '} ${rule}${hits ? ` — ${hits}` : ''}`);
}

console.log(`\n${errors.length} bloquant(s) · ${warnings.length} avertissement(s)\n`);
process.exit(errors.length > 0 ? 1 : 0);
