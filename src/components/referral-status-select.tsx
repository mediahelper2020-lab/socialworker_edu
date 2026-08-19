"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { REFERRAL_STATUS_LABEL, colorForKey } from "@/lib/labels";

export function ReferralStatusSelect({ referralId, status }: { referralId: string; status: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function update(next: string) {
    setValue(next);
    startTransition(async () => {
      await supabase.from("referrals").update({ status: next }).eq("id", referralId);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => update(e.target.value)}
      className={`rounded-md border-0 px-2 py-1 text-xs font-semibold ${colorForKey(value)}`}
    >
      {Object.entries(REFERRAL_STATUS_LABEL).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
