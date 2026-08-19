export const COUNSELING_CATEGORY_LABEL: Record<string, string> = {
  counseling: "상담",
  education: "교육",
  referral: "의뢰",
  home_visit: "가정방문",
  phone: "전화상담",
  group: "집단상담",
  other: "기타",
};

export const SCHEDULE_CATEGORY_LABEL: Record<string, string> = {
  counseling: "상담",
  case_meeting: "사례회의",
  program: "프로그램",
  education: "교육",
  home_visit: "가정방문",
  etc: "기타",
};

export const RISK_LEVEL_LABEL: Record<string, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
};

export const CASE_STATUS_LABEL: Record<string, string> = {
  open: "진행중",
  monitoring: "모니터링",
  closed: "종결",
};

export const REFERRAL_STATUS_LABEL: Record<string, string> = {
  requested: "신청",
  in_progress: "진행중",
  approved: "승인",
  rejected: "반려",
  closed: "종결",
};

export const PROGRAM_CATEGORY_LABEL: Record<string, string> = {
  afterschool: "방과후",
  experience: "체험활동",
  mentoring: "멘토링",
  career: "진로",
  psychological: "심리정서",
  other: "기타",
};

export const PROGRAM_STATUS_LABEL: Record<string, string> = {
  planned: "예정",
  ongoing: "진행중",
  completed: "완료",
  canceled: "취소",
};

export const STUDENT_STATUS_LABEL: Record<string, string> = {
  active: "지원중",
  monitoring: "모니터링",
  closed: "종결",
  transferred: "전출",
};

const COLOR_CYCLE = [
  "bg-blue-50 text-blue-600",
  "bg-orange-50 text-orange-600",
  "bg-pink-50 text-pink-600",
  "bg-emerald-50 text-emerald-600",
  "bg-violet-50 text-violet-600",
  "bg-amber-50 text-amber-600",
  "bg-slate-100 text-slate-600",
];

export function colorForKey(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return COLOR_CYCLE[hash % COLOR_CYCLE.length];
}

export const RISK_COLOR: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-red-50 text-red-600",
};
