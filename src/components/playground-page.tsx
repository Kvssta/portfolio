import Link from "next/link";
import type { PlaygroundItem } from "@/data/playground";
import { MembershipCardFlow } from "./membership-card-flow";

export function PlaygroundPage({ item }: { item: PlaygroundItem }) {
  if (item.slug === "membership-card") return <MembershipCardFlow />;

  // Fallback for any future item that doesn't ship its own experience yet.
  return (
    <main className="flex min-h-screen w-full justify-center overflow-x-clip bg-[#fafafa] px-5 pt-12 pb-24 text-black sm:pt-[100px]">
      <div className="flex w-full flex-col items-center pb-8 text-[14px] leading-[20px] font-sans font-medium">
        <div className="flex w-full max-w-[576px] flex-col gap-7 break-words">
          <div className="flex flex-col">
            <Link
              href="/"
              className="mb-6 w-fit text-[#8d8d8d] transition-colors duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:text-black"
            >
              Index
            </Link>
            <p className="pb-4 text-black">{item.title}</p>
            <div className="h-px w-8 bg-[#e8e8e8]" />
          </div>
        </div>
      </div>
    </main>
  );
}
