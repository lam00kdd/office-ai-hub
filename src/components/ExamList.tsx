import React, { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  Users,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
  Link,
  Plus
} from 'lucide-react';
import { Exam, Employee, Department } from '../types';
import { DatabaseService } from '../services/storage';

interface ExamListProps {
  onNavigateToBuilder?: () => void;
  onNavigateToTaker?: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({ onNavigateToBuilder, onNavigateToTaker }) => {
  const [exams, setExams] = useState<Exam[]>(DatabaseService.getExams());
  const [employees] = useState<Employee[]>(DatabaseService.getEmployees());
  const [departments] = useState<Department[]>(DatabaseService.getDepartments());
  const [assignments, setAssignments] = useState(DatabaseService.getAssignments());

  const [assigningExam, setAssigningExam] = useState<Exam | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleCopyLink = (examId: string) => {
    const url = `${window.location.origin}/#exam-${examId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(examId);
    setStatusMessage('Đã sao chép liên kết bài thi vào khay nhớ tạm.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAssignModal = (exam: Exam) => {
    setAssigningExam(exam);
    setSelectedEmployees(employees.map((e) => e.id)); // default select all
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  };

  const handleConfirmAssign = () => {
    if (!assigningExam || selectedEmployees.length === 0) return;
    const count = DatabaseService.assignExam(assigningExam.id, selectedEmployees, dueDate);
    setAssignments(DatabaseService.getAssignments());
    setAssigningExam(null);
    setStatusMessage(`Đã giao bài thi thành công cho ${count} nhân viên.`);
    DatabaseService.playSuccessSound();
  };

  const handleDeleteExam = (id: string) => {
    DatabaseService.deleteExam(id);
    setExams(DatabaseService.getExams());
    setStatusMessage('Đã xóa bài kiểm tra.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Send className="w-4 h-4" /> Quản lý danh mục & Giao bài thi
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Danh sách bài kiểm tra & Phân bổ nhân sự
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Sao chép liên kết đề thi, giao bài cho từng phòng ban hoặc cá nhân và theo dõi tiến độ nộp bài.
          </p>
        </div>
        <button
          onClick={onNavigateToBuilder}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Tạo đề thi mới
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" /> {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono">
                  {exam.code}
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Đang mở
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                {exam.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {exam.description || 'Chưa có mô tả chi tiết.'}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                <div className="flex justify-between">
                  <span>Thời lượng:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{exam.duration_minutes} phút</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số câu hỏi:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{exam.questions.length} câu</strong>
                </div>
                <div className="flex justify-between">
                  <span>Điểm chuẩn đạt:</span>
                  <strong className="text-blue-600">{exam.passing_score_percent}%</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyLink(exam.id)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1"
                title="Sao chép link làm bài"
              >
                {copiedId === exam.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedId === exam.id ? 'Đã chép' : 'Link'}</span>
              </button>

              <button
                onClick={() => handleOpenAssignModal(exam)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> Giao bài
              </button>

              <button
                onClick={() => handleDeleteExam(exam.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Xóa đề thi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {assigningExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Giao bài kiểm tra</h3>
                <p className="text-xs text-slate-500">{assigningExam.title}</p>
              </div>
              <button onClick={() => setAssigningExam(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hạn chót hoàn thành:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Chọn nhân viên nhận bài ({selectedEmployees.length}/{employees.length}):
                  </label>
                  <button
                    onClick={() => {
                      if (selectedEmployees.length === employees.length) {
                        setSelectedEmployees([]);
                      } else {
                        setSelectedEmployees(employees.map((e) => e.id));
                      }
                    }}
                    className="text-blue-600 font-semibold"
                  >
                    {selectedEmployees.length === employees.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {employees.map((emp) => {
                    const checked = selectedEmployees.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => {
                          if (checked) {
                            setSelectedEmployees(selectedEmployees.filter((id) => id !== emp.id));
                          } else {
                            setSelectedEmployees([...selectedEmployees, emp.id]);
                          }
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                          checked
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={checked} onChange={() => {}} className="w-4 h-4 text-blue-600 rounded" />
                          <span className="font-semibold">{emp.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({emp.employee_code})</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{emp.department_name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setAssigningExam(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Xác nhận giao bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
