"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBowelLog } from "@/actions/bowel-log";
import { format } from "date-fns";

export function BowelLogForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createBowelLog(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="bowel_date">날짜</Label>
          <Input
            id="bowel_date"
            name="log_date"
            type="date"
            required
            defaultValue={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bowel_time">시간 (선택)</Label>
          <Input
            id="bowel_time"
            name="log_time"
            type="time"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bowel_note">메모</Label>
        <Textarea
          id="bowel_note"
          name="note"
          placeholder="메모"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "저장 중..." : "추가"}
      </Button>
    </form>
  );
}
