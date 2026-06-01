import { describe, it, expect } from "vitest";
import { letterSections } from "@/data/cover-letter";

describe("cover-letter data integrity", () => {
  it("gives every section a non-empty heading", () => {
    expect(letterSections.length).toBeGreaterThan(0);
    for (const section of letterSections) {
      expect(section.heading).toBeTruthy();
      expect(section.heading.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives every section at least one body paragraph", () => {
    for (const section of letterSections) {
      expect(section.body.length).toBeGreaterThanOrEqual(1);
      for (const para of section.body) {
        expect(para.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
