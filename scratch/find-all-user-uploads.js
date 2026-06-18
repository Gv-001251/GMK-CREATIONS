const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/.system_generated/logs/transcript.jsonl';

const fileStream = fs.createReadStream(logPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      // Look at the entire object structure and print key-values that have file names
      const str = JSON.stringify(data);
      // Look for any jpg, png, jpeg references and print their surroundings
      const regex = /[^"'\s]*\.(jpg|png|jpeg)[^"'\s]*/gi;
      const matches = str.match(regex);
      if (matches) {
        console.log(`Step ${data.step_index}:`);
        console.log("  Image matches:", [...new Set(matches)]);
      }
    }
  } catch (err) {
  }
});
