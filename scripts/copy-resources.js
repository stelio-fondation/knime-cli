const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

const srcRes = path.resolve(__dirname, '../src/resources');
const distRes = path.resolve(__dirname, '../dist/resources');

console.log(`📂 Copying resources from ${srcRes} to ${distRes}...`);
copyFolderSync(srcRes, distRes);
console.log('✅ Resources copied.');
