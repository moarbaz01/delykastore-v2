const fs = require('fs');
const path = require('path');

const replacements = {
  'src/app/account/page.tsx': [
    { search: /text-white/g, replace: "text-gray-900" },
    // Revert button text back to white
    { search: /text-gray-900 text-sm font-semibold transition-all duration-300 hover:shadow/g, replace: "text-white text-sm font-semibold transition-all duration-300 hover:shadow" },
    { search: /bg-white\/5/g, replace: "bg-pink-50" },
    { search: /hover:bg-white\/10/g, replace: "hover:bg-pink-100" },
    { search: /hover:text-gray-900 transition-colors/g, replace: "hover:text-gray-900 transition-colors" }, // just in case
    { search: /bg-black\/60/g, replace: "bg-black/20" }, // Support modal overlay
  ],
  'src/app/order-history/page.tsx': [
    { search: /text-gray-100/g, replace: "text-gray-900" },
    { search: /text-white/g, replace: "text-gray-900" },
    { search: /bg-white\/5/g, replace: "bg-pink-50" },
    { search: /border-white\/30/g, replace: "border-gray-200" },
    // Fix pagination chevron buttons that we just turned to text-gray-900
    { search: /text-gray-900 disabled:opacity-40 hover:bg-primary\/10/g, replace: "text-gray-600 disabled:opacity-40 hover:bg-primary/10 hover:text-primary" },
    // Fix active filter option text color
    { search: /bg-primary\/20 text-gray-900 font-medium/g, replace: "bg-primary/20 text-primary font-bold" },
  ],
  'src/components/About/index.tsx': [
    { search: /text-white/g, replace: "text-gray-900" },
    { search: /from-white to-gray-400/g, replace: "from-gray-900 to-gray-600" },
  ],
};

for (const [relativePath, rules] of Object.entries(replacements)) {
  const filePath = path.join(__dirname, relativePath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const rule of rules) {
      content = content.replace(rule.search, rule.replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${relativePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

console.log('Done fixing profile, order history, and about pages.');
