const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/.system_generated/logs/transcript.jsonl';

const fileStream = fs.createReadStream(logPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let count = 0;
rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 424) {
      console.log(JSON.stringify(data, null, 2));
      rl.close();
    }
  } catch (err) {
  }
});
