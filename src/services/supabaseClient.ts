import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTEMPTS,
  INITIAL_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  SUPABASE_URL: 'oai_supabase_url',
  SUPABASE_KEY: 'oai_supabase_key',
};

// Check environment variables or user localStorage settings
export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  return {
    url: localUrl || envUrl || '',
    key: localKey || envKey || '',
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);

  if (key) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);

  // Notify components about credentials change
  window.dispatchEvent(new CustomEvent('oai-supabase-status-change'));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: true },
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Supabase init error:', err);
    return null;
  }
}

// Test connection and measure ping latency
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  message: string;
  tablesFound?: string[];
}> {
  const client = getSupabaseClient();
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || !client) {
    return {
      connected: false,
      message: 'Chưa cấu hình Supabase URL hoặc Anon Key trong biến môi trường / cài đặt.',
    };
  }

  const startTime = performance.now();
  try {
    // Attempt querying employees table
    const { data, error } = await client.from('employees').select('id, full_name').limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // Table might not exist yet if schema wasn't run
      if (error.code === '42P01') {
        return {
          connected: true,
          latencyMs,
          message:
            'Đã kết nối máy chủ Supabase thành công! Tuy nhiên bảng "employees" chưa được tạo. Hãy chạy file migration SQL trong SQL Editor.',
        };
      }
      return {
        connected: false,
        latencyMs,
        message: `Lỗi truy vấn Supabase: ${error.message} (Mã lỗi: ${error.code})`,
      };
    }

    return {
      connected: true,
      latencyMs,
      message: `Kết nối Supabase thành công! Độ trễ phản hồi: ${latencyMs}ms.`,
      tablesFound: ['departments', 'employees', 'questions', 'exams', 'exam_attempts'],
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Không thể kết nối đến ${url}: ${err.message || 'Lỗi mạng hoặc CORS'}`,
    };
  }
}

// Push all demo seed data directly into user's Supabase instance with 1 click
export async function syncSeedDataToSupabase(): Promise<{
  success: boolean;
  message: string;
  stats?: { departments: number; employees: number; questions: number; exams: number };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Chưa cấu hình Supabase Client. Vui lòng nhập URL và Anon Key trước.',
    };
  }

  try {
    // 1. Seed departments
    const deptRows = INITIAL_DEPARTMENTS.map((d) => ({
      code: d.code,
      name: d.name,
      manager_name: d.manager_name,
      description: d.description,
    }));
    await client.from('departments').upsert(deptRows, { onConflict: 'code' });

    // 2. Seed employees
    const empRows = INITIAL_EMPLOYEES.map((e) => ({
      employee_code: e.employee_code,
      full_name: e.full_name,
      email: e.email,
      phone: e.phone,
      position: e.position,
      role: e.role,
      status: e.status,
      avatar_url: e.avatar_url,
    }));
    await client.from('employees').upsert(empRows, { onConflict: 'employee_code' });

    // 3. Seed questions
    const qRows = INITIAL_QUESTIONS.map((q) => ({
      code: q.code,
      topic: q.topic,
      difficulty: q.difficulty,
      question_type: q.question_type,
      content: q.content,
      options: q.options,
      correct_answers: q.correct_answers,
      explanation: q.explanation,
      points: q.points,
    }));
    await client.from('questions').upsert(qRows, { onConflict: 'code' });

    // 4. Seed exams
    const examRows = INITIAL_EXAMS.map((ex) => ({
      code: ex.code,
      title: ex.title,
      description: ex.description,
      topic: ex.topic,
      duration_minutes: ex.duration_minutes,
      total_questions: ex.total_questions,
      total_points: ex.total_points,
      passing_score_percent: ex.passing_score_percent,
      max_attempts: ex.max_attempts,
      shuffle_questions: ex.shuffle_questions,
      shuffle_options: ex.shuffle_options,
      status: ex.status,
    }));
    await client.from('exams').upsert(examRows, { onConflict: 'code' });

    return {
      success: true,
      message: 'Đã đồng bộ toàn bộ dữ liệu mẫu (Phòng ban, Nhân viên, Câu hỏi, Đề thi) lên Supabase!',
      stats: {
        departments: deptRows.length,
        employees: empRows.length,
        questions: qRows.length,
        exams: examRows.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi đồng bộ: ${err.message || 'Kiểm tra lại quyền ghi RLS trên Supabase'}`,
    };
  }
}
