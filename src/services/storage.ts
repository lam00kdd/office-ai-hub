import {
  Department,
  Employee,
  Question,
  Exam,
  ExamAssignment,
  ExamAttempt,
  ActivityLog,
  SystemStats,
  UserRole,
  QualityRecord,
  WarehouseRecord,
  IsoDocument,
  IsoDocStatus,
  MealBooking,
  AttendanceRecord,
  CrimpStandard,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTEMPTS,
  INITIAL_LOGS,
  INITIAL_QUALITY_RECORDS,
  INITIAL_WAREHOUSE_RECORDS,
  INITIAL_ISO_DOCS,
  INITIAL_MEAL_BOOKINGS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CRIMP_STANDARDS,
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
  GUESTS: 'oai_guest_profiles',
  QUALITY_RECORDS: 'oai_quality_records',
  WAREHOUSE_RECORDS: 'oai_warehouse_records',
  ISO_DOCS: 'oai_iso_docs',
  MEAL_BOOKINGS: 'oai_meal_bookings',
  ATTENDANCE_RECORDS: 'oai_attendance_records',
  CRIMP_STANDARDS: 'oai_crimp_standards',
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
  if (!localStorage.getItem(STORAGE_KEYS.QUALITY_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.QUALITY_RECORDS, JSON.stringify(INITIAL_QUALITY_RECORDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WAREHOUSE_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_RECORDS, JSON.stringify(INITIAL_WAREHOUSE_RECORDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ISO_DOCS)) {
    localStorage.setItem(STORAGE_KEYS.ISO_DOCS, JSON.stringify(INITIAL_ISO_DOCS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEAL_BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.MEAL_BOOKINGS, JSON.stringify(INITIAL_MEAL_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CRIMP_STANDARDS)) {
    localStorage.setItem(STORAGE_KEYS.CRIMP_STANDARDS, JSON.stringify(INITIAL_CRIMP_STANDARDS));
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

  // Phương án 1: Đăng nhập Khách (Supabase Auth chuẩn, Google OAuth, hoặc Khách vãng lai)
  getGuests(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GUESTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveGuestProfile(guest: Employee) {
    const guests = this.getGuests();
    const existingIndex = guests.findIndex((g) => g.email.toLowerCase() === guest.email.toLowerCase());
    if (existingIndex >= 0) {
      guests[existingIndex] = { ...guests[existingIndex], ...guest };
    } else {
      guests.unshift(guest);
    }
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
    notifyChange(STORAGE_KEYS.GUESTS);
  },

  loginAsGuest(guestInfo?: { email?: string; name?: string; provider?: 'supabase_auth' | 'guest' | 'google' }): Employee {
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

    this.saveGuestProfile(guestUser);
    this.login(guestUser);
    return guestUser;
  },

  // Đăng nhập bằng Google Account - Tự động lưu thông tin khách vào Database
  loginWithGoogle(googleData?: { name?: string; email?: string; avatar?: string; googleId?: string }): Employee {
    const email = googleData?.email || 'khach.google@gmail.com';
    const name = googleData?.name || (email.split('@')[0]);
    const avatar = googleData?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80';

    // Kiểm tra xem khách này đã từng ghé thăm trước đó chưa
    const existingGuests = this.getGuests();
    const found = existingGuests.find((g) => g.email.toLowerCase() === email.toLowerCase());

    const guestUser: Employee = {
      id: found ? found.id : `guest-gg-${Date.now()}`,
      employee_code: 'GUEST-GG',
      full_name: name,
      email: email,
      position: 'Khách đăng nhập qua Google OAuth',
      department_id: 'dept-guest',
      department_name: 'Khách / Đối tác công cộng',
      role: 'guest',
      status: 'active',
      is_guest: true,
      auth_provider: 'google',
      avatar_url: avatar,
      created_at: found ? found.created_at : new Date().toISOString(),
    };

    // Lưu vĩnh viễn vào danh sách khách trong Database
    this.saveGuestProfile(guestUser);
    this.login(guestUser);
    this.addLog(
      name,
      'Google Login',
      'Xác thực OAuth',
      `Khách đăng nhập bằng tài khoản Google (${email}), đã lưu hồ sơ vào Database.`
    );
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
    localStorage.setItem(STORAGE_KEYS.QUALITY_RECORDS, JSON.stringify(INITIAL_QUALITY_RECORDS));
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_RECORDS, JSON.stringify(INITIAL_WAREHOUSE_RECORDS));
    localStorage.setItem(STORAGE_KEYS.ISO_DOCS, JSON.stringify(INITIAL_ISO_DOCS));
    localStorage.setItem(STORAGE_KEYS.MEAL_BOOKINGS, JSON.stringify(INITIAL_MEAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
    localStorage.setItem(STORAGE_KEYS.CRIMP_STANDARDS, JSON.stringify(INITIAL_CRIMP_STANDARDS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0]));
    notifyChange('all');
  },

  // ==========================================
  // MANUFACTURING: KIỂM SOÁT CHẤT LƯỢNG (IQC, IPQC, OQC)
  // ==========================================
  getQualityRecords(): QualityRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUALITY_RECORDS);
    if (!raw) return INITIAL_QUALITY_RECORDS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_QUALITY_RECORDS;
    }
  },

  saveQualityRecord(record: QualityRecord) {
    const list = this.getQualityRecords();
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.QUALITY_RECORDS, JSON.stringify(list));
    this.addLog(
      record.inspector_name,
      'Kiểm định chất lượng',
      'QA/QC',
      `Lập phiếu kiểm định ${record.code} (${record.stage.toUpperCase()}) - Kết quả: ${record.status.toUpperCase()}`
    );
    notifyChange(STORAGE_KEYS.QUALITY_RECORDS);
  },

  deleteQualityRecord(id: string) {
    const list = this.getQualityRecords().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUALITY_RECORDS, JSON.stringify(list));
    notifyChange(STORAGE_KEYS.QUALITY_RECORDS);
  },

  // ==========================================
  // MANUFACTURING: KHO VẬN & GIAO NHẬN (WAREHOUSE)
  // ==========================================
  getWarehouseRecords(): WarehouseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_RECORDS);
    if (!raw) return INITIAL_WAREHOUSE_RECORDS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_WAREHOUSE_RECORDS;
    }
  },

  saveWarehouseRecord(record: WarehouseRecord) {
    const list = this.getWarehouseRecords();
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_RECORDS, JSON.stringify(list));
    this.addLog(
      record.sender_receiver,
      'Kho vận',
      'Logistics',
      `Phiếu ${record.code} (${record.type}) - ${record.quantity} ${record.unit} ${record.part_name}`
    );
    notifyChange(STORAGE_KEYS.WAREHOUSE_RECORDS);
  },

  // ==========================================
  // MANUFACTURING: ISO 9001 & IATF 16949 QMS WORKFLOW
  // ==========================================
  getIsoDocs(): IsoDocument[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ISO_DOCS);
    if (!raw) return INITIAL_ISO_DOCS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ISO_DOCS;
    }
  },

  saveIsoDoc(doc: IsoDocument) {
    const list = this.getIsoDocs();
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      list[idx] = { ...doc, updated_at: new Date().toISOString() };
    } else {
      list.unshift(doc);
    }
    localStorage.setItem(STORAGE_KEYS.ISO_DOCS, JSON.stringify(list));
    this.addLog(
      doc.author_name,
      'Quy trình ISO-IATF',
      'QMS',
      `Cập nhật tài liệu ${doc.doc_code}: ${doc.title} (${doc.status})`
    );
    notifyChange(STORAGE_KEYS.ISO_DOCS);
  },

  updateIsoDocStatus(id: string, status: IsoDocStatus, reviewerOrApproverNotes?: string, approverName?: string) {
    const list = this.getIsoDocs();
    const idx = list.findIndex(d => d.id === id);
    if (idx >= 0) {
      const doc = list[idx];
      doc.status = status;
      doc.updated_at = new Date().toISOString();
      if (reviewerOrApproverNotes) {
        if (status === 'reviewing') doc.reviewer_notes = reviewerOrApproverNotes;
        if (status === 'approved' || status === 'published') {
          doc.approver_signature = `${approverName || 'APPROVED'}_${Date.now()}`;
          doc.approver_name = approverName || 'Nguyễn Hoàng Lâm';
          doc.controlled_copy = true;
          doc.effective_date = new Date().toISOString().split('T')[0];
        }
      }
      localStorage.setItem(STORAGE_KEYS.ISO_DOCS, JSON.stringify(list));
      this.addLog(
        approverName || 'Hệ thống',
        'Phê duyệt ISO-IATF',
        'QMS Approval',
        `Chuyển trạng thái tài liệu ${doc.doc_code} sang: ${status.toUpperCase()}`
      );
      notifyChange(STORAGE_KEYS.ISO_DOCS);
    }
  },

  // ==========================================
  // MANUFACTURING: BÁO CƠM CA LÀM VIỆC & NHÀ ĂN
  // ==========================================
  getMealBookings(): MealBooking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_BOOKINGS);
    if (!raw) return INITIAL_MEAL_BOOKINGS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MEAL_BOOKINGS;
    }
  },

  bookMeal(booking: MealBooking) {
    const list = this.getMealBookings();
    // Check if employee already booked for that date & shift
    const existingIdx = list.findIndex(
      b => b.employee_id === booking.employee_id && b.booking_date === booking.booking_date && b.shift === booking.shift
    );
    if (existingIdx >= 0) {
      list[existingIdx] = booking;
    } else {
      list.unshift(booking);
    }
    localStorage.setItem(STORAGE_KEYS.MEAL_BOOKINGS, JSON.stringify(list));
    this.addLog(
      booking.full_name,
      'Báo cơm ca',
      'Hành chính xưởng',
      `Đăng ký suất ăn (${booking.meal_option}) cho ngày ${booking.booking_date} (${booking.shift})`
    );
    notifyChange(STORAGE_KEYS.MEAL_BOOKINGS);
  },

  cancelMeal(id: string) {
    const list = this.getMealBookings();
    const idx = list.findIndex(b => b.id === id);
    if (idx >= 0) {
      list[idx].status = 'cancelled';
      localStorage.setItem(STORAGE_KEYS.MEAL_BOOKINGS, JSON.stringify(list));
      notifyChange(STORAGE_KEYS.MEAL_BOOKINGS);
    }
  },

  // ==========================================
  // MANUFACTURING: CHẤM CÔNG & ĐIỂM DANH CA KÍP / TĂNG CA (OT)
  // ==========================================
  getAttendanceRecords(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS);
    if (!raw) return INITIAL_ATTENDANCE_RECORDS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ATTENDANCE_RECORDS;
    }
  },

  checkInAttendance(record: AttendanceRecord) {
    const list = this.getAttendanceRecords();
    const existingIdx = list.findIndex(
      a => a.employee_id === record.employee_id && a.date === record.date
    );
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...record };
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(list));
    this.addLog(
      record.full_name,
      'Điểm danh ca',
      'Chấm công',
      `Vào ca làm việc ${record.shift} lúc ${record.check_in || 'đầu ca'}`
    );
    notifyChange(STORAGE_KEYS.ATTENDANCE_RECORDS);
  },

  requestOvertime(id: string, otHours: number, otReason: string, approverName: string) {
    const list = this.getAttendanceRecords();
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx].ot_hours = otHours;
      list[idx].ot_reason = otReason;
      list[idx].ot_approved_by = approverName;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(list));
      this.addLog(
        list[idx].full_name,
        'Đăng ký Tăng ca',
        'OT Management',
        `Đăng ký ${otHours}h tăng ca - Lý do: ${otReason} (Đã duyệt bởi ${approverName})`
      );
      notifyChange(STORAGE_KEYS.ATTENDANCE_RECORDS);
    }
  },

  // ==========================================
  // MANUFACTURING: BẢNG TRA THÔNG SỐ KỸ THUẬT DÂY DẪN (WIRE HARNESS)
  // ==========================================
  getCrimpStandards(): CrimpStandard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CRIMP_STANDARDS);
    if (!raw) return INITIAL_CRIMP_STANDARDS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CRIMP_STANDARDS;
    }
  },
};
