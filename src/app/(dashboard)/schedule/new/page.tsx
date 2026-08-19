"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, PageHeader } from "@/components/ui";
import { StudentSelect } from "@/components/student-select";
import { SCHEDULE_CATEGORY_LABEL } from "@/lib/labels";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function NewSchedulePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "counseling",
    schedule_date: new Date().toISOString().slice(0, 10),
    start_time: "",
    end_time: "",
    student_id: "",
    location: "",
    memo: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("schedules").insert({
      title: form.title,
      category: form.category,
      schedule_date: form.schedule_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      student_id: form.student_id || null,
      location: form.location || null,
      memo: form.memo || null,
      created_by: user?.id ?? null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/schedule?month=${form.schedule_date.slice(0, 7)}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="일정 등록" />
      <Card className="max-w-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>제목 *</label>
            <input required className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>구분</label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {Object.entries(SCHEDULE_CATEGORY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>날짜</label>
              <input type="date" className={inputClass} value={form.schedule_date} onChange={(e) => set("schedule_date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>시작 시간</label>
              <input type="time" className={inputClass} value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>종료 시간</label>
              <input type="time" className={inputClass} value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>관련 학생</label>
            <StudentSelect value={form.student_id} onChange={(id) => set("student_id", id)} />
          </div>
          <div>
            <label className={labelClass}>장소</label>
            <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>메모</label>
            <textarea rows={2} className={inputClass} value={form.memo} onChange={(e) => set("memo", e.target.value)} />
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
    </div>
  );
}
