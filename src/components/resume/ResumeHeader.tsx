import { Avatar } from "./Avatar";
import { PrintButton } from "./PrintButton";
import type { ResumeHeader as ResumeHeaderData } from "@/data/resume.types";
import { Mail, Globe, MapPin, MessageCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";

const iconMap: Record<string, React.ElementType> = {
  email: Mail,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  website: Globe,
};

interface ResumeHeaderProps {
  header: ResumeHeaderData;
  getInTouchLabel: string;
  printMode?: boolean;
}

export function ResumeHeader({ header, getInTouchLabel, printMode = false }: ResumeHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {/* Photo (circular) */}
      <Avatar src={header.photoSrc} name={header.name} size={96} />

      {/* Name / title / location / contacts */}
      <div className="flex flex-1 flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 dark:text-brand-100">{header.name}</h1>
          <p className="text-lg text-brand-600 dark:text-brand-400">{header.title}</p>
          {header.location && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-brand-500 dark:text-brand-400">
              <MapPin size={12} />
              {header.location}
            </p>
          )}
        </div>

        {/* Contact links */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {header.contacts.map((contact) => {
            const Icon = iconMap[contact.kind] ?? Globe;
            return (
              <li key={contact.href}>
                <a
                  href={contact.href}
                  target={contact.kind !== "email" ? "_blank" : undefined}
                  rel={contact.kind !== "email" ? "noopener noreferrer" : undefined}
                  className="flex min-h-9 items-center gap-1 py-1 text-sm text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
                >
                  <Icon size={12} aria-hidden />
                  {contact.label}
                </a>
              </li>
            );
          })}
          {!printMode && (
            <li className="no-print">
              <a
                href="#contact"
                className="flex min-h-9 items-center gap-1 py-1 text-sm font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
              >
                <MessageCircle size={12} aria-hidden />
                {getInTouchLabel}
              </a>
            </li>
          )}
        </ul>

        {/* Print / PDF button — client component, hidden in print */}
        {!printMode && (
          <div className="no-print">
            <PrintButton />
          </div>
        )}
      </div>
    </header>
  );
}
