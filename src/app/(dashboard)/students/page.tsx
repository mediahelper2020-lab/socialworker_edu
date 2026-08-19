import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import { STUDENT_STATUS_LABEL, colorForKey } from "@/lib/labels";
import type { Student } from "@/lib/supabase/database.types";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("students").select("*").order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);
  const { data: students } = await query;

  return (
    <div>
      <PageHeader
        title="학생관리"
        description="교육복지 지원대상 학생 정보를 관리합니다."
        action={
          <Link
            href="/students/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            학생 등록
          </Link>
        }
      />

      <form className="mb-4 flex items-center gap-2">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="이름으로 검색"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </form>

      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">이름</th>
              <th className="px-5 py-3 font-medium">학교/학년반</th>
              <th className="px-5 py-3 font-medium">우선지원 사유</th>
              <th className="px-5 py-3 font-medium">보호자 연락처</th>
              <th className="px-5 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {(students as Student[] | null)?.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/students/${s.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                    {s.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {s.school ?? "-"} {s.grade ? `${s.grade}학년` : ""} {s.class_no ? `${s.class_no}반` : ""}
                </td>
                <td className="px-5 py-3 text-slate-600">{s.priority_type ?? "-"}</td>
                <td className="px-5 py-3 text-slate-600">{s.guardian_contact ?? "-"}</td>
                <td className="px-5 py-3">
                  <Badge className={colorForKey(s.status)}>{STUDENT_STATUS_LABEL[s.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!students?.length && <EmptyState message="등록된 학생이 없습니다." />}
      </Card>
    </div>
  );
}
