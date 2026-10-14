import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  RefreshCw,
  Upload,
  Download,
  FileSpreadsheet,
  FileCode2,
  FileText,
  Images,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { DatabaseService } from '../services/storage';

export const FileConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('csv');
  const [converting, setConverting] = useState<boolean>(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedName, setConvertedName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setConvertedUrl(null);
    setStatusMessage('');

    // Pre-select best logical target format
    const name = file.name.toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      setTargetFormat('csv');
    } else if (name.endsWith('.csv')) {
      setTargetFormat('xlsx');
    } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      setTargetFormat('pdf');
    } else if (name.endsWith('.txt')) {
      setTargetFormat('pdf');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setConverting(true);
    setStatusMessage('Đang xử lý chuyển đổi định dạng...');

    try {
      const fileNameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;

      if (targetFormat === 'csv') {
        // Convert XLSX to CSV
        const arrayBuf = await selectedFile.arrayBuffer();
        const wb = XLSX.read(arrayBuf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${fileNameWithoutExt}.csv`);
      } else if (targetFormat === 'xlsx') {
        // Convert CSV or text to XLSX
        const text = await selectedFile.text();
        const wb = XLSX.read(text, { type: 'string' });
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${fileNameWithoutExt}.xlsx`);
      } else if (targetFormat === 'pdf') {
        // Convert Image or Text to PDF
        const doc = await PDFDocument.create();
        const fileType = selectedFile.type;

        if (fileType.includes('image')) {
          const imgBytes = await selectedFile.arrayBuffer();
          const img = fileType.includes('png')
            ? await doc.embedPng(imgBytes)
            : await doc.embedJpg(imgBytes);

          const page = doc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        } else {
          // Plain Text to PDF
          const text = await selectedFile.text();
          const helvetica = await doc.embedFont(StandardFonts.Helvetica);
          const page = doc.addPage([595.28, 841.89]); // A4
          const lines = text.split('\n').slice(0, 45); // First 45 lines per page
          let y = 800;
          for (const line of lines) {
            page.drawText(line.substring(0, 85), { x: 40, y, size: 10, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
            y -= 16;
          }
        }

        const pdfBytes = await doc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${fileNameWithoutExt}.pdf`);
      } else if (targetFormat === 'doc') {
        // Text to Doc
        const text = await selectedFile.text();
        const content = `<html><head><meta charset='utf-8'></head><body><pre style="font-family: 'Times New Roman'; font-size: 13pt;">${text}</pre></body></html>`;
        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${fileNameWithoutExt}.doc`);
      }

      setStatusMessage('Chuyển đổi hoàn tất thành công!');
      DatabaseService.playSuccessSound();
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Lỗi trong quá trình chuyển đổi. Vui lòng thử lại.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <RefreshCw className="w-4 h-4" /> Hệ thống chuyển đổi tài liệu đa định dạng
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
          Chuyển đổi định dạng tệp tin an toàn
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Chuyển đổi nhanh chóng giữa Excel, CSV, PDF, hình ảnh và tài liệu văn phòng trực tiếp trên trình duyệt.
        </p>
      </div>

      {/* Main Dropzone & Converter Box (matching UI screen 11) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xs space-y-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-900/50"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {selectedFile ? selectedFile.name : 'Kéo thả file vào đây hoặc bấm để chọn tệp'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {selectedFile
              ? `Kích thước: ${(selectedFile.size / 1024).toFixed(1)} KB • Định dạng: ${selectedFile.type || 'Tập tin'}`
              : 'Hỗ trợ định dạng .xlsx, .xls, .csv, .png, .jpg, .jpeg, .txt'}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv, .png, .jpg, .jpeg, .txt"
            className="hidden"
          />
        </div>

        {/* Configuration Row */}
        {selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chọn định dạng đầu ra mong muốn:
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="csv">CSV (Comma Separated Values)</option>
                <option value="xlsx">Excel Workbook (.xlsx)</option>
                <option value="pdf">Tài liệu PDF (.pdf)</option>
                <option value="doc">Văn bản Word (.doc)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${converting ? 'animate-spin' : ''}`} />
                <span>{converting ? 'Đang chuyển đổi...' : 'Chuyển đổi ngay'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Output */}
        {convertedUrl && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  {statusMessage || 'Tệp đã sẵn sàng tải về'}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  {convertedName}
                </div>
              </div>
            </div>
            <a
              href={convertedUrl}
              download={convertedName}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Tải xuống tệp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
