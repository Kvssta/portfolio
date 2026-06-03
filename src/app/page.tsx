import type { Metadata } from "next";
import { Profile } from "@/components/profile";

export const metadata: Metadata = {
  title: "Nikola Kostadinović",
  description:
    "Nikola Kostadinović is an independent software designer in AI.",
};

export default function Home() {
  return <Profile />;
}
