import React, { useState } from 'react';
import { History, Search, Filter, Shield, Clock, RotateCcw } from 'lucide-react';
import { DatabaseService } from '../services/storage';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState(DatabaseService.getLogs());
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const modules = Array.from(new Set(logs.map((l) => l.module)));

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu?')) {
      DatabaseService.resetAll();
      setLogs(DatabaseService.getLogs());
      window.location.reload();
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchMod = filterModule === 'all' || l.module === filterModule;
    return matchSearch && matchMod;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" /> Giám sát & Nhật ký bảo mật
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Nhật ký hoạt động hệ thống (Audit Logs)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Ghi nhận toàn bộ thao tác đăng nhập, nộp bài kiểm tra, tạo câu hỏi và xuất bảng điểm theo thời gian thực.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          title="Đặt lại toàn bộ dữ liệu demo"
        >
          <RotateCcw className="w-4 h-4" /> Khôi phục dữ liệu mẫu ban đầu
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nhân viên, hành động hoặc chi tiết..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 w-full md:w-auto"
        >
          <option value="all">Tất cả phân hệ</option>
          {modules.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Thời gian</th>
                <th className="p-3.5">Nhân sự thực hiện</th>
                <th className="p-3.5">Phân hệ</th>
                <th className="p-3.5">Hành động</th>
                <th className="p-3.5">Chi tiết thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {log.employee_name}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {log.details}
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
