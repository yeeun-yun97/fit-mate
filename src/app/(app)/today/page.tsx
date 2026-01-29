import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { TodayContent } from "@/components/today/today-content";

export default function TodayPage() {
  return (
    <>
      <Header title="FitMate" />
      <PageContainer>
        <TodayContent />
      </PageContainer>
    </>
  );
}
