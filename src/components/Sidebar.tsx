import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Presentation,
  FileCode2,
  RefreshCw,
  Bot,
  Sparkles,
  GraduationCap,
  PlusCircle,
  HelpCircle,
  Users,
  BarChart3,
  History,
  Database,
  ChevronLeft,
  ChevronRight,
  Send,
  BookOpenCheck,
  Lock,
  Factory,
  Zap,
  FileCheck,
  Utensils,
  Boxes
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSchemaModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  userRole,
  isCollapsed,
  onToggleCollapse,
  onOpenSchemaModal,
}) => {
  const isGuest = userRole === 'guest';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager' || isAdmin;

  const NavItem = ({
    view,
    icon: Icon,
    label,
    badge,
  }: {
    view: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
  }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onSelectView(view)}
        title={isCollapsed ? label : undefined}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
        {!isCollapsed && <span className="truncate text-left flex-1">{label}</span>}
        {!isCollapsed && badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => {
    if (isCollapsed) return <div className="my-2 border-t border-slate-200 dark:border-slate-800" />;
    return (
      <div className="px-3.5 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </div>
    );
  };

  return (
    <aside
      className={`h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <span className="font-extrabold text-lg">AI</span>
            </div>
            <div>
              <div className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Office AI Hub
              </div>
              <div className="text-[10px] text-blue-600 font-semibold tracking-wide uppercase mt-1">
                Văn phòng & Khảo thí
              </div>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold mx-auto shadow-md">
            AI
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        <SectionHeader label="Trang chủ" />
        <NavItem view="dashboard" icon={LayoutDashboard} label="Trang chủ / Tổng quan" />

        <SectionHeader label="Công cụ văn phòng" />
        <NavItem view="excel" icon={FileSpreadsheet} label="Xử lý Excel" />
        <NavItem view="pdf" icon={FileCode2} label="Công cụ PDF" />
        <NavItem view="word" icon={FileText} label="Soạn thảo Word" />
        <NavItem view="powerpoint" icon={Presentation} label="Tạo PowerPoint" />
        <NavItem view="converter" icon={RefreshCw} label="Chuyển đổi file" />

        <SectionHeader label="Trợ lý AI" />
        <NavItem view="ai-chat" icon={Bot} label="Chat với AI (Gemini)" badge="AI" />
        <NavItem view="ai-tools" icon={Sparkles} label="12 Công cụ AI văn phòng" />

        <SectionHeader label="Sản xuất & Dây dẫn điện" />
        <NavItem view="manufacturing" icon={Factory} label="Sản xuất, Kho & QA/QC" badge="IATF" />
        <NavItem view="wire-harness" icon={Zap} label="Kỹ thuật Dây & Dập Cos" />
        <NavItem view="iso-docs" icon={FileCheck} label="Quy trình ISO / IATF" badge="QMS" />
        <NavItem view="meal-attendance" icon={Utensils} label="Báo cơm & Chấm công OT" />

        <SectionHeader label={isGuest ? "Đào tạo [Nội bộ công ty 🔒]" : "Đào tạo & Kiểm tra"} />
        {isGuest ? (
          <>
            <NavItem view="exam-take" icon={Lock} label="Làm bài thi (Nội bộ)" badge="Khóa 🔒" />
            <NavItem view="results" icon={Lock} label="Kết quả thi (Nội bộ)" badge="Khóa 🔒" />
          </>
        ) : (
          <>
            <NavItem view="exam-take" icon={BookOpenCheck} label="Làm bài kiểm tra" badge="Thi" />
            {isManager && (
              <>
                <NavItem view="exam-builder" icon={PlusCircle} label="Tạo bài kiểm tra" />
                <NavItem view="question-bank" icon={HelpCircle} label="Ngân hàng câu hỏi" />
                <NavItem view="exam-list" icon={Send} label="Danh sách & Giao bài" />
              </>
            )}
            <NavItem view="results" icon={BarChart3} label="Kết quả & Báo cáo" />
          </>
        )}

        {isAdmin && (
          <>
            <SectionHeader label="Quản trị hệ thống" />
            <NavItem view="staff" icon={Users} label="Nhân sự & Phòng ban" />
            <NavItem view="logs" icon={History} label="Nhật ký hoạt động" />
          </>
        )}
      </div>

      {/* Supabase Schema / Architecture Quick Trigger */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onOpenSchemaModal}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 transition-colors ${
            isCollapsed ? 'justify-center px-1' : ''
          }`}
          title="Xem sơ đồ thực thể Supabase & Wireframe"
        >
          <Database className="w-4 h-4 text-emerald-500 shrink-0" />
          {!isCollapsed && <span>Kiến trúc Supabase DB</span>}
        </button>
      </div>
    </aside>
  );
};
