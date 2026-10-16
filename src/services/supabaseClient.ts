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

  const cleanUrl = (localUrl || envUrl || '').trim().replace(/\/+$/, '');
  const cleanKey = (localKey || envKey || '').trim().replace(/^['"]|['"]$/g, '');

  return {
    url: cleanUrl,
    key: cleanKey,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  const cleanUrl = url ? url.trim().replace(/\/+$/, '') : '';
  const cleanKey = key ? key.trim().replace(/^['"]|['"]$/g, '') : '';

  if (cleanUrl) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, cleanUrl);
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);

  if (cleanKey) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, cleanKey);
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);

  // Invalidate cached client instance immediately so next call creates fresh client
  supabaseInstance = null;
  currentClientUrl = '';
  currentClientKey = '';

  // Notify components about credentials change
  window.dispatchEvent(new CustomEvent('oai-supabase-status-change'));
}

let supabaseInstance: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }

  try {
    if (!supabaseInstance || currentClientUrl !== url || currentClientKey !== key) {
      currentClientUrl = url;
      currentClientKey = key;
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

// Kiểm tra trạng thái Google Provider trên Supabase mà không làm văng ra trang lỗi thô 400
export async function checkSupabaseGoogleProviderStatus(): Promise<{
  enabled: boolean;
  message: string;
  authUrl?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      enabled: false,
      message: 'Chưa cấu hình Supabase URL hoặc Anon Key trong ứng dụng.',
    };
  }

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true, // Không tự động chuyển hướng nếu có lỗi
      },
    });

    if (error) {
      if (error.message?.includes('not enabled') || (error as any).code === 400 || (error as any).status === 400) {
        return {
          enabled: false,
          message: 'Google Provider chưa được bật trên Supabase Dashboard (Lỗi 400: Unsupported provider).',
        };
      }
      return {
        enabled: false,
        message: `Lỗi kiểm tra Supabase: ${error.message}`,
      };
    }

    if (data?.url) {
      return {
        enabled: true,
        message: 'Google Provider đã được kích hoạt thành công trên Supabase!',
        authUrl: data.url,
      };
    }

    return {
      enabled: false,
      message: 'Không nhận được đường dẫn xác thực OAuth từ Supabase.',
    };
  } catch (err: any) {
    return {
      enabled: false,
      message: err.message || 'Lỗi mạng khi kiểm tra Supabase Google OAuth',
    };
  }
}

