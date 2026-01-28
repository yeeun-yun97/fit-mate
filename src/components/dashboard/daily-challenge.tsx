import Link from "next/link";
import Image from "next/image";

interface Props {
  hasLoggedToday: boolean;
}

export function DailyChallenge({ hasLoggedToday }: Props) {
  return (
    <Link href="/daily">
      <div className="relative mt-14">
        {/* mascot - overflows above the card */}
        <div className="absolute -top-14 -right-3 z-20 w-56 h-56 pointer-events-none">
          <Image
            src="/mascot.png"
            alt="핏 메이트 마스코트"
            width={224}
            height={224}
            className="object-contain drop-shadow-xl"
          />
        </div>

        {/* card */}
        <div className="relative overflow-hidden rounded-3xl bg-accent px-6 pt-7 pb-10">
          <div className="relative z-10 max-w-[60%]">
            <p className="text-xs font-semibold text-primary mb-2 tracking-widest uppercase">
              {hasLoggedToday ? "TODAY DONE" : "TODAY\u0027S GOAL"}
            </p>
            <h2 className="text-2xl font-extrabold text-foreground leading-tight mb-2">
              {hasLoggedToday ? "오늘 기록 완료!" : "오늘의 기록"}
            </h2>
            <p className="text-sm text-accent-foreground/70">
              {hasLoggedToday
                ? "수고했어요. 기록을 확인해 보세요"
                : "아침 공복 혈당 & 케톤을 기록하세요"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
