"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StudentSelect } from "@/components/student-select";
import { EmptyState } from "@/components/ui";

interface Participant {
  id: string;
  student_id: string;
  students: { id: string; name: string } | null;
}

export function ProgramParticipants({
  programId,
  initialParticipants,
}: {
  programId: string;
  initialParticipants: Participant[];
}) {
  const supabase = createClient();
  const [participants, setParticipants] = useState(initialParticipants);
  const [studentId, setStudentId] = useState("");
  const [isPending, startTransition] = useTransition();

  function addParticipant() {
    if (!studentId) return;
    startTransition(async () => {
      const { data, error } = await supabase
        .from("program_participants")
        .insert({ program_id: programId, student_id: studentId })
        .select("*, students(id, name)")
        .single();
      if (!error && data) {
        setParticipants((prev) => [...prev, data as Participant]);
        setStudentId("");
      }
    });
  }

  function removeParticipant(id: string) {
    startTransition(async () => {
      await supabase.from("program_participants").delete().eq("id", id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <StudentSelect value={studentId} onChange={setStudentId} />
        </div>
        <button
          onClick={addParticipant}
          disabled={isPending || !studentId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          추가
        </button>
      </div>
      {participants.length ? (
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-sm">
              <Link href={`/students/${p.student_id}`} className="text-slate-700 hover:text-blue-600">
                {p.students?.name}
              </Link>
              <button
                onClick={() => removeParticipant(p.id)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="참여 학생이 없습니다." />
      )}
    </div>
  );
}
