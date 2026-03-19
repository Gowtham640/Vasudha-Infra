import Link from "next/link";

type CTAButtonProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
};

export function CTAButton({ label, href = "#", onClick, variant = "primary" }: CTAButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition";
  const classes =
    variant === "primary"
      ? `${base} bg-accent text-neutral-900 shadow-lg shadow-accent/40`
      : `${base} border border-neutral-300 bg-white text-neutral-900`;

  if (href && !onClick) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {label}
    </button>
  );
}
