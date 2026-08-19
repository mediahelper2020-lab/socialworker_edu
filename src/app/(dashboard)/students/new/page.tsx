"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card } from "@/components/ui";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function NewStudentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    school: "",
    grade: "",
    class_no: "",
    student_no: "",
    gender: "",
    guardian_name: "",
    guardian_contact: "",
    contact: "",
    address: "",
    priority_type: "",
    memo: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("students")
      .insert({
        name: form.name,
        school: form.school || null,
        grade: form.grade ? Number(form.grade) : null,
        class_no: form.class_no ? Number(form.class_no) : null,
        student_no: form.student_no ? Number(form.student_no) : null,
        gender: form.gender || null,
        guardian_name: form.guardian_name || null,
        guardian_contact: form.guardian_contact || null,
        contact: form.contact || null,
        address: form.address || null,
        priority_type: form.priority_type || null,
        memo: form.memo || null,
        created_by: user?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/students/${data.id}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="학생 등록" description="교육복지 지원대상 학생 정보를 입력합니다." />
      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>이름 *</label>
              <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>성별</label>
              <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">선택</option>
                <option value="M">남</option>
                <option value="F">여</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>학교</label>
              <input className={inputClass} value={form.school} onChange={(e) => set("school", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelClass}>학년</label>
                <input type="number" className={inputClass} value={form.grade} onChange={(e) => set("grade", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>반</label>
                <input type="number" className={inputClass} value={form.class_no} onChange={(e) => set("class_no", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>번호</label>
                <input type="number" className={inputClass} value={form.student_no} onChange={(e) => set("student_no", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>학생 연락처</label>
              <input className={inputClass} value={form.contact} onChange={(e) => set("contact", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>우선지원 사유</label>
              <input
                className={inputClass}
                placeholder="예: 기초생활수급, 한부모가정"
                value={form.priority_type}
                onChange={(e) => set("priority_type", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>보호자 성명</label>
              <input className={inputClass} value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>보호자 연락처</label>
              <input className={inputClass} value={form.guardian_contact} onChange={(e) => set("guardian_contact", e.target.value)} />
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

          <div className="flex justify-end gap-2">
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
