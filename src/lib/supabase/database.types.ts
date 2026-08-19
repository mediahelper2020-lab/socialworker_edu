export type CounselingCategory =
  | "counseling"
  | "education"
  | "referral"
  | "home_visit"
  | "phone"
  | "group"
  | "other";

export type RiskLevel = "low" | "medium" | "high";
export type CaseStatus = "open" | "monitoring" | "closed";
export type ReferralStatus = "requested" | "in_progress" | "approved" | "rejected" | "closed";
export type ProgramCategory =
  | "afterschool"
  | "experience"
  | "mentoring"
  | "career"
  | "psychological"
  | "other";
export type ProgramStatus = "planned" | "ongoing" | "completed" | "canceled";
export type ScheduleCategory =
  | "counseling"
  | "case_meeting"
  | "program"
  | "education"
  | "home_visit"
  | "etc";
export type StudentStatus = "active" | "monitoring" | "closed" | "transferred";

export interface Profile {
  id: string;
  name: string;
  org_name: string | null;
  role: "staff" | "admin";
  phone: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  school: string | null;
  grade: number | null;
  class_no: number | null;
  student_no: number | null;
  gender: "M" | "F" | null;
  birth_date: string | null;
  contact: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  address: string | null;
  priority_type: string | null;
  status: StudentStatus;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CounselingLog {
  id: string;
  student_id: string | null;
  counselor_id: string | null;
  log_date: string;
  start_time: string | null;
  category: CounselingCategory;
  title: string | null;
  content: string | null;
  action_taken: string | null;
  next_plan: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  students?: Pick<Student, "id" | "name" | "school" | "grade" | "class_no"> | null;
}

export interface Case {
  id: string;
  student_id: string;
  case_manager_id: string | null;
  title: string;
  background: string | null;
  goal: string | null;
  risk_level: RiskLevel;
  status: CaseStatus;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  students?: Pick<Student, "id" | "name" | "school" | "grade" | "class_no"> | null;
}

export interface CaseNote {
  id: string;
  case_id: string;
  author_id: string | null;
  note_date: string;
  note_type: "progress" | "case_meeting" | "referral" | "crisis" | "closing";
  content: string;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  memo: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  student_id: string;
  case_id: string | null;
  resource_id: string;
  purpose: string | null;
  status: ReferralStatus;
  request_date: string;
  result: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  students?: Pick<Student, "id" | "name"> | null;
  resources?: Pick<Resource, "id" | "name" | "category"> | null;
}

export interface Program {
  id: string;
  name: string;
  category: ProgramCategory;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  capacity: number | null;
  budget: number | null;
  description: string | null;
  status: ProgramStatus;
  created_by: string | null;
  created_at: string;
}

export interface ProgramParticipant {
  id: string;
  program_id: string;
  student_id: string;
  applied_at: string;
  satisfaction_score: number | null;
  memo: string | null;
  students?: Pick<Student, "id" | "name"> | null;
}

export interface Schedule {
  id: string;
  title: string;
  category: ScheduleCategory;
  schedule_date: string;
  start_time: string | null;
  end_time: string | null;
  student_id: string | null;
  case_id: string | null;
  program_id: string | null;
  location: string | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  students?: Pick<Student, "id" | "name"> | null;
}

export interface Notice {
  id: string;
  category: "notice" | "update";
  title: string;
  content: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Memo {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
}
