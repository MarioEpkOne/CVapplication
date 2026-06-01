import { describe, it, expect } from "vitest";
import { resume } from "@/data/resume";

const YYYY_MM = /^\d{4}-(0[1-9]|1[0-2])$/;

describe("resume data integrity", () => {
  it("has all required header fields", () => {
    expect(resume.header.name).toBeTruthy();
    expect(resume.header.title).toBeTruthy();
    expect(resume.header.photoSrc).toBeTruthy();
    expect(resume.header.contacts.length).toBeGreaterThanOrEqual(1);
    // Every contact must have kind, label, and href
    for (const contact of resume.header.contacts) {
      expect(contact.kind).toBeTruthy();
      expect(contact.label).toBeTruthy();
      expect(contact.href).toBeTruthy();
    }
  });

  it("has valid YYYY-MM start dates for every experience entry", () => {
    expect(resume.experience.length).toBeGreaterThanOrEqual(2);
    for (const entry of resume.experience) {
      expect(entry.start).toMatch(YYYY_MM);
    }
  });

  it("has valid end dates: 'present' or >= start", () => {
    for (const entry of resume.experience) {
      if (entry.end === "present") {
        expect(entry.end).toBe("present");
      } else {
        expect(entry.end).toMatch(YYYY_MM);
        // Lexicographic comparison works for YYYY-MM formatted strings
        expect(entry.end >= entry.start).toBe(true);
      }
    }
  });

  it("lists experience newest-first", () => {
    // For consecutive entries, the earlier entry's effective end >= later entry's effective end
    // Treat 'present' as max (sorts above all YYYY-MM)
    const effectiveEnd = (end: string) => (end === "present" ? "9999-99" : end);

    for (let i = 0; i < resume.experience.length - 1; i++) {
      const current = effectiveEnd(resume.experience[i]!.end);
      const next = effectiveEnd(resume.experience[i + 1]!.end);
      expect(current >= next).toBe(true);
    }
  });

  it("has at least one education entry", () => {
    expect(resume.education.length).toBeGreaterThanOrEqual(1);
    for (const entry of resume.education) {
      expect(entry.school).toBeTruthy();
      expect(entry.credential).toBeTruthy();
    }
  });

  it("includes a GitHub repo link in projects or contacts", () => {
    // Check projects for a github.com link
    const projectGithub = resume.projects?.some(
      (p) => p.href && p.href.includes("github.com")
    );
    // Also check contacts for github kind
    const contactGithub = resume.header.contacts.some(
      (c) => c.kind === "github" || (c.href && c.href.includes("github.com"))
    );
    expect(projectGithub || contactGithub).toBe(true);
  });
});
