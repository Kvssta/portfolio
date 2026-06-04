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
    title: "Why I quit our studio",
    kind: "note",
    body: [
      "Adria was the best thing I ever built, and the hardest to leave. It got my foot into the design world. It introduced me to founders across the world I never would have met otherwise.",
      "I knew what it was from the first project with Predrag. We were good at opposite things, and that opposition is exactly why it worked. We set out to make the web beautiful, and for a while, we did.",
      "Our rule was simple: work should feel like play, and the moment it stops, something is broken. We held to it.",
      "Then AI changed the tempo. The same hours now carried a heavier expectation: move faster, generate more, explore wider.",
      "But the external work started to feel like work. Every week I was choosing between pouring everything into one thing and steering the direction of many. And taking on many has a cost no one names: you start building things you don’t believe in, and belief is the only thing that can truly keep me going.",
      "I started missing the early version of us, one project per person, all our attention on it. That’s not nostalgia. Attention is the only real resource a designer has - it is his way of productivity.",
      "So Predrag and I started asking a better question. What if we reduced the variety and increased the intensity?",
      "Range doesn’t require breadth. You can go as wide as you want by going deeper into a single thing.",
      "Because you can only truly care about what you own.",
      "The best work I’ve made always arrived the same way: an idea that found me while laying in bed, going on a walk, cleaning the house - and it refused to leave until I had built it. That doesn’t happen when your mind is held in multiple places at once.",
      "The work had also outgrown the role. Creative direction, coding interactions, product vision, marketing. Somewhere along the way it stopped being a design partnership and became a founding designers’ job.",
      "The designers I study most - Benji, Rauno Freiberg, Emil Kowalski, Josh Puckett - all share one trait. They commit to a single idea and pursue it past the point of reason. They chase a perfection they know doesn’t exist, and that is exactly the point.",
      "The chase of perfection is what we call craft. It’s what’s behind the work we call tasteful.",
      "That kind of love demands your whole attention. You cannot give it to five things.",
      "So I know what I am now. Not a founder - a founding designer. The one who treats the smallest details as if they decide everything, because they do.",
      "We’re winding Adria down. Not from any failure, revenue problem, falling out or loss of faith in the team.",
      "I’m leaving because I want to give everything I have to one thing and do it completely.",
      "As of June 1st, I’m independent, and I’m in no rush. I’m looking for a team that builds with real conviction, believes in what it’s making, and is chasing the same impossible standard I am.",
      "That standard is the whole point. I intend to spend my time with people who refuse to lower it.",
    ],
  },
  {
    slug: "figma-isnt-dead",
    title: "Figma isn't dead. you just have bad taste.",
    kind: "video",
    href: "https://youtu.be/zza15TDliGI?si=91vujSgC1Ql7r-DB",
  },
];
