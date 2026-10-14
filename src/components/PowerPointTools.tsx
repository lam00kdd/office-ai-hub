import React, { useState } from 'react';
import pptxgen from 'pptxgenjs';
import {
  Presentation,
  Plus,
  Trash2,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { SlideItem } from '../types';
import { DatabaseService } from '../services/storage';

export const PowerPointTools: React.FC = () => {
  const [topic, setTopic] = useState('Giới thiệu văn hóa doanh nghiệp & Chuyển đổi số');
  const [slideCount, setSlideCount] = useState(5);
  const [themeColor, setThemeColor] = useState('blue'); // blue, purple, emerald, dark
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Sample slides deck
  const [slides, setSlides] = useState<SlideItem[]>([
    {
      id: 's-1',
      title: 'VĂN HÓA DOANH NGHIỆP & CHUYỂN ĐỔI SỐ',
      subtitle: 'Xây dựng môi trường làm việc thông minh, chuyên nghiệp và hiệu quả',
      layout: 'title',
      speakerNotes: 'Lời chào mở đầu, giới thiệu tổng quan về mục tiêu buổi thuyết trình.',
    },
    {
      id: 's-2',
      title: 'TẦM NHÌN & SỨ MỆNH',
      layout: 'columns',
      leftColumn: 'TẦM NHÌN:\nTrở thành tổ chức tiên phong ứng dụng công nghệ trí tuệ nhân tạo và số hóa quy trình văn phòng toàn diện.',
      rightColumn: 'SỨ MỆNH:\nĐồng hành cùng nhân viên nâng cao năng suất, kiến tạo giá trị bền vững và môi trường học tập suốt đời.',
      speakerNotes: 'Nhấn mạnh 2 trụ cột tầm nhìn và sứ mệnh.',
    },
    {
      id: 's-3',
      title: 'CÁC NGUYÊN TẮC LÀM VIỆC CỐT LÕI',
      layout: 'bullets',
      bullets: [
        'Chính trực & Minh bạch trong mọi hoạt động số liệu báo cáo.',
        'Chủ động học hỏi, nâng cao kỹ năng xử lý dữ liệu Excel và công nghệ mới.',
        'Bảo mật tuyệt đối thông tin khách hàng và tài liệu nội bộ.',
        'Tinh thần phối hợp liên phòng ban và hỗ trợ đồng nghiệp.',
      ],
      speakerNotes: 'Điểm qua 4 giá trị văn hóa làm việc cốt lõi.',
    },
    {
      id: 's-4',
      title: 'LỘ TRÌNH ĐÀO TẠO NỘI BỘ 2026',
      layout: 'bullets',
      bullets: [
        'Quý I: Chuẩn hóa kỹ năng bảng tính và văn bản hành chính theo NĐ 30.',
        'Quý II: Ứng dụng Trợ lý AI Gemini vào tự động hóa công việc thường nhật.',
        'Quý III: Đánh giá khảo thí định kỳ trên nền tảng Office AI Hub.',
        'Quý IV: Tuyên dương nhân sự xuất sắc và vinh danh cán bộ tiêu biểu.',
      ],
      speakerNotes: 'Kế hoạch hành động theo từng quý.',
    },
    {
      id: 's-5',
      title: 'KẾT LUẬN & ĐỊNH HƯỚNG',
      subtitle: 'Cùng nhau bứt phá trong kỷ nguyên số!',
      content: 'Chân thành cảm ơn sự đồng hành và cống hiến của toàn thể cán bộ nhân viên công ty.',
      layout: 'conclusion',
      speakerNotes: 'Phần tổng kết và mở phiên thảo luận hỏi đáp Q&A.',
    },
  ]);

  const activeSlide = slides[activeSlideIdx] || slides[0];

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      id: `s-${Date.now()}`,
      title: `Slide tiêu đề mới ${slides.length + 1}`,
      layout: 'bullets',
      bullets: [
        'Nội dung ý chính 1',
        'Nội dung ý chính 2',
        'Nội dung ý chính 3',
      ],
      speakerNotes: 'Ghi chú thuyết trình...',
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIdx(updated.length - 1);
    setStatusMessage('Đã thêm 1 trang slide mới.');
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      setStatusMessage('Bài thuyết trình phải có ít nhất 1 slide.');
      return;
    }
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    setActiveSlideIdx(Math.max(0, idx - 1));
    setStatusMessage('Đã xóa slide.');
  };

  const handleUpdateActiveSlide = (field: keyof SlideItem, value: any) => {
    const updated = [...slides];
    updated[activeSlideIdx] = {
      ...updated[activeSlideIdx],
      [field]: value,
    };
    setSlides(updated);
  };

  // Generate real PPTX with pptxgenjs
  const handleExportPPTX = async () => {
    try {
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';

      const colorMap: Record<string, { bg: string; primary: string; text: string }> = {
        blue: { bg: 'F0F7FF', primary: '1D4ED8', text: '0F172A' },
        purple: { bg: 'FAF5FF', primary: '7E22CE', text: '0F172A' },
        emerald: { bg: 'F0FDF4', primary: '047857', text: '0F172A' },
        dark: { bg: '0F172A', primary: '38BDF8', text: 'F8FAFC' },
      };
      const theme = colorMap[themeColor] || colorMap.blue;

      slides.forEach((s) => {
        const slide = pres.addSlide();
        slide.background = { color: theme.bg };

        if (s.layout === 'title') {
          slide.addText(s.title, {
            x: 1.0,
            y: 2.2,
            w: 11.3,
            h: 1.8,
            fontSize: 32,
            bold: true,
            color: theme.primary,
            align: 'center',
          });
          if (s.subtitle) {
            slide.addText(s.subtitle, {
              x: 1.5,
              y: 4.2,
              w: 10.3,
              h: 1.0,
              fontSize: 18,
              color: '475569',
              align: 'center',
            });
          }
        } else if (s.layout === 'columns') {
          slide.addText(s.title, {
            x: 0.8,
            y: 0.8,
            w: 11.5,
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: theme.primary,
          });
          slide.addText(s.leftColumn || '', {
            x: 0.8,
            y: 2.0,
            w: 5.5,
            h: 4.0,
            fontSize: 15,
            color: theme.text,
            fill: { color: 'FFFFFF' },
            margin: 0.2,
          });
          slide.addText(s.rightColumn || '', {
            x: 6.8,
            y: 2.0,
            w: 5.5,
            h: 4.0,
            fontSize: 15,
            color: theme.text,
            fill: { color: 'FFFFFF' },
            margin: 0.2,
          });
        } else {
          // bullets or content
          slide.addText(s.title, {
            x: 0.8,
            y: 0.8,
            w: 11.5,
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: theme.primary,
          });
          if (s.bullets && s.bullets.length > 0) {
            slide.addText(
              s.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
              {
                x: 0.8,
                y: 2.0,
                w: 11.5,
                h: 4.2,
                fontSize: 16,
                color: theme.text,
                lineSpacing: 28,
              }
            );
          } else if (s.content) {
            slide.addText(s.content, {
              x: 1.0,
              y: 2.5,
              w: 11.0,
              h: 3.0,
              fontSize: 18,
              color: theme.text,
              align: 'center',
            });
          }
        }

        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      });

      const fileName = `${topic.slice(0, 30).replace(/\s+/g, '_')}.pptx`;
      await pres.writeFile({ fileName });
      setStatusMessage('Đã tạo và tải xuống file PowerPoint (.pptx) thành công!');
      DatabaseService.playSuccessSound();
    } catch (err) {
      setStatusMessage('Lỗi khi xuất file PowerPoint.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Presentation className="w-4 h-4" /> Thiết kế bài thuyết trình PowerPoint
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Trình tạo Slide thuyết trình chuyên nghiệp
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tự động tạo dàn ý bài giảng, chỉnh sửa nội dung trực quan và xuất file định dạng PPTX tiêu chuẩn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddSlide}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm Slide
          </button>
          <button
            onClick={handleExportPPTX}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Xuất file PPTX
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" /> {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-amber-700 font-bold">✕</button>
        </div>
      )}

      {/* Style & Theme settings */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-xs font-bold text-slate-500">Chủ đề bài giảng:</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Bảng màu:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'blue', color: 'bg-blue-600' },
                { id: 'purple', color: 'bg-purple-600' },
                { id: 'emerald', color: 'bg-emerald-600' },
                { id: 'dark', color: 'bg-slate-900' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setThemeColor(c.id)}
                  className={`w-6 h-6 rounded-full ${c.color} ring-offset-2 transition-all ${
                    themeColor === c.id ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Slide Editor (matching UI screen 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Thumbnails List */}
        <div className="lg:col-span-3 space-y-2 max-h-[580px] overflow-y-auto scrollbar-thin pr-1">
          {slides.map((s, idx) => {
            const isSelected = activeSlideIdx === idx;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSlideIdx(idx)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[11px] font-bold text-slate-400">Trang {idx + 1}</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {s.title}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(idx);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="Xóa slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Center Live Slide Preview Canvas */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-md aspect-video flex flex-col justify-between relative overflow-hidden">
            {/* Visual Header */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">
                OFFICE AI HUB • TRANG {activeSlideIdx + 1} / {slides.length}
              </div>
              <input
                type="text"
                value={activeSlide.title}
                onChange={(e) => handleUpdateActiveSlide('title', e.target.value)}
                className="w-full text-xl md:text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="Tiêu đề Slide..."
              />
            </div>

            {/* Visual Content Body */}
            <div className="my-auto py-4">
              {activeSlide.layout === 'title' ? (
                <div className="text-center space-y-3">
                  <textarea
                    value={activeSlide.subtitle || ''}
                    onChange={(e) => handleUpdateActiveSlide('subtitle', e.target.value)}
                    className="w-full text-center text-sm md:text-base text-slate-600 dark:text-slate-300 bg-transparent border-none focus:outline-none resize-none"
                    rows={2}
                    placeholder="Mô tả phụ cho trang bìa..."
                  />
                </div>
              ) : activeSlide.layout === 'columns' ? (
                <div className="grid grid-cols-2 gap-6">
                  <textarea
                    value={activeSlide.leftColumn || ''}
                    onChange={(e) => handleUpdateActiveSlide('leftColumn', e.target.value)}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs md:text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 resize-none h-44"
                    placeholder="Cột trái..."
                  />
                  <textarea
                    value={activeSlide.rightColumn || ''}
                    onChange={(e) => handleUpdateActiveSlide('rightColumn', e.target.value)}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs md:text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 resize-none h-44"
                    placeholder="Cột phải..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={(activeSlide.bullets || []).join('\n')}
                    onChange={(e) => handleUpdateActiveSlide('bullets', e.target.value.split('\n'))}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs md:text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 resize-none h-44 leading-relaxed font-sans"
                    placeholder="Mỗi dòng là một ý gạch đầu dòng..."
                  />
                </div>
              )}
            </div>

            {/* Slide Footer with Speaker Notes */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
              <input
                type="text"
                value={activeSlide.speakerNotes || ''}
                onChange={(e) => handleUpdateActiveSlide('speakerNotes', e.target.value)}
                className="w-full text-xs text-slate-500 bg-transparent border-none focus:outline-none"
                placeholder="Ghi chú người thuyết trình (Speaker Notes)..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
