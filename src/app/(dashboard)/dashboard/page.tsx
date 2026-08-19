import Link from "next/link";
import { Bell, CalendarDays, FileWarning, FolderKanban, Handshake, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { MemoWidget } from "@/components/memo-widget";
import { COUNSELING_CATEGORY_LABEL, colorForKey, SCHEDULE_CATEGORY_LABEL } from "@/lib/labels";
import type { CounselingLog, Memo, Notice, Schedule } from "@/lib/supabase/database.types";

function todayKST() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayKST();
  const monthStart = today.slice(0, 7) + "-01";

  const [notices, todaySchedules, draftLogs, memos, openCases, monthLogs, ongoingPrograms, activeReferrals] =
    await Promise.all([
      supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3),
      supabase
        .from("schedules")
        .select("*, students(id, name)")
        .eq("schedule_date", today)
        .order("start_time", { ascending: true }),
      supabase
        .from("counseling_logs")
        .select("*, students(id, name, school, grade, class_no)")
        .eq("is_completed", false)
        .order("log_date", { ascending: false })
        .limit(8),
      user
        ? supabase
            .from("memos")
            .select("*")
            .eq("author_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as Memo[] }),
      supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase
        .from("counseling_logs")
        .select("id", { count: "exact", head: true })
        .gte("log_date", monthStart),
      supabase.from("programs").select("id", { count: "exact", head: true }).eq("status", "ongoing"),
      supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .in("status", ["requested", "in_progress"]),
    ]);

  const stats = [
    { label: "진행중 사례", value: openCases.count ?? 0, icon: FolderKanban, color: "text-blue-600 bg-blue-50" },
    { label: "이번달 상담일지", value: monthLogs.count ?? 0, icon: FileWarning, color: "text-orange-600 bg-orange-50" },
    { label: "진행중 프로그램", value: ongoingPrograms.count ?? 0, icon: GraduationCap, color: "text-violet-600 bg-violet-50" },
    { label: "진행중 자원연계", value: activeReferrals.count ?? 0, icon: Handshake, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">담당자 홈</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <Bell size={16} className="text-blue-600" />
              공지사항
            </h2>
          </div>
          <div className="space-y-3">
            {(notices.data as Notice[] | null)?.length ? (
              (notices.data as Notice[]).map((n) => (
                <div key={n.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge className={n.category === "notice" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}>
                      {n.category === "notice" ? "공지" : "업데이트"}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{n.title}</p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">등록된 공지사항이 없습니다.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <CalendarDays size={16} className="text-blue-600" />
              오늘 일정
            </h2>
            <Link href="/schedule" className="text-xs font-medium text-blue-600">
              전체 보기 &gt;
            </Link>
          </div>
          <div className="space-y-2">
            {(todaySchedules.data as Schedule[] | null)?.length ? (
              (todaySchedules.data as Schedule[]).map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50">
                  <span className="w-14 shrink-0 text-slate-500">{s.start_time?.slice(0, 5) ?? "-"}</span>
                  <Badge className={colorForKey(s.category)}>{SCHEDULE_CATEGORY_LABEL[s.category]}</Badge>
                  <span className="font-medium text-slate-700">{s.title}</span>
                  {s.students?.name && <span className="text-slate-400">· {s.students.name}</span>}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">오늘 예정된 일정이 없습니다.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <FileWarning size={16} className="text-amber-500" />
              미작성 상담일지
              {(draftLogs.data?.length ?? 0) > 0 && (
                <Badge className="bg-amber-50 text-amber-600">{draftLogs.data?.length}</Badge>
              )}
            </h2>
            <Link href="/counseling" className="text-xs font-medium text-blue-600">
              상담일지 목록 &gt;
            </Link>
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {(draftLogs.data as CounselingLog[] | null)?.length ? (
              (draftLogs.data as CounselingLog[]).map((log) => (
                <Link
                  key={log.id}
                  href={`/counseling/${log.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="w-14 shrink-0 text-slate-500">
                    {log.log_date.slice(5)}
                  </span>
                  <Badge className={colorForKey(log.category)}>
                    {COUNSELING_CATEGORY_LABEL[log.category]}
                  </Badge>
                  <span className="text-slate-700">{log.students?.name ?? "-"}</span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">미작성 상담일지가 없습니다.</p>
            )}
          </div>
        </Card>

        <Card>
          <MemoWidget initialMemos={(memos.data as Memo[]) ?? []} />
        </Card>
      </div>
    </div>
  );
}
