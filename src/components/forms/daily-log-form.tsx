"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
  const [logDate, setLogDate] = useState<string>(initialData?.log_date || format(new Date(), "yyyy-MM-dd"));
  const [glucose, setGlucose] = useState<number>(initialData?.fasting_glucose ?? 90);
  const [ketone, setKetone] = useState<number>(initialData?.fasting_ketone ?? 0);
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
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2">{error}</p>
          )}

          <div className="space-y-2">
            <Label>날짜</Label>
            <DatePicker name="log_date" value={logDate} onChange={setLogDate} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fasting_glucose">공복 혈당 (mg/dL)</Label>
              <span className="text-lg font-extrabold text-primary tabular-nums">
                {glucose}
              </span>
            </div>
            <input
              id="fasting_glucose"
              name="fasting_glucose"
              type="range"
              min="70"
              max="135"
              step="1"
              value={glucose}
              onChange={(e) => setGlucose(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>70</span>
              <span>90</span>
              <span>110</span>
              <span>135</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fasting_ketone">공복 케톤 (mmol/L)</Label>
              <span className="text-lg font-extrabold text-primary tabular-nums">
                {ketone.toFixed(1)}
              </span>
            </div>
            <input
              id="fasting_ketone"
              name="fasting_ketone"
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={ketone}
              onChange={(e) => setKetone(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.0</span>
              <span>0.5</span>
              <span>1.0</span>
              <span>1.5</span>
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
