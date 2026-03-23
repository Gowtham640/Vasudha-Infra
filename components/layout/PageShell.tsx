export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-shell mx-auto flex min-h-screen w-full flex-col gap-10">
      {children}
    </main>
  );
}
