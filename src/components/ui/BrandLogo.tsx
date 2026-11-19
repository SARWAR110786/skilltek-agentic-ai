import { BRANDS, type BrandKey } from "@/lib/brands";

type Props = {
  brand: BrandKey;
  size?: number;
  className?: string;
  /** render the mark in its brand colour (default) or in currentColor */
  mono?: boolean;
  title?: boolean;
};

/** Official brand mark rendered as inline SVG (no network request). */
export default function BrandLogo({ brand, size = 24, className, mono, title = true }: Props) {
  const b = BRANDS[brand];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title ? b.name : undefined}
      aria-hidden={title ? undefined : true}
      fill={mono ? "currentColor" : b.color}
      fillRule="evenodd"
    >
      <path d={b.path} />
    </svg>
  );
}
