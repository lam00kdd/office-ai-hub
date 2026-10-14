import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import {
  FileCode2,
  Upload,
  Plus,
  Trash2,
  RotateCw,
  Download,
  FileCheck,
  Layers,
  Scissors,
  Bookmark,
  CheckCircle,
  Eye,
  Hash,
  Images,
  ArrowRightLeft
} from 'lucide-react';
import { DatabaseService } from '../services/storage';

interface PDFPageItem {
  pageIndex: number;
  rotation: number;
  selected: boolean;
  title: string;
}

export const PdfTools: React.FC = () => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'merge' | 'image-to-pdf'>('editor');
  const [addPageNumbering, setAddPageNumbering] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Generate a pristine sample corporate PDF with Vietnamese text & standard layout
  const loadSamplePDF = async () => {
    try {
      const doc = await PDFDocument.create();
      const helvetica = await doc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

      // Page 1: Bìa quy chế
      const page1 = doc.addPage([595.28, 841.89]); // A4
      page1.drawText('CONG TY CO PHAN OFFICE AI HUB', {
        x: 50,
        y: 780,
        size: 11,
        font: helveticaBold,
        color: rgb(0.15, 0.39, 0.92),
      });
      page1.drawText('SO: 01/2026/QD-OAI', {
        x: 50,
        y: 765,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      page1.drawText('QUY DINH NOI BO VE XU LY TAI LIEU VA BAO MAT', {
        x: 50,
        y: 680,
        size: 16,
        font: helveticaBold,
        color: rgb(0.08, 0.12, 0.2),
      });
      page1.drawText('1. MUC TIEU:', { x: 50, y: 620, size: 12, font: helveticaBold });
      page1.drawText('- Chuan hoa quy trinh tao lap, luu tru va bao ve tai lieu dien tu trong toan cong ty.', { x: 70, y: 595, size: 10, font: helvetica });
      page1.drawText('- Nang cao y thuc an toan thong tin, phong ngua ro ri du lieu khach hang va doi tac.', { x: 70, y: 575, size: 10, font: helvetica });

      page1.drawText('2. PHAM VI AP DUNG:', { x: 50, y: 530, size: 12, font: helveticaBold });
      page1.drawText('Ap dung doi voi toan the can bo nhan vien thuoc tat ca cac phong ban.', { x: 70, y: 505, size: 10, font: helvetica });

      page1.drawText('3. NGUYEN TAC AN TOAN:', { x: 50, y: 460, size: 12, font: helveticaBold });
      page1.drawText('- Khong gui tai lieu mat qua kenh ca nhan khong duoc kiem duyet.', { x: 70, y: 435, size: 10, font: helvetica });
      page1.drawText('- Khoa man hinh may tinh (Windows + L) khi roi khoi vi tri lam viec.', { x: 70, y: 415, size: 10, font: helvetica });
      page1.drawText('- Su dung he thong Office AI Hub de kiem tra va chuyen doi file an toan.', { x: 70, y: 395, size: 10, font: helvetica });

      // Page 2: Hướng dẫn nghiệp vụ
      const page2 = doc.addPage([595.28, 841.89]);
      page2.drawText('PHAN II: HUONG DAN XU LY VAN BAN', {
        x: 50,
        y: 780,
        size: 14,
        font: helveticaBold,
        color: rgb(0.15, 0.39, 0.92),
      });
      page2.drawText('1. Dinh dang phong chu bat buoc: Times New Roman hoac font tieu chuan he thong.', { x: 50, y: 730, size: 10, font: helvetica });
      page2.drawText('2. Can le trang: Top 20-25mm, Bottom 20-25mm, Left 30-35mm, Right 15-20mm.', { x: 50, y: 705, size: 10, font: helvetica });
      page2.drawText('3. Dinh ky kiem tra ky nang van phong: To chuc hang quy tren he thong khao thi.', { x: 50, y: 680, size: 10, font: helvetica });

      // Page 3: Trách nhiệm thi hành
      const page3 = doc.addPage([595.28, 841.89]);
      page3.drawText('PHAN III: HIEU LUC THI HANH', {
        x: 50,
        y: 780,
        size: 14,
        font: helveticaBold,
        color: rgb(0.15, 0.39, 0.92),
      });
      page3.drawText('Quy dinh co hieu luc thi hanh ke tu ngay ky.', { x: 50, y: 730, size: 10, font: helvetica });
      page3.drawText('Ban Giam doc va Truong cac bo phan chiu trach nhiem giam sat.', { x: 50, y: 705, size: 10, font: helvetica });
      page3.drawText('Ha Noi, ngay 10 thang 03 nam 2026', { x: 350, y: 600, size: 10, font: helvetica });
      page3.drawText('TONG GIAM DOC DIEU HANH', { x: 350, y: 575, size: 11, font: helveticaBold });

      const bytes = await doc.save();
      setPdfDoc(doc);
      setPdfBytes(bytes);
      setFileName('TaiLieu_mau_QuyDinhCongTy.pdf');

      const pageItems: PDFPageItem[] = [
        { pageIndex: 0, rotation: 0, selected: false, title: 'Trang 1: Bìa & Mục tiêu' },
        { pageIndex: 1, rotation: 0, selected: false, title: 'Trang 2: Hướng dẫn xử lý' },
        { pageIndex: 2, rotation: 0, selected: false, title: 'Trang 3: Hiệu lực thi hành' },
      ];
      setPages(pageItems);

      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      setPreviewUrl(URL.createObjectURL(blob));
      setStatusMessage('Đã tải tài liệu PDF mẫu thành công (3 trang).');
      DatabaseService.playSuccessSound();
    } catch (err) {
      setStatusMessage('Không thể tạo tài liệu PDF mẫu.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(doc);
      setPdfBytes(new Uint8Array(arrayBuffer));
      setFileName(file.name);

      const count = doc.getPageCount();
      const pageItems: PDFPageItem[] = [];
      for (let i = 0; i < count; i++) {
        pageItems.push({
          pageIndex: i,
          rotation: doc.getPage(i).getRotation().angle,
          selected: false,
          title: `Trang ${i + 1}`,
        });
      }
      setPages(pageItems);

      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      setPreviewUrl(URL.createObjectURL(blob));
      setStatusMessage(`Đã tải tài liệu PDF "${file.name}" gồm ${count} trang.`);
      DatabaseService.playSuccessSound();
    } catch (err) {
      setStatusMessage('Lỗi đọc file PDF. File có thể bị hỏng hoặc có mật khẩu bảo vệ.');
    }
  };

  // Rotate selected or all pages
  const handleRotatePage = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
    setStatusMessage(`Đã xoay trang ${idx + 1} thêm 90°.`);
  };

  // Delete page
  const handleDeletePage = (idx: number) => {
    if (pages.length <= 1) {
      setStatusMessage('Tài liệu phải có ít nhất 1 trang.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== idx));
    setStatusMessage(`Đã xóa trang ${idx + 1} khỏi danh sách xuất.`);
  };

  // Reorder page move up/down
  const handleMovePage = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const newPages = [...pages];
    const temp = newPages[idx];
    newPages[idx] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    setPages(newPages);
    setStatusMessage(`Đã đổi vị trí trang ${idx + 1} với trang ${targetIdx + 1}.`);
  };

  // Export manipulated PDF
  const handleExportPDF = async () => {
    if (!pdfDoc || pages.length === 0) return;

    try {
      const newDoc = await PDFDocument.create();
      const helvetica = await newDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const item = pages[i];
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [item.pageIndex]);
        copiedPage.setRotation(degrees(item.rotation));

        // Add page numbering footer if enabled
        if (addPageNumbering) {
          const { width } = copiedPage.getSize();
          copiedPage.drawText(`Trang ${i + 1} / ${pages.length}`, {
            x: width / 2 - 25,
            y: 20,
            size: 9,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
          });
        }

        newDoc.addPage(copiedPage);
      }

      const bytes = await newDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName ? `Da_chinh_sua_${fileName}` : 'OfficeAI_Document.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Đã xuất file PDF mới thành công.');
      DatabaseService.playSuccessSound();
    } catch (err) {
      setStatusMessage('Lỗi khi xuất file PDF.');
    }
  };

  // Merge Multiple PDFs
  const handleMergeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length < 2) {
      setStatusMessage('Vui lòng chọn ít nhất 2 tệp PDF để gộp.');
      return;
    }

    try {
      const mergedDoc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const fileBytes = await files[i].arrayBuffer();
        const srcDoc = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((p) => mergedDoc.addPage(p));
      }

      const bytes = await mergedDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Gop_${files.length}_tai_lieu.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage(`Đã gộp ${files.length} tệp PDF thành công.`);
      DatabaseService.playSuccessSound();
    } catch (err) {
      setStatusMessage('Lỗi khi gộp tệp PDF.');
    }
  };

  // Convert Images (JPG/PNG) to PDF
  const handleImagesToPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const doc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = await file.arrayBuffer();
        let image;
        if (file.type.includes('png')) {
          image = await doc.embedPng(bytes);
        } else {
          image = await doc.embedJpg(bytes);
        }

        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Anh_sang_PDF_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage(`Đã chuyển đổi ${files.length} hình ảnh sang PDF thành công.`);
      DatabaseService.playSuccessSound();
    } catch (err) {
      setStatusMessage('Lỗi khi chuyển hình ảnh sang PDF.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileCode2 className="w-4 h-4" /> Bộ công cụ PDF văn phòng
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Xử lý và biên tập tài liệu PDF
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Gộp nhiều PDF, tách trang, xóa trang thừa, xoay góc, đánh số trang và chuyển ảnh sang PDF bảo mật.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSamplePDF}
            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <FileCheck className="w-4 h-4" /> Tải tài liệu PDF mẫu
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" /> Tải tệp PDF
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
        </div>
      </div>

      {/* Quick Action Feature Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          onClick={() => mergeInputRef.current?.click()}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-400 cursor-pointer shadow-xs transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Gộp nhiều file PDF</div>
            <div className="text-[11px] text-slate-500">Nối 2 hoặc nhiều tệp thành 1 tệp duy nhất</div>
          </div>
          <input
            type="file"
            ref={mergeInputRef}
            onChange={handleMergeFiles}
            accept=".pdf"
            multiple
            className="hidden"
          />
        </div>

        <div
          onClick={() => imageInputRef.current?.click()}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-400 cursor-pointer shadow-xs transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 flex items-center justify-center">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Chuyển ảnh sang PDF</div>
            <div className="text-[11px] text-slate-500">Đóng gói ảnh JPG/PNG thành tài liệu PDF</div>
          </div>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImagesToPdf}
            accept="image/png, image/jpeg"
            multiple
            className="hidden"
          />
        </div>

        <div
          onClick={() => setAddPageNumbering(!addPageNumbering)}
          className={`p-4 rounded-xl border cursor-pointer shadow-xs transition-all flex items-center gap-3 ${
            addPageNumbering
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Chèn số trang tự động</div>
            <div className="text-[11px] text-slate-500">
              Trạng thái: <strong>{addPageNumbering ? 'Đang bật' : 'Tắt'}</strong> (ở chân trang)
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {pages.length === 0 ? (
        /* Empty Dropzone (matching UI screen 5) */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 rounded-2xl p-12 text-center bg-white dark:bg-slate-800 transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Kéo thả file PDF vào đây
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ xem trước các trang, xoay, xóa trang và sắp xếp lại thứ tự trang
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-lg font-medium">
              Hoặc bấm nút "Tải tài liệu PDF mẫu" phía trên
            </span>
          </div>
        </div>
      ) : (
        /* PDF Pages Manager (matching UI screen 6) */
        <div className="space-y-4">
          {/* Status banner */}
          {statusMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-rose-600 shrink-0" /> {statusMessage}
              </span>
              <button onClick={() => setStatusMessage('')} className="text-rose-700 font-bold">✕</button>
            </div>
          )}

          {/* Action Header */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {fileName}
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                {pages.length} trang
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-4 h-4" /> Xuất file PDF đã chỉnh sửa
              </button>
            </div>
          </div>

          {/* Grid of Page Thumbnails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((p, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:border-rose-400 transition-all flex flex-col"
              >
                {/* Simulated A4 Page preview box */}
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 flex-1 flex items-center justify-center min-h-[220px]">
                  <div
                    className="w-36 h-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-md rounded p-3 text-[9px] text-slate-500 flex flex-col justify-between transition-transform duration-300"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-[10px] border-b pb-1 mb-1 truncate">
                        {p.title}
                      </div>
                      <div className="space-y-1 text-slate-400">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="text-center text-[8px] text-slate-400 border-t pt-1">
                      {addPageNumbering ? `Trang ${idx + 1}` : ''}
                    </div>
                  </div>
                </div>

                {/* Page card footer actions */}
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Trang {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRotatePage(idx)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Xoay 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    {idx > 0 && (
                      <button
                        onClick={() => handleMovePage(idx, 'up')}
                        className="px-1.5 py-1 text-[10px] font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600"
                        title="Di chuyển lên trước"
                      >
                        ↑
                      </button>
                    )}
                    {idx < pages.length - 1 && (
                      <button
                        onClick={() => handleMovePage(idx, 'down')}
                        className="px-1.5 py-1 text-[10px] font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600"
                        title="Di chuyển ra sau"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePage(idx)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                      title="Xóa trang này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
