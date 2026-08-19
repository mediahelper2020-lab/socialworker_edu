"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, PageHeader } from "@/components/ui";
import { PROGRAM_CATEGORY_LABEL, PROGRAM_STATUS_LABEL } from "@/lib/labels";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function NewProgramPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "afterschool",
    status: "planned",
    start_date: "",
    end_date: "",
    location: "",
    capacity: "",
    budget: "",
    description: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("프로그램명을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("programs")
      .insert({
        name: form.name,
        category: form.category,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        location: form.location || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        budget: form.budget ? Number(form.budget) : null,
        description: form.description || null,
        created_by: user?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/programs/${data.id}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="프로그램 등록" />
      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>프로그램명 *</label>
            <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>구분</label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {Object.entries(PROGRAM_CATEGORY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>상태</label>
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {Object.entries(PROGRAM_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>시작일</label>
              <input type="date" className={inputClass} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>종료일</label>
              <input type="date" className={inputClass} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>장소</label>
              <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>정원</label>
              <input type="number" className={inputClass} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>예산(원)</label>
              <input type="number" className={inputClass} value={form.budget} onChange={(e) => set("budget", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>설명</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
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
