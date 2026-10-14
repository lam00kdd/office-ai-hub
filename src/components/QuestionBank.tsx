import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  HelpCircle,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Copy,
  Edit2,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { Question, QuestionOption, DifficultyLevel, QuestionType } from '../types';
import { DatabaseService } from '../services/storage';

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(DatabaseService.getQuestions());
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for modal
  const [formData, setFormData] = useState<{
    code: string;
    topic: string;
    difficulty: DifficultyLevel;
    question_type: QuestionType;
    content: string;
    points: number;
    explanation: string;
    options: { key: string; text: string; is_correct: boolean }[];
  }>({
    code: `Q${Date.now().toString().slice(-4)}`,
    topic: 'Kỹ năng Excel',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: '',
    points: 5,
    explanation: '',
    options: [
      { key: 'A', text: '', is_correct: true },
      { key: 'B', text: '', is_correct: false },
      { key: 'C', text: '', is_correct: false },
      { key: 'D', text: '', is_correct: false },
    ],
  });

  const topics = Array.from(new Set(questions.map((q) => q.topic)));

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormData({
      code: `Q${Date.now().toString().slice(-4)}`,
      topic: topics[0] || 'Kỹ năng Excel',
      difficulty: 'medium',
      question_type: 'single_choice',
      content: '',
      points: 5,
      explanation: '',
      options: [
        { key: 'A', text: '', is_correct: true },
        { key: 'B', text: '', is_correct: false },
        { key: 'C', text: '', is_correct: false },
        { key: 'D', text: '', is_correct: false },
      ],
    });
    setShowCreateModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      setStatusMessage('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const correctKeys = formData.options.filter((o) => o.is_correct).map((o) => o.key);
    if (correctKeys.length === 0) {
      setStatusMessage('Vui lòng chọn ít nhất 1 đáp án đúng.');
      return;
    }

    const newQ: Question = {
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      topic: formData.topic,
      difficulty: formData.difficulty,
      question_type: formData.question_type,
      content: formData.content,
      options: formData.options,
      correct_answers: correctKeys,
      explanation: formData.explanation,
      points: Number(formData.points) || 5,
      created_at: new Date().toISOString(),
    };

    const res = DatabaseService.saveQuestion(newQ);
    if (!res.success) {
      setStatusMessage(res.error || 'Lỗi lưu câu hỏi');
      return;
    }

    setQuestions(DatabaseService.getQuestions());
    setShowCreateModal(false);
    setStatusMessage(`Đã lưu câu hỏi "${newQ.code}" thành công.`);
    DatabaseService.playSuccessSound();
  };

  const handleDelete = (id: string) => {
    DatabaseService.deleteQuestion(id);
    setQuestions(DatabaseService.getQuestions());
    setStatusMessage('Đã xóa câu hỏi khỏi ngân hàng.');
  };

  const handleDuplicate = (q: Question) => {
    const clone: Question = {
      ...q,
      id: `q-${Date.now()}`,
      code: `${q.code}-COPY`,
      created_at: new Date().toISOString(),
    };
    DatabaseService.saveQuestion(clone);
    setQuestions(DatabaseService.getQuestions());
    setStatusMessage(`Đã nhân bản câu hỏi thành "${clone.code}".`);
  };

  // Export questions to Excel
  const handleExportExcel = () => {
    const rows = questions.map((q) => {
      const optA = q.options.find((o) => o.key === 'A')?.text || '';
      const optB = q.options.find((o) => o.key === 'B')?.text || '';
      const optC = q.options.find((o) => o.key === 'C')?.text || '';
      const optD = q.options.find((o) => o.key === 'D')?.text || '';
      return {
        'Mã câu hỏi': q.code,
        'Chủ đề': q.topic,
        'Độ khó': q.difficulty,
        'Dạng câu hỏi': q.question_type,
        'Nội dung': q.content,
        'Đáp án A': optA,
        'Đáp án B': optB,
        'Đáp án C': optC,
        'Đáp án D': optD,
        'Đáp án đúng': q.correct_answers.join(','),
        'Điểm': q.points,
        'Giải thích': q.explanation || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NganHangCauHoi');
    XLSX.writeFile(wb, 'OfficeAI_NganHangCauHoi.xlsx');
    setStatusMessage('Xuất danh sách câu hỏi ra Excel thành công.');
    DatabaseService.playSuccessSound();
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    const sampleRows = [
      {
        'Mã câu hỏi': 'EX01',
        'Chủ đề': 'Kỹ năng Excel',
        'Độ khó': 'easy',
        'Dạng câu hỏi': 'single_choice',
        'Nội dung': 'Hàm nào sau đây dùng để tính tổng các ô trong Excel?',
        'Đáp án A': 'AVERAGE',
        'Đáp án B': 'SUM',
        'Đáp án C': 'COUNT',
        'Đáp án D': 'MAX',
        'Đáp án đúng': 'B',
        'Điểm': 5,
        'Giải thích': 'Hàm SUM dùng để tính tổng.',
      },
      {
        'Mã câu hỏi': 'EX02',
        'Chủ đề': 'Kỹ năng Excel',
        'Độ khó': 'medium',
        'Dạng câu hỏi': 'multiple_choice',
        'Nội dung': 'Những hàm nào sau đây có thể dò tìm dữ liệu?',
        'Đáp án A': 'XLOOKUP',
        'Đáp án B': 'INDEX MATCH',
        'Đáp án C': 'COUNTIF',
        'Đáp án D': 'VLOOKUP',
        'Đáp án đúng': 'A,B,D',
        'Điểm': 5,
        'Giải thích': 'XLOOKUP, INDEX MATCH, VLOOKUP đều là các hàm dò tìm.',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Cau_Hoi');
    XLSX.writeFile(wb, 'Mau_Nhap_Cau_Hoi_OfficeAI.xlsx');
    setStatusMessage('Đã tải tệp Excel mẫu để nhập câu hỏi.');
  };

  // Import from Excel file
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        const newParsedQuestions: Question[] = rawJson.map((row, idx) => {
          const correctRaw = String(row['Đáp án đúng'] || 'A');
          const correctArr = correctRaw.split(',').map((s) => s.trim().toUpperCase());

          const opts: QuestionOption[] = [
            { key: 'A', text: String(row['Đáp án A'] || ''), is_correct: correctArr.includes('A') },
            { key: 'B', text: String(row['Đáp án B'] || ''), is_correct: correctArr.includes('B') },
            { key: 'C', text: String(row['Đáp án C'] || ''), is_correct: correctArr.includes('C') },
            { key: 'D', text: String(row['Đáp án D'] || ''), is_correct: correctArr.includes('D') },
          ];

          return {
            id: `q-imp-${Date.now()}-${idx}`,
            code: String(row['Mã câu hỏi'] || `Q-IMP-${idx + 1}`),
            topic: String(row['Chủ đề'] || 'Chung'),
            difficulty: (['easy', 'medium', 'hard'].includes(row['Độ khó']) ? row['Độ khó'] : 'medium') as DifficultyLevel,
            question_type: (['single_choice', 'multiple_choice', 'true_false'].includes(row['Dạng câu hỏi']) ? row['Dạng câu hỏi'] : 'single_choice') as QuestionType,
            content: String(row['Nội dung'] || 'Nội dung câu hỏi'),
            options: opts,
            correct_answers: correctArr,
            points: Number(row['Điểm']) || 5,
            explanation: String(row['Giải thích'] || ''),
            created_at: new Date().toISOString(),
          };
        });

        const count = DatabaseService.importQuestions(newParsedQuestions);
        setQuestions(DatabaseService.getQuestions());
        setStatusMessage(`Đã nhập thành công ${count} câu hỏi từ tệp Excel.`);
        DatabaseService.playSuccessSound();
      } catch (err) {
        setStatusMessage('Lỗi cấu trúc file Excel nhập câu hỏi.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.code.toLowerCase().includes(search.toLowerCase());
    const matchTopic = filterTopic === 'all' || q.topic === filterTopic;
    const matchDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchSearch && matchTopic && matchDifficulty;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" /> Ngân hàng câu hỏi trắc nghiệm
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Quản trị & Phân loại câu hỏi khảo thí
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Hỗ trợ câu hỏi một đáp án, nhiều đáp án, đúng/sai, nhập/xuất bảng tính Excel và sinh câu hỏi bằng AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSampleExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Tải file mẫu Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" /> Nhập từ Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm câu hỏi
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

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã câu hỏi hoặc từ khóa nội dung..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="all">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
      </div>

      {/* Question List Cards */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-3 hover:border-blue-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                  {q.code}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {q.topic}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    q.difficulty === 'easy'
                      ? 'bg-emerald-100 text-emerald-700'
                      : q.difficulty === 'hard'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {q.difficulty}
                </span>
                <span className="text-[11px] text-slate-400">
                  • {q.question_type === 'multiple_choice' ? 'Nhiều đáp án' : '1 đáp án'} • {q.points} điểm
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(q)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Nhân bản"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              {q.content}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {q.options.map((opt) => (
                <div
                  key={opt.key}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    opt.is_correct
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 font-semibold text-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-750 border-slate-200/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    opt.is_correct ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {opt.key}
                  </span>
                  <span>{opt.text}</span>
                  {opt.is_correct && <span className="text-[10px] ml-auto text-emerald-600 font-bold">✓ Đúng</span>}
                </div>
              ))}
            </div>

            {q.explanation && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-750 rounded-xl text-[11px] text-slate-500 border border-slate-100 dark:border-slate-700">
                <strong>💡 Giải thích:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Question */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo mới câu hỏi khảo thí'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã câu hỏi:</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chủ đề:</label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Điểm số:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dạng câu hỏi:</label>
                  <select
                    value={formData.question_type}
                    onChange={(e) => setFormData({ ...formData, question_type: e.target.value as QuestionType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="single_choice">Một đáp án đúng (Radio)</option>
                    <option value="multiple_choice">Nhiều đáp án đúng (Checkbox)</option>
                    <option value="true_false">Đúng / Sai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Độ khó:</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung câu hỏi:</label>
                <textarea
                  required
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung đề bài câu hỏi..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Options list */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Các phương án và chọn đáp án ĐÚNG:
                </label>
                {formData.options.map((opt, i) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <input
                      type={formData.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                      name="correct_choice"
                      checked={opt.is_correct}
                      onChange={() => {
                        const updated = formData.options.map((o, idx) => {
                          if (formData.question_type === 'multiple_choice') {
                            return idx === i ? { ...o, is_correct: !o.is_correct } : o;
                          }
                          return { ...o, is_correct: idx === i };
                        });
                        setFormData({ ...formData, options: updated });
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-bold w-5">{opt.key}:</span>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...formData.options];
                        updated[i].text = e.target.value;
                        setFormData({ ...formData, options: updated });
                      }}
                      placeholder={`Nội dung phương án ${opt.key}...`}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lời giải thích chi tiết:</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Giải thích vì sao đáp án này đúng để thí sinh xem sau khi thi..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
