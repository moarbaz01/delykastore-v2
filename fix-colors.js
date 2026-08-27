const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /#0D0B1A/g, replace: "#FDFDFD" },
  { search: /#12102A/g, replace: "#FFFFFF" },
  { search: /#1A1730/g, replace: "#FDFDFD" },
  { search: /#1A163B/g, replace: "#FFFFFF" },
  { search: /purple-500/g, replace: "pink-500" },
  { search: /purple-400/g, replace: "primary" },
  { search: /purple-300/g, replace: "primary" },
  { search: /text-purple-400/g, replace: "text-primary" },
  { search: /text-purple-300/g, replace: "text-primary" },
  { search: /168,85,247/g, replace: "255,117,151" },
  { search: /#A855F7/g, replace: "#FF7597" },
  { search: /#7B2FBE/g, replace: "#E55577" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('dashboard') || fullPath.includes('api')) continue; // skip admin panel and api

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const rule of replacements) {
        content = content.replace(rule.search, rule.replace);
      }
      
      // Specifically for auth and account pages, fix white text
      if (fullPath.includes('login') || fullPath.includes('signup') || fullPath.includes('forgot-password') || fullPath.includes('account') || fullPath.includes('order-history')) {
        // Change text-white and text-gray-300 to darker colors
        content = content.replace(/text-gray-300/g, 'text-gray-600');
        content = content.replace(/text-gray-400/g, 'text-gray-600');
        // Be careful with text-white, let's just do it manually if it's broken, or just replace specific ones
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const appDir = path.join(__dirname, 'src', 'app');
if (fs.existsSync(appDir)) {
  processDirectory(appDir);
  console.log('Done updating src/app colors.');
}