// Đồng bộ toàn diện thông tin người dùng Google lên cả 2 bảng employees và guests của Supabase
export async function syncGoogleUserToSupabase(user: {
  email: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  employee_code?: string;
  position?: string;
  department_id?: string;
  auth_provider?: string;
}): Promise<{
  success: boolean;
  message: string;
  syncedTables: string[];
  errors: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Chưa cấu hình hoặc chưa kết nối Supabase Client.',
      syncedTables: [],
      errors: ['No client initialized'],
    };
  }

  const email = (user.email || '').trim();
  const fullName = (user.full_name || email.split('@')[0] || 'User').trim();
  const avatarUrl = user.avatar_url || '';
  const isLamAdmin = email.toLowerCase() === 'nh.lam19382@gmail.com';
  const role = isLamAdmin ? 'admin' : (user.role || 'staff');
  const code = user.employee_code || (isLamAdmin ? 'NV001' : `GG-${Math.floor(1000 + Math.random() * 9000)}`);
  const position = user.position || (isLamAdmin ? 'Tổng Quản trị viên (Admin)' : 'Nhân viên Google Account');

  const syncedTables: string[] = [];
  const errors: string[] = [];

  // 1. Đồng bộ vào bảng "employees"
  try {
    const { data: existingList, error: queryErr } = await client
      .from('employees')
      .select('id, employee_code, email')
      .eq('email', email)
      .limit(1);

    if (queryErr) {
      errors.push(`Bảng "employees": ${queryErr.message}`);
    } else if (existingList && existingList.length > 0) {
      const existing = existingList[0];
      const { error: updateErr } = await client
        .from('employees')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          status: 'active',
          role: isLamAdmin ? 'admin' : role,
          position: position,
        })
        .eq('id', existing.id);

      if (updateErr) {
        errors.push(`Cập nhật "employees": ${updateErr.message}`);
      } else {
        syncedTables.push('employees');
      }
    } else {
      const { error: insertErr } = await client.from('employees').insert([
        {
          employee_code: code,
          full_name: fullName,
          email: email,
          role: role,
          position: position,
          status: 'active',
          avatar_url: avatarUrl,
        },
      ]);

      if (insertErr) {
        errors.push(`Thêm mới "employees": ${insertErr.message}`);
      } else {
        syncedTables.push('employees');
      }
    }
  } catch (err: any) {
    errors.push(`Lỗi kết nối "employees": ${err.message}`);
  }

  // 2. Đồng bộ vào bảng "guests"
  try {
    const { error: guestErr } = await client.from('guests').upsert(
      {
        email: email,
        full_name: fullName,
        avatar_url: avatarUrl,
        auth_provider: 'google',
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (guestErr) {
      if (guestErr.code === '42P01') {
        errors.push(`Bảng "guests" chưa được tạo trên Supabase`);
      } else {
        errors.push(`Bảng "guests": ${guestErr.message}`);
      }
    } else {
      syncedTables.push('guests');
    }
  } catch (err: any) {
    errors.push(`Lỗi bảng "guests": ${err.message}`);
  }

  // 3. Ghi log hoạt động vào "activity_logs"
  try {
    const { error: logErr } = await client.from('activity_logs').insert([
      {
        employee_name: fullName,
        action: 'Đăng nhập Google Account',
        module: 'Xác thực',
        details: `Tài khoản ${fullName} (${email}) đã đăng nhập qua Google.`,
      },
    ]);
    if (!logErr) syncedTables.push('activity_logs');
  } catch {
    // Không chặn luồng nếu log phụ có lỗi
  }

  const success = syncedTables.length > 0;
  let message = '';
  if (success) {
    message = `Đã lưu tài khoản ${fullName} vào Supabase (Bảng: ${syncedTables.join(', ')})!`;
  } else {
    message = `Chưa thể lưu lên Supabase: ${errors.join('; ')}`;
  }

  return {
    success,
    message,
    syncedTables,
    errors,
  };
}

// Đồng bộ thông tin Khách đăng nhập (Google/Supabase) lên bảng guests của Supabase
export async function syncGuestToSupabase(guest: {
  email: string;
  full_name: string;
  avatar_url?: string;
  auth_provider?: string;
}): Promise<{ success: boolean; message?: string }> {
  const res = await syncGoogleUserToSupabase({
    email: guest.email,
    full_name: guest.full_name,
    avatar_url: guest.avatar_url,
    auth_provider: guest.auth_provider,
  });
  return { success: res.success, message: res.message };
}

// Đọc danh sách tài khoản thực tế đang có trên Supabase để người dùng kiểm chứng
export async function fetchSupabaseUsers(): Promise<{
  employees: any[];
  guests: any[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { employees: [], guests: [], error: 'Chưa kết nối Supabase' };

  try {
    const [empRes, guestRes] = await Promise.all([
      client.from('employees').select('id, employee_code, full_name, email, role, position, status, avatar_url, created_at').order('created_at', { ascending: false }).limit(25),
      client.from('guests').select('id, email, full_name, auth_provider, avatar_url, last_login_at').order('last_login_at', { ascending: false }).limit(25),
    ]);

    return {
      employees: empRes.data || [],
      guests: guestRes.data || [],
      error: empRes.error ? empRes.error.message : (guestRes.error && guestRes.error.code !== '42P01' ? guestRes.error.message : undefined),
    };
  } catch (err: any) {
    return { employees: [], guests: [], error: err.message };
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

  // Khóa Anon Key của Supabase luôn là mã JWT (bắt đầu bằng eyJ và có 3 phần tách nhau bởi dấu chấm, thường > 100 ký tự)
  if (!key.startsWith('eyJ') && key.length < 90) {
    return {
      connected: false,
      message: `Khóa API không đúng định dạng: Khóa Supabase Anon Public Key luôn bắt đầu bằng "eyJ..." và dài hơn 150 ký tự. Bạn đang nhập chuỗi dài ${key.length} ký tự. Hãy vào Supabase Dashboard > Settings > API > Project API keys > copy khóa "anon public".`,
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

      const isInvalidKey =
        error.message?.toLowerCase().includes('invalid api key') ||
        error.message?.toLowerCase().includes('jwt') ||
        (error as any).status === 401;

      if (isInvalidKey) {
        return {
          connected: false,
          latencyMs,
          message: `Lỗi: Supabase từ chối với "Invalid API key". Khóa Anon Public hợp lệ của Supabase là mã JWT bắt đầu bằng 'eyJ...' (khoảng 200 ký tự, lấy tại Supabase Dashboard > Settings > API > Project API keys > anon public). Vui lòng không dùng mật khẩu DB hoặc Project Ref.`,
        };
      }

      return {
        connected: false,
        latencyMs,
        message: `Lỗi truy vấn Supabase: ${error.message} (Mã lỗi: ${error.code || 'undefined'})`,
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
