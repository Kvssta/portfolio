export type Thought = {
  slug: string;
  title: string;
  kind: "note" | "video";
  /** External URL — present for videos (opens in a new tab with an arrow). */
  href?: string;
  /** Placeholder article body — present for notes (their own page). */
  body?: string[];
};

export const thoughts: Thought[] = [
  {
    slug: "why-i-quit-our-studio",
    title: "why I quit our studio",
    kind: "note",
    body: ["coming soon"],
  },
  {
    slug: "figma-isnt-dead",
    title: "figma isn't dead. you just have bad taste.",
    kind: "video",
    href: "https://youtu.be/zza15TDliGI?si=91vujSgC1Ql7r-DB",
  },
];
