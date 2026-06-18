const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const brainDir = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933';
const downloadsDir = '/Users/lateshk/Downloads';

function getMd5(filePath) {
  if (!fs.existsSync(filePath)) return "NOT_FOUND";
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

console.log("=== DOWNLOAD FILES ===");
const targetNames = [
  'IMG20251218212613.jpg',
  'IMG20251218112731.jpg',
  'IMG-20251216-WA0031.jpeg',
  'IMG20251028232722.jpg',
  'IMG20251028162817.jpg',
  'IMG20251227104004.jpg',
  'IMG20251127190629.jpg'
];
targetNames.forEach(name => {
  console.log(`${name}: ${getMd5(path.join(downloadsDir, name))}`);
});

console.log("=== BRAIN FILES ===");
fs.readdirSync(brainDir)
  .filter(file => file.startsWith('media__'))
  .forEach(file => {
    console.log(`${file}: ${getMd5(path.join(brainDir, file))}`);
  });
