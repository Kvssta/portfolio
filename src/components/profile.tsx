"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig, type Variants } from "motion/react";
import { thoughts as thoughtsData } from "@/data/thoughts";
import { playground as playgroundData } from "@/data/playground";
import { getReadArticles } from "@/lib/read-articles";
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
  href?: string; // external link (new tab, shows arrow)
  internalHref?: string; // internal route (same tab, no arrow)
  dot?: boolean; // small leading marker (e.g. readable article)
};

const projects: Project[] = [
  { name: "Steel", role: "Product + Web (Framer)", href: "https://steel.dev" },
  { name: "Acctual", role: "Web (Framer)", href: "https://acctual.com" },
  {
    name: "EVPin",
    role: "Web (NextJS)",
    href: "https://x.com/kosta4a/status/2059988794695164193",
  },
  { name: "Melrose", role: "Web (Framer)", href: "https://getmelrose.com" },
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
      className="size-5 shrink-0"
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
  internalHref,
  dot,
  onHover,
  onPress,
  onActivate,
}: Project & {
  onHover: () => void;
  onPress: () => void;
  onActivate?: (el: HTMLElement) => void;
}) {
  const title = (
    <span className="flex items-center gap-1">
      {dot ? (
        <span
          aria-hidden
          className="mr-2 size-1.5 shrink-0 rounded-full bg-[#2e90fa] shadow-[0_0_6px_rgba(46,144,250,0.5)]"
        />
      ) : null}
      <span>{name}</span>
      {href ? <ArrowUpRight /> : null}
    </span>
  );
  const role_ = <span className="text-[#8d8d8d]">{role}</span>;

  // 12px padding; -mx-3 + width:100%+24px makes the row 24px wider than the
  // 640px column so the text still aligns with the content above. z-10 keeps
  // the content above the shared moving hover background.
  const base =
    "relative z-10 -mx-3 flex w-[calc(100%+24px)] cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-black";
  const linkClass = `${base} outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/15`;

  // Internal note → its own article route (same tab, no arrow).
  if (internalHref) {
    return (
      <Link
        href={internalHref}
        onPointerEnter={(e) => {
          onHover();
          onActivate?.(e.currentTarget);
        }}
        onPointerDown={onPress}
        className={linkClass}
      >
        {title}
        {role_}
      </Link>
    );
  }

  // External link (video) → new tab with arrow.
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerEnter={(e) => {
          onHover();
          onActivate?.(e.currentTarget);
        }}
        onPointerDown={onPress}
        className={linkClass}
      >
        {title}
        {role_}
      </a>
    );
  }

  // Plain row (no destination).
  return (
    <div className={base} onPointerEnter={(e) => onActivate?.(e.currentTarget)}>
      {title}
      {role_}
    </div>
  );
}

/** A list of ProjectRows sharing a single background that slides between rows
    on hover. It fades in on first hover and fades out when the list is left. */
