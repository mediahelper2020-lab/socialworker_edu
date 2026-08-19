"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ResourceOption {
  id: string;
  name: string;
  category: string;
}

export function ResourceSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}) {
  const supabase = createClient();
  const [resources, setResources] = useState<ResourceOption[]>([]);

  useEffect(() => {
    supabase
      .from("resources")
      .select("id, name, category")
      .order("name", { ascending: true })
      .then(({ data }) => setResources(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    >
      <option value="">연계 기관 선택</option>
      {resources.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} · {r.category}
        </option>
      ))}
    </select>
  );
}
