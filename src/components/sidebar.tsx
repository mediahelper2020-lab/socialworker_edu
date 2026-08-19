"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  FolderKanban,
  Handshake,
  GraduationCap,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/schedule", label: "일정", icon: CalendarDays },
  { href: "/counseling", label: "상담일지", icon: NotebookPen },
  { href: "/cases", label: "사례관리", icon: FolderKanban },
  { href: "/students", label: "학생관리", icon: Users },
  { href: "/resources", label: "자원연계", icon: Handshake },
  { href: "/programs", label: "프로그램", icon: GraduationCap },
  { href: "/statistics", label: "통계", icon: BarChart3 },
];

export function Sidebar({
  name,
  orgName,
}: {
  name: string;
  orgName: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <p className="text-xl font-bold text-blue-600">EDUWELL</p>
        <p className="mt-0.5 text-xs text-slate-400">교육복지 통합업무관리시스템</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-4 py-4">
        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
        {orgName && <p className="truncate text-xs text-slate-400">{orgName}</p>}
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
