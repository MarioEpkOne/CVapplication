export interface ContactLink {
  kind: "email" | "github" | "linkedin" | "website" | string;
  label: string;
  href: string;
}

export interface ResumeHeader {
  name: string;
  title: string;
  photoSrc: string; // public/ path; circular in header, flows into PDF
  location?: string;
  contacts: ContactLink[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;        // freeform: "2025 -- present", "2.5 years", etc.
  bullets: string[];
  tech?: string[];
}

export interface SkillGroup {
  group: "Languages" | "Cloud/AWS" | "AI tooling" | "Frontend" | "Backend" | "DevOps" | string;
  items: string[];
}

export interface EducationEntry {
  school: string;
  credential: string;
  start?: string;
  end?: string;
}

export interface ProjectEntry {
  name: string;
  href?: string;
  blurb: string;
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}

export interface ResumeData {
  header: ResumeHeader;
  summary: string;                       // profile/summary section
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  education: EducationEntry[];
  certifications: CertificationEntry[];  // courses & certifications
  projects?: ProjectEntry[];
  languages?: LanguageEntry[];
}
