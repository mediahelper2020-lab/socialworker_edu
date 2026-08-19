import { PageHeader } from "@/components/ui";
import { ReferralForm } from "./form";

export default async function NewReferralPage({
  searchParams,
}: {
  searchParams: Promise<{ student_id?: string }>;
}) {
  const { student_id } = await searchParams;

  return (
    <div>
      <PageHeader title="자원연계 신청" description="학생을 지역사회 자원 기관에 연계합니다." />
      <ReferralForm defaultStudentId={student_id ?? ""} />
    </div>
  );
}
