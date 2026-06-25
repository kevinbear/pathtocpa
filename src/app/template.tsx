"use client";

/**
 * Wraps every page. A `template` (unlike `layout`) re-mounts on each navigation,
 * so the cube transition replays for every page change — giving one consistent
 * page-to-page animation across the whole app.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="slide-in-page">{children}</div>;
}
