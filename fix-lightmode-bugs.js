const fs = require('fs');
const path = require('path');

const replacements = [
  // Gray text legibility
  { search: /text-gray-200/g, replace: "text-gray-700" },
  { search: /text-gray-300/g, replace: "text-gray-600" },
  { search: /text-gray-400/g, replace: "text-gray-600" },
  
  // GamesClient.tsx specific active/inactive tabs
  { search: /bg-gray-800 text-gray-600 hover:text-white/g, replace: "bg-pink-50 text-gray-600 hover:text-gray-900 hover:bg-pink-100" },
  { search: /bg-gray-800 text-gray-400 hover:text-white/g, replace: "bg-pink-50 text-gray-600 hover:text-gray-900 hover:bg-pink-100" },

  // Auth Form Shadows
  { search: /boxShadow:\s*"0 0 40px rgba\(255,117,151,0\.1\), 0 25px 50px rgba\(0,0,0,0\.5\)"/g, replace: 'boxShadow: "0 0 40px rgba(255,117,151,0.1), 0 25px 50px rgba(0,0,0,0.1)"' },

  // Any stray purples
  { search: /text-purple-600/g, replace: "text-pink-600" },
  { search: /text-purple-500/g, replace: "text-pink-500" },
  { search: /text-purple-400/g, replace: "text-pink-400" },
  { search: /bg-purple-600/g, replace: "bg-pink-500" },
  { search: /bg-purple-500/g, replace: "bg-pink-400" },
  { search: /purple-500/g, replace: "pink-500" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Skip admin directories
    if (fullPath.includes('dashboard') || fullPath.includes('Dashboard') || fullPath.includes('Sidebar')) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const rule of replacements) {
        content = content.replace(rule.search, rule.replace);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const appDir = path.join(__dirname, 'src', 'app');
const compDir = path.join(__dirname, 'src', 'components');

if (fs.existsSync(appDir)) processDirectory(appDir);
if (fs.existsSync(compDir)) processDirectory(compDir);

console.log('Done with lightmode bugs fix.');
