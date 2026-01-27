import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  { href: "/daily", label: "아침 기록", emoji: "☀️", color: "bg-accent" },
  { href: "/inbody", label: "인바디", emoji: "💪", color: "bg-secondary" },
  { href: "/charts", label: "차트 보기", emoji: "📊", color: "bg-accent" },
];

export function QuickAdd() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {quickLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className={`${link.color} border-0 hover:scale-105 transition-transform cursor-pointer`}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{link.emoji}</div>
              <div className="text-[10px] font-medium text-foreground">{link.label}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
