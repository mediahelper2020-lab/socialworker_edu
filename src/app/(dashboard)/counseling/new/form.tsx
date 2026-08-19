"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { StudentSelect } from "@/components/student-select";
import { COUNSELING_CATEGORY_LABEL } from "@/lib/labels";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

interface CounselingFormValues {
  student_id: string;
  log_date: string;
  start_time: string;
  category: string;
  title: string;
  content: string;
  action_taken: string;
  next_plan: string;
  is_completed: boolean;
}

export function CounselingForm({
  defaultStudentId,
  logId,
  initial,
}: {
  defaultStudentId: string;
  logId?: string;
  initial?: Partial<CounselingFormValues>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CounselingFormValues>({
    student_id: defaultStudentId,
    log_date: new Date().toISOString().slice(0, 10),
    start_time: "",
    category: "counseling",
    title: "",
    content: "",
    action_taken: "",
    next_plan: "",
    is_completed: true,
    ...initial,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) {
      setError("학생을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      student_id: form.student_id,
      log_date: form.log_date,
      start_time: form.start_time || null,
      category: form.category,
      title: form.title || null,
      content: form.content || null,
      action_taken: form.action_taken || null,
      next_plan: form.next_plan || null,
      is_completed: form.is_completed,
    };

    if (logId) {
      const { error } = await supabase.from("counseling_logs").update(payload).eq("id", logId);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push(`/counseling/${logId}`);
      router.refresh();
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("counseling_logs")
      .insert({ ...payload, counselor_id: user?.id ?? null })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/counseling/${data.id}`);
    router.refresh();
  }

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>학생 *</label>
          <StudentSelect value={form.student_id} onChange={(id) => set("student_id", id)} required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>날짜</label>
            <input type="date" className={inputClass} value={form.log_date} onChange={(e) => set("log_date", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>시간</label>
            <input type="time" className={inputClass} value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>유형</label>
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {Object.entries(COUNSELING_CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>제목</label>
          <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>상담 내용</label>
          <textarea rows={4} className={inputClass} value={form.content} onChange={(e) => set("content", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>조치 사항</label>
          <textarea rows={2} className={inputClass} value={form.action_taken} onChange={(e) => set("action_taken", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>다음 계획</label>
          <textarea rows={2} className={inputClass} value={form.next_plan} onChange={(e) => set("next_plan", e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.is_completed}
            onChange={(e) => set("is_completed", e.target.checked)}
          />
          작성 완료로 저장
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "저장 중..." : logId ? "수정 완료" : "저장"}
          </button>
        </div>
      </form>
    </Card>
  );
}
