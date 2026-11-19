"use client";

import { useEffect, useRef, type ReactNode, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Non-scrubbed reveal (fade + rise) for every [data-reveal] child, batched so
 * siblings stagger in. The brand-page pattern from the skill, GSAP edition.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduce) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(els, {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, overwrite: true }),
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return ref;
}

export default function Reveal({
  as: Tag = "div",
  className,
  children,
  id,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}
