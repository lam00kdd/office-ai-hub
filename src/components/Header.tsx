import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Bell,
  Database,
  Shield,
  ShieldCheck,
  ChevronDown,
  Check,
  UserCheck,
  Wifi,
  WifiOff,
  LogOut,
  LogIn,
  Key,
  Building2,
  Camera
} from 'lucide-react';
import { Employee, UserRole } from '../types';
import { DatabaseService } from '../services/storage';
import { getSupabaseCredentials, testSupabaseConnection } from '../services/supabaseClient';

interface HeaderProps {
  currentUser: Employee;
  onSearchSelect?: (view: string) => void;
  onOpenSchemaModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUserChanged: (user: Employee) => void;
  onOpenLoginModal?: () => void;
  onOpenPermissionModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSearchSelect,
  onOpenSchemaModal,
  soundEnabled,
  onToggleSound,
  onUserChanged,
  onOpenLoginModal,
  onOpenPermissionModal,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'local' | 'testing'>('local');
  const [supabaseLatency, setSupabaseLatency] = useState<number | null>(null);

  const checkSupabase = async () => {
    const creds = getSupabaseCredentials();
    if (!creds.url || !creds.key) {
      setSupabaseStatus('local');
      setSupabaseLatency(null);
      return;
    }
    setSupabaseStatus('testing');
    try {
      const res = await testSupabaseConnection();
      if (res.connected) {
        setSupabaseStatus('connected');
        setSupabaseLatency(res.latencyMs || 25);
      } else {
        setSupabaseStatus('local');
      }
    } catch {
      setSupabaseStatus('local');
    }
  };

  useEffect(() => {
    checkSupabase();
    window.addEventListener('oai-supabase-status-change', checkSupabase);
    return () => window.removeEventListener('oai-supabase-status-change', checkSupabase);
  }, []);

  const employees = DatabaseService.getEmployees();

  const handleSelectRole = (emp: Employee) => {
    DatabaseService.setCurrentUser(emp);
    onUserChanged(emp);
    setShowRoleMenu(false);
  };

  const searchableTools = [
    { name: 'Xử lý Excel', view: 'excel', desc: 'Lọc, xóa trùng, thống kê, gộp sheet' },
    { name: 'Công cụ PDF', view: 'pdf', desc: 'Gộp, tách, xóa trang, xoay, trích xuất text' },
    { name: 'Soạn thảo Word', view: 'word', desc: 'Công văn, thông báo, biên bản họp theo NĐ 30' },
    { name: 'Tạo PowerPoint', view: 'powerpoint', desc: 'Tạo slide AI, xuất bài thuyết trình' },
    { name: 'Chuyển đổi file', view: 'converter', desc: 'Chuyển XLSX sang CSV, ảnh sang PDF' },
    { name: 'Chat với AI Gemini', view: 'ai-chat', desc: 'Hỏi đáp nghiệp vụ, tóm tắt tài liệu' },
    { name: 'Làm bài kiểm tra online', view: 'exam-take', desc: 'Tham gia thi trắc nghiệm bấm giờ' },
    { name: 'Ngân hàng câu hỏi', view: 'question-bank', desc: 'Quản lý câu hỏi, import Excel' },
    { name: 'Quản lý nhân sự', view: 'staff', desc: 'Hồ sơ nhân viên, mã NV, phòng ban' },
  ];

