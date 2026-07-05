const fs = require('fs');
const path = require('path');

const directories = [
  './src/routes',
  './src/components',
  './src/lib'
];

const replacements = [
  { from: /bg-zinc-950\/50/g, to: 'bg-white' },
  { from: /bg-zinc-900\/50/g, to: 'bg-slate-50' },
  { from: /bg-zinc-900\/80/g, to: 'bg-slate-50' },
  { from: /bg-zinc-900\/40/g, to: 'bg-slate-50' },
  { from: /bg-zinc-900\/20/g, to: 'bg-slate-50' },
  { from: /hover:bg-zinc-900\/50/g, to: 'hover:bg-slate-50' },
  { from: /hover:bg-zinc-700/g, to: 'hover:bg-slate-200' },
  { from: /border-zinc-800\/50/g, to: 'border-slate-200' },
  { from: /border-zinc-800\/80/g, to: 'border-slate-200' },
  { from: /border-zinc-800/g, to: 'border-slate-200' },
  { from: /hover:border-zinc-700/g, to: 'hover:border-slate-300' },
  { from: /file:bg-zinc-800/g, to: 'file:bg-slate-100' },
  { from: /file:text-zinc-300/g, to: 'file:text-slate-700' },
  { from: /data-\[state=active\]:bg-zinc-800/g, to: 'data-[state=active]:bg-white data-[state=active]:shadow-sm' },
  { from: /data-\[state=active\]:text-white/g, to: 'data-[state=active]:text-slate-900' },
  { from: /hover:bg-zinc-200/g, to: 'hover:bg-slate-100' },
  { from: /text-zinc-300/g, to: 'text-slate-500' },
  { from: /text-zinc-400/g, to: 'text-slate-500' },
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
console.log('Theme fix complete.');
