import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Download,
  RotateCcw,
  BarChart2,
  Plus,
  FileCheck,
  Calculator,
  Layers,
  Split,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { DatabaseService } from '../services/storage';

interface SheetData {
  name: string;
  rows: any[][];
}

export const ExcelTools: React.FC = () => {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState<number>(0);
  const [originalRows, setOriginalRows] = useState<any[][]>([]);
  const [currentRows, setCurrentRows] = useState<any[][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumnIdx, setSelectedColumnIdx] = useState<number>(0);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fileName, setFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [stats, setStats] = useState<{
    sum: number;
    avg: number;
    min: number;
    max: number;
    count: number;
    blankCount: number;
  } | null>(null);
  const [showChart, setShowChart] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample employee data directly
  const loadSampleExcel = () => {
    const sampleHeaders = ['STT', 'Mã NV', 'Họ tên', 'Phòng ban', 'Chức vụ', 'Ngày vào làm', 'Lương cơ bản (VNĐ)'];
    const sampleData = [
      [1, 'NV001', 'Nguyễn Hoàng Lâm', 'Kế toán', 'Tổng Quản trị (Admin)', '10/01/2022', 25000000],
      [2, 'NV002', 'Trần Thị Bình', 'Nhân sự', 'Trưởng phòng', '15/03/2021', 22000000],
      [3, 'NV003', 'Lê Văn Công', 'Kinh doanh', 'Chuyên viên', '20/07/2022', 15000000],
      [4, 'NV004', 'Phạm Thị Dung', 'Kinh doanh', 'Trưởng phòng', '01/02/2020', 28000000],
      [5, 'NV005', 'Hoàng Minh Đức', 'IT', 'Kỹ sư trưởng', '11/11/2021', 30000000],
      [6, 'NV006', 'Vũ Thị Hoa', 'Kế toán', 'Kế toán viên', '05/04/2023', 12000000],
      [7, 'NV007', 'Đặng Quốc Khánh', 'Nhân sự', 'Chuyên viên', '18/08/2023', 14000000],
      [8, 'NV008', 'Bùi Thị Lan', 'Kế toán', 'Kế toán thanh toán', '22/09/2023', 13500000],
      [9, 'NV009', 'Đỗ Tiến Mạnh', 'IT', 'Chuyên viên An ninh', '12/10/2023', 19000000],
      [10, 'NV010', 'Mai Phương Nga', 'Nhân sự', 'Chuyên viên Đào tạo', '01/12/2023', 14500000],
    ];
    const full = [sampleHeaders, ...sampleData];
    setFileName('Danh_sach_nhan_vien_mau.xlsx');
    setSheets([{ name: 'Sheet1', rows: full }]);
    setActiveSheetIdx(0);
    setOriginalRows(full);
    setCurrentRows(full);
    setStatusMessage('Đã tải thành công tệp Excel mẫu danh sách nhân sự.');
    calculateStats(full, 6); // default stats on salary
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const loadedSheets: SheetData[] = wb.SheetNames.map((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          return { name: sheetName, rows: data };
        });

        if (loadedSheets.length > 0) {
          setSheets(loadedSheets);
          setActiveSheetIdx(0);
          setOriginalRows(loadedSheets[0].rows);
          setCurrentRows(loadedSheets[0].rows);
          setStatusMessage(`Tải tệp "${file.name}" thành công với ${loadedSheets.length} sheet.`);
          DatabaseService.playSuccessSound();
        }
      } catch (err) {
        setStatusMessage('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSheetChange = (idx: number) => {
    setActiveSheetIdx(idx);
    setOriginalRows(sheets[idx].rows);
    setCurrentRows(sheets[idx].rows);
    setStats(null);
  };

  // Sort rows based on selected column
  const handleSort = () => {
    if (currentRows.length <= 1) return;
    const headers = currentRows[0];
    const body = [...currentRows.slice(1)];

    const newDir = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDir);

    body.sort((a, b) => {
      const valA = a[selectedColumnIdx] ?? '';
      const valB = b[selectedColumnIdx] ?? '';
      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        return newDir === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
      return newDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    setCurrentRows([headers, ...body]);
    setStatusMessage(`Đã sắp xếp cột "${headers[selectedColumnIdx]}" theo thứ tự ${newDir === 'asc' ? 'tăng dần' : 'giảm dần'}.`);
  };

  // Remove duplicate rows
  const handleRemoveDuplicates = () => {
    if (currentRows.length <= 1) return;
    const headers = currentRows[0];
    const body = currentRows.slice(1);
    const seen = new Set<string>();
    const uniqueBody: any[][] = [];

    for (const row of body) {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBody.push(row);
      }
    }

    const removedCount = body.length - uniqueBody.length;
    setCurrentRows([headers, ...uniqueBody]);
    setStatusMessage(`Đã xóa ${removedCount} dòng trùng lặp thành công.`);
    DatabaseService.playSuccessSound();
  };

  // Calculate statistics for selected numeric column
  const calculateStats = (rowsToAnalyze = currentRows, colIdx = selectedColumnIdx) => {
    if (rowsToAnalyze.length <= 1) return;
    const body = rowsToAnalyze.slice(1);
    let sum = 0;
    let numericCount = 0;
    let min = Infinity;
    let max = -Infinity;
    let blankCount = 0;

    for (const row of body) {
      const val = row[colIdx];
      if (val === undefined || val === null || val === '') {
        blankCount++;
        continue;
      }
      const num = Number(val);
      if (!isNaN(num)) {
        sum += num;
        numericCount++;
        if (num < min) min = num;
        if (num > max) max = num;
      }
    }

    if (numericCount > 0) {
      setStats({
        sum,
        avg: Number((sum / numericCount).toFixed(2)),
        min: min === Infinity ? 0 : min,
        max: max === -Infinity ? 0 : max,
        count: numericCount,
        blankCount,
      });
    } else {
      setStats({
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        count: 0,
        blankCount,
      });
    }
  };

  // Reset to original data
  const handleReset = () => {
    setCurrentRows(originalRows);
    setSearchQuery('');
    setStats(null);
    setStatusMessage('Đã hoàn tác và khôi phục dữ liệu ban đầu.');
  };

  // Export processed data to XLSX
  const handleExportXLSX = () => {
    if (currentRows.length === 0) return;
    const ws = XLSX.utils.aoa_to_sheet(currentRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheets[activeSheetIdx]?.name || 'Processed');
    XLSX.writeFile(wb, fileName ? `Da_xu_ly_${fileName}` : 'OfficeAI_Excel_Export.xlsx');
    setStatusMessage('Xuất file Excel thành công.');
    DatabaseService.playSuccessSound();
  };

  // Export processed data to CSV
  const handleExportCSV = () => {
    if (currentRows.length === 0) return;
    const ws = XLSX.utils.aoa_to_sheet(currentRows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OfficeAI_Export.csv';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Xuất file CSV thành công.');
    DatabaseService.playSuccessSound();
  };

  // Filter rows by search query
  const displayedRows = currentRows.filter((row, idx) => {
    if (idx === 0) return true; // keep header
    if (!searchQuery.trim()) return true;
    return row.some((cell) => String(cell || '').toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const headers = currentRows[0] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" /> Phân hệ xử lý bảng tính
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Công cụ xử lý Excel chuyên sâu
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Xem trước dữ liệu, lọc, xóa dòng trùng, tính tổng, thống kê cột và xuất file XLSX/CSV chuẩn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSampleExcel}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <FileCheck className="w-4 h-4" /> Tải file mẫu thực hành
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" /> Tải file Excel / CSV
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace */}
      {currentRows.length === 0 ? (
        /* Empty State Dropzone (matching UI screen 3) */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-12 text-center bg-white dark:bg-slate-800 transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Kéo thả file Excel hoặc CSV vào đây
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 50MB, xử lý hoàn toàn an toàn trên máy)
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-lg font-medium">
              Hoặc bấm nút "Tải file mẫu thực hành" phía trên
            </span>
          </div>
        </div>
      ) : (
        /* Data Processing View (matching UI screen 4) */
        <div className="space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> {statusMessage}
              </span>
              <button onClick={() => setStatusMessage('')} className="text-emerald-700 font-bold">✕</button>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Sheet Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Sheet:
              </span>
              {sheets.map((s, idx) => (
                <button
                  key={s.name}
                  onClick={() => handleSheetChange(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeSheetIdx === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSort}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                title="Sắp xếp cột đang chọn"
              >
                <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp ({sortDirection === 'asc' ? 'A→Z' : 'Z→A'})
              </button>
              <button
                onClick={handleRemoveDuplicates}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
                title="Xóa các dòng trùng lặp hoàn toàn"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa dòng trùng
              </button>
              <button
                onClick={() => calculateStats()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" /> Thống kê cột
              </button>
              <button
                onClick={() => setShowChart(!showChart)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5" /> {showChart ? 'Ẩn biểu đồ' : 'Xem biểu đồ'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                title="Khôi phục nguyên bản"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
              </button>
              <button
                onClick={handleExportXLSX}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải xuống Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Search & Column Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm giá trị trong bảng dữ liệu..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Chọn cột thống kê:</span>
              <select
                value={selectedColumnIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedColumnIdx(idx);
                  calculateStats(currentRows, idx);
                }}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {headers.map((h: any, idx: number) => (
                  <option key={idx} value={idx}>
                    {h || `Cột ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistics Box */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs animate-in fade-in duration-150">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Tổng giá trị (SUM)</div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {stats.sum.toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Trung bình (AVERAGE)</div>
                <div className="text-sm font-bold text-blue-600 font-mono">
                  {stats.avg.toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Nhỏ nhất (MIN)</div>
                <div className="text-sm font-bold text-amber-600 font-mono">
                  {stats.min.toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Lớn nhất (MAX)</div>
                <div className="text-sm font-bold text-purple-600 font-mono">
                  {stats.max.toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Số ô chứa số (COUNT)</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {stats.count} dòng
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Số ô trống</div>
                <div className="text-sm font-bold text-rose-600 font-mono">
                  {stats.blankCount} ô
                </div>
              </div>
            </div>
          )}

          {/* Simple Dynamic Bar Visualizer */}
          {showChart && stats && (
            <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" /> Biểu đồ phân bổ dữ liệu: {headers[selectedColumnIdx]}
                </h4>
                <span className="text-[10px] text-slate-400">Tỷ lệ theo giá trị lớn nhất ({stats.max.toLocaleString('vi-VN')})</span>
              </div>
              <div className="space-y-2 pt-2">
                {currentRows.slice(1, 11).map((r, i) => {
                  const val = Number(r[selectedColumnIdx]) || 0;
                  const label = r[2] || r[1] || `Dòng ${i + 1}`;
                  const pct = stats.max > 0 ? Math.min(100, Math.round((val / stats.max) * 100)) : 0;
                  return (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-medium truncate max-w-xs">{label}</span>
                        <span className="font-mono font-bold">{val.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[520px] scrollbar-thin">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {headers.map((h: any, i: number) => (
                      <th
                        key={i}
                        onClick={() => {
                          setSelectedColumnIdx(i);
                          calculateStats(currentRows, i);
                        }}
                        className={`p-3 whitespace-nowrap cursor-pointer transition-colors ${
                          selectedColumnIdx === i
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{h || `Cột ${i + 1}`}</span>
                          {selectedColumnIdx === i && <ArrowUpDown className="w-3 h-3 text-emerald-600" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                  {displayedRows.slice(1).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      {row.map((cell: any, cIdx: number) => (
                        <td
                          key={cIdx}
                          className={`p-3 whitespace-nowrap font-sans ${
                            selectedColumnIdx === cIdx
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/10 font-semibold text-slate-900 dark:text-white'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cell !== undefined && cell !== null && cell !== '' ? String(cell) : (
                            <span className="text-slate-300 italic">--</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
              <div>
                Hiển thị <strong>{displayedRows.length - 1}</strong> / {currentRows.length - 1} dòng dữ liệu
              </div>
              <div className="text-[11px]">
                Tệp: <strong className="text-slate-700 dark:text-slate-300">{fileName}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
