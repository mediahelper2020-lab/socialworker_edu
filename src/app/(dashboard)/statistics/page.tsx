import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { MonthlyBarChart, BreakdownPieChart } from "./charts";
import {
  COUNSELING_CATEGORY_LABEL,
  CASE_STATUS_LABEL,
  RISK_LEVEL_LABEL,
  REFERRAL_STATUS_LABEL,
} from "@/lib/labels";

function lastNMonths(n: number) {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function countBy<T extends string>(items: T[], labels: Record<string, string>) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return Object.keys(labels).map((key) => ({ name: labels[key], value: counts.get(key) ?? 0 }));
}

export default async function StatisticsPage() {
  const supabase = await createClient();

  const [{ data: logs }, { data: cases }, { data: referrals }, { data: programs }, { count: studentCount }] =
    await Promise.all([
      supabase.from("counseling_logs").select("log_date, category"),
      supabase.from("cases").select("status, risk_level"),
      supabase.from("referrals").select("status"),
      supabase.from("programs").select("id, name, program_participants(count)"),
      supabase.from("students").select("id", { count: "exact", head: true }),
    ]);

  const months = lastNMonths(6);
  const monthlyCounts = months.map((m) => ({
    label: m.slice(5) + "월",
    value: (logs ?? []).filter((l) => l.log_date.startsWith(m)).length,
  }));

  const categoryBreakdown = countBy((logs ?? []).map((l) => l.category), COUNSELING_CATEGORY_LABEL);
  const caseStatusBreakdown = countBy((cases ?? []).map((c) => c.status), CASE_STATUS_LABEL);
  const riskBreakdown = countBy((cases ?? []).map((c) => c.risk_level), RISK_LEVEL_LABEL);
  const referralBreakdown = countBy((referrals ?? []).map((r) => r.status), REFERRAL_STATUS_LABEL);

  const programParticipation = (programs ?? [])
    .map((p) => ({
      label: p.name,
      value: (p as unknown as { program_participants: { count: number }[] }).program_participants?.[0]?.count ?? 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div>
      <PageHeader title="통계" description="상담·사례관리·프로그램·자원연계 현황을 한눈에 확인합니다." />

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-900">{studentCount ?? 0}</p>
          <p className="text-xs text-slate-500">등록 학생</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-900">{logs?.length ?? 0}</p>
          <p className="text-xs text-slate-500">전체 상담일지</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-900">{cases?.length ?? 0}</p>
          <p className="text-xs text-slate-500">전체 사례</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-900">{referrals?.length ?? 0}</p>
          <p className="text-xs text-slate-500">전체 자원연계</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-800">월별 상담일지 추이 (최근 6개월)</h2>
          <MonthlyBarChart data={monthlyCounts} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800">상담 유형별 비중</h2>
          <BreakdownPieChart data={categoryBreakdown} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800">사례 상태별 분포</h2>
          <BreakdownPieChart data={caseStatusBreakdown} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800">사례 위험도 분포</h2>
          <BreakdownPieChart data={riskBreakdown} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800">자원연계 상태별 분포</h2>
          <BreakdownPieChart data={referralBreakdown} />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-800">프로그램별 참여 학생 수</h2>
          <MonthlyBarChart data={programParticipation} />
        </Card>
      </div>
    </div>
  );
}
