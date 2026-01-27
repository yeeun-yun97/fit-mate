"use client";

import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import { PeriodSelector } from "@/components/charts/period-selector";
import { GlucoseKetoneChart } from "@/components/charts/glucose-ketone-chart";
import { BodyCompositionChart } from "@/components/charts/body-composition-chart";
import type { DailyLog, InbodyLog } from "@/lib/types/database";

interface Props {
  dailyLogs: DailyLog[];
  inbodyLogs: InbodyLog[];
}

export function ChartsContent({ dailyLogs, inbodyLogs }: Props) {
  const [period, setPeriod] = useState(30);

  const filteredDaily = useMemo(() => {
    if (period === 0) return dailyLogs;
    const cutoff = subDays(new Date(), period).toISOString().split("T")[0];
    return dailyLogs.filter((d) => d.log_date >= cutoff);
  }, [dailyLogs, period]);

  const filteredInbody = useMemo(() => {
    if (period === 0) return inbodyLogs;
    const cutoff = subDays(new Date(), period).toISOString().split("T")[0];
    return inbodyLogs.filter((d) => d.measured_date >= cutoff);
  }, [inbodyLogs, period]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PeriodSelector selected={period} onChange={setPeriod} />
      </div>
      <GlucoseKetoneChart data={filteredDaily} />
      <BodyCompositionChart data={filteredInbody} />
    </div>
  );
}