function HoverList({
  items,
  onHover,
  onPress,
}: {
  items: Project[];
  onHover: () => void;
  onPress: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [box, setBox] = useState({ top: 0, height: 0, instant: true });
  const wasActive = useRef(false);

  const enter = (i: number, el: HTMLElement) => {
    // Jump (no slide) when arriving from outside the list; slide when moving
    // between rows.
    setBox({ top: el.offsetTop, height: el.offsetHeight, instant: !wasActive.current });
    wasActive.current = true;
    setActive(i);
  };

  const posTransition = box.instant
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 44 };

  return (
    <div
      className="relative -mt-1 flex flex-col gap-1"
      onPointerLeave={() => {
        wasActive.current = false;
        setActive(null);
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-x-3 z-0 rounded-xl bg-black/[0.04]"
        initial={false}
        animate={{
          top: box.top,
          height: box.height,
          opacity: active !== null ? 1 : 0,
        }}
        transition={{
          top: posTransition,
          height: posTransition,
          opacity: { duration: 0.2 },
        }}
      />
      {items.map((item, i) => (
        <ProjectRow
          key={item.name}
          {...item}
          onHover={onHover}
          onPress={onPress}
          onActivate={(el) => enter(i, el)}
        />
      ))}
    </div>
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

// Tracks whether the home entrance has already played. A module-level flag
// (not a ref) so it survives client-side navigation to an article and back —
// the stagger runs once per real page load, not every time you return home.
let homeEntered = false;

function ProfileInner() {
  const patch = usePatch(minimalPatch);
  const playHover = () => {
    if (patch.ready) patch.play("hover");
  };
  const playClick = () => {
    if (patch.ready) patch.play("click");
  };
  const playCopy = () => {
    if (patch.ready) patch.play("copy");
  };

  // Keep the latest patch reachable from handlers below.
  const patchRef = useRef(patch);
  patchRef.current = patch;
  const playSound = (name: string) => {
    if (patchRef.current.ready) patchRef.current.play(name);
  };

  // The entrance stagger plays only on the first real page load.
  const firstLoad = useRef(!homeEntered);
  useEffect(() => {
    homeEntered = true;
  }, []);

  // Read which articles have been opened (cookie) so their "unread" dot drops.
  // Resolved after mount; the brief initial dot is masked by the page fade-in.
  const [readSlugs, setReadSlugs] = useState<string[]>([]);
  useEffect(() => {
    setReadSlugs(getReadArticles());
  }, []);

  // Thoughts rows: notes link to their own article route; videos open YouTube.
  const thoughtRows: Project[] = thoughtsData.map((t) =>
    t.kind === "video"
      ? { name: t.title, role: "Video", href: t.href }
      : {
          name: t.title,
          role: "Note",
          dot: !readSlugs.includes(t.slug),
          internalHref: `/article/${t.slug}`,
        },
  );

  // Playground rows: each experiment links to its own /playground route.
  const playgroundRows: Project[] = playgroundData.map((p) => ({
    name: p.title,
    role: p.role,
    internalHref: `/playground/${p.slug}`,
  }));

  return (
    <MotionConfig reducedMotion="user">
    <main className="flex min-h-screen w-full justify-center overflow-x-clip bg-[#fafafa] px-5 pt-12 pb-24 text-black sm:pt-[100px]">
      <div className="flex w-full flex-col items-center pb-8 text-[14px] leading-[20px] font-sans font-medium">
        <motion.div
          variants={stagger}
          initial={firstLoad.current ? "hidden" : "show"}
          animate="show"
          className="flex w-full flex-col items-center gap-10"
        >
                {/* Header */}
                <motion.header
                  variants={group}
                  className="flex w-full max-w-[576px] flex-col gap-1"
                >
                  <Signature />
                  <motion.p variants={rowReveal} className="text-black">
                    Nikola Kostadinović
                  </motion.p>
                  <motion.p variants={rowReveal} className="text-[#8d8d8d]">
                    prev. co-founder of Adria Studio
                  </motion.p>
                </motion.header>

                {/* Bio — paragraphs separated by blank lines (per Figma) with
                    zero flex gap between them. */}
                <motion.div
                  variants={group}
                  className="flex w-full max-w-[576px] flex-col gap-0 break-words"
                >
                  <motion.p variants={rowReveal}>
                    I&rsquo;m an independent software designer born in the same
                    birthplace as Constantine the Great. It&rsquo;s currently{" "}
                    <LocalTime onHover={playHover} onToggle={playClick} /> here.
                  </motion.p>
                  <p aria-hidden>&nbsp;</p>
                  <motion.p variants={rowReveal}>
                    Currently working on passion projects, improving my driving
                    skills in my{" "}
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
                    I previously co-founded Adria Studio and scaled it to $400k+
                    per year, a 2-person boutique design studio focused on
                    working with a16z/yc backed startups. Notable clients
                    include Chaos Labs, Whop, Ostium, Tembo, Buildcores &amp;
                    15+ more.
                  </motion.p>
                  <p aria-hidden>&nbsp;</p>
                  <motion.p variants={rowReveal}>
                    Had my work featured on inspiration/award websites including
                    Mobbin, Godly &amp; more.
                  </motion.p>
                  <p aria-hidden>&nbsp;</p>
                  <motion.p variants={rowReveal}>
                    Currently open to founding / product design roles at AI
                    startups. Reach out to me via{" "}
                    <CopyEmail
                      email="me@uxkosta.com"
                      onCopy={playCopy}
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

                {/* Highlights — plain list (per Figma 4:71). Reveals last on
                    first load (its own delay); appears instantly on toggle. */}
                <motion.section
                  initial={firstLoad.current ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: firstLoad.current ? 1 : 0,
                  }}
                  className="flex w-full max-w-[576px] flex-col gap-4"
                >
                  <p className="pb-2 text-black">Highlights</p>
                  <div className="h-px w-8 bg-[#e8e8e8]" />
                  <HoverList
                    items={projects}
                    onHover={playHover}
                    onPress={playClick}
                  />
                </motion.section>

                {/* Thoughts — moved onto the home page, just below Highlights. */}
                <motion.section
                  initial={firstLoad.current ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: firstLoad.current ? 1.12 : 0,
                  }}
                  className="flex w-full max-w-[576px] flex-col gap-4"
                >
                  <p className="pb-2 text-black">Thoughts</p>
                  <div className="h-px w-8 bg-[#e8e8e8]" />
                  <HoverList
                    items={thoughtRows}
                    onHover={playHover}
                    onPress={playClick}
                  />
                </motion.section>

                {/* Playground — small experiments, each on its own route. */}
                <motion.section
                  initial={firstLoad.current ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: firstLoad.current ? 1.24 : 0,
                  }}
                  className="flex w-full max-w-[576px] flex-col gap-4"
                >
                  <p className="pb-2 text-black">Playground</p>
                  <div className="h-px w-8 bg-[#e8e8e8]" />
                  <HoverList
                    items={playgroundRows}
                    onHover={playHover}
                    onPress={playClick}
                  />
                </motion.section>
        </motion.div>
      </div>
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
