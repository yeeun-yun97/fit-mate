import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-xl font-bold text-foreground">페이지를 찾을 수 없습니다</h2>
      <p className="text-sm text-muted-foreground">요청하신 페이지가 존재하지 않습니다.</p>
      <Link href="/dashboard">
        <Button>대시보드로 이동</Button>
      </Link>
    </div>
  );
}
