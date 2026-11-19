export default function SectionHeading({
  kicker,
  title,
  sub,
  align = "left",
  id,
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
}) {
  const center = align === "center";
  return (
    <header className={center ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <p data-reveal className="kicker mb-5">{kicker}</p>
      <h2 id={id} data-reveal className="display text-[clamp(2.3rem,6vw,5.4rem)]">
        {title}
      </h2>
      {sub && (
        <p
          data-reveal
          className={`mt-6 text-[clamp(1rem,1.35vw,1.2rem)] leading-relaxed text-muted ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
        >
          {sub}
        </p>
      )}
    </header>
  );
}
