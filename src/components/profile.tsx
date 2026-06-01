"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
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
  { src: "/cards/cayman-1.jpg", alt: "718 Cayman at night", dx: -34, rotate: -6.58, delay: 110 },
];

const fujiCards: CardData[] = [
  { src: "/cards/fuji-2.jpg", alt: "Fujifilm photo of a facade", dx: 34, rotate: 11.9, delay: 0 },
  { src: "/cards/fuji-1.jpg", alt: "Fujifilm photo of a building", dx: -34, rotate: -6.58, delay: 110 },
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
  { name: "Tembo", role: "Product", href: "https://tembo.io" },
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

function ProfileInner() {
  const patch = usePatch(minimalPatch);
  const playHover = () => {
    if (patch.ready) patch.play("hover");
  };
  const playClick = () => {
    if (patch.ready) patch.play("click");
  };

  return (
    <main className="flex min-h-screen w-full justify-center overflow-x-clip bg-white px-5 py-16 text-black sm:items-center">
      <div className="flex w-full max-w-[560px] flex-col gap-10 text-[14px] leading-[20px] font-sans">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-black">Nikola Kostadinovic</p>
          <p className="text-[#8d8d8d]">prev. co-founder of Adria Studio</p>
        </header>

        {/* Bio */}
        <div className="flex flex-col gap-5 break-words">
          <p>
            I&rsquo;m an independent software designer based in Serbia that often
            vibe-codes random software purely for enjoyment.
          </p>
          <p>
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
          </p>
          <p>
            I previously co-founded Adria Studio and scaled it to $400k+ per
            year, a 2-person boutique design studio focused on working with US /
            CAN startups. Notable clients include Chaos Labs, Whop, Ostium,
            Tembo, Buildcores &amp; 15+ more. I&rsquo;m used to working in
            high-stake and high-pressure environments.
          </p>
          <p>
            Had my work featured on inspiration/award websites including Mobbin,
            Godly &amp; more.
          </p>
          <p>
            Currently open to founding / product design roles at AI startups.
          </p>
        </div>

        {/* Highlights */}
        <section className="flex flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <p className="text-black">Highlights</p>
            <p className="text-[#8d8d8d]">worked on</p>
          </div>
          <div className="h-px w-full bg-[#f0f0f0]" />
          {/* Each row dims only itself on hover (not the whole column). */}
          <div className="flex flex-col gap-4">
            {projects.map((p) => (
              <ProjectRow
                key={p.name}
                {...p}
                onHover={playHover}
                onPress={playClick}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function Profile() {
  return (
    <SoundProvider>
      <ProfileInner />
    </SoundProvider>
  );
}
