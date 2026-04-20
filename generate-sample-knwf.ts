import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';

const zip = new AdmZip();
const sourceDir = path.join(__dirname, 'samples/wf_simple');
const targetFile = path.join(__dirname, 'samples/wf_simple.knwf');

if (fs.existsSync(sourceDir)) {
  zip.addLocalFolder(sourceDir);
  zip.writeZip(targetFile);
  console.log(`Generated: ${targetFile}`);
} else {
  console.error(`Source not found: ${sourceDir}`);
}
