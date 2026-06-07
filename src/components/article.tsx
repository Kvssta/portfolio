import { Fragment } from "react";
import Link from "next/link";
import type { Thought } from "@/data/thoughts";
import { WorkIsPlay } from "./work-is-play";
import { MarkArticleRead } from "./mark-article-read";

/** A single note rendered on its own page (/article/[slug]). The "← Back" link
    returns home; the route transition fades in via app/template.tsx. */
export function Article({ thought }: { thought: Thought }) {
  return (
    <main className="flex min-h-screen w-full justify-center overflow-x-clip bg-[#fafafa] px-5 pt-12 pb-24 text-black sm:pt-[100px]">
      <MarkArticleRead slug={thought.slug} />
      <div className="flex w-full flex-col items-center pb-8 text-[14px] leading-[20px] font-sans font-medium">
        <div className="flex w-full max-w-[576px] flex-col gap-7 break-words">
          <div className="flex flex-col">
            <Link
              href="/"
              className="mb-6 w-fit text-[#8d8d8d] transition-colors duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:text-black"
            >
              Index
            </Link>
            <p className="pb-4 text-black">{thought.title}</p>
            <div className="h-px w-8 bg-[#e8e8e8]" />
          </div>
          {thought.body?.map((paragraph, i) => (
            <Fragment key={i}>
              <p className="text-black">{paragraph}</p>
              {thought.slug === "why-i-quit-our-studio" && i === 2 && (
                <>
                  <WorkIsPlay />
                  <figure className="flex border-l border-black/[0.12] py-2.5 pr-2.5 pl-4">
                    <blockquote className="flex flex-col gap-1 text-black/35">
                      <p>
                        “Find what feels like play to you, but looks like work to
                        others”
                      </p>
                      <p>Naval</p>
                    </blockquote>
                  </figure>
                </>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
