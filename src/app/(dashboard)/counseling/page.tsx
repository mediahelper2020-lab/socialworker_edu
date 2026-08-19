import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import { COUNSELING_CATEGORY_LABEL, colorForKey } from "@/lib/labels";
import type { CounselingLog } from "@/lib/supabase/database.types";

export default async function CounselingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("counseling_logs")
    .select("*, students(id, name, school, grade, class_no)")
    .order("log_date", { ascending: false })
    .limit(100);
  if (status === "draft") query = query.eq("is_completed", false);

  const { data: logs } = await query;

  return (
    <div>
      <PageHeader
        title="상담일지"
        description="상담, 교육, 의뢰, 가정방문 등 모든 상담 기록을 관리합니다."
        action={
          <Link
            href="/counseling/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            상담일지 작성
          </Link>
        }
      />

      <div className="mb-4 flex gap-2 text-sm">
        <Link
          href="/counseling"
          className={`rounded-full px-3 py-1 ${!status ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
        >
          전체
        </Link>
        <Link
          href="/counseling?status=draft"
          className={`rounded-full px-3 py-1 ${status === "draft" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
        >
          미작성
        </Link>
      </div>

      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">날짜</th>
              <th className="px-5 py-3 font-medium">유형</th>
              <th className="px-5 py-3 font-medium">학생</th>
              <th className="px-5 py-3 font-medium">제목</th>
              <th className="px-5 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {(logs as CounselingLog[] | null)?.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">{log.log_date}</td>
                <td className="px-5 py-3">
                  <Badge className={colorForKey(log.category)}>{COUNSELING_CATEGORY_LABEL[log.category]}</Badge>
                </td>
                <td className="px-5 py-3 text-slate-700">{log.students?.name ?? "-"}</td>
                <td className="px-5 py-3">
                  <Link href={`/counseling/${log.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                    {log.title || "(제목 없음)"}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  {log.is_completed ? (
                    <Badge className="bg-emerald-50 text-emerald-600">작성완료</Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-600">미작성</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs?.length && <EmptyState message="상담일지가 없습니다." />}
      </Card>
    </div>
  );
}
