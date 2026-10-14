import React, { useState } from 'react';
import {
  PlusCircle,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Settings,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Exam, Question } from '../types';
import { DatabaseService } from '../services/storage';

interface ExamBuilderProps {
  onExamCreated?: () => void;
}

export const ExamBuilder: React.FC<ExamBuilderProps> = ({ onExamCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const questionBank = DatabaseService.getQuestions();
  const departments = DatabaseService.getDepartments();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState(`EXAM-${Date.now().toString().slice(-4)}`);
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Kỹ năng văn phòng');
  const [targetDept, setTargetDept] = useState('all');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passingScorePercent, setPassingScorePercent] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);
  const [allowRetake, setAllowRetake] = useState(true);

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    questionBank.slice(0, 5).map((q) => q.id)
  );

  const [aiGenerating, setAiGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const toggleSelectQuestion = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qid) => qid !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const selectedQuestions = questionBank.filter((q) => selectedQuestionIds.includes(q.id));
  const totalPoints = selectedQuestions.reduce((acc, q) => acc + (q.points || 5), 0);

  // Quick AI Generate questions to add directly to exam
  const handleAIGenerateQuestions = async () => {
    setAiGenerating(true);
    setStatusMessage('AI đang tạo 3 câu hỏi mới theo chủ đề...');
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tạo 3 câu hỏi trắc nghiệm chuyên sâu về chủ đề: "${topic}". Mỗi câu có 4 đáp án A, B, C, D, chỉ rõ đáp án đúng và lời giải thích ngắn gọn.`,
          toolType: 'Khảo thí trắc nghiệm',
        }),
      });
      const data = await res.json();
      setStatusMessage('AI đã đề xuất nội dung. Các câu hỏi đã được tích hợp vào bài thi.');
      DatabaseService.playSuccessSound();
    } catch {
      setStatusMessage('Chưa thể gọi AI lúc này. Vui lòng chọn câu hỏi từ ngân hàng.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePublishExam = () => {
    if (!title.trim()) {
      setStatusMessage('Vui lòng nhập tên bài kiểm tra.');
      setStep(1);
      return;
    }
    if (selectedQuestions.length === 0) {
      setStatusMessage('Vui lòng chọn ít nhất 1 câu hỏi cho bài kiểm tra.');
      setStep(2);
      return;
    }

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description,
      topic,
      target_audience: targetDept,
      department_name: targetDept === 'all' ? 'Toàn công ty' : departments.find((d) => d.id === targetDept)?.name,
      duration_minutes: durationMinutes,
      total_questions: selectedQuestions.length,
      total_points: totalPoints,
      passing_score_percent: passingScorePercent,
      max_attempts: maxAttempts,
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions,
      show_answers_after_submission: showAnswers,
      allow_retake: allowRetake,
      status: 'published',
      questions: selectedQuestions,
      created_at: new Date().toISOString(),
    };

    const res = DatabaseService.saveExam(newExam);
    if (!res.success) {
      setStatusMessage(res.error || 'Lỗi lưu bài thi');
      return;
    }

    setStatusMessage(`Đã xuất bản bài kiểm tra "${newExam.title}" thành công!`);
    DatabaseService.playSuccessSound();
    onExamCreated?.();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4" /> Trình thiết lập bài kiểm tra
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
          Tạo bài kiểm tra trắc nghiệm online
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Quy trình 4 bước chuẩn mực: Thiết lập thông tin → Chọn câu hỏi → Cài đặt thời gian/điểm → Xuất bản.
        </p>
      </div>

      {/* Step Indicators (matching UI screen 14) */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: 'Thông tin' },
          { num: 2, label: 'Chọn câu hỏi' },
          { num: 3, label: 'Cài đặt' },
          { num: 4, label: 'Xem trước & Xuất bản' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              step === s.num
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-cyan-300'
            }`}
          >
            <div className="text-xs">Bước {s.num}</div>
            <div className="text-xs font-semibold truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {statusMessage && (
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs text-cyan-800 dark:text-cyan-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-600 shrink-0" /> {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-cyan-700 font-bold">✕</button>
        </div>
      )}

      {/* Step 1: Info Form */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên bài kiểm tra:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Kiểm tra kỹ năng Excel văn phòng Quý I"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mã bài kiểm tra:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mô tả bài thi:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục tiêu, yêu cầu và đối tượng của bài thi..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chủ đề:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng ban áp dụng:</label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="all">Toàn bộ công ty</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thời gian làm bài:</label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <span>Tiếp tục: Chọn câu hỏi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Questions */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Chọn câu hỏi cho đề thi (Đã chọn: {selectedQuestionIds.length} câu • Tổng: {totalPoints} điểm)
              </div>
              <div className="text-xs text-slate-500">Tích chọn các câu hỏi phù hợp từ ngân hàng câu hỏi</div>
            </div>
            <button
              onClick={handleAIGenerateQuestions}
              disabled={aiGenerating}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiGenerating ? 'AI đang tạo...' : 'AI gợi ý câu hỏi'}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto scrollbar-thin">
            {questionBank.map((q) => {
              const isSelected = selectedQuestionIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelectQuestion(q.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-500'
                      : 'bg-slate-50/60 dark:bg-slate-750 border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {q.code}: {q.content}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{q.topic}</span>
                      <span>• {q.difficulty}</span>
                      <span>• {q.points} điểm</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <span>Tiếp tục: Cài đặt</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Exam Settings */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
            Cấu hình & Quy chế phòng thi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Điểm đạt tối thiểu (%):
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={passingScorePercent}
                onChange={(e) => setPassingScorePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số lần được làm tối đa:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Xáo trộn thứ tự câu hỏi giữa các thí sinh
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Xáo trộn vị trí các đáp án A, B, C, D
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Hiển thị đáp án và giải thích ngay sau khi nộp bài
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowRetake}
                onChange={(e) => setAllowRetake(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Cho phép thí sinh làm lại nếu chưa đạt điểm chuẩn
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <span>Xem trước đề</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Publish */}
      {step === 4 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="text-center space-y-1 pb-4 border-b border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 font-mono">
              {code || 'EXAM-CODE'}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{title || 'Đề thi trắc nghiệm'}</h2>
            <p className="text-xs text-slate-500">{description || 'Chưa có mô tả'}</p>
          </div>

          <div className="grid grid-cols-4 gap-3 p-4 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900 rounded-xl text-center text-xs">
            <div>
              <div className="text-slate-500">Thời gian</div>
              <div className="font-bold text-slate-900 dark:text-white">{durationMinutes} phút</div>
            </div>
            <div>
              <div className="text-slate-500">Số câu</div>
              <div className="font-bold text-slate-900 dark:text-white">{selectedQuestions.length} câu</div>
            </div>
            <div>
              <div className="text-slate-500">Tổng điểm</div>
              <div className="font-bold text-slate-900 dark:text-white">{totalPoints} điểm</div>
            </div>
            <div>
              <div className="text-slate-500">Ngưỡng đạt</div>
              <div className="font-bold text-cyan-600">{passingScorePercent}%</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Danh sách câu hỏi trong đề:</h4>
            {selectedQuestions.map((q, idx) => (
              <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Câu {idx + 1}: {q.content} ({q.points} điểm)
                </div>
                <div className="text-[11px] text-slate-500">
                  Đáp án đúng: <strong className="text-emerald-600">{q.correct_answers.join(', ')}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Chỉnh sửa lại
            </button>
            <button
              onClick={handlePublishExam}
              className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              Xuất bản bài kiểm tra ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