  const filteredTools = searchQuery.trim()
    ? searchableTools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Bar */}
      <div className="relative w-80 md:w-96">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công cụ, tài liệu, bài kiểm tra..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kết quả gợi ý ({filteredTools.length})
            </div>
            {filteredTools.length > 0 ? (
              filteredTools.map((t) => (
                <button
                  key={t.view}
                  onClick={() => {
                    onSearchSelect?.(t.view);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors flex flex-col"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">{t.desc}</span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Không tìm thấy công cụ phù hợp với từ khóa
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Action Icons & User Switcher */}
      <div className="flex items-center gap-3">
        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800'
              : 'border-slate-200 bg-slate-50 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
          }`}
          title={soundEnabled ? 'Âm thanh thông báo: ĐANG BẬT' : 'Âm thanh thông báo: ĐANG TẮT'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Supabase Connection Status Pill & Modal Trigger */}
        <button
          onClick={onOpenSchemaModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
            supabaseStatus === 'connected'
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              : supabaseStatus === 'testing'
              ? 'border-blue-300 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
              : 'border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
          }`}
          title={
            supabaseStatus === 'connected'
              ? `Đã kết nối Supabase Cloud (${supabaseLatency}ms). Bấm để xem ERD hoặc đồng bộ.`
              : 'Đang dùng CSDL Cục bộ (LocalStorage). Bấm để cấu hình kết nối Supabase Cloud.'
          }
        >
          {supabaseStatus === 'connected' ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : supabaseStatus === 'testing' ? (
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          )}

          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bold">
            {supabaseStatus === 'connected'
              ? 'Supabase: Đã kết nối'
              : supabaseStatus === 'testing'
              ? 'Supabase: Đang test...'
              : 'Supabase: Cục bộ'}
          </span>
          {supabaseLatency !== null && supabaseStatus === 'connected' && (
            <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-800/80 px-1.5 py-0.2 rounded font-mono font-bold">
              {supabaseLatency}ms
            </span>
          )}
          {supabaseStatus === 'local' && (
            <span className="text-[10px] bg-amber-200/80 dark:bg-amber-800/80 px-1.5 py-0.2 rounded font-bold hidden md:inline">
              Cấu hình
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 relative transition-colors"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Thông báo hệ thống</span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Đánh dấu đã đọc</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">Đợt kiểm tra kỹ năng Quý I</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Hạn chót làm bài kiểm tra Excel cơ bản: 25/03/2026.
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Trợ lý AI sẵn sàng</div>
                  <div className="text-slate-500 mt-0.5">
                    Đã tích hợp Gemini 3.8 Flash hỗ trợ viết email và tạo đề thi.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-600/30"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                <span className={`font-semibold uppercase tracking-wider ${
                  currentUser.role === 'guest'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : currentUser.role === 'admin'
                    ? 'text-rose-600 dark:text-rose-400'
                    : currentUser.role === 'manager'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {currentUser.role === 'guest' ? 'Khách (Công cụ)' : currentUser.role}
                </span>
                <span>• {currentUser.employee_code}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role switcher & User Account Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-84 max-w-[92vw] max-h-[85vh] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 flex flex-col overflow-hidden">
              {/* TOP FIXED SECTION: User Summary, Avatar Change & Prominent Logout */}
              <div className="p-3.5 pb-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/90 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Avatar with Camera badge */}
                  <div className="relative group shrink-0">
                    <img
                      src={currentUser.avatar_url || '/admin-avatar.svg'}
                      alt={currentUser.full_name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
                    />
                    <label
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110 active:scale-95"
                      title="Bấm để đổi ảnh đại diện"
                    >
                      <Camera className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const dataUrl = evt.target?.result as string;
                            if (dataUrl) {
                              DatabaseService.updateUserAvatar(dataUrl);
                              onUserChanged(DatabaseService.getCurrentUser());
                              setShowRoleMenu(false);
                              DatabaseService.playSuccessSound();
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        currentUser.role === 'guest'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : currentUser.role === 'admin'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : currentUser.role === 'manager'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {currentUser.role === 'guest'
                          ? currentUser.auth_provider === 'google'
                            ? 'Khách Google'
                            : 'Khách (Công cụ)'
                          : currentUser.role}
                      </span>
                      {currentUser.auth_provider === 'google' && (
                        <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-semibold px-1.5 py-0.2 rounded flex items-center gap-1 border border-red-200 dark:border-red-900/40">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          Google
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentUser.employee_code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Actions Bar: Đổi ảnh đại diện & Đổi tài khoản */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-650 text-[11px] font-semibold rounded-xl cursor-pointer transition-colors shadow-2xs">
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    <span>Đổi ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const dataUrl = evt.target?.result as string;
                          if (dataUrl) {
                            DatabaseService.updateUserAvatar(dataUrl);
                            onUserChanged(DatabaseService.getCurrentUser());
                            setShowRoleMenu(false);
                            DatabaseService.playSuccessSound();
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenLoginModal?.();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-650 text-[11px] font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Đổi tài khoản đăng nhập"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Đổi tài khoản</span>
                  </button>
                </div>

                {/* Prominent Full-Width Logout Button */}
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-rose-600/25 cursor-pointer"
                    title="Đăng xuất khỏi phiên làm việc ngay"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Đăng xuất khỏi hệ thống</span>
                  </button>
                </div>
              </div>

              {/* MIDDLE SCROLLABLE SECTION: RBAC & Switch Role List */}
              <div className="overflow-y-auto max-h-[46vh] p-3.5 space-y-2.5 scrollbar-thin">
                {/* RBAC Matrix Trigger Button */}
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    onOpenPermissionModal?.();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors border border-blue-200/60 dark:border-blue-900/40"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Ma trận Phân quyền (RBAC)</span>
                  </div>
                  <span className="text-[10px] text-blue-500 font-bold uppercase">4 Cấp</span>
                </button>

                {/* Quick switch list header */}
                <div className="pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
                    <span>Chuyển nhanh vai trò:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Cuộn để xem thêm</span>
                  </div>
                  <div className="space-y-1">
                    {/* Guest quick option */}
                    <button
                      onClick={() => {
                        DatabaseService.switchRole('guest');
                        onUserChanged(DatabaseService.getCurrentUser());
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        currentUser.role === 'guest'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                        🌐
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">Khách vãng lai (Guest)</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Supabase Auth • <strong className="uppercase text-emerald-600">CHỈ CÔNG CỤ</strong>
                        </div>
                      </div>
                      {currentUser.role === 'guest' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>

                    {/* Employee roles */}
                    {employees.map((emp) => {
                      const isCurrent = emp.id === currentUser.id && currentUser.role !== 'guest';
                      return (
                        <button
                          key={emp.id}
                          onClick={() => handleSelectRole(emp)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <img
                            src={emp.avatar_url || '/admin-avatar.svg'}
                            alt={emp.full_name}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">{emp.full_name}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {emp.position} • <strong className="uppercase">{emp.role}</strong>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
