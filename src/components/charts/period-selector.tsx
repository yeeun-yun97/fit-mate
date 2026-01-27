"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const periods = [
  { value: 7, label: "7일" },
  { value: 30, label: "30일" },
  { value: 90, label: "90일" },
  { value: 0, label: "전체" },
] as const;

interface Props {
  selected: number;
  onChange: (value: number) => void;
}

export function PeriodSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={selected === p.value ? "default" : "outline"}
          size="sm"
          className={cn("text-xs h-7 px-3")}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
