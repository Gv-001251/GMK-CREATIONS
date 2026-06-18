import { parseSTL } from "./stl-parser";

self.onmessage = (e: MessageEvent) => {
  try {
    const { buffer } = e.data;
    const result = parseSTL(buffer);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
};
