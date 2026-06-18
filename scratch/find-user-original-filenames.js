const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/.system_generated/logs/transcript.jsonl';

const fileStream = fs.createReadStream(logPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

const targetNames = [
  'IMG20251218212613.jpg',
  'IMG20251218112731.jpg',
  'IMG-20251216-WA0031.jpeg',
  'IMG20251028232722.jpg',
  'IMG20251028162817.jpg',
  'IMG20251227104004.jpg',
  'IMG20251127190629.jpg'
];

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    const lineStr = JSON.stringify(data);
    
    targetNames.forEach(name => {
      // Check if this step contains the target name
      // e.g. "originalName": "IMG20251218212613.jpg" or in text
      if (lineStr.toLowerCase().includes(name.toLowerCase())) {
        console.log(`FOUND ${name} in Step ${data.step_index} (${data.source}):`);
        console.log(JSON.stringify(data, null, 2).substring(0, 1000));
      }
    });
  } catch (err) {
  }
});
