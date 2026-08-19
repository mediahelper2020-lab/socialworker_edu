"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CaseNote } from "@/lib/supabase/database.types";

const NOTE_TYPE_LABEL: Record<string, string> = {
  progress: "진행기록",
  case_meeting: "사례회의",
  referral: "자원연계",
  crisis: "위기개입",
  closing: "종결",
};

export function CaseNotesTimeline({ caseId, initialNotes }: { caseId: string; initialNotes: CaseNote[] }) {
  const supabase = createClient();
  const [notes, setNotes] = useState(initialNotes);
  const [noteType, setNoteType] = useState("progress");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function addNote() {
    if (!content.trim()) return;
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("case_notes")
        .insert({ case_id: caseId, author_id: user?.id ?? null, note_type: noteType, content })
        .select()
        .single();
      if (!error && data) {
        setNotes((prev) => [data as CaseNote, ...prev]);
        setContent("");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 space-y-2 rounded-xl border border-slate-100 p-4">
        <select
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
        >
          {Object.entries(NOTE_TYPE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="진행 내용을 기록하세요..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <div className="flex justify-end">
          <button
            onClick={addNote}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            기록 추가
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.length === 0 && <p className="py-6 text-center text-sm text-slate-400">진행기록이 없습니다.</p>}
        {notes.map((note) => (
          <div key={note.id} className="border-l-2 border-blue-200 pl-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-blue-600">{NOTE_TYPE_LABEL[note.note_type]}</span>
              <span>{note.note_date}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
