"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createDailyLog, updateDailyLog } from "@/actions/daily-log";
import type { DailyLog } from "@/lib/types/database";
import { format } from "date-fns";

interface Props {
  initialData?: DailyLog;
}

export function DailyLogForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updateDailyLog(initialData!.id, formData)
      : await createDailyLog(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/daily");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="log_date">날짜</Label>
            <Input
              id="log_date"
              name="log_date"
              type="date"
              required
              defaultValue={initialData?.log_date || format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fasting_glucose">공복 혈당 (mg/dL)</Label>
              <Input
                id="fasting_glucose"
                name="fasting_glucose"
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="예: 95"
                defaultValue={initialData?.fasting_glucose ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fasting_ketone">공복 케톤 (mmol/L)</Label>
              <Input
                id="fasting_ketone"
                name="fasting_ketone"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="예: 1.5"
                defaultValue={initialData?.fasting_ketone ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet_note">전날 식단 메모</Label>
            <Textarea
              id="diet_note"
              name="diet_note"
              placeholder="어제 무엇을 먹었나요?"
              rows={3}
              defaultValue={initialData?.diet_note ?? ""}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "저장 중..." : isEdit ? "수정" : "저장"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
