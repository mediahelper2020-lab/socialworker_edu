import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, PageHeader } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { ProgramParticipants } from "@/components/program-participants";
import { ProgramSessions } from "@/components/program-sessions";
import { PROGRAM_CATEGORY_LABEL, PROGRAM_STATUS_LABEL, colorForKey } from "@/lib/labels";
import type { Program } from "@/lib/supabase/database.types";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: program }, { data: participants }, { data: sessions }, { data: attendanceRows }] = await Promise.all(
    [
      supabase.from("programs").select("*").eq("id", id).maybeSingle(),
      supabase.from("program_participants").select("*, students(id, name)").eq("program_id", id),
      supabase.from("program_sessions").select("*").eq("program_id", id).order("session_date", { ascending: false }),
      supabase.from("attendance").select("session_id, student_id").eq("attended", true),
    ]
  );

  if (!program) notFound();
  const p = program as Program;

  const sessionIds = new Set((sessions ?? []).map((s) => s.id));
  const attendanceMap: Record<string, string[]> = {};
  for (const row of attendanceRows ?? []) {
    if (!sessionIds.has(row.session_id)) continue;
    (attendanceMap[row.session_id] ??= []).push(row.student_id);
  }

  return (
    <div>
      <PageHeader
        title={p.name}
        description={`${p.start_date ?? "-"} ~ ${p.end_date ?? "-"}${p.location ? " · " + p.location : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Badge className={colorForKey(p.category)}>{PROGRAM_CATEGORY_LABEL[p.category]}</Badge>
            <Badge className={colorForKey(p.status)}>{PROGRAM_STATUS_LABEL[p.status]}</Badge>
            <DeleteButton table="programs" id={p.id} redirectTo="/programs" />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-slate-800">프로그램 정보</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">정원</dt>
              <dd className="text-slate-700">{p.capacity ?? "-"}명</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">예산</dt>
              <dd className="text-slate-700">{p.budget ? `${Number(p.budget).toLocaleString()}원` : "-"}</dd>
            </div>
          </dl>
          {p.description && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{p.description}</p>}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-800">참여 학생</h2>
          <ProgramParticipants programId={p.id} initialParticipants={participants ?? []} />
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-3 font-semibold text-slate-800">회차 및 출석 관리</h2>
          <ProgramSessions
            programId={p.id}
            initialSessions={sessions ?? []}
            participants={participants ?? []}
            initialAttendance={attendanceMap}
          />
        </Card>
      </div>
    </div>
  );
}
