"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

/**
 * Pointer-driven 3D tilt with a moving glare. Children can use
 * [transform:translateZ(..)] to float above the card plane.
 */
export default function TiltCard({
  children,
  className = "",
  max = 10,
  glare = "rgba(139,92,246,0.22)",
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(x - 0.5) * max * 2}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * max * 2}deg`);
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div className="[perspective:1000px]" style={style}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`group/tilt relative h-full [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-500 ease-out-expo motion-reduce:[transform:none] ${className}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
          style={{ background: `radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), ${glare}, transparent 45%)` }}
        />
        {children}
      </div>
    </div>
  );
}
