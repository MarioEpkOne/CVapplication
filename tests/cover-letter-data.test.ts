import { describe, it, expect } from "vitest";
import { letterSectionsCz, letterSectionsEn } from "@/data/cover-letter";
import type { LetterSection } from "@/data/cover-letter";

const locales: Array<[string, LetterSection[]]> = [
  ["cs", letterSectionsCz],
  ["en", letterSectionsEn],
];

describe("cover-letter data integrity", () => {
  describe.each(locales)("locale: %s", (_locale, sections) => {
    it("gives every section a non-empty heading", () => {
      expect(sections.length).toBeGreaterThan(0);
      for (const section of sections) {
        expect(section.heading).toBeTruthy();
        expect(section.heading.trim().length).toBeGreaterThan(0);
      }
    });

    it("gives every section at least one body paragraph", () => {
      for (const section of sections) {
        expect(section.body.length).toBeGreaterThanOrEqual(1);
        for (const para of section.body) {
          expect(para.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it("has exactly 4 sections with correct IDs", () => {
      expect(sections.length).toBe(4);
      const ids = sections.map((s) => s.id);
      expect(ids).toContain("hook");
      expect(ids).toContain("orchestration");
      expect(ids).toContain("why-purple");
      expect(ids).toContain("why-me");
    });
  });
});
