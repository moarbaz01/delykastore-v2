const fs = require('fs');
const path = require('path');

const replacements = {
  'PaymentSummary.tsx': [
    { search: /rgba\(18, 16, 42, 0\.95\)/g, replace: "rgba(255, 255, 255, 0.95)" },
    { search: /text-white p-4/g, replace: "text-gray-900 p-4" },
    { search: /#ffffff, #C084FC/g, replace: "#E55577, #FF7597" },
  ],
  'PaymentSection.tsx': [
    { search: /text-white">ABA KHQR/g, replace: 'text-gray-900">ABA KHQR' },
    { search: /#C084FC, #FF7597/g, replace: "#FF9CB5, #FF7597" },
  ],
  'PackageSection.tsx': [
    { search: /color: "#C084FC"/g, replace: 'color: "#FF7597"' },
  ],
  'CouponSection.tsx': [
    { search: /text-white placeholder:text-gray-500/g, replace: "text-gray-900 placeholder:text-gray-500" },
    { search: /text-green-400/g, replace: "text-green-600" },
    { search: /text-red-400/g, replace: "text-red-500" }
  ],
  'UserIdSection.tsx': [
    { search: /text-white text-sm py-2\.5/g, replace: "text-gray-900 text-sm py-2.5" },
    { search: /text-green-400/g, replace: "text-green-600" },
    { search: /text-red-400/g, replace: "text-red-500" }
  ],
  'index.tsx': [
    { search: /text-white placeholder:text-gray-500/g, replace: "text-gray-900 placeholder:text-gray-500" },
  ]
};

const dir = path.join(__dirname, 'src', 'components', 'Product');

for (const [filename, rules] of Object.entries(replacements)) {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const rule of rules) {
      content = content.replace(rule.search, rule.replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filename}`);
    }
  }
}

console.log('Done fixing product page sections.');
