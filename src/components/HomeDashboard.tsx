import React from 'react';
import {
  FileSpreadsheet,
  FileCode2,
  FileText,
  Presentation,
  RefreshCw,
  Bot,
  BookOpenCheck,
  BarChart3,
  Users,
  CheckCircle2,
  Award,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Employee, SystemStats } from '../types';
import { DatabaseService } from '../services/storage';

interface DashboardProps {
  currentUser: Employee;
  stats: SystemStats;
  onNavigate: (view: string) => void;
}

export const HomeDashboard: React.FC<DashboardProps> = ({
  currentUser,
  stats,
  onNavigate,
}) => {
  const exams = DatabaseService.getExams().filter(e => e.status === 'published');
  const logs = DatabaseService.getLogs().slice(0, 5);

  const toolCards = [
    {
      id: 'excel',
      title: 'Xử lý Excel',
      desc: 'Xem trước, lọc dữ liệu, xóa trùng lặp, thống kê cột và xuất XLSX/CSV',
      icon: FileSpreadsheet,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      badge: 'Phổ biến',
    },
    {
      id: 'pdf',
      title: 'Công cụ PDF',
      desc: 'Gộp PDF, tách trang, xoay, xóa trang, chèn số trang và xuất PDF chuẩn',
      icon: FileCode2,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
      id: 'word',
      title: 'Soạn thảo Word',
      desc: 'Thư viện mẫu công văn, thông báo, biên bản họp chuẩn NĐ 30, xuất DOCX',
      icon: FileText,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      badge: 'Chuẩn NĐ 30',
    },
    {
      id: 'powerpoint',
      title: 'Tạo PowerPoint',
      desc: 'Thiết kế slide thuyết trình tự động, dàn ý AI và xuất định dạng PPTX',
      icon: Presentation,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      id: 'converter',
      title: 'Chuyển đổi file',
      desc: 'Chuyển đổi linh hoạt giữa Excel, CSV, ảnh JPG/PNG và tài liệu văn bản',
      icon: RefreshCw,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
      id: 'ai-chat',
      title: 'Trợ lý AI',
      desc: 'Chat thông minh với Gemini 3.8, gợi ý công thức Excel, soạn thảo văn bản',
      icon: Bot,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      badge: 'Gemini 3.8',
    },
    {
      id: 'exam-take',
      title: 'Kiểm tra nhân viên',
      desc: 'Hệ thống thi trắc nghiệm trực tuyến có đồng hồ bấm giờ và chấm điểm tự động',
      icon: BookOpenCheck,
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
      badge: 'Đang mở',
    },
    {
      id: 'results',
      title: 'Quản lý kết quả',
      desc: 'Theo dõi điểm số từng nhân viên, biểu đồ tỷ lệ đạt và xuất bảng điểm Excel',
      icon: BarChart3,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 md:p-8 shadow-lg shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm mb-3">
            ✨ Phiên bản Office AI Hub 2026
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Chào mừng đến với Office AI Hub!
          </h1>
          <p className="mt-2 text-sm md:text-base text-blue-100 font-normal leading-relaxed">
            Mọi công cụ văn phòng và đào tạo trong một nền tảng: Xử lý tệp tin, trợ lý AI đa năng và hệ thống khảo thí
            đánh giá năng lực nhân sự toàn diện.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('exam-take')}
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>Vào thi ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('excel')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-semibold backdrop-blur-sm transition-all"
            >
              Mở công cụ Excel
            </button>
          </div>
        </div>
        {/* Subtle decorative background shapes */}
        <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 8 Big Tool Cards (matching UI mockup screen 2) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Công cụ chính</h2>
          <span className="text-xs text-slate-500">Bấm vào thẻ để mở công cụ làm việc</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${tool.lightColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Sử dụng ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tổng nhân viên</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalEmployees}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Bài kiểm tra đang mở</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.openExamsCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tỷ lệ hoàn thành</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.completionRate}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Điểm trung bình</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.averageScore} / 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Bottom Columns: Recent Exams & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-blue-600" />
              <span>Bài kiểm tra gần đây</span>
            </h3>
            <button
              onClick={() => onNavigate('exam-take')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-900 bg-slate-50/50 dark:bg-slate-750 flex items-center justify-between transition-all"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {exam.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {exam.duration_minutes} phút
                    </span>
                    <span>• {exam.total_questions} câu hỏi</span>
                    <span>• Điểm đạt: {exam.passing_score_percent}%</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('exam-take')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors"
                >
                  Làm bài
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity & System Notifications */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-600" />
              <span>Hoạt động & Thông báo</span>
            </h3>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Xem nhật ký
            </button>
          </div>
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700/60 text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.employee_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-blue-600 dark:text-blue-400 font-medium">[{log.action}]</strong> {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
