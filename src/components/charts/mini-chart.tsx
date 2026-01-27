"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { DailyLog } from "@/lib/types/database";

interface Props {
  data: DailyLog[];
}

export function MiniChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          차트를 표시하려면 최소 2개의 기록이 필요합니다
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.log_date + "T00:00:00"), "M/d"),
    glucose: d.fasting_glucose,
    ketone: d.fasting_ketone,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">최근 14일 추이</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10 }}
              domain={["auto", "auto"]}
              width={30}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10 }}
              domain={[0, "auto"]}
              width={30}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="glucose"
              name="혈당"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ketone"
              name="케톤"
              stroke="#84cc16"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground justify-center">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            혈당 (mg/dL)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            케톤 (mmol/L)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
