"use client";

/**
 * Wraps every page. A `template` (unlike `layout`) re-mounts on each navigation,
 * so the cube transition replays for every page change — giving one consistent
 * page-to-page animation across the whole app.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  // `flex-1` lets the page content grow to fill the viewport so the footer is
  // pushed to the bottom even when a page is short (sticky-footer layout).
  return <div className="slide-in-page flex-1">{children}</div>;
}
