"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPeriodLog, updatePeriodLog } from "@/actions/period-log";
import type { PeriodLog } from "@/lib/types/database";
import { format } from "date-fns";

interface Props {
  initialData?: PeriodLog;
  onSuccess?: () => void;
}

export function PeriodLogForm({ initialData, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updatePeriodLog(initialData!.id, formData)
      : await createPeriodLog(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onSuccess?.();
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
          <Label htmlFor="start_date">시작일</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={initialData?.start_date || format(new Date(), "yyyy-MM-dd")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">종료일 (선택)</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={initialData?.end_date ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="period_note">메모</Label>
        <Textarea
          id="period_note"
          name="note"
          placeholder="증상이나 메모"
          rows={2}
          defaultValue={initialData?.note ?? ""}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "저장 중..." : isEdit ? "수정" : "추가"}
      </Button>
    </form>
  );
}
