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
  start: string; // ISO 'YYYY-MM'
  end: string | "present";
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

export interface LanguageEntry {
  name: string;
  level: string;
}

export interface ResumeData {
  header: ResumeHeader;
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  education: EducationEntry[];
  projects?: ProjectEntry[];
  languages?: LanguageEntry[];
}
