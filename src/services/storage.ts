import {
  Department,
  Employee,
  Question,
  Exam,
  ExamAssignment,
  ExamAttempt,
  ActivityLog,
  SystemStats,
  UserRole
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTEMPTS,
  INITIAL_LOGS
} from './mockData';

const STORAGE_KEYS = {
  DEPARTMENTS: 'oai_departments',
  EMPLOYEES: 'oai_employees',
  QUESTIONS: 'oai_questions',
  EXAMS: 'oai_exams',
  ASSIGNMENTS: 'oai_assignments',
  ATTEMPTS: 'oai_attempts',
  LOGS: 'oai_logs',
  CURRENT_USER: 'oai_current_user',
  AUTH_STATE: 'oai_is_authenticated',
  SUPABASE_CONFIG: 'oai_supabase_config',
  SOUND_ENABLED: 'oai_sound_enabled',
};

// Dispatch storage change event for reactive UI updates
function notifyChange(key: string) {
  window.dispatchEvent(new CustomEvent('oai-storage-update', { detail: { key } }));
}

// Initialize seed data if not present
function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  }

  // Always ensure Admin profile is updated to Nguyễn Hoàng Lâm
  const employeesRaw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (employeesRaw) {
    try {
      const emps: Employee[] = JSON.parse(employeesRaw);
      const adminIdx = emps.findIndex(e => e.employee_code === 'NV001' || e.role === 'admin');
      if (adminIdx >= 0) {
        emps[adminIdx].full_name = 'Nguyễn Hoàng Lâm';
        emps[adminIdx].email = 'nh.lam19382@gmail.com';
        emps[adminIdx].position = 'Tổng Quản trị viên (Admin)';
        if (!emps[adminIdx].avatar_url || emps[adminIdx].avatar_url.includes('unsplash')) {
          emps[adminIdx].avatar_url = '/admin-avatar.svg';
        }
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(emps));
      }
    } catch {}
  }

  const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (currentUserRaw) {
    try {
      const cur: Employee = JSON.parse(currentUserRaw);
      if (cur.role === 'admin' || cur.employee_code === 'NV001' || cur.employee_code === 'LAMNH') {
        cur.full_name = 'Nguyễn Hoàng Lâm';
        cur.email = 'nh.lam19382@gmail.com';
        cur.position = 'Tổng Quản trị viên (Admin)';
        cur.password = cur.password || 'admin123';
        if (!cur.avatar_url || cur.avatar_url.includes('unsplash')) {
          cur.avatar_url = '/admin-avatar.svg';
        }
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(cur));
      }
    } catch {}
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0]));
  }
}

initializeData();

