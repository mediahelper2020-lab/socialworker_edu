"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RISK_LEVEL_LABEL, CASE_STATUS_LABEL } from "@/lib/labels";

export function CaseStatusEditor({
  caseId,
  status,
  riskLevel,
}: {
  caseId: string;
  status: string;
  riskLevel: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [values, setValues] = useState({ status, risk_level: riskLevel });
  const [isPending, startTransition] = useTransition();

  function update(field: "status" | "risk_level", value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    startTransition(async () => {
      const patch: Record<string, string | null> = { [field]: value };
      if (field === "status" && value === "closed") patch.closed_at = new Date().toISOString().slice(0, 10);
      await supabase.from("cases").update(patch).eq("id", caseId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={values.risk_level}
        onChange={(e) => update("risk_level", e.target.value)}
        disabled={isPending}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600"
      >
        {Object.entries(RISK_LEVEL_LABEL).map(([v, l]) => (
          <option key={v} value={v}>
            위험도 {l}
          </option>
        ))}
      </select>
      <select
        value={values.status}
        onChange={(e) => update("status", e.target.value)}
        disabled={isPending}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600"
      >
        {Object.entries(CASE_STATUS_LABEL).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
