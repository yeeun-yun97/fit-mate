import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <>
      <Header title="달력" />
      <PageContainer>
        <CalendarView />
      </PageContainer>
    </>
  );
}
