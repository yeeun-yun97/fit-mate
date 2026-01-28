import Link from "next/link";

const quickLinks = [
  {
    href: "/daily",
    label: "아침 기록",
    sub: "혈당 & 케톤",
    emoji: "☀️",
    bg: "bg-accent",
  },
  {
    href: "/inbody",
    label: "인바디",
    sub: "체성분 측정",
    emoji: "💪",
    bg: "bg-secondary",
  },
  {
    href: "/tracking",
    label: "추가 기록",
    sub: "생리 & 배변",
    emoji: "📋",
    bg: "bg-accent",
  },
  {
    href: "/charts",
    label: "차트",
    sub: "추이 분석",
    emoji: "📊",
    bg: "bg-secondary",
  },
];

export function QuickAdd() {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3">바로가기</h2>
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div
              className={`${link.bg} rounded-2xl p-4 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer`}
            >
              <span className="text-2xl block mb-2">{link.emoji}</span>
              <p className="text-sm font-bold text-foreground">{link.label}</p>
              <p className="text-[11px] text-accent-foreground/70 mt-0.5">{link.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
