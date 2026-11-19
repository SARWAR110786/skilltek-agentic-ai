import type Lenis from "lenis";

/** Shared handle to the Lenis instance so nav links and CTAs can smooth-scroll. */
export const scrollState: { lenis: Lenis | null } = { lenis: null };

export function scrollToId(id: string) {
  const el = id === "home" ? document.body : document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (scrollState.lenis && !reduce) {
    scrollState.lenis.scrollTo(id === "home" ? 0 : (el as HTMLElement), {
      offset: id === "home" ? 0 : -72,
      duration: 1.4,
    });
  } else {
    if (id === "home") window.scrollTo({ top: 0 });
    else el.scrollIntoView({ block: "start" });
  }
  history.replaceState(null, "", id === "home" ? "#" : `#${id}`);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
