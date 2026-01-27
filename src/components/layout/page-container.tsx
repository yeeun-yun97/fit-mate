export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
      {children}
    </main>
  );
}
