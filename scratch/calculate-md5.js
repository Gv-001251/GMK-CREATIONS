const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const brainDir = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933';
const downloadsDir = '/Users/lateshk/Downloads';

function getMd5(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// 1. Get all media__ files in brain directory
const brainFiles = fs.readdirSync(brainDir)
  .filter(file => file.startsWith('media__'))
  .map(file => ({
    name: file,
    path: path.join(brainDir, file),
    md5: getMd5(path.join(brainDir, file))
  }));

// 2. Get target files from Downloads
const targetNames = [
  'IMG20251218212613.jpg',
  'IMG20251218112731.jpg',
  'IMG-20251216-WA0031.jpeg',
  'IMG20251028232722.jpg',
  'IMG20251028162817.jpg',
  'IMG20251227104004.jpg',
  'IMG20251127190629.jpg'
];

const downloadFiles = targetNames.map(name => {
  const filePath = path.join(downloadsDir, name);
  return {
    name,
    path: filePath,
    md5: getMd5(filePath)
  };
});

console.log("=== Matching Results ===");
downloadFiles.forEach(df => {
  if (!df.md5) {
    console.log(`Download file ${df.name} not found or has no hash.`);
    return;
  }
  const match = brainFiles.find(bf => bf.md5 === df.md5);
  if (match) {
    console.log(`Original: ${df.name}  ==>  Brain: ${match.name}`);
  } else {
    console.log(`Original: ${df.name}  ==>  No match in brain files.`);
  }
});
