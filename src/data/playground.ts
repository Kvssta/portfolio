export type PlaygroundItem = {
  slug: string;
  title: string;
  /** Right-aligned label shown in the list (e.g. the kind of experiment). */
  role: string;
};

export const playground: PlaygroundItem[] = [
  { slug: "membership-card", title: "Membership card", role: "Card" },
];
