import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { CaseNotesTimeline } from "@/components/case-notes-timeline";
import { CaseStatusEditor } from "@/components/case-status-editor";
import type { Case, CaseNote } from "@/lib/supabase/database.types";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: caseData }, { data: notes }] = await Promise.all([
    supabase.from("cases").select("*, students(id, name, school, grade, class_no)").eq("id", id).maybeSingle(),
    supabase.from("case_notes").select("*").eq("case_id", id).order("note_date", { ascending: false }),
  ]);

  if (!caseData) notFound();
  const c = caseData as Case;

  return (
    <div>
      <PageHeader
        title={c.title}
        description={
          c.students ? (
            <Link href={`/students/${c.students.id}`} className="text-blue-600 hover:underline">
              {c.students.name} 학생
            </Link>
          ) : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <CaseStatusEditor caseId={c.id} status={c.status} riskLevel={c.risk_level} />
            <DeleteButton table="cases" id={c.id} redirectTo="/cases" />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-slate-800">사례 정보</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="mb-1 text-xs text-slate-400">개시일</dt>
              <dd className="text-slate-700">{c.opened_at}</dd>
            </div>
            {c.closed_at && (
              <div>
                <dt className="mb-1 text-xs text-slate-400">종결일</dt>
                <dd className="text-slate-700">{c.closed_at}</dd>
              </div>
            )}
            {c.background && (
              <div>
                <dt className="mb-1 text-xs text-slate-400">배경/현황</dt>
                <dd className="whitespace-pre-wrap text-slate-700">{c.background}</dd>
              </div>
            )}
            {c.goal && (
              <div>
                <dt className="mb-1 text-xs text-slate-400">목표</dt>
                <dd className="whitespace-pre-wrap text-slate-700">{c.goal}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-800">진행기록</h2>
          <CaseNotesTimeline caseId={c.id} initialNotes={(notes as CaseNote[]) ?? []} />
        </Card>
      </div>
    </div>
  );
}
