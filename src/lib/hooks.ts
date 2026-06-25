import { useEffect, type RefObject } from "react";

/**
 * Calls `handler` when a mousedown happens outside `ref`. Only active while
 * `active` is true (e.g. a dropdown is open). Opening one menu by clicking
 * another menu's trigger naturally closes the first, so only one stays open.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  active = true,
) {
  useEffect(() => {
    if (!active) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, handler, active]);
}
