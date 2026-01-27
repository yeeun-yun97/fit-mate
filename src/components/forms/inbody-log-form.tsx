"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createInbodyLog, updateInbodyLog } from "@/actions/inbody-log";
import type { InbodyLog } from "@/lib/types/database";
import { format } from "date-fns";

interface Props {
  initialData?: InbodyLog;
}

const fields = [
  { name: "basal_metabolic_rate", label: "기초 대사량 (kcal)", step: "0.1" },
  { name: "skeletal_muscle_mass", label: "골격근량 (kg)", step: "0.01" },
  { name: "body_fat_mass", label: "체지방량 (kg)", step: "0.01" },
  { name: "bmi", label: "BMI", step: "0.1" },
  { name: "body_fat_pct", label: "체지방률 (%)", step: "0.1" },
  { name: "abdominal_fat_ratio", label: "복부 지방률", step: "0.01" },
  { name: "visceral_fat_level", label: "내장지방 레벨", step: "0.1" },
  { name: "body_water", label: "체수분 (L)", step: "0.01" },
  { name: "protein", label: "단백질 (kg)", step: "0.01" },
  { name: "minerals", label: "무기질 (kg)", step: "0.01" },
] as const;

export function InbodyLogForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updateInbodyLog(initialData!.id, formData)
      : await createInbodyLog(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/inbody");
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
            <Label htmlFor="measured_date">측정일</Label>
            <Input
              id="measured_date"
              name="measured_date"
              type="date"
              required
              defaultValue={initialData?.measured_date || format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  step={field.step}
                  placeholder="0"
                  defaultValue={
                    initialData
                      ? (initialData[field.name as keyof InbodyLog] as number | null) ?? ""
                      : ""
                  }
                />
              </div>
            ))}
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
