import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { thoughts } from "@/data/thoughts";
import { Article } from "@/components/article";

// Prerender one static page per note so /article/[name] is fully static.
export function generateStaticParams() {
  return thoughts
    .filter((t) => t.kind === "note")
    .map((t) => ({ name: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const thought = thoughts.find((t) => t.slug === name);
  return {
    title: thought ? thought.title : "Nikola Kostadinović",
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const thought = thoughts.find((t) => t.slug === name && t.kind === "note");
  if (!thought) notFound();
  return <Article thought={thought} />;
}
