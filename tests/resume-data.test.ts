import { describe, it, expect } from "vitest";
import { resumeCs, resumeEn } from "@/data/resume";
import type { ResumeData } from "@/data/resume.types";
import { labels } from "@/lib/labels";

const locales: Array<[string, ResumeData]> = [
  ["cs", resumeCs],
  ["en", resumeEn],
];

describe("resume data integrity", () => {
  describe.each(locales)("locale: %s", (_locale, resume) => {
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

    it("uses the portrait.png headshot", () => {
      expect(resume.header.photoSrc).toBe("/portrait.png");
    });

    it("exposes no email contact and includes github + linkedin (form removed)", () => {
      // D2/D3: no email may be exposed in the header after the contact form removal.
      const kinds = resume.header.contacts.map((c) => c.kind);
      expect(kinds).not.toContain("email");
      expect(kinds).toContain("github");
      expect(kinds).toContain("linkedin");
      // Belt-and-braces: no mailto: href, no literal email address.
      for (const c of resume.header.contacts) {
        expect(c.href.startsWith("mailto:")).toBe(false);
        expect(c.href).not.toContain("mario.alina11@gmail.com");
        expect(c.label).not.toContain("mario.alina11@gmail.com");
      }
    });

    it("has >= 3 experience entries with truthy period", () => {
      expect(resume.experience.length).toBeGreaterThanOrEqual(3);
      for (const entry of resume.experience) {
        expect(entry.period).toBeTruthy();
      }
    });

    it("MoroSystems entry has 2 nested projects with valid fields and unchanged period", () => {
      const moro = resume.experience.find((e) => e.company === "Morosystems");
      expect(moro).toBeDefined();
      // D4 regression guard: existing period preserved.
      expect(moro!.period).toBeTruthy();
      // D5/D2: exactly two nested projects.
      expect(moro!.projects).toBeDefined();
      expect(moro!.projects!.length).toBe(2);
      // Each project has truthy name, truthy description, and >= 1 tech entry.
      for (const project of moro!.projects!) {
        expect(project.name).toBeTruthy();
        expect(project.description).toBeTruthy();
        expect(project.tech.length).toBeGreaterThanOrEqual(1);
      }
      // Locale-independent identity: proper nouns present, in order.
      expect(moro!.projects![0].name).toContain("AstraZeneca");
      expect(moro!.projects![1].name).toContain("Global Payments");
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
        (p: { href?: string }) => p.href && p.href.includes("github.com")
      );
      // Also check contacts for github kind
      const contactGithub = resume.header.contacts.some(
        (c: { kind: string; href: string }) =>
          c.kind === "github" || (c.href && c.href.includes("github.com"))
      );
      expect(projectGithub || contactGithub).toBe(true);
    });

    it("has a non-empty summary", () => {
      expect(resume.summary).toBeTruthy();
      expect(resume.summary.trim().length).toBeGreaterThan(0);
    });

    it("has >= 1 certification with truthy name", () => {
      expect(resume.certifications.length).toBeGreaterThanOrEqual(1);
      for (const cert of resume.certifications) {
        expect(cert.name).toBeTruthy();
      }
    });
  });
});

describe("hero label keys (D1 bilingual parity)", () => {
  const heroKeys = ["available", "viewResume", "downloadPdf", "openToRoles", "connect"] as const;
  it.each(heroKeys)("key '%s' exists and is non-empty in both locales", (key) => {
    expect(labels.cs[key]).toBeTruthy();
    expect(labels.en[key]).toBeTruthy();
  });
});
