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
    
    // Look at steps where user uploaded files (source is USER_EXPLICIT or type is USER_INPUT)
    if (data.type === 'USER_INPUT') {
      console.log(`Step ${data.step_index}:`);
      // Print anything in data that looks like it has filenames, e.g. data.tool_calls or other metadata
      console.log(JSON.stringify(data, null, 2).substring(0, 1500));
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
});
