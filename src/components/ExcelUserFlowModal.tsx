import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  Layers,
  Filter,
  ArrowUpDown,
  Trash2,
  Calculator,
  BarChart2,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Split,
  Eye,
  FileCode2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelUserFlowModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Tải tệp lên (Upload File)',
      icon: Upload,
      color: 'bg-blue-600',
      action: 'Người dùng kéo thả hoặc bấm tải tệp định dạng .XLSX, .CSV hoặc .XLS vào Dropzone.',
      validation: 'Kiểm tra phần mở rộng tệp, giới hạn dung lượng (≤ 50MB) và cấu trúc bảng tính hợp lệ qua SheetJS.',
      warning: 'Cảnh báo mất mát công thức (Macro/VBA, PivotTable, định dạng có điều kiện phức tạp không được lưu trữ khi xuất CSV hoặc sửa trực tiếp).',
    },
    {
      step: 2,
      title: 'Xem trước & Chọn Sheet (Preview & Sheet Switcher)',
      icon: Layers,
      color: 'bg-emerald-600',
      action: 'Hệ thống tự động đọc tất cả các Sheets và hiển thị thanh tab Sheet1, Sheet2... Bảng xem trước dữ liệu hiển thị tức thì.',
      validation: 'Tự động nhận diện dòng tiêu đề (Header row) và định dạng dữ liệu từng cột (số, chuỗi, ngày tháng).',
      warning: 'Nếu sheet không có dữ liệu, hiển thị thông báo "Sheet rỗng, vui lòng chọn sheet khác".',
    },
    {
      step: 3,
      title: 'Tìm kiếm & Lọc dữ liệu (Search & Column Filter)',
      icon: Filter,
      color: 'bg-indigo-600',
      action: 'Nhập từ khóa vào ô tìm kiếm nhanh; chọn lọc theo cột để chỉ giữ lại các dòng khớp tiêu chí nghiệp vụ.',
      validation: 'Cập nhật trực tiếp số dòng hiển thị (ví dụ: Hiển thị 8/10 dòng) trên giao diện.',
      warning: 'Không làm thay đổi tập dữ liệu gốc trong bộ nhớ, cho phép xóa từ khóa để hoàn nguyên.',
    },
    {
      step: 4,
      title: 'Sắp xếp dữ liệu (Sort Ascending / Descending)',
      icon: ArrowUpDown,
      color: 'bg-purple-600',
      action: 'Chọn cột cần sắp xếp và bấm nút Sắp xếp (A→Z hoặc Z→A). Hệ thống phân loại thông minh giữa kiểu chuỗi và kiểu số.',
      validation: 'Giữ nguyên dòng tiêu đề trên cùng, chỉ xáo trộn các dòng dữ liệu con.',
      warning: 'Cột chứa giá trị rỗng/ô trống sẽ tự động được dồn xuống cuối bảng.',
    },
    {
      step: 5,
      title: 'Loại bỏ dòng trùng lặp (Remove Duplicates)',
      icon: Trash2,
      color: 'bg-rose-600',
      action: 'Bấm nút "Xóa dòng trùng". Hệ thống quét toàn bộ các trường bản ghi và chỉ giữ lại 1 bản ghi duy nhất.',
      validation: 'Hiển thị toast thông báo chính xác số lượng dòng đã được loại bỏ (ví dụ: "Đã xóa 2 dòng trùng lặp thành công").',
      warning: 'Có nút "Hoàn tác / Khôi phục bản gốc" nếu người dùng xóa nhầm.',
    },
    {
      step: 6,
      title: 'Phát hiện ô trống & Thống kê cột (Stats: Sum, Avg, Min, Max)',
      icon: Calculator,
      color: 'bg-amber-600',
      action: 'Chọn cột số liệu (như Lương, Doanh thu, Điểm) → Bấm "Thống kê cột".',
      validation: 'Hệ thống tự động tính: Tổng (SUM), Trung bình (AVERAGE), Giá trị nhỏ nhất (MIN), Lớn nhất (MAX), Số lượng ô trống (Blank Cells).',
      warning: 'Nếu cột được chọn hoàn toàn là văn bản không thể ép kiểu số, thông báo "Cột không chứa số liệu để tính toán".',
    },
    {
      step: 7,
      title: 'Tạo biểu đồ trực quan (Data Visualization)',
      icon: BarChart2,
      color: 'bg-teal-600',
      action: 'Bấm nút "Xem biểu đồ". Hệ thống tạo thanh phân bổ tỷ lệ phần trăm theo giá trị lớn nhất của cột được chọn.',
      validation: 'Trực quan hóa tức thời mức độ biến thiên dữ liệu giữa các nhân sự hoặc đối tượng.',
      warning: 'Hỗ trợ ẩn/hiện biểu đồ để tối ưu không gian hiển thị bảng dữ liệu.',
    },
    {
      step: 8,
      title: 'Gộp nhiều file & Tách file theo điều kiện (Merge / Split)',
      icon: Split,
      color: 'bg-cyan-600',
      action: 'Hỗ trợ nạp thêm file Excel thứ 2 có cấu trúc tương thích để nối tiếp dữ liệu hoặc tách file theo phòng ban.',
      validation: 'Kiểm tra tính tương thích số cột và tên trường trước khi gộp.',
      warning: 'Cảnh báo khi tên cột giữa các file không đồng nhất.',
    },
    {
      step: 9,
      title: 'Xuất file đã xử lý (Download XLSX / CSV)',
      icon: Download,
      color: 'bg-emerald-700',
      action: 'Bấm nút "Tải xuống Excel" hoặc "CSV". File được xuất với tên tệp tiền tố "Da_xu_ly_...".',
      validation: 'Tự động phát âm thanh thông báo thành công và ghi log hoạt động vào hệ thống.',
      warning: 'Khi xuất CSV, cảnh báo người dùng về việc dấu phẩy ngăn cách và nhiều sheet sẽ chỉ lưu sheet hiện hành.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Sơ đồ luồng người dùng chi tiết: Module Excel Tools
              </h2>
              <p className="text-xs text-slate-500">
                Toàn bộ các bước tương tác, xử lý tính toán, xử lý ngoại lệ và cảnh báo mất mát định dạng
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 text-xs">
              <div className="font-bold text-blue-700 mb-0.5">1. Định dạng hỗ trợ</div>
              <div className="text-slate-600 dark:text-slate-400">.XLSX, .XLS, .CSV (Mã hóa UTF-8 tiếng Việt chuẩn)</div>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 text-xs">
              <div className="font-bold text-rose-700 mb-0.5">2. Cảnh báo bảo toàn</div>
              <div className="text-slate-600 dark:text-slate-400">Không ghi đè tệp gốc; cảnh báo mất Macro/VBA khi chuyển định dạng.</div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-xs">
              <div className="font-bold text-emerald-700 mb-0.5">3. Trải nghiệm tức thời</div>
              <div className="text-slate-600 dark:text-slate-400">Có sẵn nút "Tải file mẫu thực hành" để thử nghiệm không cần tệp ngoài.</div>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg ${s.color} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                      {s.step}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      {s.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">Thao tác:</strong> {s.action}
                    </div>
                    <div className="text-blue-700 dark:text-blue-400">
                      <strong>Kiểm tra & Xử lý:</strong> {s.validation}
                    </div>
                    <div className="text-amber-700 dark:text-amber-400">
                      <strong>Cảnh báo / Ngoại lệ:</strong> {s.warning}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