export const DatabaseService = {
  // Current user & authentication
  isAuthenticated(): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return raw !== 'false'; // Default to true on initial session
  },

  isGuestUser(): boolean {
    const user = this.getCurrentUser();
    return user.role === 'guest' || !!user.is_guest;
  },

  login(user: Employee, remember = true) {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'true');
    this.setCurrentUser(user);
    const providerLabel = user.role === 'guest' ? 'Khách (Công cụ công khai)' : `Nhân viên nội bộ (${user.role.toUpperCase()})`;
    this.addLog(user.full_name, 'Đăng nhập', 'Bảo mật', `Đăng nhập thành công với chế độ: ${providerLabel}`);
    this.playSuccessSound();
    notifyChange(STORAGE_KEYS.AUTH_STATE);
  },

  // Phương án 2: Xác thực Nhân viên Nội bộ (Mã NV + Mật khẩu nội bộ)
  verifyEmployeeLogin(codeOrEmail: string, passwordInput: string): {
    success: boolean;
    employee?: Employee;
    message: string;
  } {
    const employees = this.getEmployees();
    const cleanCode = codeOrEmail.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanCode || !cleanPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Mã Nhân viên và Mật khẩu.' };
    }

    // Match by employee_code (or alias LAMNH for admin) or email
    const emp = employees.find((e) => {
      const eCode = (e.employee_code || '').toLowerCase();
      const eEmail = (e.email || '').toLowerCase();
      if (cleanCode === 'lamnh' && (eCode === 'nv001' || e.role === 'admin')) return true;
      return eCode === cleanCode || eEmail === cleanCode;
    });

    if (!emp) {
      return {
        success: false,
        message: `Không tìm thấy nhân viên với mã hoặc email "${codeOrEmail}". Vui lòng kiểm tra lại.`,
      };
    }

    if (emp.status === 'inactive') {
      return {
        success: false,
        message: 'Tài khoản nhân viên này đang trong trạng thái tạm khóa. Vui lòng liên hệ Admin.',
      };
    }

    // Expected password (default: admin123 for admin, 123456 for staff)
    const expectedPass = emp.password || (emp.role === 'admin' ? 'admin123' : '123456');

    if (cleanPass !== expectedPass) {
      return {
        success: false,
        message: 'Mật khẩu nội bộ không chính xác. Vui lòng thử lại hoặc liên hệ Admin.',
      };
    }

    return {
      success: true,
      employee: emp,
      message: `Xác thực thành công cán bộ nhân viên: ${emp.full_name} (${emp.position}).`,
    };
  },

  // Phương án 1: Đăng nhập Khách (Supabase Auth chuẩn hoặc Khách vãng lai)
  loginAsGuest(guestInfo?: { email?: string; name?: string; provider?: 'supabase_auth' | 'guest' }): Employee {
    const guestUser: Employee = {
      id: `guest-${Date.now()}`,
      employee_code: 'GUEST',
      full_name: guestInfo?.name || (guestInfo?.email ? guestInfo.email.split('@')[0] : 'Khách vãng lai (Guest User)'),
      email: guestInfo?.email || 'guest@officeai.local',
      position: 'Khách trải nghiệm công cụ Office & AI',
      department_id: 'dept-guest',
      department_name: 'Khách / Đối tác công cộng',
      role: 'guest',
      status: 'active',
      is_guest: true,
      auth_provider: guestInfo?.provider || (guestInfo?.email ? 'supabase_auth' : 'guest'),
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      created_at: new Date().toISOString(),
    };

    this.login(guestUser);
    return guestUser;
  },

  changePassword(employeeId: string, oldPass: string, newPass: string): { success: boolean; message: string } {
    const employees = this.getEmployees();
    const idx = employees.findIndex((e) => e.id === employeeId);
    if (idx < 0) return { success: false, message: 'Không tìm thấy nhân viên.' };

    const emp = employees[idx];
    const expectedPass = emp.password || (emp.role === 'admin' ? 'admin123' : '123456');
    if (oldPass !== expectedPass) {
      return { success: false, message: 'Mật khẩu cũ không chính xác.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    employees[idx].password = newPass;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));

    const cur = this.getCurrentUser();
    if (cur.id === employeeId) {
      cur.password = newPass;
      this.setCurrentUser(cur);
    }

    this.addLog(emp.full_name, 'Đổi mật khẩu', 'Bảo mật', 'Thay đổi mật khẩu tài khoản thành công');
    notifyChange(STORAGE_KEYS.EMPLOYEES);
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  },

  logout() {
    const user = this.getCurrentUser();
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'false');
    this.addLog(user.full_name, 'Đăng xuất', 'Bảo mật', 'Người dùng đã đăng xuất khỏi phiên làm việc');
    notifyChange(STORAGE_KEYS.AUTH_STATE);
  },

  getCurrentUser(): Employee {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return INITIAL_EMPLOYEES[0];
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EMPLOYEES[0];
    }
  },

  setCurrentUser(user: Employee) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    notifyChange(STORAGE_KEYS.CURRENT_USER);
  },

  switchRole(role: UserRole) {
    if (role === 'guest') {
      this.loginAsGuest();
      return;
    }
    const current = this.getCurrentUser();
    const target = this.getEmployees().find(e => e.role === role) || {
      ...current,
      role,
      is_guest: false,
    };
    this.setCurrentUser(target);
    this.addLog(target.full_name, 'Chuyển vai trò', 'Phân quyền', `Đổi vai trò sang ${role.toUpperCase()}`);
  },

  updateUserAvatar(avatarUrl: string) {
    const user = this.getCurrentUser();
    user.avatar_url = avatarUrl;
    this.setCurrentUser(user);

    // Also update in employees list
    const employees = this.getEmployees();
    const idx = employees.findIndex(e => e.id === user.id);
    if (idx >= 0) {
      employees[idx].avatar_url = avatarUrl;
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      notifyChange(STORAGE_KEYS.EMPLOYEES);
    }
  },

  // Sound settings
  isSoundEnabled(): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return raw !== 'false'; // default true
  },

  setSoundEnabled(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
    notifyChange(STORAGE_KEYS.SOUND_ENABLED);
  },

  playSuccessSound() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext could be blocked until user interaction
    }
  },

  // Departments
  getDepartments(): Department[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || '[]');
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  },

  saveDepartment(dept: Department): Department {
    const list = this.getDepartments();
    const idx = list.findIndex(d => d.id === dept.id);
    if (idx >= 0) {
      list[idx] = dept;
    } else {
      list.unshift(dept);
    }
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
    notifyChange(STORAGE_KEYS.DEPARTMENTS);
    return dept;
  },

  // Employees
  getEmployees(): Employee[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
    } catch {
      return INITIAL_EMPLOYEES;
    }
  },

  saveEmployee(emp: Employee): { success: boolean; error?: string } {
    const list = this.getEmployees();
    // Validate unique employee_code
    const duplicate = list.find(e => e.employee_code.toLowerCase() === emp.employee_code.toLowerCase() && e.id !== emp.id);
    if (duplicate) {
      return { success: false, error: `Mã nhân viên "${emp.employee_code}" đã tồn tại trên hệ thống!` };
    }

    const idx = list.findIndex(e => e.id === emp.id);
    if (idx >= 0) {
      list[idx] = emp;
    } else {
      list.unshift(emp);
    }
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.addLog(this.getCurrentUser().full_name, idx >= 0 ? 'Cập nhật nhân viên' : 'Thêm nhân viên', 'Quản lý nhân sự', `${emp.employee_code} - ${emp.full_name}`);
    notifyChange(STORAGE_KEYS.EMPLOYEES);
    return { success: true };
  },

  deleteEmployee(id: string) {
    const list = this.getEmployees().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    notifyChange(STORAGE_KEYS.EMPLOYEES);
  },

  // Questions Bank
  getQuestions(): Question[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    } catch {
      return INITIAL_QUESTIONS;
    }
  },

  saveQuestion(question: Question): { success: boolean; error?: string } {
    const list = this.getQuestions();
    const duplicate = list.find(q => q.code.toLowerCase() === question.code.toLowerCase() && q.id !== question.id);
    if (duplicate) {
      return { success: false, error: `Mã câu hỏi "${question.code}" đã tồn tại trong ngân hàng!` };
    }

    const idx = list.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      list[idx] = question;
    } else {
      list.unshift(question);
    }
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
    this.addLog(this.getCurrentUser().full_name, idx >= 0 ? 'Sửa câu hỏi' : 'Tạo câu hỏi', 'Ngân hàng câu hỏi', `${question.code} - ${question.topic}`);
    notifyChange(STORAGE_KEYS.QUESTIONS);
    return { success: true };
  },

  deleteQuestion(id: string) {
    const list = this.getQuestions().filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
    notifyChange(STORAGE_KEYS.QUESTIONS);
  },

  importQuestions(newQuestions: Question[]): number {
    const list = this.getQuestions();
    let count = 0;
    for (const q of newQuestions) {
      if (!list.some(existing => existing.code.toLowerCase() === q.code.toLowerCase())) {
        list.unshift(q);
        count++;
      }
    }
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
    this.addLog(this.getCurrentUser().full_name, 'Nhập câu hỏi Excel/AI', 'Ngân hàng câu hỏi', `Nhập thành công ${count} câu hỏi`);
    notifyChange(STORAGE_KEYS.QUESTIONS);
    return count;
  },

  // Exams
  getExams(): Exam[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
    } catch {
      return INITIAL_EXAMS;
    }
  },

  saveExam(exam: Exam): { success: boolean; error?: string } {
    const list = this.getExams();
    const duplicate = list.find(e => e.code.toLowerCase() === exam.code.toLowerCase() && e.id !== exam.id);
    if (duplicate) {
      return { success: false, error: `Mã bài kiểm tra "${exam.code}" đã tồn tại!` };
    }

    const idx = list.findIndex(e => e.id === exam.id);
    if (idx >= 0) {
      list[idx] = exam;
    } else {
      list.unshift(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(list));
    this.addLog(this.getCurrentUser().full_name, idx >= 0 ? 'Cập nhật đề thi' : 'Tạo bài kiểm tra', 'Đào tạo', `${exam.code} - ${exam.title}`);
    notifyChange(STORAGE_KEYS.EXAMS);
    return { success: true };
  },

  deleteExam(id: string) {
    const list = this.getExams().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(list));
    notifyChange(STORAGE_KEYS.EXAMS);
  },

  // Assignments
  getAssignments(): ExamAssignment[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  },

  assignExam(examId: string, employeeIds: string[], dueDate?: string): number {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return 0;

    const employees = this.getEmployees();
    const currentAssignments = this.getAssignments();
    const currentUser = this.getCurrentUser();
    let assignedCount = 0;

    for (const empId of employeeIds) {
      const emp = employees.find(e => e.id === empId);
      if (!emp) continue;

      const existing = currentAssignments.find(a => a.exam_id === examId && a.employee_id === empId);
      if (!existing) {
        currentAssignments.unshift({
          id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          exam_id: exam.id,
          exam_title: exam.title,
          employee_id: emp.id,
          employee_name: emp.full_name,
          department_name: emp.department_name || 'Công ty',
          assigned_by: currentUser.full_name,
          assigned_at: new Date().toISOString(),
          due_date: dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
          status: 'pending',
        });
        assignedCount++;
      }
    }

    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(currentAssignments));
    this.addLog(currentUser.full_name, 'Giao bài kiểm tra', 'Đào tạo', `Giao "${exam.title}" cho ${assignedCount} nhân viên`);
    notifyChange(STORAGE_KEYS.ASSIGNMENTS);
    return assignedCount;
  },

  // Attempts & Results
  getAttempts(): ExamAttempt[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
    } catch {
      return INITIAL_ATTEMPTS;
    }
  },

  saveAttempt(attempt: ExamAttempt) {
    const list = this.getAttempts();
    list.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(list));

    // Update assignment status if exists
    const assignments = this.getAssignments();
    const asg = assignments.find(a => a.exam_id === attempt.exam_id && a.employee_id === attempt.employee_id);
    if (asg) {
      asg.status = 'completed';
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    }

    this.addLog(
      attempt.employee_name,
      'Nộp bài kiểm tra',
      'Khảo thí',
      `Bài thi "${attempt.exam_title}" - Điểm: ${attempt.total_score}/${attempt.max_score} (${attempt.score_percentage.toFixed(1)}%) - ${attempt.is_passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}`
    );
    notifyChange(STORAGE_KEYS.ATTEMPTS);
    notifyChange(STORAGE_KEYS.ASSIGNMENTS);
    this.playSuccessSound();
  },

  // Activity Logs
  getLogs(): ActivityLog[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(employeeName: string, action: string, module: string, details: string) {
    const list = this.getLogs();
    list.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_name: employeeName,
      action,
      module,
      details,
      created_at: new Date().toISOString(),
    });
    // Keep last 150 logs
    const trimmed = list.slice(0, 150);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trimmed));
    notifyChange(STORAGE_KEYS.LOGS);
  },

  // Dashboard Stats
  getStats(): SystemStats {
    const employees = this.getEmployees();
    const exams = this.getExams().filter(e => e.status === 'published');
    const attempts = this.getAttempts();

    const passedCount = attempts.filter(a => a.is_passed).length;
    const failedCount = attempts.length - passedCount;

    const totalScorePct = attempts.reduce((acc, a) => acc + (a.score_percentage || 0), 0);
    const averageScore = attempts.length > 0 ? Number((totalScorePct / attempts.length).toFixed(1)) : 78.5;

    const completionRate = attempts.length > 0
      ? Number(((passedCount / attempts.length) * 100).toFixed(0))
      : 86;

    return {
      totalEmployees: employees.length,
      openExamsCount: exams.length,
      completionRate,
      averageScore,
      totalAttempts: attempts.length,
      passedCount,
      failedCount,
    };
  },

  // Reset to initial demo data
  resetAll() {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0]));
    notifyChange('all');
  },
};
