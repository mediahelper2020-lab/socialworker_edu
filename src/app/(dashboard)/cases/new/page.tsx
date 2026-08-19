import { PageHeader } from "@/components/ui";
import { CaseForm } from "./form";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ student_id?: string }>;
}) {
  const { student_id } = await searchParams;

  return (
    <div>
      <PageHeader title="사례 등록" description="위기·지원이 필요한 학생의 사례를 새로 등록합니다." />
      <CaseForm defaultStudentId={student_id ?? ""} />
    </div>
  );
}
