import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { TabBar } from "@/components/TabBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsPing } from "@/components/AnalyticsPing";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Mario Alina — Interactive Resume",
    template: "%s | Mario Alina",
  },
  description:
    "Interactive resume + cover letter for Purple LAB. Built with Next.js, tRPC, Drizzle, and Framer Motion — a work sample that is the argument.",
  openGraph: {
    title: "Mario Alina — Interactive Resume for Purple LAB",
    description:
      "An over-engineered interactive resume that doubles as a work sample for AI agent orchestration.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mario Alina — Interactive Resume for Purple LAB",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="theme">
          <TRPCProvider>
            <div className="flex min-h-screen flex-col">
              <header className="flex items-center justify-between pr-4">
                <TabBar />
                <div className="no-print flex-shrink-0">
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="no-print mt-8 border-t border-brand-200 py-4 text-center text-xs text-brand-500 dark:border-brand-800 dark:text-brand-400">
                <p>
                  Built by Mario Alina for Purple LAB.{" "}
                  <span title="Runs on Fly.io — yes, intentionally. Ask me why." className="cursor-help">
                    AWS shop, runs on Fly.
                  </span>{" "}
                  <a
                    href="https://github.com/marioalina/CVapplication"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-brand-700"
                  >
                    View source
                  </a>
                </p>
              </footer>
              <AnalyticsPing />
            </div>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
