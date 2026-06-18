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
    if (data.tool_calls) {
      data.tool_calls.forEach(call => {
        if (call.name === 'run_command' || call.name === 'write_to_file') {
          console.log(`Step ${data.step_index}: ${call.name}`);
          console.log(JSON.stringify(call.args, null, 2));
        }
      });
    }
  } catch (err) {
  }
});
