import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Award,
  Users,
  Check,
  Building,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { ExamAttempt, Department, Employee } from '../types';
import { DatabaseService } from '../services/storage';

export const ResultsAndReports: React.FC = () => {
  const [attempts] = useState<ExamAttempt[]>(DatabaseService.getAttempts());
  const [departments] = useState<Department[]>(DatabaseService.getDepartments());
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');

  const stats = DatabaseService.getStats();

  const filteredAttempts = attempts.filter((a) => {
    const matchSearch =
      a.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      a.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      a.exam_title.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || a.department_name.includes(filterDept);
    const matchResult =
      filterResult === 'all' ||
      (filterResult === 'passed' && a.is_passed) ||
      (filterResult === 'failed' && !a.is_passed);
    return matchSearch && matchDept && matchResult;
  });

  // Export Score Table to Excel
  const handleExportExcel = () => {
    const rows = filteredAttempts.map((a, idx) => ({
      STT: idx + 1,
      'Mã NV': a.employee_code,
      'Họ và tên': a.employee_name,
      'Phòng ban': a.department_name,
      'Bài kiểm tra': a.exam_title,
      'Thời gian nộp': new Date(a.submitted_at).toLocaleString('vi-VN'),
      'Thời gian làm (giây)': a.time_spent_seconds,
      'Số câu đúng': a.correct_count,
      'Tổng điểm': a.total_score,
      'Điểm tối đa': a.max_score,
      'Tỷ lệ %': `${a.score_percentage}%`,
      'Kết quả': a.is_passed ? 'ĐẠT' : 'KHÔNG ĐẠT',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');
    XLSX.writeFile(wb, `Bao_Cao_Khao_Thi_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setStatusMessage('Xuất bảng điểm ra file Excel thành công.');
    DatabaseService.playSuccessSound();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Báo cáo & Thống kê kết quả đào tạo
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Kết quả khảo thí & Đánh giá nhân sự
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Theo dõi chi tiết lịch sử từng lượt thi, tỷ lệ đạt theo phòng ban và xuất báo cáo bảng điểm tổng hợp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> In báo cáo
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Xuất bảng điểm Excel
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* 4 Stats Metrics Cards (matching UI screen 16) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tổng lượt thi</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalAttempts || 320}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ Tăng 12% so với tháng trước</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tỷ lệ đạt chuẩn</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats.completionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ngưỡng đạt tiêu chuẩn từ 70% trở lên</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Điểm trung bình</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {stats.averageScore} / 100
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Trên toàn bộ các bài kiểm tra</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Chưa hoàn thành</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {stats.failedCount || 2} nhân sự
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Cần hoàn thành trước hạn</div>
        </div>
      </div>

      {/* Visual Charts: Department comparison & Pass/Fail donut (matching UI screen 16) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Average Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Kết quả điểm trung bình theo phòng ban
            </h3>
            <span className="text-xs text-slate-400">Thang điểm 100</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { dept: 'Phòng Kế toán', score: 85.5, count: '3 nhân sự', color: 'bg-blue-600' },
              { dept: 'Phòng Nhân sự', score: 82.0, count: '3 nhân sự', color: 'bg-indigo-600' },
              { dept: 'Phòng Công nghệ TT (IT)', score: 92.5, count: '2 nhân sự', color: 'bg-emerald-600' },
              { dept: 'Phòng Kinh doanh', score: 76.8, count: '2 nhân sự', color: 'bg-amber-600' },
            ].map((d) => (
              <div key={d.dept} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
                  <span>{d.dept} ({d.count})</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{d.score} / 100</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div className={`${d.color} h-3 rounded-full transition-all duration-700`} style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pass / Fail Rate Donut Visual */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tỷ lệ Đạt / Không đạt
              </h3>
            </div>

            <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-rose-100 dark:text-rose-950/40"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${stats.completionRate}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-black text-slate-900 dark:text-white">{stats.completionRate}%</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">ĐẠT</div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Đạt chuẩn:
                </span>
                <strong className="text-emerald-600 font-mono">{stats.passedCount || 275} lượt</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" /> Chưa đạt:
                </span>
                <strong className="text-rose-600 font-mono">{stats.failedCount || 45} lượt</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên nhân viên, mã NV hoặc đề thi..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-750 border-none rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-750 border-none rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-750 border-none rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Tất cả kết quả</option>
              <option value="passed">Đạt</option>
              <option value="failed">Không đạt</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Mã NV</th>
                <th className="p-3.5">Họ và tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5">Bài kiểm tra</th>
                <th className="p-3.5">Thời gian nộp</th>
                <th className="p-3.5 text-center">Điểm số</th>
                <th className="p-3.5 text-center">Tỷ lệ</th>
                <th className="p-3.5 text-center">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
              {filteredAttempts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{a.employee_code}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{a.employee_name}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{a.department_name}</td>
                  <td className="p-3.5 text-slate-800 dark:text-slate-200">{a.exam_title}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {new Date(a.submitted_at).toLocaleDateString('vi-VN')} {new Date(a.submitted_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {a.total_score} / {a.max_score}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-blue-600">
                    {a.score_percentage}%
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.is_passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {a.is_passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{a.is_passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
