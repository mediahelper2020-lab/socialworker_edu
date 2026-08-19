import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import { SCHEDULE_CATEGORY_LABEL, colorForKey } from "@/lib/labels";
import type { Schedule } from "@/lib/supabase/database.types";

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? new Date().toISOString().slice(0, 7);
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, students(id, name)")
    .gte("schedule_date", `${month}-01`)
    .lt("schedule_date", `${shiftMonth(month, 1)}-01`)
    .order("schedule_date", { ascending: true })
    .order("start_time", { ascending: true });

  const grouped = new Map<string, Schedule[]>();
  for (const s of (schedules as Schedule[] | null) ?? []) {
    const list = grouped.get(s.schedule_date) ?? [];
    list.push(s);
    grouped.set(s.schedule_date, list);
  }

  return (
    <div>
      <PageHeader
        title="일정"
        description="상담, 사례회의, 프로그램 등 업무 일정을 관리합니다."
        action={
          <Link
            href="/schedule/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            일정 등록
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Link href={`/schedule?month=${shiftMonth(month, -1)}`} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50">
          <ChevronLeft size={16} />
        </Link>
        <span className="text-lg font-semibold text-slate-800">{month}</span>
        <Link href={`/schedule?month=${shiftMonth(month, 1)}`} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50">
          <ChevronRight size={16} />
        </Link>
      </div>

      {grouped.size ? (
        <div className="space-y-4">
          {[...grouped.entries()].map(([date, items]) => (
            <Card key={date} className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {date} ({["일", "월", "화", "수", "목", "금", "토"][new Date(date).getDay()]})
              </h3>
              <div className="space-y-2">
                {items.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    <span className="w-14 shrink-0 text-slate-500">{s.start_time?.slice(0, 5) ?? "-"}</span>
                    <Badge className={colorForKey(s.category)}>{SCHEDULE_CATEGORY_LABEL[s.category]}</Badge>
                    <span className="font-medium text-slate-700">{s.title}</span>
                    {s.students?.name && <span className="text-slate-400">· {s.students.name}</span>}
                    {s.location && <span className="text-slate-400">· {s.location}</span>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState message="이번 달 등록된 일정이 없습니다." />
        </Card>
      )}
    </div>
  );
}
