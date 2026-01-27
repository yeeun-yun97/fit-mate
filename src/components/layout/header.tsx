"use client";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-border">
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
