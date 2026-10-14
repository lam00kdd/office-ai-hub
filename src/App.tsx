import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { ExcelUserFlowModal } from './components/ExcelUserFlowModal';
import { LoginModal } from './components/LoginModal';
import { PermissionMatrixModal } from './components/PermissionMatrixModal';
import { InternalAccessGuard } from './components/InternalAccessGuard';
import { ToastContainer } from './components/ToastContainer';
import { DatabaseService } from './services/storage';
import { toast } from './services/toast';
import { Employee, SystemStats } from './types';

// Lazy-loaded submodules to split chunks and speed up initial page load
const ExcelTools = lazy(() => import('./components/ExcelTools').then(m => ({ default: m.ExcelTools })));
const PdfTools = lazy(() => import('./components/PdfTools').then(m => ({ default: m.PdfTools })));
const WordTools = lazy(() => import('./components/WordTools').then(m => ({ default: m.WordTools })));
const PowerPointTools = lazy(() => import('./components/PowerPointTools').then(m => ({ default: m.PowerPointTools })));
const FileConverter = lazy(() => import('./components/FileConverter').then(m => ({ default: m.FileConverter })));
const AIChat = lazy(() => import('./components/AIChat').then(m => ({ default: m.AIChat })));
const AIOfficeTools = lazy(() => import('./components/AIOfficeTools').then(m => ({ default: m.AIOfficeTools })));
const ExamTaker = lazy(() => import('./components/ExamTaker').then(m => ({ default: m.ExamTaker })));
const ExamBuilder = lazy(() => import('./components/ExamBuilder').then(m => ({ default: m.ExamBuilder })));
const QuestionBank = lazy(() => import('./components/QuestionBank').then(m => ({ default: m.QuestionBank })));
const ExamList = lazy(() => import('./components/ExamList').then(m => ({ default: m.ExamList })));
const ResultsAndReports = lazy(() => import('./components/ResultsAndReports').then(m => ({ default: m.ResultsAndReports })));
const StaffManagement = lazy(() => import('./components/StaffManagement').then(m => ({ default: m.StaffManagement })));
const ActivityLogs = lazy(() => import('./components/ActivityLogs').then(m => ({ default: m.ActivityLogs })));
const ManufacturingHub = lazy(() => import('./components/ManufacturingHub').then(m => ({ default: m.ManufacturingHub })));
const IsoIatfDocManager = lazy(() => import('./components/IsoIatfDocManager').then(m => ({ default: m.IsoIatfDocManager })));
const MealAndAttendance = lazy(() => import('./components/MealAndAttendance').then(m => ({ default: m.MealAndAttendance })));
const WireHarnessTools = lazy(() => import('./components/WireHarnessTools').then(m => ({ default: m.WireHarnessTools })));

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<Employee>(DatabaseService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(DatabaseService.isAuthenticated());
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(DatabaseService.isSoundEnabled());
  const [stats, setStats] = useState<SystemStats>(DatabaseService.getStats());
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isExcelFlowModalOpen, setIsExcelFlowModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);

  // Sync state on custom event
  useEffect(() => {
    const handleStorageUpdate = () => {
      setStats(DatabaseService.getStats());
      setCurrentUser(DatabaseService.getCurrentUser());
      setIsAuthenticated(DatabaseService.isAuthenticated());
    };
    window.addEventListener('oai-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('oai-storage-update', handleStorageUpdate);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    DatabaseService.setSoundEnabled(next);
  };

  const getModuleName = (view: string): string => {
    switch (view) {
      case 'exam-take':
        return 'Làm bài kiểm tra & Khảo thí nội bộ';
      case 'exam-builder':
        return 'Tạo đề thi & Cấu hình điểm đạt';
      case 'question-bank':
        return 'Ngân hàng câu hỏi nội bộ';
      case 'exam-list':
        return 'Danh sách đề thi & Giao bài nội bộ';
      case 'results':
        return 'Báo cáo & Kết quả sát hạch cán bộ';
      case 'staff':
        return 'Quản trị Nhân sự & Phòng ban';
      case 'logs':
        return 'Nhật ký an ninh & Hoạt động hệ thống';
      case 'manufacturing':
        return 'Quản lý Sản xuất, Kho vận & Chất lượng (IQC/OQC)';
      case 'wire-harness':
        return 'Công cụ Kỹ thuật Bộ dây & Dập cos';
      case 'iso-docs':
        return 'Quy trình Tài liệu chuẩn ISO / IATF 16949';
      case 'meal-attendance':
        return 'Báo cơm nhà ăn & Chấm công OT';
      default:
        return 'Tính năng hệ thống';
    }
  };

  const renderContent = () => {
    // Phương án 1: Khách (Guest) bị chặn truy cập các tính năng nội bộ
    const internalViews = [
      'exam-take',
      'exam-builder',
      'question-bank',
      'exam-list',
      'results',
      'staff',
      'logs',
      'manufacturing',
      'iso-docs',
      'meal-attendance',
    ];

    if (currentUser.role === 'guest' && internalViews.includes(currentView)) {
      return (
        <InternalAccessGuard
          moduleName={getModuleName(currentView)}
          onOpenEmployeeLogin={() => setIsLoginModalOpen(true)}
          onNavigateToTools={() => setCurrentView('wire-harness')}
        />
      );
    }

    // Role checks for internal staff
    if (currentUser.role === 'employee' && (currentView === 'staff' || currentView === 'logs' || currentView === 'exam-builder' || currentView === 'question-bank')) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quyền hạn không đủ</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Phân hệ <strong>{getModuleName(currentView)}</strong> chỉ dành riêng cho cấp <strong>Quản lý (Manager)</strong> hoặc <strong>Tổng Quản trị (Admin)</strong>.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Quay về Trang chủ
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <HomeDashboard
            currentUser={currentUser}
            stats={stats}
            onNavigate={(view) => setCurrentView(view)}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
          />
        );
      case 'excel':
        return <ExcelTools />;
      case 'pdf':
        return <PdfTools />;
      case 'word':
        return <WordTools />;
      case 'powerpoint':
        return <PowerPointTools />;
      case 'converter':
        return <FileConverter />;
      case 'ai-chat':
        return <AIChat />;
      case 'ai-tools':
        return <AIOfficeTools />;
      case 'manufacturing':
        return <ManufacturingHub />;
      case 'wire-harness':
        return <WireHarnessTools />;
      case 'iso-docs':
        return <IsoIatfDocManager />;
      case 'meal-attendance':
        return <MealAndAttendance />;
      case 'exam-take':
        return <ExamTaker currentUser={currentUser} onFinish={() => setCurrentView('results')} />;
      case 'exam-builder':
        return <ExamBuilder onExamCreated={() => setCurrentView('exam-list')} />;
      case 'question-bank':
        return <QuestionBank />;
      case 'exam-list':
        return (
          <ExamList
            onNavigateToBuilder={() => setCurrentView('exam-builder')}
            onNavigateToTaker={() => setCurrentView('exam-take')}
          />
        );
      case 'results':
        return <ResultsAndReports />;
      case 'staff':
        return <StaffManagement />;
      case 'logs':
        return <ActivityLogs />;
      default:
        return (
          <HomeDashboard
            currentUser={currentUser}
            stats={stats}
            onNavigate={(view) => setCurrentView(view)}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Role-based Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        userRole={currentUser.role}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header with Search, Role Switcher, Sound & Notifications */}
        <Header
          currentUser={currentUser}
          onSearchSelect={(v) => setCurrentView(v)}
          onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onUserChanged={(u) => setCurrentUser(u)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenPermissionModal={() => setIsPermissionModalOpen(true)}
          onLogout={() => {
            DatabaseService.logout();
            setIsAuthenticated(false);
            setIsLoginModalOpen(true);
            toast.info('Bạn đã đăng xuất khỏi phiên làm việc an toàn.', 'Đăng xuất thành công');
          }}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
          {/* Quick Floating Architecture / Flow triggers */}
          <div className="flex items-center justify-between pb-4">
            <div className="text-xs text-slate-400 font-medium">
              Đang thao tác: <strong className="text-slate-700 dark:text-slate-200 capitalize">{currentView}</strong> • Quyền: <strong className="uppercase text-blue-600">{currentUser.role}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPermissionModalOpen(true)}
                className="text-xs px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 font-semibold hover:bg-indigo-100 transition-colors"
              >
                🛡️ Phân quyền RBAC
              </button>
              <button
                onClick={() => setIsExcelFlowModalOpen(true)}
                className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-semibold hover:bg-emerald-100 transition-colors"
              >
                📊 Sơ đồ luồng Excel
              </button>
              <button
                onClick={() => setIsSchemaModalOpen(true)}
                className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 font-semibold hover:bg-blue-100 transition-colors"
              >
                🗄️ Supabase ERD & Wireframe
              </button>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[380px] space-y-3">
                <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Đang tải phân hệ...</span>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>

      {/* Login & Auth Modal */}
      <LoginModal
        isOpen={isLoginModalOpen || !isAuthenticated}
        onClose={isAuthenticated ? () => setIsLoginModalOpen(false) : undefined}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsAuthenticated(true);
          setIsLoginModalOpen(false);
        }}
      />

      {/* Permission Matrix & RBAC Modal */}
      <PermissionMatrixModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
      />

      {/* Database Schema & Dashboard Wireframe Modal */}
      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      {/* Excel User Flow & Technical UX Modal */}
      <ExcelUserFlowModal
        isOpen={isExcelFlowModalOpen}
        onClose={() => setIsExcelFlowModalOpen(false)}
      />

      {/* Global floating toast notification host */}
      <ToastContainer />
    </div>
  );
}
