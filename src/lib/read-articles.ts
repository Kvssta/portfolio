// Tracks which article slugs the visitor has opened, persisted in a cookie so
// the "unread" dot stays gone across sessions. Client-only (uses document).
const COOKIE = "read-articles";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function getReadArticles(): string[] {
  if (typeof document === "undefined") return [];
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!entry) return [];
  const value = decodeURIComponent(entry.slice(COOKIE.length + 1));
  return value ? value.split(",").filter(Boolean) : [];
}

export function markArticleRead(slug: string): void {
  if (typeof document === "undefined") return;
  const current = getReadArticles();
  if (current.includes(slug)) return;
  const next = [...current, slug].join(",");
  document.cookie = `${COOKIE}=${encodeURIComponent(next)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
