"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ name: "", org_name: "", phone: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? "");
      const meta = user.user_metadata ?? {};
      setForm((f) => ({ ...f, name: meta.full_name || meta.name || "" }));
      setChecking(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.org_name.trim() || !form.phone.trim()) {
      setError("이름, 소속기관, 연락처를 모두 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: form.name, org_name: form.org_name, phone: form.phone })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { error: metaError } = await supabase.auth.updateUser({ data: { onboarded: true } });
    if (metaError) {
      setError(metaError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checking) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <h1 className="text-xl font-bold text-slate-900">프로필 설정</h1>
          <p className="mt-1 text-sm text-slate-500">
            {email} 계정으로 로그인했습니다. 서비스 이용을 위해 아래 정보를 입력해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>이름 *</label>
            <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="김사랑" />
          </div>
          <div>
            <label className={labelClass}>소속기관(학교) *</label>
            <input
              required
              className={inputClass}
              value={form.org_name}
              onChange={(e) => set("org_name", e.target.value)}
              placeholder="예: 서울초등학교"
            />
          </div>
          <div>
            <label className={labelClass}>연락처 *</label>
            <input
              required
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="010-0000-0000"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
