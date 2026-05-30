import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
    });

    it("handles conditional classes", () => {
      const isActive = true;
      expect(cn("px-2", isActive && "bg-blue-500")).toBe("px-2 bg-blue-500");
    });

    it("resolves tailwind conflicts using tailwind-merge", () => {
      expect(cn("p-4", "p-2")).toBe("p-2");
    });
  });
});
