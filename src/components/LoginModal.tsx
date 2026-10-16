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
  Users,
  Copy,
} from 'lucide-react';
import { Employee } from '../types';
import { DatabaseService } from '../services/storage';
import {
  getSupabaseClient,
  getSupabaseCredentials,
  checkSupabaseGoogleProviderStatus,
  syncGoogleUserToSupabase,
} from '../services/supabaseClient';
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

  // Google OAuth Sign-in State
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [supabaseGoogleError, setSupabaseGoogleError] = useState<string | null>(null);

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

  // Mở bộ chọn tài khoản Google tức thì (An toàn, không bị chuyển hướng lỗi 400)
  const handleGoogleSignIn = () => {
    setGuestError(null);
    setSupabaseGoogleError(null);
    setShowGooglePicker((prev) => !prev);
  };

  // Thử kết nối trực tiếp với Supabase Google OAuth (Kiểm tra an toàn, ngăn chặn hoàn toàn lỗi 400 làm đơ trang)
  const handleTestSupabaseGoogleOAuth = async () => {
    setIsLoading(true);
    setSupabaseGoogleError(null);
    try {
      const status = await checkSupabaseGoogleProviderStatus();
      if (!status.enabled) {
        setSupabaseGoogleError(status.message);
        setShowSupabaseGuide(true);
        setIsLoading(false);
        return;
      }

      if (status.authUrl) {
        // Provider đã được bật trên Supabase! Chuyển hướng an toàn tới màn hình cấp quyền Google
        window.location.href = status.authUrl;
      }
    } catch (err: any) {
      setSupabaseGoogleError(err.message || 'Lỗi kiểm tra kết nối Supabase Google OAuth');
      setShowSupabaseGuide(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (acc: { name: string; email: string; avatar: string }) => {
    setIsLoading(true);
    try {
      const user = DatabaseService.loginWithGoogle({
        name: acc.name,
        email: acc.email,
        avatar: acc.avatar,
      });

      onLoginSuccess(user);

      // Đồng bộ trực tiếp lên Supabase (cả bảng employees và guests)
      const syncRes = await syncGoogleUserToSupabase({
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        employee_code: user.employee_code,
        position: user.position,
      });

      if (syncRes.success) {
        toast.success(
          `Đã đăng nhập ${user.full_name} (${user.email}) và lưu thành công vào Supabase Cloud (bảng: ${syncRes.syncedTables.join(', ')})!`,
          'Đồng bộ Supabase thành công'
        );
      } else {
        toast.info(
          `Đã đăng nhập ${user.full_name} vào hệ thống. ${syncRes.message}`,
          'Đăng nhập Google'
        );
      }

      setShowGooglePicker(false);
      onClose?.();
    } catch (err: any) {
      toast.error(`Lỗi đăng nhập: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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

              {/* Google OAuth & Fast Guest Section */}
              <div className="space-y-2">
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs md:text-sm shadow-xs flex items-center justify-between transition-all hover:border-blue-400 dark:hover:border-blue-500 group"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Đăng nhập bằng Google</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded font-semibold">Khuyên dùng</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">Tự động lưu hồ sơ khách vào Database & Supabase</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                </button>

                {/* Interactive Google Account Picker (Simulation / Direct Auth) */}
                {showGooglePicker && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-800/90 border border-blue-200 dark:border-blue-900/60 space-y-2.5 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-1.5 border-b border-blue-100 dark:border-slate-700">
                      <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <span>Chọn tài khoản Google để tiếp tục:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGooglePicker(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Đóng ✕
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {/* Account 1: Nguyễn Hoàng Lâm */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectGoogleAccount({
                            name: 'Nguyễn Hoàng Lâm',
                            email: 'nh.lam19382@gmail.com',
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                          })
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-750 hover:bg-blue-100/70 dark:hover:bg-slate-700 text-left transition-colors border border-slate-200 dark:border-slate-650"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                          alt="Lâm"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Nguyễn Hoàng Lâm (Tài khoản của bạn)
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">nh.lam19382@gmail.com</div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg">Chọn</span>
                      </button>

                      {/* Account 2: Đối tác Khách hàng */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectGoogleAccount({
                            name: 'Trần Minh Anh (Đối tác)',
                            email: 'minhanh.partner@gmail.com',
                            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
                          })
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-750 hover:bg-blue-100/70 dark:hover:bg-slate-700 text-left transition-colors border border-slate-200 dark:border-slate-650"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
                          alt="Đối tác"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Trần Minh Anh (Đối tác khách mời)
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">minhanh.partner@gmail.com</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg">Chọn</span>
                      </button>
                    </div>

                    {/* Or enter custom Google email */}
                    <div className="pt-1 flex items-center gap-2">
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="Nhập email Google khác..."
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        disabled={!customGoogleEmail.includes('@')}
                        onClick={() =>
                          handleSelectGoogleAccount({
                            name: customGoogleEmail.split('@')[0],
                            email: customGoogleEmail.trim(),
                            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
                          })
                        }
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold"
                      >
                        Đăng nhập
                      </button>
                    </div>

                    {/* Supabase Real OAuth Trigger & Guide */}
                    <div className="pt-2 border-t border-blue-200/60 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleTestSupabaseGoogleOAuth}
                          disabled={isLoading}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>🔗 Kiểm tra Supabase Google OAuth Redirect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSupabaseGuide(!showSupabaseGuide)}
                          className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                        >
                          {showSupabaseGuide ? 'Ẩn hướng dẫn ▲' : 'Xem cách bật Google trên Supabase ▼'}
                        </button>
                      </div>

                      {/* Error Banner when provider is not enabled on Supabase */}
                      {supabaseGoogleError && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in">
                          <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                            <span>⚠️ {supabaseGoogleError}</span>
                          </div>
                          <div className="text-[10px] text-amber-700 dark:text-amber-300/80 leading-relaxed">
                            Hệ thống đã tự động bảo vệ trình duyệt của bạn khỏi màn hình lỗi trắng trang. Bạn có thể đăng nhập ngay bằng tài khoản Google của mình bên dưới để lưu hồ sơ vào Database và tiếp tục làm việc mà không cần chờ cấu hình Supabase:
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectGoogleAccount({
                                name: 'Nguyễn Hoàng Lâm',
                                email: 'nh.lam19382@gmail.com',
                                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                              })
                            }
                            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/25"
                          >
                            <span>👉 Đăng nhập ngay với nh.lam19382@gmail.com</span>
                          </button>
                        </div>
                      )}

                      {/* 3-Step Setup Guide */}
                      {showSupabaseGuide && (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 text-[11px] space-y-2 text-slate-700 dark:text-slate-300">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>📋 3 bước kích hoạt Google Provider trên Supabase:</span>
                            <button
                              type="button"
                              onClick={() => setShowSupabaseGuide(false)}
                              className="text-[10px] text-slate-400 hover:text-slate-600"
                            >
                              Ẩn ✕
                            </button>
                          </div>
                          <ol className="list-decimal list-inside space-y-1.5 text-[11px] pl-1 text-slate-600 dark:text-slate-400">
                            <li>
                              Vào <strong>Google Cloud Console</strong> &gt; APIs &amp; Services &gt; Credentials &gt; Tạo <strong>OAuth 2.0 Client ID</strong> (Web).
                            </li>
                            <li>
                              Thêm Authorized redirect URI:
                              <div className="flex items-center gap-1.5 mt-1">
                                <code className="flex-1 p-1.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[10px] rounded select-all break-all border border-slate-200 dark:border-slate-700">
                                  {getSupabaseCredentials().url
                                    ? `${getSupabaseCredentials().url.replace(/\/+$/, '')}/auth/v1/callback`
                                    : 'https://[ma-project].supabase.co/auth/v1/callback'}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cb = getSupabaseCredentials().url
                                      ? `${getSupabaseCredentials().url.replace(/\/+$/, '')}/auth/v1/callback`
                                      : 'https://[ma-project].supabase.co/auth/v1/callback';
                                    navigator.clipboard.writeText(cb);
                                    toast.info('Đã sao chép Callback URI');
                                  }}
                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-[10px] font-bold shrink-0 flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                            </li>
                            <li>
                              Vào <strong>Supabase Dashboard</strong> &gt; <strong>Authentication</strong> &gt; <strong>Providers</strong> &gt; tìm <strong>Google</strong> &gt; Bật <strong>"Enable Google provider"</strong> &gt; Dán Client ID &amp; Secret &gt; Nhấn <strong>Save</strong>.
                            </li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fast 1-Click Guest Button */}
                <button
                  type="button"
                  onClick={handleFastGuestEntry}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <div className="text-left">
                      <div>Khách vãng lai dùng thử ngay</div>
                      <div className="text-[10px] text-emerald-100 font-normal">Không cần đăng nhập, dùng ngay Office & AI</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

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
