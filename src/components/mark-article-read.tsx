"use client";

import { useEffect } from "react";
import { markArticleRead } from "@/lib/read-articles";

/** Records (in a cookie) that this article has been opened, so the home page
    can drop its "unread" dot. Renders nothing. */
export function MarkArticleRead({ slug }: { slug: string }) {
  useEffect(() => {
    markArticleRead(slug);
  }, [slug]);
  return null;
}
