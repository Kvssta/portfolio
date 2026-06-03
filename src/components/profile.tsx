"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion, MotionConfig, type Variants } from "motion/react";
import { SoundProvider, usePatch } from "@web-kits/audio/react";
import type { SoundPatch } from "@web-kits/audio";
import minimalJson from "@/sounds/minimal.json";

// Raphael Salaja's "minimal" sound library (fetched from the registry).
const minimalPatch = minimalJson as unknown as SoundPatch;

type CardData = {
  src: string;
  alt: string;
  dx: number; // horizontal offset from the trigger center, px
  rotate: number; // final tilt, deg
  delay: number; // stagger, ms
};

// Card order = back-to-front. The back card pops first, the front one follows.
const caymanCards: CardData[] = [
  { src: "/cards/cayman-2.jpg", alt: "718 Cayman by a parking structure", dx: 34, rotate: 11.9, delay: 0 },
  { src: "/cards/cayman-1.jpg", alt: "718 Cayman at night", dx: -34, rotate: -6.58, delay: 0 },
];

const fujiCards: CardData[] = [
  { src: "/cards/fuji-2.jpg", alt: "Fujifilm photo of a facade", dx: 34, rotate: 11.9, delay: 0 },
  { src: "/cards/fuji-1.jpg", alt: "Fujifilm photo of a building", dx: -34, rotate: -6.58, delay: 0 },
];

type Project = {
  name: string;
  role: string;
  href?: string; // present = linked row (shows arrow)
};

const projects: Project[] = [
  { name: "Steel", role: "Product + Web (no-code)", href: "https://steel.dev" },
  { name: "Acctual", role: "Web (no-code)", href: "https://acctual.com" },
  {
    name: "EVPin",
    role: "Web (NextJS)",
    href: "https://x.com/kosta4a/status/2059988794695164193",
  },
  { name: "Melrose", role: "Web (no-code)", href: "https://getmelrose.com" },
  { name: "Sonatic", role: "Website", href: "https://sonatic.co" },
];

function ArrowUpRight() {
  // Static — no hover movement (per design feedback).
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4 shrink-0"
    >
      <path d="M5 11 11 5" />
      <path d="M5.5 5H11v5.5" />
    </svg>
  );
}

/** Hand-drawn signature (from Figma) that animates as if being written on load. */
function Signature() {
  return (
    <svg
      width={85}
      height={36}
      viewBox="0 0 86.3619 37.7352"
      fill="none"
      role="img"
      aria-label="Nikola Kostadinović's signature"
      className="mb-3 h-[36px] w-[85px] shrink-0 overflow-visible text-black"
    >
      <motion.path
        d="M11.2252 15.5587C3.50887 24.9469 -7.29395 41.0552 11.2252 30.3822C29.7443 19.7093 39.2733 6.17045 41.7229 0.735157L30.0216 33.4904C29.6847 34.4334 30.7892 35.2313 31.5786 34.6151L52.195 18.5234M71.4858 0.735157L52.195 18.5234M52.195 18.5234L85.9998 5.39398M52.195 18.5234C25.3717 24.594 -12.181 36.7352 52.195 36.7352"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: 1, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{
          strokeDashoffset: { duration: 1.6, ease: "easeInOut", delay: 0.3 },
          opacity: { duration: 0.2, delay: 0.3 },
        }}
      />
    </svg>
  );
}

