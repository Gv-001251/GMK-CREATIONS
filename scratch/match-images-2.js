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
    
    // We want to find any occurrences of the media files that were not matched in the previous script.
    // For example: media__1781496097108 or media__1781496497568
    const targetMedia = ['media__1781496097108', 'media__1781496097163', 'media__1781496097176', 'media__1781496097189', 'media__1781496097194', 'media__1781496497568', 'media__1781496497575', 'media__1781496497583', 'media__1781496497587', 'media__1781496631006', 'media__1781496632421', 'media__1781496634059', 'media__1781496641008'];
    
    const found = targetMedia.filter(m => lineStr.includes(m));
    if (found.length > 0) {
      console.log(`Step ${data.step_index} (${data.source}):`);
      // Print the tool call arguments or the text content that contains these
      if (data.tool_calls) {
        data.tool_calls.forEach(call => {
          if (JSON.stringify(call).includes(found[0])) {
            console.log("  Tool call:", call.name);
            console.log("  Args:", JSON.stringify(call.args, null, 2));
          }
        });
      } else {
        // Just print snippet of content
        console.log("  Content snippet:", data.content.substring(0, 500));
      }
    }
  } catch (err) {
  }
});
