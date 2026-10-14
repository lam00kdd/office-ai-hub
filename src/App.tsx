import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { ExcelTools } from './components/ExcelTools';
import { PdfTools } from './components/PdfTools';
import { WordTools } from './components/WordTools';
import { PowerPointTools } from './components/PowerPointTools';
import { FileConverter } from './components/FileConverter';
import { AIChat } from './components/AIChat';
import { AIOfficeTools } from './components/AIOfficeTools';
import { ExamTaker } from './components/ExamTaker';
import { ExamBuilder } from './components/ExamBuilder';
import { QuestionBank } from './components/QuestionBank';
import { ExamList } from './components/ExamList';
import { ResultsAndReports } from './components/ResultsAndReports';
import { StaffManagement } from './components/StaffManagement';
import { ActivityLogs } from './components/ActivityLogs';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { ExcelUserFlowModal } from './components/ExcelUserFlowModal';
import { DatabaseService } from './services/storage';
import { Employee, SystemStats } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<Employee>(DatabaseService.getCurrentUser());
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(DatabaseService.isSoundEnabled());
  const [stats, setStats] = useState<SystemStats>(DatabaseService.getStats());
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isExcelFlowModalOpen, setIsExcelFlowModalOpen] = useState<boolean>(false);

  // Sync state on custom event
  useEffect(() => {
    const handleStorageUpdate = () => {
      setStats(DatabaseService.getStats());
      setCurrentUser(DatabaseService.getCurrentUser());
    };
    window.addEventListener('oai-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('oai-storage-update', handleStorageUpdate);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    DatabaseService.setSoundEnabled(next);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <HomeDashboard
            currentUser={currentUser}
            stats={stats}
            onNavigate={(view) => setCurrentView(view)}
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

          {renderContent()}
        </main>
      </div>

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
    </div>
  );
}
