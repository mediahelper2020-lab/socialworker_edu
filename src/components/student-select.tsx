"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StudentOption {
  id: string;
  name: string;
  school: string | null;
  grade: number | null;
  class_no: number | null;
}

export function StudentSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}) {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentOption[]>([]);

  useEffect(() => {
    supabase
      .from("students")
      .select("id, name, school, grade, class_no")
      .order("name", { ascending: true })
      .then(({ data }) => setStudents(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    >
      <option value="">학생 선택</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
          {s.school ? ` · ${s.school}` : ""}
          {s.grade ? ` ${s.grade}학년` : ""}
          {s.class_no ? ` ${s.class_no}반` : ""}
        </option>
      ))}
    </select>
  );
}
