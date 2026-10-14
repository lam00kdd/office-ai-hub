import React, { useState, useEffect } from 'react';
import { Search, Volume2, VolumeX, Bell, Database, Shield, ChevronDown, Check, UserCheck, Wifi, WifiOff } from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSearchSelect,
  onOpenSchemaModal,
  soundEnabled,
  onToggleSound,
  onUserChanged,
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
                <span className="font-semibold text-blue-600 uppercase tracking-wider">{currentUser.role}</span>
                <span>• {currentUser.employee_code}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role switcher menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Chuyển đổi tài khoản trải nghiệm</div>
                <div className="text-[11px] text-slate-500">Thử nghiệm giao diện theo các phân quyền thực tế:</div>
              </div>

              <div className="space-y-1">
                {employees.slice(0, 3).map((emp) => {
                  const isCurrent = emp.id === currentUser.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectRole(emp)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <img src={emp.avatar_url || '/admin-avatar.svg'} alt={emp.full_name} className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{emp.full_name}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {emp.position} • <strong className="uppercase">{emp.role}</strong>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                  <span>📸 Thay đổi ảnh đại diện</span>
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
