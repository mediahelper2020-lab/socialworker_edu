"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, PageHeader } from "@/components/ui";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

const CATEGORIES = ["복지관", "정신건강복지센터", "청소년상담복지센터", "지자체", "병원", "법률기관", "기타"];

export default function NewResourcePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    contact_person: "",
    phone: "",
    address: "",
    memo: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("기관명을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("resources").insert({
      name: form.name,
      category: form.category,
      contact_person: form.contact_person || null,
      phone: form.phone || null,
      address: form.address || null,
      memo: form.memo || null,
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
    <div>
      <PageHeader title="연계 기관 등록" description="지역사회 자원 기관 정보를 등록합니다." />
      <Card className="max-w-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>기관명 *</label>
            <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>구분</label>
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>담당자</label>
              <input className={inputClass} value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>연락처</label>
              <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>주소</label>
            <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>메모</label>
            <textarea rows={3} className={inputClass} value={form.memo} onChange={(e) => set("memo", e.target.value)} />
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
