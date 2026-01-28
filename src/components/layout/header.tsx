"use client";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface HeaderProps {
  title: string;
  greeting?: boolean;
}

export function Header({ title, greeting }: HeaderProps) {
  if (greeting) {
    return (
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg">
              💪
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "M월 d일 EEEE", { locale: ko })}
              </p>
            </div>
          </div>
          <form action={logout}>
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
              <LogoutIcon className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <form action={logout}>
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
            로그아웃
          </Button>
        </form>
      </div>
    </header>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}
