import type { Metadata } from "next";
import { CoverLetterContent } from "@/components/cover-letter/CoverLetterContent";

export const metadata: Metadata = {
  title: "Cover Letter",
  description:
    "Why agent orchestration, why Purple LAB, why me — a scrollytelling cover letter.",
};

export default function CoverLetterPage() {
  return <CoverLetterContent />;
}
