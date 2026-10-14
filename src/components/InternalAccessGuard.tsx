import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  FileSpreadsheet,
  FileCode2,
  FileText,
  Presentation,
  Bot,
  Sparkles,
  LogIn,
  KeyRound
} from 'lucide-react';

interface InternalAccessGuardProps {
  moduleName: string;
  onOpenEmployeeLogin: () => void;
  onNavigateToTools: () => void;
}

export const InternalAccessGuard: React.FC<InternalAccessGuardProps> = ({
  moduleName,
  onOpenEmployeeLogin,
  onNavigateToTools,
}) => {
  return (
    <div className="max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header status */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            Khu vực Dữ liệu Nội bộ Công ty
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Yêu cầu Quyền Cán bộ Nhân viên
          </h2>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <p>
          Bạn đang truy cập phân hệ: <strong className="text-blue-600 dark:text-blue-400 font-bold">{moduleName}</strong>.
        </p>
        <p>
          Hiện tại bạn đang ở chế độ <strong>Khách vãng lai (Guest / Supabase Auth)</strong>. Chế độ này được thiết kế để sử dụng tự do các công cụ văn phòng và Trợ lý AI công khai, nhưng <strong>không được phép xem hoặc chỉnh sửa dữ liệu thi cử, nhân sự và báo cáo nội bộ doanh nghiệp</strong>.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onOpenEmployeeLogin}
          className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>Đăng nhập bằng Mã Nhân Viên & Mật khẩu</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={onNavigateToTools}
          className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
        >
          Quay lại Bộ công cụ Văn phòng
        </button>
      </div>

      {/* Available Tools for Guest */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Các công cụ Khách được phép sử dụng không giới hạn:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xử lý Excel & JSON</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileCode2 className="w-4 h-4 text-rose-600" />
            <span>Công cụ PDF toàn diện</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Soạn thảo Word (NĐ 30)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Presentation className="w-4 h-4 text-amber-600" />
            <span>Tạo Slide PowerPoint</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Bot className="w-4 h-4 text-purple-600" />
            <span>Chat Trợ lý AI Gemini</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>12 Tiện ích AI văn phòng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
