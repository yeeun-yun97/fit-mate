"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  action: (id: string) => Promise<{ error?: string; success?: boolean }>;
  redirectTo: string;
}

export function DeleteButton({ id, action, redirectTo }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    await action(id);
    router.push(redirectTo);
  }

  return (
    <div className="flex justify-end">
      {confirm && (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => setConfirm(false)}
        >
          취소
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "삭제 중..." : confirm ? "정말 삭제?" : "삭제"}
      </Button>
    </div>
  );
}
