import { parseModel } from "./stl-parser";

self.onmessage = (e: MessageEvent) => {
  try {
    const { buffer, format } = e.data;
    const result = parseModel(buffer, format);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
};
