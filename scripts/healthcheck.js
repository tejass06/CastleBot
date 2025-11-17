// Healthcheck script for CastleBot
// Run: node scripts/healthcheck.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();

function collectCommands() {
  const commandsDir = path.join(root, 'commands');
  const categories = fs.readdirSync(commandsDir).filter(f => fs.statSync(path.join(commandsDir, f)).isDirectory());
  const results = [];
  for (const cat of categories) {
    const catDir = path.join(commandsDir, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const full = path.join(catDir, file);
      let mod;
      try { mod = require(full); } catch (e) { results.push({ file: full, ok: false, error: 'Require failed: ' + e.message }); continue; }
      const shapeIssues = [];
      if (!mod.name) shapeIssues.push('Missing name');
      if (typeof mod.execute !== 'function') shapeIssues.push('Missing execute()');
      if (mod.aliases && !Array.isArray(mod.aliases)) shapeIssues.push('aliases not array');
      results.push({ file: full, ok: shapeIssues.length === 0, issues: shapeIssues, name: mod.name, aliases: mod.aliases });
    }
  }
  return results;
}

function duplicateCheck(results) {
  const nameMap = new Map();
  const dupes = [];
  for (const r of results) {
    if (!r.name) continue;
    if (nameMap.has(r.name)) dupes.push([r.name, nameMap.get(r.name), r.file]);
    else nameMap.set(r.name, r.file);
  }
  return dupes;
}

function main() {
  console.log('🔍 CastleBot Healthcheck');
  const results = collectCommands();
  const total = results.length;
  const failed = results.filter(r => !r.ok);
  const dupes = duplicateCheck(results);

  console.log(`📦 Total command modules: ${total}`);
  console.log(`✅ Valid modules: ${total - failed.length}`);
  if (failed.length) {
    console.log('❌ Modules with issues:');
    for (const f of failed) {
      console.log('  -', f.file, '=>', f.issues.join(', '));
    }
  }
  if (dupes.length) {
    console.log('⚠️ Duplicate command names detected:');
    for (const [name, first, second] of dupes) {
      console.log(`  - ${name}: ${first} AND ${second}`);
    }
  } else {
    console.log('✅ No duplicate command names');
  }

  // Summary of aliases
  console.log('\n🔁 Alias Summary:');
  for (const r of results) {
    console.log(`  - ${r.name || 'UNKNOWN'}: ${Array.isArray(r.aliases) ? r.aliases.join(', ') || '(none)' : '(none)'}`);
  }

  // Recommendations
  console.log('\n🛠 Recommendations:');
  if (!failed.length && !dupes.length) console.log('  - Command module structure looks good.');
  console.log('  - Ensure permission checks added for mod/admin commands consistently.');
  console.log('  - Consider adding central error logging wrapper.');
  console.log('  - Add automated tests for critical moderation workflows.');
}

main();
