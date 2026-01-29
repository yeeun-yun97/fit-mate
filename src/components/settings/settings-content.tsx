"use client";

import { logout } from "@/actions/auth";

export function SettingsContent() {
  return (
    <div className="space-y-4">
      {/* 계정 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">계정</h3>
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left text-sm text-red-500 py-2"
          >
            로그아웃
          </button>
        </form>
      </div>

      {/* 앱 정보 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">앱 정보</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">버전</span>
          <span>1.0.0</span>
        </div>
      </div>
    </div>
  );
}
