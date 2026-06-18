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
    const lineStr = JSON.stringify(data);
    
    // We want to find any mapping between original filenames and media__ filenames
    // For example, when a script is written, it might contain the mapping, e.g.:
    // "localPath": "...media__1781494963468.jpg", "filename": "ufo-lamp-red.jpg"
    if (lineStr.includes('localPath') && lineStr.includes('media__')) {
      console.log(`Step ${data.step_index}:`);
      // Find all matches for media__ or IMG in lineStr
      const matches = lineStr.match(/(media__[0-9]+|IMG[-_0-9A-Z]+|ufo|keychain|nameplate|lithophane|shiva|robot|vr|elephant|chakra|flower|tile|prabhavali)[^"'\s]*\.(jpg|png|jpeg)/gi);
      if (matches) {
        console.log("  Matches:", [...new Set(matches)]);
      }
    }
  } catch (err) {
  }
});
