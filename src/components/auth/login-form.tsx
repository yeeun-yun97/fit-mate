"use client";

import { useState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ message }: { message?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* 로고 & 타이틀 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
          <DumbbellIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">FitMate</h1>
        <p className="text-sm text-muted-foreground mt-1">건강한 습관을 기록하세요</p>
      </div>

      {/* 폼 */}
      <form action={handleSubmit} className="space-y-4">
        {message && (
          <p className="text-sm text-primary bg-primary/10 rounded-xl p-3 text-center">{message}</p>
        )}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-3 text-center">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold mt-2"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

    </div>
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
