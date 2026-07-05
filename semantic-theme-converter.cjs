const fs = require('fs');
const path = require('path');

const replacements = {
  // Backgrounds
  'bg-white': 'bg-card',
  'bg-slate-50': 'bg-background',
  'bg-slate-100': 'bg-muted',
  'bg-slate-200': 'bg-muted/80',
  
  // Borders
  'border-slate-200': 'border-border',
  'border-slate-100': 'border-border/50',
  'divide-slate-200': 'divide-border',
  'border-r-zinc-800': 'border-r-border',
  
  // Text colors
  'text-slate-900': 'text-foreground',
  'text-slate-800': 'text-foreground/90',
  'text-slate-700': 'text-foreground/80',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground/75',
  
  // Hover states
  'hover:bg-slate-50': 'hover:bg-muted/50',
  'hover:bg-slate-100': 'hover:bg-muted',
  'hover:text-slate-900': 'hover:text-foreground',
  'focus:bg-slate-50': 'focus:bg-muted/50',
  'focus:text-slate-900': 'focus:text-foreground',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'components') { // Let's skip ui folder if needed, but let's process all to be thorough
        walkDir(dirPath, callback);
      } else {
        // Skip components/ui specifically to keep library defaults clean
        walkDir(dirPath, (filePath) => {
          if (!filePath.includes(path.join('components', 'ui'))) {
            callback(filePath);
          }
        });
      }
    } else {
      callback(dirPath);
    }
  });
}

function convertToSemanticTheme(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [lightClass, semanticClass] of Object.entries(replacements)) {
    const escapedLightClass = lightClass.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Exact word matching in class names (surrounded by quotes, space, or backticks)
    const regex = new RegExp(`(?<=[\\s"'\\\`])${escapedLightClass}(?=[\\s"'\\\`])`, 'g');
    content = content.replace(regex, semanticClass);
    
    // Matches at start and end of strings
    const regexStart = new RegExp(`^${escapedLightClass}(?=[\\s"'\\\`])`, 'g');
    const regexEnd = new RegExp(`(?<=[\\s"'\\\`])${escapedLightClass}$`, 'g');
    const regexExact = new RegExp(`^${escapedLightClass}$`, 'g');
    
    content = content.replace(regexStart, semanticClass);
    content = content.replace(regexEnd, semanticClass);
    content = content.replace(regexExact, semanticClass);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Converted to semantic theme: ${filePath}`);
  }
}

console.log('Starting semantic theme conversion...');
walkDir(path.join(__dirname, 'src'), convertToSemanticTheme);
console.log('Semantic theme conversion complete.');
