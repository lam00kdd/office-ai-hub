import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Sparkles,
  BookOpen,
  Check,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { INITIAL_WORD_TEMPLATES } from '../services/mockData';
import { WordTemplate } from '../types';
import { DatabaseService } from '../services/storage';

export const WordTools: React.FC = () => {
  const [templates] = useState<WordTemplate[]>(INITIAL_WORD_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<WordTemplate>(templates[0]);
  const [documentContent, setDocumentContent] = useState<string>(templates[0].content);
  const [documentTitle, setDocumentTitle] = useState<string>(templates[0].title);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const wordCount = documentContent.trim() ? documentContent.trim().split(/\s+/).length : 0;
  const charCount = documentContent.length;

  const handleSelectTemplate = (tpl: WordTemplate) => {
    setSelectedTemplate(tpl);
    setDocumentTitle(tpl.title);
    setDocumentContent(tpl.content);
    setStatusMessage(`Đã áp dụng mẫu "${tpl.title}".`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setStatusMessage('Đã sao chép nội dung vào khay nhớ tạm.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = () => {
    // Generate a formatted plain text / html document that MS Word opens cleanly
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${documentTitle}</title>
<style>
body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; margin: 2.5cm 2cm 2cm 3cm; }
p { margin-bottom: 6pt; }
</style>
</head><body><pre style="font-family: 'Times New Roman', serif; font-size: 13pt; white-space: pre-wrap;">${documentContent}</pre></body></html>`;

    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Đã xuất tệp Word (.doc/docx) chuẩn thành công.');
    DatabaseService.playSuccessSound();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>${documentTitle}</title>
<style>
body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; margin: 30mm 20mm 25mm 25mm; }
pre { font-family: inherit; font-size: inherit; white-space: pre-wrap; word-break: break-word; }
</style></head><body><pre>${documentContent}</pre></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Soạn thảo văn bản hành chính chuẩn Nghị định 30
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Bộ công cụ Word & Mẫu văn bản doanh nghiệp
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Thư viện biểu mẫu hành chính, công văn, thông báo, biên bản họp theo thể thức quy chuẩn quốc gia.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã chép' : 'Sao chép'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> In / Lưu PDF
          </button>
          <button
            onClick={handleDownloadDocx}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Xuất file Word (.docx)
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" /> {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Template Chooser Cards (matching UI screen 7) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Thư viện biểu mẫu hành chính có sẵn
          </h2>
          <span className="text-xs text-slate-500">Chọn mẫu để tự động điền cấu trúc</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 flex items-center justify-center font-bold">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    {isSelected && <span className="text-[10px] font-bold text-blue-600">Đang chọn</span>}
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {tpl.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {tpl.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace (matching UI screen 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="font-bold text-base text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 flex-1 mr-3"
              placeholder="Tiêu đề văn bản..."
            />
            <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
              <span>{wordCount} từ</span>
              <span>• {charCount} ký tự</span>
            </div>
          </div>

          <textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            rows={22}
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Nhập hoặc chỉnh sửa nội dung văn bản..."
          />
        </div>

        {/* Sidebar Info & Regulations */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rules Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Quy chuẩn Nghị định 30/2020/NĐ-CP
            </h3>
            <div className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">1. Quốc hiệu & Tiêu ngữ:</strong>
                <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (In hoa, đậm)</div>
                <div>Độc lập - Tự do - Hạnh phúc (In thường, đậm, gạch dưới)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">2. Căn lề khổ A4:</strong>
                <div>• Mép trên & dưới: 20 - 25 mm</div>
                <div>• Mép trái: 30 - 35 mm</div>
                <div>• Mép phải: 15 - 20 mm</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">3. Phông chữ chuẩn:</strong>
                <div>Times New Roman, mã Unicode TCVN 6909:2001, cỡ 13 - 14pt.</div>
              </div>
            </div>
          </div>

          {/* Quick AI Refine Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 shadow-xs text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="w-4 h-4" />
              Gợi ý tối ưu với Trợ lý AI
            </div>
            <p className="text-purple-900/80 dark:text-purple-200 leading-relaxed">
              Cần kiểm tra ngữ pháp, nâng cấp văn phong hành chính chỉn chu hơn? Bạn có thể mở thẻ <strong>Chat với AI</strong> để nhờ trợ lý hỗ trợ ngay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
