import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { playground } from "@/data/playground";
import { PlaygroundPage } from "@/components/playground-page";

// Prerender one static page per playground item.
export function generateStaticParams() {
  return playground.map((p) => ({ name: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const item = playground.find((p) => p.slug === name);
  return {
    title: item ? item.title : "Nikola Kostadinović",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = playground.find((p) => p.slug === name);
  if (!item) notFound();
  return <PlaygroundPage item={item} />;
}
