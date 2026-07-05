const fs = require('fs');
const path = require('path');

const directories = [
  './src/routes',
  './src/components',
  './src/lib'
];

const replacements = [
  { from: /text-zinc-600/g, to: 'text-slate-500' },
  { from: /focus-visible:ring-zinc-700/g, to: 'focus-visible:ring-indigo-500' },
  { from: /hover:file:bg-zinc-700/g, to: 'hover:file:bg-slate-200' },
  { from: /text-zinc-500/g, to: 'text-slate-500' },
  { from: /\[color-scheme:dark\]/g, to: '' },
  { from: /data-\[state=active\]:bg-zinc-800/g, to: 'data-[state=active]:bg-white data-[state=active]:shadow-sm' },
  { from: /data-\[state=active\]:text-white/g, to: 'data-[state=active]:text-slate-900' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.from.test(content)) {
          content = content.replace(rule.from, rule.to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Theme fix part 2 complete.');
