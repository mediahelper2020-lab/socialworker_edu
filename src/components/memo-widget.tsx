"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Memo } from "@/lib/supabase/database.types";

export function MemoWidget({ initialMemos }: { initialMemos: Memo[] }) {
  const supabase = createClient();
  const [memos, setMemos] = useState(initialMemos);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function addMemo() {
    const content = draft.trim();
    if (!content) return;
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("memos")
        .insert({ content, author_id: user.id })
        .select()
        .single();
      if (!error && data) {
        setMemos((prev) => [data as Memo, ...prev]);
        setDraft("");
      }
    });
  }

  function removeMemo(id: string) {
    startTransition(async () => {
      await supabase.from("memos").delete().eq("id", id);
      setMemos((prev) => prev.filter((m) => m.id !== id));
    });
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">메모</h2>
      </div>
      <div className="mb-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMemo()}
          placeholder="메모 추가..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={addMemo}
          disabled={isPending}
          className="flex items-center justify-center rounded-lg bg-blue-600 px-2.5 text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {memos.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">메모가 없습니다.</p>
        )}
        {memos.map((memo) => (
          <div
            key={memo.id}
            className="group flex items-start justify-between gap-2 rounded-lg bg-indigo-50/70 px-3 py-2 text-sm text-slate-700"
          >
            <span className="whitespace-pre-wrap break-words">{memo.content}</span>
            <button
              onClick={() => removeMemo(memo.id)}
              className="shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
