import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { InbodyLogForm } from "@/components/forms/inbody-log-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { deleteInbodyLog } from "@/actions/inbody-log";
import { notFound } from "next/navigation";
import type { InbodyLog } from "@/lib/types/database";

export default async function InbodyLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: log } = await supabase
    .from("inbody_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (!log) notFound();

  return (
    <>
      <Header title="인바디 수정" />
      <PageContainer>
        <div className="space-y-4">
          <InbodyLogForm initialData={log as InbodyLog} />
          <DeleteButton id={id} action={deleteInbodyLog} redirectTo="/inbody" />
        </div>
      </PageContainer>
    </>
  );
}
