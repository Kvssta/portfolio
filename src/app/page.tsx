import type { Metadata } from "next";
import { Profile } from "@/components/profile";

export const metadata: Metadata = {
  title: "Nikola Kostadinovic",
  description:
    "Nikola Kostadinovic is an independent software designer in AI.",
};

export default function Home() {
  return <Profile />;
}
