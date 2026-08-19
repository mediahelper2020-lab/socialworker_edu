import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import { ReferralStatusSelect } from "@/components/referral-status-select";
import { colorForKey } from "@/lib/labels";
import type { Referral, Resource } from "@/lib/supabase/database.types";

export default async function ResourcesPage() {
  const supabase = await createClient();

  const [{ data: resources }, { data: referrals }] = await Promise.all([
    supabase.from("resources").select("*").order("name", { ascending: true }),
    supabase
      .from("referrals")
      .select("*, students(id, name), resources(id, name, category)")
      .order("request_date", { ascending: false })
      .limit(50),
  ]);

  return (
    <div>
      <PageHeader
        title="자원연계"
        description="지역사회 기관 정보와 학생별 연계 이력을 관리합니다."
        action={
          <div className="flex gap-2">
            <Link
              href="/resources/new"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              기관 등록
            </Link>
            <Link
              href="/referrals/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              연계 신청
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800">연계 기관 DB</h2>
          <div className="max-h-[32rem] space-y-2 overflow-y-auto">
            {(resources as Resource[] | null)?.length ? (
              (resources as Resource[]).map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{r.name}</span>
                    <Badge className={colorForKey(r.category)}>{r.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {r.contact_person ? `${r.contact_person} · ` : ""}
                    {r.phone ?? "-"}
                  </p>
                  {r.address && <p className="text-xs text-slate-400">{r.address}</p>}
                </div>
              ))
            ) : (
              <EmptyState message="등록된 연계 기관이 없습니다." />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800">연계 현황</h2>
          <div className="max-h-[32rem] space-y-2 overflow-y-auto">
            {(referrals as Referral[] | null)?.length ? (
              (referrals as Referral[]).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">
                      {r.students?.name} → {r.resources?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {r.request_date} {r.purpose ? `· ${r.purpose}` : ""}
                    </p>
                  </div>
                  <ReferralStatusSelect referralId={r.id} status={r.status} />
                </div>
              ))
            ) : (
              <EmptyState message="연계 이력이 없습니다." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
