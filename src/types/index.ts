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
  auth_provider?: 'internal' | 'supabase_auth' | 'guest';
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
