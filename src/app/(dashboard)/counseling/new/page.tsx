import { CounselingForm } from "./form";
import { PageHeader } from "@/components/ui";

export default async function NewCounselingLogPage({
  searchParams,
}: {
  searchParams: Promise<{ student_id?: string }>;
}) {
  const { student_id } = await searchParams;

  return (
    <div>
      <PageHeader title="상담일지 작성" description="상담·교육·의뢰 등 학생 지원 기록을 작성합니다." />
      <CounselingForm defaultStudentId={student_id ?? ""} />
    </div>
  );
}
