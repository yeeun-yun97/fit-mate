import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { DailyLog } from "@/lib/types/database";
import Link from "next/link";

interface Props {
  logs: DailyLog[];
}

export function RecentEntries({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground text-sm">
          최근 기록이 없습니다
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <Link key={log.id} href={`/daily/${log.id}`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {format(new Date(log.log_date + "T00:00:00"), "M월 d일 (EEE)", { locale: ko })}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {log.fasting_glucose && (
                    <span>
                      혈당 <strong className="text-foreground">{log.fasting_glucose}</strong>
                    </span>
                  )}
                  {log.fasting_ketone && (
                    <span>
                      케톤 <strong className="text-foreground">{log.fasting_ketone}</strong>
                    </span>
                  )}
                </div>
              </div>
              {log.diet_note && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {log.diet_note}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
