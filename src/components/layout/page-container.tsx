export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-lg mx-auto px-4 pb-28 pt-3">
      {children}
    </main>
  );
}
