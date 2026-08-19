"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DeleteButton({
  table,
  id,
  redirectTo,
  confirmMessage = "삭제하시겠습니까?",
}: {
  table: string;
  id: string;
  redirectTo: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    await supabase.from(table).delete().eq("id", id);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 size={14} />
      삭제
    </button>
  );
}
