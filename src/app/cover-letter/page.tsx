import type { Metadata } from "next";
import { CoverLetterContent } from "@/components/cover-letter/CoverLetterContent";

export const metadata: Metadata = {
  title: "Cover Letter",
  description:
    "Why agent orchestration, why this work, why me — a scrollytelling cover letter.",
};

export default function CoverLetterPage() {
  return <CoverLetterContent />;
}
