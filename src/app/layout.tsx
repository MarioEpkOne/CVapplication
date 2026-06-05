import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { LocaleProvider } from "@/lib/locale";
import { TabBar } from "@/components/TabBar";
import { SiteFooter } from "@/components/SiteFooter";
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
    "Interactive resume + cover letter. Built with Next.js, tRPC, Drizzle, and Framer Motion — a work sample that is the argument.",
  openGraph: {
    title: "Mario Alina — Interactive Resume",
    description:
      "An over-engineered interactive resume that doubles as a work sample for AI agent orchestration.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mario Alina — Interactive Resume",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="theme">
          <LocaleProvider>
            <TRPCProvider>
              <div className="flex min-h-screen flex-col">
                <TabBar />
                <main className="flex-1">{children}</main>
                <SiteFooter />
                <AnalyticsPing />
              </div>
            </TRPCProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