/** Live local time in Belgrade (CET/CEST). Click to toggle 12h ⇄ 24h (EU). */
function LocalTime({
  onHover,
  onToggle,
}: {
  onHover: () => void;
  onToggle: () => void;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [hour12, setHour12] = useState(true);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  // Render a placeholder until mounted so SSR and the client first paint match.
  if (!now) {
    return <span suppressHydrationWarning>…</span>;
  }

  const formatted = new Intl.DateTimeFormat(hour12 ? "en-US" : "en-GB", {
    timeZone: "Europe/Belgrade",
    hour: hour12 ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12,
  }).format(now);

  return (
    <button
      type="button"
      onClick={() => {
        onToggle();
        setHour12((v) => !v);
      }}
      onPointerEnter={onHover}
      aria-label={`Local time, ${formatted}. Click to switch to ${hour12 ? "24-hour" : "12-hour"} format`}
      className="relative inline-flex cursor-pointer items-baseline bg-transparent p-0 align-baseline tabular-nums underline decoration-dotted underline-offset-2 transition-opacity duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:opacity-70"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={hour12 ? "12h" : "24h"}
          initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block"
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** Sleepy Z's drifting up from the top-middle of the Snorlax, fading out as
    they rise. Mixed upper/lowercase for an organic feel. */
function SleepingZs() {
  // delay (s) offset by half the cycle so at most 2 are ever in flight.
  const zs = [
    { delay: 0, letter: "z" },
    { delay: 0.8, letter: "Z" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0">
      {zs.map((z, i) => (
        <motion.span
          key={i}
          className="absolute left-0 top-0 font-sans font-medium text-[14px] leading-none text-[#8d8d8d]"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
          animate={{
            opacity: [0, 0.9, 0],
            x: [0, 3 + i * 2, 5 + i * 4],
            y: [0, -16, -40],
            scale: [0.7, 0.95, 1.25],
          }}
          transition={{
            duration: 1.6,
            delay: z.delay,
            repeat: Infinity,
            ease: "easeOut",
            // Pop in within the first ~15%, then rise + fade out.
            times: [0, 0.15, 1],
          }}
        >
          {z.letter}
        </motion.span>
      ))}
    </div>
  );
}

/** An inline link that reveals a tilting stack of photos on hover + a sound. */
function HoverPreview({
  label,
  cards,
  onHover,
}: {
  label: string;
  cards: CardData[];
  onHover: () => void;
}) {
  return (
    <span className="card-trigger inline-block">
      <span
        onPointerEnter={onHover}
        className="cursor-default underline decoration-dotted underline-offset-2"
      >
        {label}
      </span>
      <span aria-hidden className="card-stack">
        {cards.map((c) => (
          <span
            key={c.src}
            className="hover-card"
            style={
              {
                "--dx": `${c.dx}px`,
                "--r": `${c.rotate}deg`,
                "--delay": `${c.delay}ms`,
              } as CSSProperties
            }
          >
            <Image
              src={c.src}
              alt={c.alt}
              width={145}
              height={172}
              className="h-full w-full object-cover"
            />
          </span>
        ))}
      </span>
    </span>
  );
}

/** Email that copies to the clipboard on click and flashes a "Copied" toast. */
function CopyEmail({
  email,
  onCopy,
  onHover,
}: {
  email: string;
  onCopy: () => void;
  onHover: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Async Clipboard API blocked (insecure context, missing focus, etc.) —
      // fall back to a hidden textarea + execCommand so the email still copies.
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // Nothing more we can do; the toast still flashes.
      }
      document.body.removeChild(ta);
    }
    onCopy();
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={copy}
        onPointerEnter={onHover}
        className="cursor-pointer bg-transparent p-0 align-baseline underline decoration-dotted underline-offset-2 transition-opacity duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:opacity-70"
      >
        {email}
      </button>
      <span aria-hidden className={`copied-toast${copied ? " is-visible" : ""}`}>
        Copied to clipboard
      </span>
    </span>
  );
}

function ProjectRow({
  name,
  role,
  href,
  onHover,
  onPress,
}: Project & { onHover: () => void; onPress: () => void }) {
  const title = (
    <span className="flex items-center gap-1">
      <span>{name}</span>
      {href ? <ArrowUpRight /> : null}
    </span>
  );
  const role_ = <span className="text-[#8d8d8d]">{role}</span>;

  if (!href) {
    return (
      <div className="flex w-full items-center justify-between text-black">
        {title}
        {role_}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={onHover}
      onPointerDown={onPress}
      className="flex w-full items-center justify-between rounded-sm text-black outline-none transition-opacity duration-150 ease-(--ease-out-strong) focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-white [@media(hover:hover)]:hover:opacity-70"
    >
      {title}
      {role_}
    </a>
  );
}

// Page-load entrance: each row fades up from below, staggered top-to-bottom.
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

// Nested groups (header lines, bio paragraphs) cascade their own rows in turn.
const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const rowReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
  },
};

const SNORLAX_W = 117;
const SNORLAX_H = 100;
const SNORLAX_EDGE_MARGIN = 64; // min gap from the left/right/bottom edges
const SNORLAX_TOP_MARGIN = 128; // min gap from the top edge

/** Pick a random on-screen spot for Snorlax that stays ≥64px from the edges
    (≥128px from the top) and avoids the centered content column. */
function pickSnorlaxPosition(contentEl: HTMLElement | null) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const minLeft = SNORLAX_EDGE_MARGIN;
  const maxLeft = Math.max(minLeft, W - SNORLAX_W - SNORLAX_EDGE_MARGIN);
  const minTop = SNORLAX_TOP_MARGIN;
  const maxTop = Math.max(minTop, H - SNORLAX_H - SNORLAX_EDGE_MARGIN);

  let box: { left: number; right: number; top: number; bottom: number } | null =
    null;
  if (contentEl) {
    const r = contentEl.getBoundingClientRect();
    const pad = 24;
    const halfW = 302 + pad; // ~half the 604px card, padded
    const cx = W / 2; // content is horizontally centered
    box = {
      left: cx - halfW,
      right: cx + halfW,
      top: r.top - pad,
      bottom: r.bottom + pad,
    };
  }

  for (let i = 0; i < 60; i++) {
    const left = minLeft + Math.random() * (maxLeft - minLeft);
    const top = minTop + Math.random() * (maxTop - minTop);
    const overlaps =
      box &&
      left < box.right &&
      left + SNORLAX_W > box.left &&
      top < box.bottom &&
      top + SNORLAX_H > box.top;
    if (!overlaps) return { left, top };
  }
  return { left: minLeft, top: maxTop };
}

