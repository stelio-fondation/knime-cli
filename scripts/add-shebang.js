const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.js');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  if (!content.startsWith('#!')) {
    content = '#!/usr/bin/env node\n' + content;
    fs.writeFileSync(indexPath, content);
    console.log('✅ Shebang ajouté à dist/index.js');
  }
}
