import React from 'react';
import {
  Shield,
  Check,
  X,
  Users,
  Building2,
  FileSpreadsheet,
  FileCode2,
  BookOpenCheck,
  HelpCircle,
  BarChart3,
  Database,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionMatrixModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const permissions = [
    {
      module: 'Bảng điều khiển chung (Dashboard)',
      desc: 'Xem số liệu thống kê, bài thi sắp tới, thông báo toàn công ty',
      admin: true,
      manager: true,
      employee: true,
      guest: true, // Chỉ xem tổng quan công cụ
    },
    {
      module: 'Bộ công cụ Văn phòng (Excel, Word, PDF, PPT, Convert)',
      desc: 'Xử lý file tài liệu, chuyển đổi file, dùng mẫu công văn chuẩn NĐ 30',
      admin: true,
      manager: true,
      employee: true,
      guest: true, // Khách toàn quyền sử dụng công cụ
    },
    {
      module: 'Trợ lý AI Gemini 3.8 Flash',
      desc: 'Chat nghiệp vụ, viết email, tóm tắt tài liệu, phân tích số liệu',
      admin: true,
      manager: true,
      employee: true,
      guest: true, // Khách toàn quyền sử dụng AI
    },
    {
      module: 'Tham gia thi khảo thí (Exam Taker)',
      desc: 'Vào phòng thi, làm bài trắc nghiệm có đồng hồ bấm giờ',
      admin: true,
      manager: true,
      employee: true,
      guest: false, // Khách bị khóa
    },
    {
      module: 'Ngân hàng câu hỏi (Question Bank)',
      desc: 'Tạo, sửa, xóa câu hỏi, import Excel, tạo câu hỏi AI',
      admin: true,
      manager: true,
      employee: false,
      guest: false, // Khách bị khóa
    },
    {
      module: 'Tạo & Thiết lập Đề thi (Exam Builder)',
      desc: 'Tạo đề kiểm tra mới, chọn câu hỏi từ ngân hàng, cấu hình điểm đạt',
      admin: true,
      manager: true,
      employee: false,
      guest: false, // Khách bị khóa
    },
    {
      module: 'Giao bài kiểm tra (Exam Assignment)',
      desc: 'Chỉ định nhân viên hoặc toàn phòng ban bắt buộc làm bài',
      admin: true,
      manager: true,
      employee: false,
      guest: false, // Khách bị khóa
    },
    {
      module: 'Xem kết quả toàn công ty & Xuất Excel',
      desc: 'Theo dõi điểm số nhân sự, tỷ lệ đạt, xuất bảng điểm báo cáo',
      admin: true,
      manager: true, // manager chỉ xem phòng mình
      employee: false, // nhân viên chỉ xem bài của mình
      guest: false, // Khách bị khóa
    },
    {
      module: 'Quản lý Nhân sự & Phòng ban',
      desc: 'Thêm, sửa nhân viên, phân chức vụ, cấu hình phòng ban',
      admin: true,
      manager: false,
      employee: false,
      guest: false, // Khách bị khóa
    },
    {
      module: 'Cấu hình Supabase Cloud, ERD & Nhật ký hệ thống',
      desc: 'Đồng bộ cơ sở dữ liệu, quản lý cấu trúc bảng, xem lịch sử bảo mật',
      admin: true,
      manager: false,
      employee: false,
      guest: false, // Khách bị khóa
    },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Ma trận Phân quyền & Đề xuất Nâng cấp User (RBAC)
              </h2>
              <p className="text-xs text-slate-500">
                Mô hình phân quyền đa cấp chuẩn doanh nghiệp (Role-Based Access Control)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-200 space-y-2">
            <div className="font-bold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
              Kiến trúc Cổng Xác thực Kép & Phân quyền bảo mật (Hybrid Dual-Auth):
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
              <li>
                <strong>Phương án 1 (Supabase Auth chuẩn cho Khách):</strong> Người dùng ngoài doanh nghiệp hoặc khách đối tác đăng nhập Email qua Supabase Auth để sử dụng tự do toàn bộ công cụ Office và Trợ lý AI. Tuyệt đối không thể truy cập đề thi hoặc dữ liệu nội bộ.
              </li>
              <li>
                <strong>Phương án 2 (Mã NV + Mật khẩu nội bộ):</strong> Dành riêng cho Cán bộ Nhân viên công ty. Xác thực nghiêm ngặt theo Mã NV và Mật khẩu nội bộ, phân quyền theo 3 cấp độ: <strong>Admin</strong> (Nguyễn Hoàng Lâm), <strong>Trưởng phòng (Manager)</strong> và <strong>Nhân viên (Employee)</strong>.
              </li>
              <li>
                <strong>Cổng chặn an ninh (Internal Access Guard):</strong> Tự động chặn và khóa giao diện nếu tài khoản Khách cố tình mở các phân hệ thi cử hoặc quản trị.
              </li>
            </ul>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-bold">Chức năng / Phân hệ</th>
                  <th className="py-3 px-2 font-bold text-center w-24 text-emerald-600 dark:text-emerald-400">
                    🌐 KHÁCH (Supabase)
                  </th>
                  <th className="py-3 px-2 font-bold text-center w-24 text-blue-600 dark:text-blue-400">
                    💼 NHÂN VIÊN
                  </th>
                  <th className="py-3 px-2 font-bold text-center w-24 text-purple-600 dark:text-purple-400">
                    👔 TRƯỞNG PHÒNG
                  </th>
                  <th className="py-3 px-2 font-bold text-center w-24 text-rose-600 dark:text-rose-400">
                    👑 ADMIN (LAMNH)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissions.map((p, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.module}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {p.guest ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mx-auto" title="Cho phép">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto" title="Khóa bảo mật">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {p.employee ? (
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 flex items-center justify-center mx-auto" title="Cho phép">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto" title="Không có quyền">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {p.manager ? (
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 flex items-center justify-center mx-auto" title="Cho phép">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto" title="Không có quyền">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {p.admin ? (
                        <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto" title="Toàn quyền">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hệ thống tự động ẩn các mục quản trị trên thanh Sidebar đối với nhân viên không có quyền.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
