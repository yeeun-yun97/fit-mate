"use client";

interface HeaderProps {
  title: string;
  greeting?: boolean;
}

export function Header({ title, greeting }: HeaderProps) {
  return (
    <header className="pt-6 pb-2">
      <div className="max-w-lg mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DumbbellIcon className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="m5.343 2.515a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829L6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}
