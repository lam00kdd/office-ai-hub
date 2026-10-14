import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Shield,
  Key,
  Mail,
  Lock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Database,
  Eye,
  EyeOff,
  Building2,
  Globe,
  AlertCircle,
  HelpCircle,
  Check,
  Users
} from 'lucide-react';
import { Employee } from '../types';
import { DatabaseService } from '../services/storage';
import { getSupabaseClient } from '../services/supabaseClient';
import { toast } from '../services/toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: Employee) => void;
  defaultTab?: 'employee' | 'guest';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultTab = 'employee',
}) => {
  const [activeTab, setActiveTab] = useState<'employee' | 'guest'>(defaultTab);

  // State for Employee login (Phương án 2: Mã NV + Mật khẩu nội bộ)
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // State for Guest login (Phương án 1: Supabase Auth / Khách công cộng)
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setEmployeeError(null);
      setGuestError(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Handle Phương án 2: Đăng nhập Cán bộ Nhân viên
  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError(null);

    if (!employeeCode.trim() || !employeePassword.trim()) {
      setEmployeeError('Vui lòng nhập đầy đủ Mã Nhân viên và Mật khẩu nội bộ.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = DatabaseService.verifyEmployeeLogin(employeeCode, employeePassword);
      setIsLoading(false);

      if (res.success && res.employee) {
        DatabaseService.login(res.employee);
        onLoginSuccess(res.employee);
        toast.success(
          `Chào mừng ${res.employee.full_name} (${res.employee.position}) đã đăng nhập!`,
          'Xác thực Nhân viên thành công'
        );
        onClose?.();
      } else {
        setEmployeeError(res.message);
        toast.error(res.message, 'Đăng nhập không thành công');
      }
    }, 400);
  };

  // Quick fill helper for testing/inspection
  const handleQuickFillEmployee = (code: string, pass: string) => {
    setEmployeeCode(code);
    setEmployeePassword(pass);
    setEmployeeError(null);
  };

  // Handle Phương án 1: Supabase Auth / Khách
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError(null);

    if (!guestEmail.trim()) {
      setGuestError('Vui lòng nhập Email để đăng nhập qua Supabase Auth.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && guestPassword.trim()) {
        // Attempt Supabase Auth signInWithPassword
        const { data, error } = await supabase.auth.signInWithPassword({
          email: guestEmail.trim(),
          password: guestPassword.trim(),
        });

        if (error) {
          // If user doesn't exist, try auto sign up
          if (error.message.includes('Invalid login credentials')) {
            const { error: signUpErr } = await supabase.auth.signUp({
              email: guestEmail.trim(),
              password: guestPassword.trim(),
            });
            if (signUpErr) {
              setGuestError(`Supabase Auth: ${signUpErr.message}`);
              setIsLoading(false);
              return;
            }
          } else {
            setGuestError(`Supabase Auth: ${error.message}`);
            setIsLoading(false);
            return;
          }
        }
      }

      // Successful guest authentication
      const guestUser = DatabaseService.loginAsGuest({
        email: guestEmail.trim(),
        name: guestEmail.split('@')[0],
        provider: 'supabase_auth',
      });

      onLoginSuccess(guestUser);
      toast.success(
        `Chào mừng ${guestUser.full_name}! Bạn được cấp quyền sử dụng các công cụ văn phòng và Trợ lý AI.`,
        'Đăng nhập Khách (Supabase Auth)'
      );
      setIsLoading(false);
      onClose?.();
    } catch (err: any) {
      setIsLoading(false);
      setGuestError(err.message || 'Lỗi kết nối Supabase Auth');
    }
  };

  // 1-Click Fast Guest Entry
  const handleFastGuestEntry = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guestUser = DatabaseService.loginAsGuest();
      onLoginSuccess(guestUser);
      toast.info(
        'Đã kích hoạt chế độ Khách vãng lai: Sử dụng miễn phí toàn bộ công cụ Excel, PDF, Word, PPT và AI Trợ lý.',
        'Trải nghiệm Khách thành công'
      );
      setIsLoading(false);
      onClose?.();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Hero Banner */}
        <div className="p-6 pb-5 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-sm border border-white/10 text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Office AI Hub 2026 • Cổng Xác Thực Kép
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm"
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Đăng nhập hệ thống</h2>
          <p className="text-xs text-blue-200/90 mt-1">
            Chọn phương thức xác thực phù hợp theo yêu cầu phân quyền bảo mật doanh nghiệp
          </p>
        </div>

        {/* 2 Door Tabs (Phương án 2 vs Phương án 1) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 mx-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveTab('employee');
              setEmployeeError(null);
            }}
            className={`py-2.5 px-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'employee'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md shadow-slate-300/40 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div className="text-left leading-tight">
              <div>Cán bộ Nhân viên</div>
              <div className="text-[10px] font-normal opacity-80">Mã NV + Mật khẩu</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('guest');
              setGuestError(null);
            }}
            className={`py-2.5 px-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guest'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md shadow-slate-300/40 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-left leading-tight">
              <div>Khách & Đối tác</div>
              <div className="text-[10px] font-normal opacity-80">Supabase Auth</div>
            </div>
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="p-6 pt-4 space-y-4 overflow-y-auto scrollbar-thin">
          {/* TAB 1: PHƯƠNG ÁN 2 (MÃ NV + MẬT KHẨU NỘI BỘ) */}
          {activeTab === 'employee' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Phương án 2 (Nội bộ doanh nghiệp):</strong> Dành cho Cán bộ Nhân viên, Trưởng phòng và Quản trị viên để quản lý đề thi, làm bài sát hạch và quản lý nhân sự theo phân quyền RBAC.
                </div>
              </div>

              {employeeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{employeeError}</span>
                </div>
              )}

              <form onSubmit={handleEmployeeSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mã Nhân viên hoặc Email:
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="VD: LAMNH, NV001, NV002..."
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mật khẩu nội bộ:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showEmployeePassword ? 'text' : 'password'}
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      placeholder="Nhập mật khẩu nội bộ..."
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                      {showEmployeePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Đang kiểm tra thông tin...' : 'Đăng nhập Nhân viên'}</span>
                </button>
              </form>

              {/* 1-Click Fill Testing Credentials */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Điền nhanh tài khoản kiểm thử:
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    1-Click điền mã & pass
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Admin: Nguyễn Hoàng Lâm */}
                  <button
                    type="button"
                    onClick={() => handleQuickFillEmployee('LAMNH', 'admin123')}
                    className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-300">Nguyễn Hoàng Lâm</span>
                      <span className="text-[9px] font-extrabold px-1 rounded bg-rose-200 text-rose-800">ADMIN</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã: LAMNH</div>
                    <div className="text-[10px] text-slate-400">Pass: admin123</div>
                  </button>

                  {/* Manager: Trần Thị Bình */}
                  <button
                    type="button"
                    onClick={() => handleQuickFillEmployee('NV002', '123456')}
                    className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-700 dark:text-purple-300">Trần Thị Bình</span>
                      <span className="text-[9px] font-extrabold px-1 rounded bg-purple-200 text-purple-800">MANAGER</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã: NV002</div>
                    <div className="text-[10px] text-slate-400">Pass: 123456</div>
                  </button>

                  {/* Employee: Lê Văn Công */}
                  <button
                    type="button"
                    onClick={() => handleQuickFillEmployee('NV003', '123456')}
                    className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 dark:text-blue-300">Lê Văn Công</span>
                      <span className="text-[9px] font-extrabold px-1 rounded bg-blue-200 text-blue-800">STAFF</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã: NV003</div>
                    <div className="text-[10px] text-slate-400">Pass: 123456</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: PHƯƠNG ÁN 1 (SUPABASE AUTH CHO KHÁCH & ĐỐI TÁC) */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Phương án 1 (Khách công cộng):</strong> Cho phép khách cá nhân đăng nhập bằng tài khoản Supabase Auth để sử dụng toàn bộ công cụ văn phòng và Trợ lý AI. <em>Tính năng thi cử & nhân sự nội bộ sẽ bị khóa an toàn.</em>
                </div>
              </div>

              {guestError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{guestError}</span>
                </div>
              )}

              {/* Fast 1-Click Guest Button */}
              <button
                type="button"
                onClick={handleFastGuestEntry}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-500/25 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div>Trải nghiệm ngay với tư cách Khách</div>
                    <div className="text-[10px] text-emerald-100 font-normal">Không cần mật khẩu, dùng ngay công cụ Office & AI</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">
                  Hoặc đăng nhập Email qua Supabase Auth
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <form onSubmit={handleGuestSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email của bạn:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="khach.hang@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu Supabase Auth:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showGuestPassword ? 'text' : 'password'}
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGuestPassword(!showGuestPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                      {showGuestPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>{isLoading ? 'Đang kết nối Supabase...' : 'Đăng nhập / Đăng ký Supabase Auth'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Footer security notes */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              Bảo mật 2 lớp: Mã NV nội bộ & Supabase RLS
            </span>
            <span className="text-slate-400 font-mono">Phiên bản 2026.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
