import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, PageHeader, EmptyState } from "@/components/ui";
import {
  STUDENT_STATUS_LABEL,
  COUNSELING_CATEGORY_LABEL,
  CASE_STATUS_LABEL,
  REFERRAL_STATUS_LABEL,
  RISK_COLOR,
  RISK_LEVEL_LABEL,
  colorForKey,
} from "@/lib/labels";
import type { Case, CounselingLog, Referral, Student } from "@/lib/supabase/database.types";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: logs }, { data: cases }, { data: referrals }, { data: participations }] =
    await Promise.all([
      supabase.from("students").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("counseling_logs")
        .select("*")
        .eq("student_id", id)
        .order("log_date", { ascending: false })
        .limit(10),
      supabase.from("cases").select("*").eq("student_id", id).order("opened_at", { ascending: false }),
      supabase
        .from("referrals")
        .select("*, resources(id, name, category)")
        .eq("student_id", id)
        .order("request_date", { ascending: false }),
      supabase
        .from("program_participants")
        .select("*, programs(id, name, category, status)")
        .eq("student_id", id),
    ]);

  if (!student) notFound();
  const s = student as Student;

  return (
    <div>
      <PageHeader
        title={s.name}
        description={`${s.school ?? "-"} ${s.grade ? `${s.grade}학년` : ""} ${s.class_no ? `${s.class_no}반` : ""}`}
        action={<Badge className={colorForKey(s.status)}>{STUDENT_STATUS_LABEL[s.status]}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-slate-800">기본 정보</h2>
          <dl className="space-y-2 text-sm">
            <Row label="우선지원 사유" value={s.priority_type} />
            <Row label="성별" value={s.gender === "M" ? "남" : s.gender === "F" ? "여" : "-"} />
            <Row label="학생 연락처" value={s.contact} />
            <Row label="보호자" value={s.guardian_name} />
            <Row label="보호자 연락처" value={s.guardian_contact} />
            <Row label="주소" value={s.address} />
          </dl>
          {s.memo && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 whitespace-pre-wrap">
              {s.memo}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/counseling/new?student_id=${s.id}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              + 상담일지
            </Link>
            <Link
              href={`/cases/new?student_id=${s.id}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              + 사례관리
            </Link>
            <Link
              href={`/referrals/new?student_id=${s.id}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              + 자원연계
            </Link>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 font-semibold text-slate-800">사례관리</h2>
            {(cases as Case[] | null)?.length ? (
              <div className="space-y-2">
                {(cases as Case[]).map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">{c.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={RISK_COLOR[c.risk_level]}>위험도 {RISK_LEVEL_LABEL[c.risk_level]}</Badge>
                      <Badge className={colorForKey(c.status)}>{CASE_STATUS_LABEL[c.status]}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState message="등록된 사례가 없습니다." />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold text-slate-800">최근 상담일지</h2>
            {(logs as CounselingLog[] | null)?.length ? (
              <div className="space-y-2">
                {(logs as CounselingLog[]).map((log) => (
                  <Link
                    key={log.id}
                    href={`/counseling/${log.id}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="w-20 shrink-0 text-slate-500">{log.log_date}</span>
                    <Badge className={colorForKey(log.category)}>{COUNSELING_CATEGORY_LABEL[log.category]}</Badge>
                    <span className="truncate text-slate-700">{log.title ?? "-"}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState message="작성된 상담일지가 없습니다." />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold text-slate-800">자원연계 이력</h2>
            {(referrals as Referral[] | null)?.length ? (
              <div className="space-y-2">
                {(referrals as Referral[]).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{r.resources?.name}</span>
                    <Badge className={colorForKey(r.status)}>{REFERRAL_STATUS_LABEL[r.status]}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="연계 이력이 없습니다." />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold text-slate-800">프로그램 참여</h2>
            {participations?.length ? (
              <div className="space-y-2">
                {participations.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{p.programs?.name}</span>
                    <span className="text-slate-400">{p.programs?.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="참여 중인 프로그램이 없습니다." />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-700">{value || "-"}</dd>
    </div>
  );
}
