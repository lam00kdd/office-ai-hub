import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpenCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Award,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { Exam, Question, ExamAttempt, AttemptAnswer, Employee } from '../types';
import { DatabaseService } from '../services/storage';

interface ExamTakerProps {
  currentUser: Employee;
  onFinish?: () => void;
}

export const ExamTaker: React.FC<ExamTakerProps> = ({ currentUser, onFinish }) => {
  const exams = DatabaseService.getExams().filter((e) => e.status === 'published');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null);
  const [inProgress, setInProgress] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);

  // Active question
  const questions: Question[] = selectedExam?.questions || [];
  const currentQuestion = questions[currentQIdx];

  // Timer tick
  useEffect(() => {
    if (!inProgress) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam(true); // timed out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [inProgress]);

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
    setAnswers({});
    setFlagged({});
    setCurrentQIdx(0);
    setSecondsRemaining(exam.duration_minutes * 60);
    setCompletedAttempt(null);
    setInProgress(true);
  };

  const handleSelectOption = (questionId: string, optionKey: string, isMultiple: boolean) => {
    const current = answers[questionId] || [];
    if (isMultiple) {
      if (current.includes(optionKey)) {
        setAnswers({ ...answers, [questionId]: current.filter((k) => k !== optionKey) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, optionKey] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: [optionKey] });
    }
  };

  const toggleFlag = (questionId: string) => {
    setFlagged({ ...flagged, [questionId]: !flagged[questionId] });
  };

  // Submit and Auto-Grade according to prompt Section 19 rules
  const handleSubmitExam = (isTimedOut = false) => {
    if (!selectedExam) return;

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const attemptAnswers: AttemptAnswer[] = [];

    questions.forEach((q) => {
      const selected = answers[q.id] || [];
      const qPoints = q.points || 5;
      maxScore += qPoints;

      if (selected.length === 0) {
        skippedCount++;
        attemptAnswers.push({
          question_id: q.id,
          question_content: q.content,
          options: q.options,
          correct_answers: q.correct_answers,
          selected_options: [],
          is_correct: false,
          points_awarded: 0,
          max_points: qPoints,
          explanation: q.explanation,
        });
        return;
      }

      // Check correctness
      const correctSet = new Set(q.correct_answers);
      const isSingleOrTF = q.question_type === 'single_choice' || q.question_type === 'true_false';

      let isCorrect = false;
      if (isSingleOrTF) {
        isCorrect = selected.length === 1 && correctSet.has(selected[0]);
      } else {
        // Multiple choice: exactly all correct options with no extra/missing
        isCorrect =
          selected.length === q.correct_answers.length &&
          selected.every((ans) => correctSet.has(ans));
      }

      if (isCorrect) {
        correctCount++;
        totalScore += qPoints;
      } else {
        incorrectCount++;
      }

      attemptAnswers.push({
        question_id: q.id,
        question_content: q.content,
        options: q.options,
        correct_answers: q.correct_answers,
        selected_options: selected,
        is_correct: isCorrect,
        points_awarded: isCorrect ? qPoints : 0,
        max_points: qPoints,
        explanation: q.explanation,
      });
    });

    const scorePercentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(1)) : 0;
    const isPassed = scorePercentage >= selectedExam.passing_score_percent;

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      exam_id: selectedExam.id,
      exam_title: selectedExam.title,
      employee_id: currentUser.id,
      employee_code: currentUser.employee_code,
      employee_name: currentUser.full_name,
      department_name: currentUser.department_name || 'Phòng ban',
      attempt_number: 1,
      started_at: new Date(Date.now() - (selectedExam.duration_minutes * 60 - secondsRemaining) * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
      time_spent_seconds: selectedExam.duration_minutes * 60 - secondsRemaining,
      total_questions: questions.length,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      total_score: totalScore,
      max_score: maxScore,
      score_percentage: scorePercentage,
      is_passed: isPassed,
      status: isTimedOut ? 'timed_out' : 'submitted',
      answers: attemptAnswers,
    };

    // Save attempt to database
    DatabaseService.saveAttempt(attempt);
    setCompletedAttempt(attempt);
    setInProgress(false);
    setShowConfirmModal(false);

    if (isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || []).length > 0).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* State 1: Choose Exam or Exam Overview (matching UI screen 14/15) */}
      {!inProgress && !completedAttempt && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider mb-1">
              <BookOpenCheck className="w-4 h-4" /> Hệ thống khảo thí trực tuyến
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Kỳ kiểm tra & Đánh giá năng lực nhân sự
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Chọn đề thi trong danh mục để bắt đầu làm bài. Hệ thống tự động tính giờ và lưu kết quả minh bạch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-cyan-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                      {exam.topic}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{exam.code}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {exam.description}
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <div className="flex justify-between">
                      <span>Thời lượng:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{exam.duration_minutes} phút</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Số câu hỏi:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{exam.questions.length} câu</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngưỡng đạt:</span>
                      <strong className="text-cyan-600">{exam.passing_score_percent}% điểm</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Bắt đầu làm bài</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State 2: Doing Exam Live Interface (matching UI screen 15) */}
      {inProgress && selectedExam && currentQuestion && (
        <div className="space-y-4">
          {/* Top Exam Header with Timer */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-10">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                {selectedExam.title}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Thí sinh: {currentUser.full_name} ({currentUser.employee_code}) - {currentUser.department_name}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-mono shadow-xs ${
                  secondsRemaining < 300
                    ? 'bg-rose-50 text-rose-600 border border-rose-300 animate-pulse'
                    : 'bg-amber-50 text-amber-700 border border-amber-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài</span>
              </button>
            </div>
          </div>

          {/* Question Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Question Box */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
                  <span className="font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    Câu {currentQIdx + 1} / {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Điểm: {currentQuestion.points} điểm • {currentQuestion.question_type === 'multiple_choice' ? 'Nhiều đáp án' : 'Một đáp án'}
                    </span>
                    <button
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        flagged[currentQuestion.id]
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{flagged[currentQuestion.id] ? 'Đã đánh dấu' : 'Xem lại sau'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                  {currentQuestion.content}
                </h2>

                {/* Question Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const selected = (answers[currentQuestion.id] || []).includes(opt.key);
                    const isMultiple = currentQuestion.question_type === 'multiple_choice';

                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.key, isMultiple)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                          selected
                            ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/20'
                            : 'bg-slate-50/60 dark:bg-slate-750 border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            selected
                              ? 'bg-cyan-600 text-white'
                              : 'bg-white dark:bg-slate-700 border border-slate-300 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {opt.key}
                        </div>
                        <div className="text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                          {opt.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Prev / Next */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <button
                  disabled={currentQIdx === 0}
                  onClick={() => setCurrentQIdx(currentQIdx - 1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Câu trước
                </button>
                <button
                  disabled={currentQIdx === questions.length - 1}
                  onClick={() => setCurrentQIdx(currentQIdx + 1)}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  Câu tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Question Palette Grid */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <span>Bảng câu hỏi ({answeredCount}/{questions.length})</span>
                <span className="text-xs text-slate-400 font-mono">{Math.round((answeredCount / questions.length) * 100)}%</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = (answers[q.id] || []).length > 0;
                  const isFlag = flagged[q.id];
                  const isCurrent = currentQIdx === idx;

                  let colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
                  if (isAnswered) {
                    colorClass = 'bg-emerald-500 text-white shadow-xs';
                  }
                  if (isFlag) {
                    colorClass = 'bg-amber-400 text-slate-900 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIdx(idx)}
                      className={`h-10 rounded-xl text-xs font-bold transition-all relative ${colorClass} ${
                        isCurrent ? 'ring-2 ring-cyan-600 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Đã trả lời ({answeredCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400" /> Cần xem lại
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" /> Chưa trả lời ({questions.length - answeredCount})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Result View (matching UI screen 16) */}
      {completedAttempt && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-md space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg ${
                completedAttempt.is_passed
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-rose-500/25'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {completedAttempt.is_passed ? 'CHÚC MỪNG! BẠN ĐÃ ĐẠT' : 'CHƯA ĐẠT KẾT QUẢ YÊU CẦU'}
            </h2>
            <p className="text-xs text-slate-500">
              Bài thi: <strong>{completedAttempt.exam_title}</strong> • Thí sinh: {completedAttempt.employee_name}
            </p>
          </div>

          {/* Score metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
            <div>
              <div className="text-xs text-slate-400 font-medium">Tổng điểm đạt được</div>
              <div className="text-2xl font-extrabold text-blue-600 font-mono">
                {completedAttempt.total_score} / {completedAttempt.max_score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Tỷ lệ phần trăm</div>
              <div
                className={`text-2xl font-extrabold font-mono ${
                  completedAttempt.is_passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {completedAttempt.score_percentage}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Số câu đúng</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                {completedAttempt.correct_count} / {completedAttempt.total_questions}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Thời gian hoàn thành</div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {Math.floor(completedAttempt.time_spent_seconds / 60)}p {completedAttempt.time_spent_seconds % 60}s
              </div>
            </div>
          </div>

          {/* Detailed Question Answers with Explanations */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Chi tiết câu trả lời & Lời giải thích:
            </h3>
            <div className="space-y-3">
              {completedAttempt.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    ans.is_correct
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">
                      Câu {idx + 1}: {ans.question_content}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ans.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {ans.is_correct ? `+${ans.points_awarded} điểm (ĐÚNG)` : '0 điểm (SAI)'}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Đáp án của bạn: <strong className="font-mono">{ans.selected_options.join(', ') || 'Bỏ trống'}</strong> • Đáp án đúng: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{ans.correct_answers.join(', ')}</strong>
                  </div>
                  {ans.explanation && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50">
                      <strong>💡 Giải thích:</strong> {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setCompletedAttempt(null);
                setInProgress(false);
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Trở về danh sách bài kiểm tra
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Xác nhận nộp bài kiểm tra?
              </h3>
              <p className="text-xs text-slate-500">
                Bạn đã trả lời <strong>{answeredCount}</strong> / {questions.length} câu hỏi.
                {questions.length - answeredCount > 0 && (
                  <span className="block text-rose-600 font-medium mt-1">
                    Cảnh báo: Bạn vẫn còn {questions.length - answeredCount} câu chưa hoàn thành!
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
