"use client";

export function FloatingActions() {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 flex flex-col gap-3">
      <a
        className="pointer-events-auto flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[0_20px_45px_rgba(15,90,38,0.3)] transition hover:bg-[var(--brand-dark)]"
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        WhatsApp
      </a>
      <a
        className="pointer-events-auto flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-lg shadow-neutral-300 transition hover:border-[var(--brand-primary)]"
        href="tel:+919999999999"
        aria-label="Call our helpline"
      >
        Call
      </a>
    </div>
  );
}
