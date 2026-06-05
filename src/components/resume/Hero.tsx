"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowDown, Download, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import type { ResumeHeader } from "@/data/resume.types";
import { useTilt } from "./hero/useTilt";
import { MagneticButton } from "./hero/MagneticButton";
import styles from "./hero/Hero.module.css";

const socialIcon: Record<string, React.ElementType> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const up: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "110%" },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";
const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white/70 px-5 py-3 text-[15px] font-semibold text-slate-800 transition-colors hover:border-brand-500 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100";

interface HeroProps {
  header: ResumeHeader;
  getInTouchLabel: string;
  /** Short supporting line under the title (e.g. first sentence of the summary). */
  tagline?: string;
  available: string;
  viewResume: string;
  downloadPdf: string;
  connect: string;
  openToRoles: string;
}

export function Hero({
  header,
  getInTouchLabel,
  tagline,
  available,
  viewResume,
  downloadPdf,
  connect,
  openToRoles,
}: HeroProps) {
  const reduce = useReducedMotion();
  const tilt = useTilt(9);
  const nameWords = header.name.split(" ");
  const socials = header.contacts.filter(
    (c) => c.kind === "github" || c.kind === "linkedin",
  );
  const [city, ...rest] = (header.location ?? "").split(",");
  const region = rest.join(",").trim();

  const reveal = reduce
    ? undefined
    : {
        initial: { clipPath: "inset(0 0 100% 0)", scale: 1.06, opacity: 0 },
        animate: { clipPath: "inset(0% 0 0% 0)", scale: 1, opacity: 1 },
        transition: { duration: 1.05, ease: EASE },
      };

  return (
    <section className={styles.stage} aria-label={header.name}>
      <div className={`${styles.bg} ${styles.grid}`} aria-hidden="true">
        <span className={`${styles.blob} ${styles.blobA}`} />
        <span className={`${styles.blob} ${styles.blobB}`} />
      </div>

      <div className="relative z-[1] mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:px-10 md:py-24">
        {/* Copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          <motion.span
            variants={up}
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400"
          >
            <span className={styles.statusDot} /> {available}
          </motion.span>

          <div>
            <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-slate-900 dark:text-white">
              {nameWords.map((w, i) => (
                <span
                  key={i}
                  className="inline-block overflow-hidden align-bottom"
                  style={{ marginRight: "0.26em" }}
                >
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              variants={up}
              className="mt-2 text-[clamp(1.1rem,2vw,1.5rem)] font-semibold text-brand-600 dark:text-brand-400"
            >
              {header.title}
            </motion.p>
          </div>

          {tagline && (
            <motion.p
              variants={up}
              className="max-w-[46ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-relaxed text-slate-600 dark:text-slate-300"
              style={{ textWrap: "pretty" }}
            >
              {tagline}
            </motion.p>
          )}

          <motion.div variants={up} className="flex flex-wrap items-center gap-3.5">
            <MagneticButton href="#profile-heading" className={btnPrimary}>
              {viewResume} <ArrowDown size={17} />
            </MagneticButton>
            <MagneticButton href="#contact" className={btnGhost}>
              <Mail size={17} /> {getInTouchLabel}
            </MagneticButton>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-1.5 py-3 text-[15px] font-semibold text-slate-500 transition-colors hover:text-brand-600"
            >
              <Download size={16} /> {downloadPdf}
            </button>
          </motion.div>

          <motion.div variants={up} className="flex items-center gap-3.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {connect}
            </span>
            <div className="flex gap-2">
              {socials.map((s) => {
                const Icon = socialIcon[s.kind] ?? GithubIcon;
                return (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-brand-200 bg-white/60 text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Portrait */}
        <div className={styles.portrait}>
          <motion.div
            ref={tilt.ref}
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
            className={styles.tilt}
            style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
          >
            <span className={styles.ring} aria-hidden="true" />
            <motion.div className={styles.imgWrap} {...reveal}>
              <Image
                src={header.photoSrc}
                alt={`${header.name} — portrait`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 440px"
                className="object-cover"
                draggable={false}
              />
            </motion.div>

            <div className={`${styles.badge} ${styles.bob}`} style={{ top: 18, left: -34 }}>
              <span className={styles.statusDot} /> <span>{openToRoles}</span>
            </div>
            {header.location && (
              <div
                className={`${styles.badge} ${styles.bobDelay}`}
                style={{ bottom: 26, right: -30 }}
              >
                <MapPin />{" "}
                <span>
                  {city}
                  {region && <span className={styles.badgeMuted}> · {region}</span>}
                </span>
              </div>
            )}
            <span
              className={`${styles.accentDot} ${styles.accentRing}`}
              style={{ width: 22, height: 22, top: -14, right: 60, color: "#06b6d4" }}
            />
            <span
              className={styles.accentDot}
              style={{ width: 14, height: 14, top: 30, right: -14, background: "#2dd4bf" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
