const fs = require('fs');
const path = require('path');

const replacements = {
  // Backgrounds
  'bg-zinc-950': 'bg-white',
  'bg-zinc-900': 'bg-slate-50',
  'bg-zinc-800': 'bg-slate-100',
  'bg-zinc-700': 'bg-slate-200',
  'bg-black': 'bg-white',
  'bg-ink': 'bg-slate-900', // Assuming ink was a dark color
  
  // Borders
  'border-zinc-800': 'border-slate-200',
  'border-zinc-700': 'border-slate-300',
  'border-zinc-600': 'border-slate-400',
  'divide-zinc-800': 'divide-slate-200',
  
  // Text
  'text-white': 'text-slate-900',
  'text-zinc-400': 'text-slate-500',
  'text-zinc-500': 'text-slate-400',
  'text-zinc-300': 'text-slate-700',
  'text-zinc-200': 'text-slate-800',
  'text-ink': 'text-white', // Buttons with gold background had text-ink

  // Hover states
  'hover:bg-zinc-900': 'hover:bg-slate-50',
  'hover:bg-zinc-800': 'hover:bg-slate-100',
  'hover:text-white': 'hover:text-slate-900',
  'focus:bg-zinc-900': 'focus:bg-slate-50',
  'focus:text-white': 'focus:text-slate-900',
  
  // Change "Gold" premium feel to a modern "Indigo"
  'bg-gold': 'bg-indigo-600',
  'hover:bg-gold': 'hover:bg-indigo-700',
  'text-gold': 'text-indigo-600',
  'border-gold': 'border-indigo-600',
  'ring-gold': 'ring-indigo-600',
  'focus:ring-gold': 'focus:ring-indigo-600',
  'shadow-gold': 'shadow-indigo-600',
  'from-gold': 'from-indigo-600',

  // Misc component changes
  'shadow-black/50': 'shadow-slate-200/50',
  'shadow-xl': 'shadow-xl', // keep
  'border-dashed': 'border-dashed'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceThemeClasses(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We want to replace exact whole words. 
  // However, things like hover:bg-zinc-950 have colons, so \b doesn't treat the colon as part of the word boundary properly in all cases, 
  // but it's safe if we use a regex that matches the string with lookarounds.
  
  for (const [darkClass, lightClass] of Object.entries(replacements)) {
    // Escape string for regex
    const escapedDarkClass = darkClass.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Using a regex to match the class exactly if it is surrounded by whitespace, quotes, or backticks
    // Example: " bg-zinc-950 " or 'bg-zinc-950' or `bg-zinc-950`
    const regex = new RegExp(`(?<=[\\s"'\\\`])${escapedDarkClass}(?=[\\s"'\\\`])`, 'g');
    content = content.replace(regex, lightClass);
    
    // Also handle case where it's at the very beginning or end of a string
    const regexStart = new RegExp(`^${escapedDarkClass}(?=[\\s"'\\\`])`, 'g');
    const regexEnd = new RegExp(`(?<=[\\s"'\\\`])${escapedDarkClass}$`, 'g');
    const regexExact = new RegExp(`^${escapedDarkClass}$`, 'g');
    
    content = content.replace(regexStart, lightClass);
    content = content.replace(regexEnd, lightClass);
    content = content.replace(regexExact, lightClass);
  }

  // Inject some global animation classes into Cards if they don't have them
  // A bit risky with regex, but we can do targeted replacement
  // "bg-white border-slate-200 text-slate-900" -> add "transition-all duration-300"
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated theme in ${filePath}`);
  }
}

console.log('Starting theme shift...');
walkDir(path.join(__dirname, 'src'), replaceThemeClasses);
console.log('Theme shift complete.');
