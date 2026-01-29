import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <>
      <Header title="설정" />
      <PageContainer>
        <SettingsContent />
      </PageContainer>
    </>
  );
}
