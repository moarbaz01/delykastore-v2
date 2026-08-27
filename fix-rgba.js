const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /rgba\(18,16,42,0\.85\)/g, replace: "rgba(255,255,255,0.95)" },
  { search: /rgba\(13,11,26,0\.8\)/g, replace: "#FFFFFF" },
  { search: /text-white font-bold outline-none/g, replace: "text-gray-900 font-bold outline-none" }, // for OTP input
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
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

const authDir = path.join(__dirname, 'src', 'app', '(auth)');
if (fs.existsSync(authDir)) {
  processDirectory(authDir);
  console.log('Done updating rgba colors.');
}
