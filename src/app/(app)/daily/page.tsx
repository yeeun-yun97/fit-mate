import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyLogForm } from "@/components/forms/daily-log-form";

export default function DailyPage() {
  return (
    <>
      <Header title="아침 기록" />
      <PageContainer>
        <DailyLogForm />
      </PageContainer>
    </>
  );
}
