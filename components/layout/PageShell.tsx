export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-shell mx-auto flex min-h-screen max-w-6xl flex-col gap-10 md:px-6">
      {children}
    </main>
  );
}
