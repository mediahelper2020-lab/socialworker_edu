"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { StudentSelect } from "@/components/student-select";
import { RISK_LEVEL_LABEL, CASE_STATUS_LABEL } from "@/lib/labels";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function CaseForm({ defaultStudentId }: { defaultStudentId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_id: defaultStudentId,
    title: "",
    background: "",
    goal: "",
    risk_level: "medium",
    status: "open",
    opened_at: new Date().toISOString().slice(0, 10),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id || !form.title.trim()) {
      setError("학생과 사례명을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("cases")
      .insert({
        student_id: form.student_id,
        case_manager_id: user?.id ?? null,
        title: form.title,
        background: form.background || null,
        goal: form.goal || null,
        risk_level: form.risk_level,
        status: form.status,
        opened_at: form.opened_at,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/cases/${data.id}`);
    router.refresh();
  }

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>학생 *</label>
          <StudentSelect value={form.student_id} onChange={(id) => set("student_id", id)} required />
        </div>
        <div>
          <label className={labelClass}>사례명 *</label>
          <input required className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>위험도</label>
            <select className={inputClass} value={form.risk_level} onChange={(e) => set("risk_level", e.target.value)}>
              {Object.entries(RISK_LEVEL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>상태</label>
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {Object.entries(CASE_STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>개시일</label>
            <input type="date" className={inputClass} value={form.opened_at} onChange={(e) => set("opened_at", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>배경/현황</label>
          <textarea rows={3} className={inputClass} value={form.background} onChange={(e) => set("background", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>목표</label>
          <textarea rows={2} className={inputClass} value={form.goal} onChange={(e) => set("goal", e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </Card>
  );
}
