import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import { PROGRAM_CATEGORY_LABEL, PROGRAM_STATUS_LABEL, colorForKey } from "@/lib/labels";
import type { Program } from "@/lib/supabase/database.types";

export default async function ProgramsPage() {
  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("programs")
    .select("*, program_participants(count)")
    .order("start_date", { ascending: false });

  return (
    <div>
      <PageHeader
        title="프로그램"
        description="방과후, 문화체험, 멘토링 등 교육복지 프로그램을 관리합니다."
        action={
          <Link
            href="/programs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            프로그램 등록
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(programs as (Program & { program_participants: { count: number }[] })[] | null)?.map((p) => (
          <Link key={p.id} href={`/programs/${p.id}`}>
            <Card className="h-full p-5 transition hover:border-blue-200">
              <div className="mb-2 flex items-center justify-between">
                <Badge className={colorForKey(p.category)}>{PROGRAM_CATEGORY_LABEL[p.category]}</Badge>
                <Badge className={colorForKey(p.status)}>{PROGRAM_STATUS_LABEL[p.status]}</Badge>
              </div>
              <h3 className="mb-1 font-semibold text-slate-800">{p.name}</h3>
              <p className="text-xs text-slate-400">
                {p.start_date ?? "-"} ~ {p.end_date ?? "-"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                참여 {p.program_participants?.[0]?.count ?? 0}명
                {p.capacity ? ` / 정원 ${p.capacity}명` : ""}
              </p>
            </Card>
          </Link>
        ))}
      </div>
      {!programs?.length && (
        <Card>
          <EmptyState message="등록된 프로그램이 없습니다." />
        </Card>
      )}
    </div>
  );
}
