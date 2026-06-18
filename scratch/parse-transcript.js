const fs = require('fs');
const readline = require('readline');
const path = require('path');

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
      console.log(`--- Step ${data.step_index} ---`);
      console.log(data.content);
      if (data.tool_calls) {
        console.log("Tool Calls:", JSON.stringify(data.tool_calls, null, 2));
      }
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
});
