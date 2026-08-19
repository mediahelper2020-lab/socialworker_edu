import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, PageHeader } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { COUNSELING_CATEGORY_LABEL, colorForKey } from "@/lib/labels";
import type { CounselingLog } from "@/lib/supabase/database.types";

export default async function CounselingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: log } = await supabase
    .from("counseling_logs")
    .select("*, students(id, name, school, grade, class_no)")
    .eq("id", id)
    .maybeSingle();

  if (!log) notFound();
  const l = log as CounselingLog;

  return (
    <div>
      <PageHeader
        title={l.title || "(제목 없음)"}
        description={`${l.log_date} ${l.start_time?.slice(0, 5) ?? ""}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/counseling/${l.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Pencil size={14} />
              수정
            </Link>
            <DeleteButton table="counseling_logs" id={l.id} redirectTo="/counseling" />
          </div>
        }
      />

      <Card className="max-w-2xl p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className={colorForKey(l.category)}>{COUNSELING_CATEGORY_LABEL[l.category]}</Badge>
          {l.is_completed ? (
            <Badge className="bg-emerald-50 text-emerald-600">작성완료</Badge>
          ) : (
            <Badge className="bg-amber-50 text-amber-600">미작성</Badge>
          )}
          {l.students && (
            <Link href={`/students/${l.students.id}`} className="text-sm font-medium text-blue-600">
              {l.students.name}
            </Link>
          )}
        </div>

        <Section title="상담 내용" content={l.content} />
        <Section title="조치 사항" content={l.action_taken} />
        <Section title="다음 계획" content={l.next_plan} />
      </Card>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-500">{title}</h3>
      <p className="whitespace-pre-wrap text-sm text-slate-700">{content}</p>
    </div>
  );
}
