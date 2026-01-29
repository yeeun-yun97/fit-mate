import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { DailyFasting } from "@/lib/types/database";
import Link from "next/link";

interface Props {
  logs: DailyFasting[];
}

export function RecentEntries({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl bg-muted/50 py-8 text-center text-muted-foreground text-sm">
        최근 기록이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <Link key={log.id} href={`/daily/${log.id}`}>
          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border/50 p-3.5 hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-sm shrink-0">
              ☀️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {format(new Date(log.log_date + "T00:00:00"), "M월 d일 (EEE)", { locale: ko })}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              {log.fasting_glucose != null && (
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">혈당</p>
                  <p className="font-bold text-foreground">{log.fasting_glucose}</p>
                </div>
              )}
              {log.fasting_ketone != null && (
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">케톤</p>
                  <p className="font-bold text-foreground">{log.fasting_ketone}</p>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
