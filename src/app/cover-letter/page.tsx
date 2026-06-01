import type { Metadata } from "next";
import { letterSections } from "@/data/cover-letter";
import { Scrollytelling } from "@/components/cover-letter/Scrollytelling";

export const metadata: Metadata = {
  title: "Cover Letter",
  description:
    "Why agent orchestration, why Purple LAB, why me — a scrollytelling cover letter.",
};

export default function CoverLetterPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Intro */}
      <div className="mb-12 text-sm text-brand-500 dark:text-brand-400">
        <p>To the Purple LAB hiring team —</p>
      </div>

      {/* Scrollytelling sections — content only from cover-letter.ts (Constraint) */}
      <Scrollytelling sections={letterSections} />

      {/* Signing off */}
      <div className="mt-16 border-t border-brand-200 pt-8 dark:border-brand-700">
        <p className="text-brand-700 dark:text-brand-300">With genuine enthusiasm,</p>
        <p className="mt-1 font-semibold text-brand-900 dark:text-brand-100">Mario Alina</p>
        <p className="mt-4 text-xs text-brand-400 dark:text-brand-500">
          AWS shop, runs on Fly.{" "}
          <a
            href="/docs/adr/0001-fly-over-aws"
            className="underline hover:text-brand-600"
          >
            Ask me why.
          </a>
        </p>
      </div>
    </div>
  );
}