function ProfileInner() {
  const patch = usePatch(minimalPatch);
  const playHover = () => {
    if (patch.ready) patch.play("hover");
  };
  const playClick = () => {
    if (patch.ready) patch.play("click");
  };

  // Keep the latest patch reachable from timers/handlers below.
  const patchRef = useRef(patch);
  patchRef.current = patch;
  const playSound = (name: string) => {
    if (patchRef.current.ready) patchRef.current.play(name);
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const snorlaxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [snorlaxVisible, setSnorlaxVisible] = useState(false);
  const [snorlaxPos, setSnorlaxPos] = useState<{
    left: number;
    top: number;
  } | null>(null);

  // Snorlax is desktop-only — hidden on mobile / tablet breakpoints.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // On desktop, Snorlax arrives 2s after load (bottom-left) with a "success" chime.
  useEffect(() => {
    if (!isDesktop) {
      setSnorlaxVisible(false);
      return;
    }
    snorlaxTimer.current = setTimeout(() => {
      setSnorlaxPos({
        left: SNORLAX_EDGE_MARGIN,
        top: window.innerHeight - SNORLAX_H - SNORLAX_EDGE_MARGIN,
      });
      setSnorlaxVisible(true);
      playSound("success");
    }, 2000);
    return () => {
      if (snorlaxTimer.current) clearTimeout(snorlaxTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  // Click Snorlax: "undo" + vanish for 2s, then reappear somewhere random.
  const handleSnorlaxClick = () => {
    playSound("undo");
    setSnorlaxVisible(false);
    if (snorlaxTimer.current) clearTimeout(snorlaxTimer.current);
    snorlaxTimer.current = setTimeout(() => {
      setSnorlaxPos(pickSnorlaxPosition(contentRef.current));
      setSnorlaxVisible(true);
      playSound("success");
    }, 2000);
  };

  return (
    <MotionConfig reducedMotion="user">
    <main className="flex min-h-screen w-full justify-center overflow-x-clip bg-[#fafafa] px-5 py-16 text-black sm:items-center">
      <motion.div
        ref={contentRef}
        initial="hidden"
        animate="show"
        variants={stagger}
        className="flex w-full flex-col items-center gap-10 text-[14px] leading-[20px] font-sans font-medium"
      >
        {/* Header */}
        <motion.header
          variants={group}
          className="flex w-full max-w-[560px] flex-col gap-1"
        >
          <Signature />
          <motion.p variants={rowReveal} className="text-black">
            Nikola Kostadinović
          </motion.p>
          <motion.p variants={rowReveal} className="text-[#8d8d8d]">
            prev. co-founder of Adria Studio
          </motion.p>
        </motion.header>

        {/* Bio — paragraphs separated by blank lines (per Figma) with zero
            flex gap between them. */}
        <motion.div
          variants={group}
          className="flex w-full max-w-[560px] flex-col gap-0 break-words"
        >
          <motion.p variants={rowReveal}>
            I&rsquo;m an independent software designer born in the same
            birthplace as Constantine the Great. It&rsquo;s currently{" "}
            <LocalTime onHover={playHover} onToggle={playClick} /> here.
          </motion.p>
          <p aria-hidden>&nbsp;</p>
          <motion.p variants={rowReveal}>
            Currently working on passion projects, improving my driving skills
            in my{" "}
            <HoverPreview
              label="718 Cayman"
              cards={caymanCards}
              onHover={playHover}
            />{" "}
            as well as my photography skills with my{" "}
            <HoverPreview
              label="Fujifilm cam"
              cards={fujiCards}
              onHover={playHover}
            />
            .
          </motion.p>
          <p aria-hidden>&nbsp;</p>
          <motion.p variants={rowReveal}>
            I previously co-founded Adria Studio and scaled it to $400k+ per
            year, a 2-person boutique design studio focused on working with
            a16z/yc backed startups. Notable clients include Chaos Labs, Whop,
            Ostium, Tembo, Buildcores &amp; 15+ more.
          </motion.p>
          <p aria-hidden>&nbsp;</p>
          <motion.p variants={rowReveal}>
            Had my work featured on inspiration/award websites including Mobbin,
            Godly &amp; more.
          </motion.p>
          <p aria-hidden>&nbsp;</p>
          <motion.p variants={rowReveal}>
            Currently open to founding / product design roles at AI startups.
            Reach out to me via{" "}
            <CopyEmail
              email="me@uxkosta.com"
              onCopy={playClick}
              onHover={playHover}
            />{" "}
            or DM me on{" "}
            <a
              href="https://x.com/kosta4a"
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={playHover}
              onPointerDown={playClick}
              className="underline decoration-dotted underline-offset-2 transition-opacity duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:opacity-70"
            >
              Twitter
            </a>
            .
          </motion.p>
        </motion.div>

        {/* Highlights — bordered card (per Figma 16:366). The header's bottom
            hairline replaces the old standalone divider. */}
        <motion.section
          variants={rowReveal}
          className="w-full max-w-[604px] overflow-clip rounded-[20px] border-[0.5px] border-[rgba(0,0,0,0.12)] bg-white"
        >
          <div className="flex w-full items-center justify-between border-b-[0.5px] border-b-[rgba(0,0,0,0.12)] p-5">
            <p className="text-black">Highlights</p>
          </div>
          {/* Each row dims only itself on hover (not the whole column). */}
          <div className="flex flex-col gap-4 p-5 pb-[22px]">
            {projects.map((p) => (
              <ProjectRow
                key={p.name}
                {...p}
                onHover={playHover}
                onPress={playClick}
              />
            ))}
          </div>
        </motion.section>
      </motion.div>
      <AnimatePresence>
        {isDesktop && snorlaxVisible && snorlaxPos && (
          <motion.div
            key="snorlax"
            onClick={handleSnorlaxClick}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{ left: snorlaxPos.left, top: snorlaxPos.top }}
            className="fixed z-40 h-[100px] w-[117px] origin-bottom cursor-pointer select-none"
            role="button"
            aria-label="Snorlax — click to send him somewhere else"
          >
            <Image
              src="/snorlax.png"
              alt="Snorlax"
              width={117}
              height={100}
              className="h-full w-full"
            />
            <SleepingZs />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </MotionConfig>
  );
}

export function Profile() {
  return (
    <SoundProvider>
      <ProfileInner />
    </SoundProvider>
  );
}
