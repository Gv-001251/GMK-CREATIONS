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
    
    // Look at steps where model/system or user talks about files, or check data fields
    const lineStr = JSON.stringify(data);
    if (lineStr.includes('IMG20') || lineStr.includes('IMG-20') || lineStr.includes('media__') || lineStr.includes('media_d66')) {
      // Print the step details and matching parts
      console.log(`Step ${data.step_index} (${data.type}):`);
      // Find all matches for media__ or IMG in lineStr
      const matches = lineStr.match(/(media_[a-zA-Z0-9_-]+|media__[0-9]+|IMG[-_0-9A-Z]+)/g);
      if (matches) {
        console.log("  Matches:", [...new Set(matches)]);
      }
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
});
