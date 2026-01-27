"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { InbodyLog } from "@/lib/types/database";

interface Props {
  data: InbodyLog[];
}

export function BodyCompositionChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          체성분 차트를 표시하려면 최소 2개의 인바디 기록이 필요합니다
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.measured_date + "T00:00:00"), "M/d"),
    muscle: d.skeletal_muscle_mass,
    fat: d.body_fat_mass,
    fatPct: d.body_fat_pct,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">체성분 변화</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10 }}
              domain={["auto", "auto"]}
              label={{ value: "kg", angle: -90, position: "insideLeft", fontSize: 10 }}
              width={35}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10 }}
              domain={["auto", "auto"]}
              label={{ value: "%", angle: 90, position: "insideRight", fontSize: 10 }}
              width={35}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="muscle"
              name="골격근량"
              stroke="#84cc16"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="fat"
              name="체지방량"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fatPct"
              name="체지방률"
              stroke="#ec4899"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
