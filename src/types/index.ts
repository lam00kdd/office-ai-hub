export type UserRole = 'admin' | 'manager' | 'employee' | 'guest';

export interface Department {
  id: string;
  code: string;
  name: string;
  manager_name?: string;
  description?: string;
  employee_count?: number;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department_id: string;
  department_name?: string;
  position: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'on_leave';
  avatar_url?: string;
  password?: string;
  is_guest?: boolean;
  auth_provider?: 'internal' | 'supabase_auth' | 'google' | 'guest';
  created_at: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D'
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  code: string;
  topic: string;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  content: string;
  options: QuestionOption[];
  correct_answers: string[]; // ['A'] or ['A', 'C']
  explanation?: string;
  points: number;
  created_by?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  description?: string;
  topic: string;
  department_id?: string;
  department_name?: string;
  target_audience: string; // 'all' or department name
  duration_minutes: number;
  total_questions: number;
  total_points: number;
  passing_score_percent: number;
  start_time?: string;
  end_time?: string;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_answers_after_submission: boolean;
  allow_retake: boolean;
  status: 'draft' | 'published' | 'closed';
  questions: Question[];
  created_by?: string;
  created_at: string;
}

export interface ExamAssignment {
  id: string;
  exam_id: string;
  exam_title: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  assigned_by: string;
  assigned_at: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface AttemptAnswer {
  question_id: string;
  question_content: string;
  options: QuestionOption[];
  correct_answers: string[];
  selected_options: string[];
  is_correct: boolean;
  points_awarded: number;
  max_points: number;
  explanation?: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  exam_title: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department_name: string;
  attempt_number: number;
  started_at: string;
  submitted_at: string;
  time_spent_seconds: number;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  total_score: number;
  max_score: number;
  score_percentage: number;
  is_passed: boolean;
  status: 'submitted' | 'timed_out';
  answers: AttemptAnswer[];
}

export interface ActivityLog {
  id: string;
  employee_id?: string;
  employee_name: string;
  action: string;
  module: string;
  details: string;
  created_at: string;
}

export interface SystemStats {
  totalEmployees: number;
  openExamsCount: number;
  completionRate: number;
  averageScore: number;
  totalAttempts: number;
  passedCount: number;
  failedCount: number;
}

// PowerPoint types
export interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  layout: 'title' | 'content' | 'bullets' | 'columns' | 'quote' | 'conclusion';
  bullets?: string[];
  content?: string;
  leftColumn?: string;
  rightColumn?: string;
  speakerNotes?: string;
  bgGradient?: string;
}

// Word Document Template types
export interface WordTemplate {
  id: string;
  title: string;
  description: string;
  category: 'administrative' | 'meeting' | 'hr' | 'planning';
  content: string;
}

// ==========================================
// PHÂN HỆ SẢN XUẤT & LẮP RÁP BỘ DÂY ĐIỆN - ĐIỆN TỬ
// ==========================================

export type QualityInspectionStage = 'iqc' | 'inprocess' | 'outqc';
export type InspectionStatus = 'pass' | 'fail' | 'rework' | 'pending';

export interface InspectionParameter {
  id: string;
  name: string;
  standard: string;
  actual: string;
  result: 'pass' | 'fail';
}

export interface QualityRecord {
  id: string;
  code: string; // e.g. IQC-2026-0301, IPQC-CRIMP-042, OQC-HARNESS-109
  stage: QualityInspectionStage;
  part_number: string; // Mã linh kiện: WIRE-AVSS-0.5, TERM-AMP-173850
  part_name: string; // Tên linh kiện / Cụm dây
  lot_number: string;
  line_name: string; // "Line 01 (Cắt dập)", "Line 02 (Lắp ráp bàn Jig)"
  sample_size: number;
  defect_count: number;
  status: InspectionStatus;
  inspector_name: string;
  inspector_id: string;
  parameters: InspectionParameter[];
  defect_notes?: string;
  created_at: string;
}

// Kho vận & Giao nhận linh kiện / thành phẩm
export type WarehouseTransactionType = 'inbound' | 'outbound' | 'line_feed' | 'return';

export interface WarehouseRecord {
  id: string;
  code: string;
  type: WarehouseTransactionType;
  part_number: string;
  part_name: string;
  category: 'raw_material' | 'component' | 'finished_harness' | 'packaging';
  quantity: number;
  unit: 'cuộn' | 'cái' | 'bộ' | 'mét' | 'thùng';
  location: string;
  sender_receiver: string;
  lot_number: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
}

// ==========================================
// TIÊU CHUẨN ISO 9001 & IATF 16949 (QMS WORKFLOW)
// ==========================================

export type IsoDocType = 'SOP' | 'WI' | 'CONTROL_PLAN' | 'FMEA' | 'DRAWING' | 'SPEC';
export type IsoDocStatus = 'draft' | 'reviewing' | 'approved' | 'published' | 'obsolete';

export interface IsoDocument {
  id: string;
  doc_code: string; // e.g. SOP-PROD-014, WI-CRIMP-002, CP-HARNESS-A01
  title: string;
  standard: 'IATF 16949' | 'ISO 9001' | 'ISO 14001' | 'ISO 45001';
  doc_type: IsoDocType;
  revision: string; // Rev 01, Rev 02.1
  department: string;
  author_name: string; // Người biên soạn
  author_id: string;
  reviewer_name?: string; // Người soát xét (PE / QA Engineer)
  reviewer_notes?: string;
  approver_name?: string; // Người phê duyệt (QA Manager / Plant Manager)
  approver_signature?: string;
  status: IsoDocStatus;
  effective_date?: string;
  summary: string;
  key_steps?: string[];
  controlled_copy: boolean; // Dấu "CONTROLLED COPY"
  created_at: string;
  updated_at: string;
}

// ==========================================
// HÀNH CHÍNH NHÀ XƯỞNG: BÁO CƠM & CHẤM CÔNG / OT
// ==========================================

export type MealShift = 'ca_1_sang' | 'ca_2_chieu' | 'ca_3_dem' | 'tang_ca_ot';
export type MealOption = 'com_man' | 'com_chay' | 'suat_an_nhe' | 'an_kieng';

export interface MealBooking {
  id: string;
  employee_id: string;
  employee_code: string;
  full_name: string;
  department_name: string;
  line_name: string;
  booking_date: string;
  shift: MealShift;
  meal_option: MealOption;
  status: 'confirmed' | 'cancelled';
  special_diet?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_code: string;
  full_name: string;
  department_name: string;
  line_name: string;
  date: string;
  shift: 'ca_1' | 'ca_2' | 'ca_3' | 'hanh_chinh';
  check_in?: string;
  check_out?: string;
  status: 'on_time' | 'late' | 'early_leave' | 'absent_permitted' | 'absent_unexcused';
  ot_hours: number;
  ot_reason?: string;
  ot_approved_by?: string;
  created_at: string;
}

// Công cụ kỹ thuật dập cos & thông số dây dẫn điện (Wire Harness Engineering)
export interface CrimpStandard {
  id: string;
  terminal_code: string;
  terminal_name: string;
  wire_size: string; // "0.3 sq", "0.5 sq", "0.85 sq", "1.25 sq", "2.0 sq"
  crimp_height_min: number; // mm
  crimp_height_max: number; // mm
  crimp_width_nom: number; // mm
  pull_force_min: number; // Newton (N)
  applicable_wire_type: string; // AVSS, AVS, CIVUS, FLRY-A
  applicator_die_code: string;
}

