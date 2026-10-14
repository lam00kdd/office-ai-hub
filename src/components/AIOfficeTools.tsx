import React, { useState } from 'react';
import {
  Mail,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  Calendar,
  CheckSquare,
  UserCheck,
  Calculator,
  Presentation,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  Download,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { DatabaseService } from '../services/storage';

interface ToolConfig {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  lightBg: string;
  promptPlaceholder: string;
  fields: { name: string; label: string; placeholder: string; defaultValue?: string }[];
}

export const AIOfficeTools: React.FC = () => {
  const tools: ToolConfig[] = [
    {
      id: 'email',
      name: 'AI Viết Email',
      desc: 'Soạn email công việc, đối tác, khách hàng chuẩn văn phong',
      icon: Mail,
      color: 'text-blue-600',
      lightBg: 'bg-blue-50 dark:bg-blue-950/40',
      promptPlaceholder: 'Nội dung cốt lõi của email...',
      fields: [
        { name: 'recipient', label: 'Đối tượng người nhận', placeholder: 'Khách hàng, Giám đốc, Toàn thể nhân viên' },
        { name: 'purpose', label: 'Mục đích email', placeholder: 'Thông báo nghỉ lễ, Đề nghị báo giá, Nhắc hạn báo cáo' },
        { name: 'tone', label: 'Văn phong', placeholder: 'Trang trọng, Thân thiện, Thúc giục lịch sự', defaultValue: 'Chuyên nghiệp' },
      ],
    },
    {
      id: 'report',
      name: 'AI Tạo Báo Cáo',
      desc: 'Tổng hợp và xây dựng báo cáo công việc định kỳ',
      icon: TrendingUp,
      color: 'text-purple-600',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40',
      promptPlaceholder: 'Các số liệu và kết quả chính đạt được...',
      fields: [
        { name: 'period', label: 'Kỳ báo cáo', placeholder: 'Báo cáo tuần 11, Báo cáo Quý I/2026' },
        { name: 'dept', label: 'Bộ phận / Phòng ban', placeholder: 'Phòng Kế toán, Kinh doanh, IT' },
        { name: 'keyMetrics', label: 'Chỉ số quan trọng', placeholder: 'Doanh thu đạt 120%, 10/10 nhân sự hoàn thành khóa học' },
      ],
    },
    {
      id: 'dispatch',
      name: 'AI Soạn Công Văn',
      desc: 'Viết công văn gửi cơ quan, đối tác theo Nghị định 30',
      icon: FileText,
      color: 'text-emerald-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      promptPlaceholder: 'Vấn đề cần đề nghị hoặc thông báo trong công văn...',
      fields: [
        { name: 'dispatchTo', label: 'Cơ quan / Đối tác nhận', placeholder: 'Sở Thông tin & Truyền thông, Quý đối tác' },
        { name: 'subject', label: 'Trích yếu nội dung', placeholder: 'V/v Phối hợp tổ chức hội thảo chuyển đổi số' },
      ],
    },
    {
      id: 'meeting',
      name: 'AI Tạo Biên Bản Họp',
      desc: 'Ghi tóm tắt cuộc họp giao ban và phân công nhiệm vụ',
      icon: ClipboardList,
      color: 'text-amber-600',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40',
      promptPlaceholder: 'Nội dung trao đổi và các quyết định đưa ra...',
      fields: [
        { name: 'meetingName', label: 'Tên cuộc họp', placeholder: 'Họp giao ban Quý I/2026' },
        { name: 'leader', label: 'Chủ trì', placeholder: 'Nguyễn Văn An - Giám đốc vận hành' },
      ],
    },
    {
      id: 'plan',
      name: 'AI Lập Kế Hoạch',
      desc: 'Lên kế hoạch triển khai công việc theo tuần hoặc tháng',
      icon: Calendar,
      color: 'text-indigo-600',
      lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      promptPlaceholder: 'Mục tiêu trọng tâm cần đạt được...',
      fields: [
        { name: 'timeline', label: 'Thời gian', placeholder: 'Tuần từ 15/03 đến 22/03/2026' },
        { name: 'goals', label: 'Chỉ tiêu KPI', placeholder: '100% nhân sự hoàn thành bài thi trắc nghiệm' },
      ],
    },
    {
      id: 'checklist',
      name: 'AI Tạo Checklist',
      desc: 'Lập danh mục đầu việc kiểm tra không bỏ sót nhiệm vụ',
      icon: CheckSquare,
      color: 'text-rose-600',
      lightBg: 'bg-rose-50 dark:bg-rose-950/40',
      promptPlaceholder: 'Quy trình cần tạo checklist kiểm tra...',
      fields: [
        { name: 'process', label: 'Tên quy trình', placeholder: 'Bàn giao thiết bị cho nhân viên mới, Chuẩn bị tổ chức thi online' },
      ],
    },
    {
      id: 'excel-formula',
      name: 'AI Gợi Ý Excel',
      desc: 'Hướng dẫn viết công thức Excel theo yêu cầu bài toán',
      icon: Calculator,
      color: 'text-teal-600',
      lightBg: 'bg-teal-50 dark:bg-teal-950/40',
      promptPlaceholder: 'Mô tả bài toán cần tính toán trong bảng tính Excel...',
      fields: [
        { name: 'dataDesc', label: 'Cấu trúc cột dữ liệu', placeholder: 'Cột A là Mã NV, Cột B là Họ tên, Cột C là Điểm' },
        { name: 'requirement', label: 'Kết quả muốn tính', placeholder: 'Tìm điểm cao nhất của phòng Kế toán' },
      ],
    },
    {
      id: 'slide-content',
      name: 'AI Tạo Slide',
      desc: 'Đề xuất dàn ý và nội dung thuyết trình PowerPoint',
      icon: Presentation,
      color: 'text-cyan-600',
      lightBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      promptPlaceholder: 'Chủ đề và thông điệp của bài thuyết trình...',
      fields: [
        { name: 'topic', label: 'Chủ đề', placeholder: 'An toàn thông tin trong thời đại AI' },
        { name: 'audience', label: 'Đối tượng người nghe', placeholder: 'Toàn thể cán bộ nhân viên công ty' },
      ],
    },
    {
      id: 'jd-hr',
      name: 'AI Hỗ Trợ Nhân Sự',
      desc: 'Tạo bản mô tả công việc (JD) và tiêu chí đánh giá',
      icon: UserCheck,
      color: 'text-orange-600',
      lightBg: 'bg-orange-50 dark:bg-orange-950/40',
      promptPlaceholder: 'Vị trí tuyển dụng và yêu cầu kỹ năng...',
      fields: [
        { name: 'position', label: 'Tên vị trí', placeholder: 'Chuyên viên Phân tích Dữ liệu Văn phòng' },
        { name: 'experience', label: 'Yêu cầu kinh nghiệm', placeholder: 'Từ 1-2 năm, thành thạo Excel & công cụ số' },
      ],
    },
    {
      id: 'quiz-gen',
      name: 'AI Tạo Đề Thi Trắc Nghiệm',
      desc: 'Tự động tạo câu hỏi trắc nghiệm kèm giải thích chi tiết',
      icon: GraduationCap,
      color: 'text-violet-600',
      lightBg: 'bg-violet-50 dark:bg-violet-950/40',
      promptPlaceholder: 'Chủ đề cần tạo câu hỏi trắc nghiệm...',
      fields: [
        { name: 'subject', label: 'Môn thi / Chủ đề', placeholder: 'Kỹ năng Excel nâng cao, Quy định bảo mật' },
        { name: 'count', label: 'Số lượng câu hỏi', placeholder: '5 câu', defaultValue: '5' },
      ],
    },
  ];

  const [activeTool, setActiveTool] = useState<ToolConfig>(tools[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [promptText, setPromptText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectTool = (t: ToolConfig) => {
    setActiveTool(t);
    setFormData({});
    setPromptText('');
    setResult('');
  };

  const handleGenerate = async () => {
    const fullPrompt = `Yêu cầu công cụ: ${activeTool.name}
Chi tiết các trường:
${Object.entries(formData).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
Nội dung bổ sung: ${promptText}

Hãy tạo nội dung hoàn chỉnh, chuẩn xác, định dạng rõ ràng bằng tiếng Việt.`;

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          toolType: activeTool.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi xử lý');
      }

      setResult(data.result || 'Không có kết quả.');
      DatabaseService.playSuccessSound();
    } catch (err: any) {
      setResult(`⚠️ Không thể kết nối Gemini AI: ${err.message}. Vui lòng cấu hình GEMINI_API_KEY.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTool.name.replace(/\s+/g, '_')}_KetQua.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" /> Hệ thống 12 Công cụ AI văn phòng chuyên sâu
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
          Trợ lý AI chuyên biệt theo nghiệp vụ
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Được tối ưu hóa cấu trúc prompt chuyên sâu cho từng nghiệp vụ: email, báo cáo, công văn, công thức Excel và khảo thí.
        </p>
      </div>

      {/* Grid of 10-12 Specialized AI Cards (matching UI screen 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          const isSelected = activeTool.id === t.id;
          return (
            <div
              key={t.id}
              onClick={() => handleSelectTool(t)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${t.lightBg} ${t.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{t.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Tool Form & Result Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <activeTool.icon className={`w-5 h-5 ${activeTool.color}`} />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{activeTool.name}</h3>
              <p className="text-[11px] text-slate-500">{activeTool.desc}</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeTool.fields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {f.label}:
                </label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  defaultValue={f.defaultValue}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yêu cầu bổ sung hoặc bối cảnh:
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={activeTool.promptPlaceholder}
                rows={4}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'AI đang tạo nội dung...' : `Tạo nội dung với AI`}</span>
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Kết quả từ Trợ lý AI</span>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 text-xs rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Lưu file
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Gemini 3.8 Flash đang xử lý yêu cầu...</p>
              </div>
            ) : result ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-100 border border-slate-200/50 max-h-[460px] overflow-y-auto scrollbar-thin">
                {result}
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 mx-auto flex items-center justify-center text-slate-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>Điền thông tin ở khung bên trái và bấm <strong>"Tạo nội dung với AI"</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
