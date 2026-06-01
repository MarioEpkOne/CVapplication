import type { Metadata } from "next";
import { ResumeContent } from "@/components/resume/ResumeContent";

export const metadata: Metadata = {
  title: "Mario — Interactive Resume",
  description: "Mario Alina — Backend Engineer & AI Agent Orchestrator. Interactive CV for Purple LAB.",
};

export default function ResumePage() {
  return <ResumeContent />;
}
