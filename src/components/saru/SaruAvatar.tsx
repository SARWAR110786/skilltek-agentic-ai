/** Animated AI avatar: a glowing core with orbiting ring (pure CSS). */
export default function SaruAvatar({
  size = 40,
  state = "idle",
}: {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
}) {
  return (
    <span
      className={`saru-avatar saru-${state} relative inline-grid shrink-0 place-items-center`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="saru-avatar-glow absolute inset-[-25%] rounded-full" />
      <span className="saru-avatar-ring absolute inset-0 rounded-full" />
      <span className="saru-avatar-core absolute inset-[18%] rounded-full" />
      <span className="saru-avatar-shine absolute left-[30%] top-[26%] h-[18%] w-[18%] rounded-full bg-white/80 blur-[1px]" />
    </span>
  );
}
