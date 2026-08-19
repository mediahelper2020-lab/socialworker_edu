"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui";

interface Session {
  id: string;
  session_date: string;
  topic: string | null;
}

interface Participant {
  id: string;
  student_id: string;
  students: { id: string; name: string } | null;
}

export function ProgramSessions({
  programId,
  initialSessions,
  participants,
  initialAttendance,
}: {
  programId: string;
  initialSessions: Session[];
  participants: Participant[];
  initialAttendance: Record<string, string[]>; // session_id -> attended student_ids
}) {
  const supabase = createClient();
  const [sessions, setSessions] = useState(initialSessions);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTopic, setNewTopic] = useState("");
  const [isPending, startTransition] = useTransition();

  function addSession() {
    startTransition(async () => {
      const { data, error } = await supabase
        .from("program_sessions")
        .insert({ program_id: programId, session_date: newDate, topic: newTopic || null })
        .select()
        .single();
      if (!error && data) {
        setSessions((prev) => [data as Session, ...prev]);
        setAttendance((prev) => ({ ...prev, [data.id]: [] }));
        setNewTopic("");
      }
    });
  }

  function toggleAttendance(sessionId: string, studentId: string) {
    const attended = attendance[sessionId]?.includes(studentId);
    startTransition(async () => {
      if (attended) {
        await supabase.from("attendance").delete().eq("session_id", sessionId).eq("student_id", studentId);
        setAttendance((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId].filter((id) => id !== studentId),
        }));
      } else {
        await supabase.from("attendance").upsert(
          { session_id: sessionId, student_id: studentId, attended: true },
          { onConflict: "session_id,student_id" }
        );
        setAttendance((prev) => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] ?? []), studentId],
        }));
      }
    });
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="회차 주제"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={addSession}
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          회차 추가
        </button>
      </div>

      {sessions.length ? (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-100">
              <button
                onClick={() => setOpenSession(openSession === s.id ? null : s.id)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm"
              >
                <span>
                  <span className="font-medium text-slate-700">{s.session_date}</span>
                  {s.topic && <span className="ml-2 text-slate-500">{s.topic}</span>}
                </span>
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  출석 {attendance[s.id]?.length ?? 0}/{participants.length}
                  {openSession === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {openSession === s.id && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
                  {participants.length === 0 && <p className="text-xs text-slate-400">참여 학생을 먼저 등록해 주세요.</p>}
                  {participants.map((p) => {
                    const attended = attendance[s.id]?.includes(p.student_id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleAttendance(s.id, p.student_id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          attended ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.students?.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="등록된 회차가 없습니다." />
      )}
    </div>
  );
}
