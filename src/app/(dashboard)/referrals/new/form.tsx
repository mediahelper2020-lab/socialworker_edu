"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { StudentSelect } from "@/components/student-select";
import { ResourceSelect } from "@/components/resource-select";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function ReferralForm({ defaultStudentId }: { defaultStudentId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_id: defaultStudentId,
    resource_id: "",
    purpose: "",
    request_date: new Date().toISOString().slice(0, 10),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id || !form.resource_id) {
      setError("학생과 연계 기관을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("referrals").insert({
      student_id: form.student_id,
      resource_id: form.resource_id,
      purpose: form.purpose || null,
      request_date: form.request_date,
      created_by: user?.id ?? null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/resources");
    router.refresh();
  }

  return (
    <Card className="max-w-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>학생 *</label>
          <StudentSelect value={form.student_id} onChange={(id) => set("student_id", id)} required />
        </div>
        <div>
          <label className={labelClass}>연계 기관 *</label>
          <ResourceSelect value={form.resource_id} onChange={(id) => set("resource_id", id)} required />
        </div>
        <div>
          <label className={labelClass}>신청일</label>
          <input type="date" className={inputClass} value={form.request_date} onChange={(e) => set("request_date", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>연계 목적/사유</label>
          <textarea rows={3} className={inputClass} value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
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
