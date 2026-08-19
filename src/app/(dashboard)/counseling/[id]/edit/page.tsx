import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { CounselingForm } from "../../new/form";
import type { CounselingLog } from "@/lib/supabase/database.types";

export default async function EditCounselingLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: log } = await supabase.from("counseling_logs").select("*").eq("id", id).maybeSingle();

  if (!log) notFound();
  const l = log as CounselingLog;

  return (
    <div>
      <PageHeader title="상담일지 수정" />
      <CounselingForm
        logId={l.id}
        defaultStudentId={l.student_id ?? ""}
        initial={{
          student_id: l.student_id ?? "",
          log_date: l.log_date,
          start_time: l.start_time?.slice(0, 5) ?? "",
          category: l.category,
          title: l.title ?? "",
          content: l.content ?? "",
          action_taken: l.action_taken ?? "",
          next_plan: l.next_plan ?? "",
          is_completed: l.is_completed,
        }}
      />
    </div>
  );
}
