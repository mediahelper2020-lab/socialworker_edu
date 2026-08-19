import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import { CASE_STATUS_LABEL, RISK_COLOR, RISK_LEVEL_LABEL, colorForKey } from "@/lib/labels";
import type { Case } from "@/lib/supabase/database.types";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("cases")
    .select("*, students(id, name, school, grade, class_no)")
    .order("opened_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: cases } = await query;

  const tabs = [
    { key: "", label: "전체" },
    { key: "open", label: "진행중" },
    { key: "monitoring", label: "모니터링" },
    { key: "closed", label: "종결" },
  ];

  return (
    <div>
      <PageHeader
        title="사례관리"
        description="위기 및 지원이 필요한 학생의 사례를 체계적으로 관리합니다."
        action={
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            사례 등록
          </Link>
        }
      />

      <div className="mb-4 flex gap-2 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/cases?status=${t.key}` : "/cases"}
            className={`rounded-full px-3 py-1 ${
              (status ?? "") === t.key ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">학생</th>
              <th className="px-5 py-3 font-medium">사례명</th>
              <th className="px-5 py-3 font-medium">위험도</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium">개시일</th>
            </tr>
          </thead>
          <tbody>
            {(cases as Case[] | null)?.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-700">{c.students?.name ?? "-"}</td>
                <td className="px-5 py-3">
                  <Link href={`/cases/${c.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                    {c.title}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Badge className={RISK_COLOR[c.risk_level]}>{RISK_LEVEL_LABEL[c.risk_level]}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge className={colorForKey(c.status)}>{CASE_STATUS_LABEL[c.status]}</Badge>
                </td>
                <td className="px-5 py-3 text-slate-500">{c.opened_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!cases?.length && <EmptyState message="등록된 사례가 없습니다." />}
      </Card>
    </div>
  );
}
