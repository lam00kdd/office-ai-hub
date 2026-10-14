import React, { useState } from 'react';
import {
  Zap,
  Wrench,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  Layers,
  Cpu,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { DatabaseService } from '../services/storage';

export const WireHarnessTools: React.FC = () => {
  const standards = DatabaseService.getCrimpStandards();
  const [selectedStandard, setSelectedStandard] = useState(standards[0]);
  
  // Real measurement test state
  const [actualCH, setActualCH] = useState(selectedStandard.crimp_height_min + 0.03);
  const [actualPull, setActualPull] = useState(selectedStandard.pull_force_min + 15);
  
  // Wire Color Search state
  const [colorSearch, setColorSearch] = useState('');

  // Wire Gauge Table
  const wireGaugeTable = [
    { awg: 'AWG 28', sqmm: '0.08 mm²', strands: '7 x 0.127 mm', maxAmp: '0.8 A', app: 'Dây tín hiệu vi mạch, cảm biến PCB' },
    { awg: 'AWG 26', sqmm: '0.13 mm²', strands: '7 x 0.16 mm', maxAmp: '1.5 A', app: 'Cáp điều khiển giắc cắm JST/Molex' },
    { awg: 'AWG 24', sqmm: '0.22 mm²', strands: '7 x 0.20 mm', maxAmp: '2.5 A', app: 'Dây cảm biến tốc độ ABS, túi khí' },
    { awg: 'AVSS 0.3', sqmm: '0.35 mm²', strands: '7 x 0.26 mm', maxAmp: '5.0 A', app: 'Cụm dây đèn táp-lô, công tắc cửa' },
    { awg: 'AVSS 0.5', sqmm: '0.56 mm²', strands: '7 x 0.32 mm', maxAmp: '9.0 A', app: 'Dây đèn pha xe máy, còi ô tô' },
    { awg: 'AVSS 0.85', sqmm: '0.88 mm²', strands: '19 x 0.24 mm', maxAmp: '14.0 A', app: 'Bơm xăng, quạt gió làm mát két nước' },
    { awg: 'AVS 1.25', sqmm: '1.29 mm²', strands: '19 x 0.29 mm', maxAmp: '18.0 A', app: 'Mô-tơ gạt mưa, khóa cửa trung tâm' },
    { awg: 'AVS 2.0', sqmm: '2.09 mm²', strands: '37 x 0.26 mm', maxAmp: '25.0 A', app: 'Dây sấy kính sau, nguồn rơ-le chính' },
    { awg: 'AV 3.0', sqmm: '3.30 mm²', strands: '41 x 0.32 mm', maxAmp: '35.0 A', app: 'Dây nguồn máy phát điện Dynamo' },
    { awg: 'AV 5.0', sqmm: '5.26 mm²', strands: '65 x 0.32 mm', maxAmp: '50.0 A', app: 'Cáp ắc-quy khởi động động cơ đề' },
  ];

  // Wire Color Dictionary (JASO D 611 / JIS C 3406 / SAE)
  const wireColors = [
    { code: 'B', name: 'Black (Đen)', bg: '#000000', text: '#ffffff', desc: 'Dây nối đất (GND), mát sườn xe' },
    { code: 'W', name: 'White (Trắng)', bg: '#ffffff', text: '#000000', border: true, desc: 'Dây nguồn dương thường trực (+BAT)' },
    { code: 'R', name: 'Red (Đỏ)', bg: '#dc2626', text: '#ffffff', desc: 'Dây nguồn qua khóa điện (IGNITION / +12V)' },
    { code: 'G', name: 'Green (Xanh lá cây)', bg: '#16a34a', text: '#ffffff', desc: 'Dây tín hiệu đèn xi-nhan, công tắc' },
    { code: 'Y', name: 'Yellow (Vàng)', bg: '#eab308', text: '#000000', desc: 'Dây đèn sương mù, cảm biến phanh' },
    { code: 'L', name: 'Blue (Xanh dương)', bg: '#2563eb', text: '#ffffff', desc: 'Dây đèn chiếu xa (Pha), quạt làm mát' },
    { code: 'Br', name: 'Brown (Nâu)', bg: '#78350f', text: '#ffffff', desc: 'Dây còi xe, đèn phanh dừng' },
    { code: 'Gr', name: 'Gray (Xám)', bg: '#6b7280', text: '#ffffff', desc: 'Dây cảm biến oxy, chiếu sáng nền đồng hồ' },
    { code: 'O', name: 'Orange (Cam)', bg: '#ea580c', text: '#ffffff', desc: 'Dây điện áp cao, xe hybrid/EV' },
    { code: 'P', name: 'Pink (Hồng)', bg: '#ec4899', text: '#ffffff', desc: 'Dây tín hiệu âm thanh loa, audio' },
    { code: 'V', name: 'Violet (Tím)', bg: '#7c3aed', text: '#ffffff', desc: 'Dây mạng truyền thông CAN-Bus H' },
    { code: 'Sb', name: 'Sky Blue (Xanh da trời)', bg: '#38bdf8', text: '#000000', desc: 'Dây cảm biến nhiệt độ nước' },
    { code: 'W-B', name: 'White/Black (Trắng sọc đen)', bg: 'linear-gradient(90deg, #ffffff 60%, #000000 60%)', text: '#000000', border: true, desc: 'Nguồn mass cảm biến chuyên dụng' },
    { code: 'B-W', name: 'Black/White (Đen sọc trắng)', bg: 'linear-gradient(90deg, #000000 60%, #ffffff 60%)', text: '#ffffff', desc: 'Dây dập lửa bugi, đánh lửa CDI' },
    { code: 'G-Y', name: 'Green/Yellow (Xanh sọc vàng)', bg: 'linear-gradient(90deg, #16a34a 60%, #eab308 60%)', text: '#ffffff', desc: 'Dây tiếp địa an toàn quốc tế' },
    { code: 'R-Y', name: 'Red/Yellow (Đỏ sọc vàng)', bg: 'linear-gradient(90deg, #dc2626 60%, #eab308 60%)', text: '#ffffff', desc: 'Nguồn đèn chiếu sáng ban ngày DRL' },
  ];

  // Crimp verification calculation
  const isChPass = actualCH >= selectedStandard.crimp_height_min && actualCH <= selectedStandard.crimp_height_max;
  const isPullPass = actualPull >= selectedStandard.pull_force_min;
  const isOverallPass = isChPass && isPullPass;

  // Filtered colors
  const filteredColors = wireColors.filter(c =>
    c.code.toLowerCase().includes(colorSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
    c.desc.toLowerCase().includes(colorSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Wire Harness & Electrical Engineering Tools
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Công cụ Kỹ thuật Bộ Dây Dẫn & Linh Kiện Điện Tử
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Bộ công cụ trợ thủ đắc lực cho Kỹ sư PE, QA và Công nhân xưởng dập: Tra cứu thông số dập cos Crimp Height, kiểm tra lực kéo tuột cốt, bảng mã màu dây xe hơi và quy đổi tiết diện AWG.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: CRIMP HEIGHT & PULL-FORCE VALIDATOR */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Máy tính Kiểm định Thông số Dập Đầu Cos (Crimping Calculator)
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm tra chiều cao dập cốt (Crimp Height) và lực kéo đứt (Pull-Force) theo chuẩn IPC/WHMA-A-620.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-xl">
            Tiêu chuẩn JIS / SAE / USCAR-21
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls: Select Terminal */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn loại đầu cos (Terminal Code):
              </label>
              <select
                value={selectedStandard.id}
                onChange={e => {
                  const std = standards.find(s => s.id === e.target.value) || standards[0];
                  setSelectedStandard(std);
                  setActualCH(Number(((std.crimp_height_min + std.crimp_height_max) / 2).toFixed(3)));
                  setActualPull(std.pull_force_min + 15);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-blue-600"
              >
                {standards.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.terminal_code} - {s.terminal_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">Thông số kỹ thuật tiêu chuẩn quy định:</div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Cỡ cáp điện áp dụng:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedStandard.wire_size}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Chiều cao cốt quy chuẩn (CH):</span>
                <span className="font-bold text-blue-600 font-mono">
                  {selectedStandard.crimp_height_min.toFixed(2)} ~ {selectedStandard.crimp_height_max.toFixed(2)} mm
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Chiều rộng dập cốt (CW):</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedStandard.crimp_width_nom.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Lực kéo tuột tối thiểu:</span>
                <span className="font-bold text-emerald-600 font-mono">≥ {selectedStandard.pull_force_min} Newton (N)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Khuôn dập Applicator Die:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{selectedStandard.applicator_die_code}</span>
              </div>
            </div>
          </div>

          {/* Test & Result Verdict */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 space-y-4">
              <div className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                Nhập số đo thực tế đo bằng Panme (Micrometer) & Máy kéo lực:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chiều cao dập cốt đo được (CH - mm):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.005"
                      value={actualCH}
                      onChange={e => setActualCH(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-bold font-mono focus:outline-none ${
                        isChPass
                          ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800'
                          : 'border-rose-400 bg-rose-50/50 text-rose-800'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">mm</span>
                  </div>
                  <div className="text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    {isChPass ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng dung sai (±0.03mm)
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Lệch kích thước cho phép!
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lực kéo đo được (Pull Force - N):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={actualPull}
                      onChange={e => setActualPull(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-bold font-mono focus:outline-none ${
                        isPullPass
                          ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800'
                          : 'border-rose-400 bg-rose-50/50 text-rose-800'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">N</span>
                  </div>
                  <div className="text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    {isPullPass ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đạt lực kéo giữ cốt
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Yếu lực, nguy cơ tuột dây!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Huge Result Banner */}
              <div className={`p-4 rounded-2xl flex items-center justify-between text-white ${
                isOverallPass
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-md shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-600 to-red-700 shadow-md shadow-rose-500/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-2xl">
                    {isOverallPass ? '✓' : '✗'}
                  </div>
                  <div>
                    <div className="text-xs uppercase font-extrabold tracking-wider opacity-90">KẾT LUẬN KIỂM ĐỊNH ĐẦU CA:</div>
                    <div className="text-xl font-black">
                      {isOverallPass ? 'ĐẠT TIÊU CHUẨN (PASS - OK)' : 'KHÔNG ĐẠT (NG - REJECT / REWORK)'}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs opacity-90 hidden sm:block font-medium">
                  {isOverallPass
                    ? 'Đủ điều kiện bấm nút chạy chuyền dập hàng loạt'
                    : 'Phải dừng máy và báo Kỹ thuật PE chỉnh lại đĩa cối'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BẢNG MÃ MÀU DÂY ĐIỆN CÔNG NGHIỆP (AUTOMOTIVE WIRE COLORS) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Bảng Tra Mã Màu Dây Điện Ô Tô & Xe Máy (JASO D 611 / JIS C 3406)
            </h3>
            <p className="text-xs text-slate-500">
              Tra cứu nhanh ký hiệu màu dây đơn sắc & dây sọc đôi (Two-color stripe) phục vụ cắm giắc Poka-Yoke.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={colorSearch}
              onChange={e => setColorSearch(e.target.value)}
              placeholder="Tìm mã màu: W-B, Red, Mass..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredColors.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl shrink-0 shadow-inner"
                  style={{
                    background: c.bg,
                    border: c.border ? '1px solid #cbd5e1' : 'none',
                  }}
                />
                <div className="min-w-0">
                  <div className="font-mono font-black text-sm text-slate-900 dark:text-white">{c.code}</div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">{c.name}</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: BẢNG QUY ĐỔI TIẾT DIỆN DÂY & DÒNG TẢI (AWG / SQMM / CURRENT) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Bảng Quy Đổi Cỡ Dây AWG / mm² & Dòng Điện Định Mức Tối Đa
          </h3>
          <p className="text-xs text-slate-500">
            Dữ liệu kỹ thuật lựa chọn dây điện theo tiêu chuẩn Nhật Bản (JIS) và Quốc tế (SAE).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 text-slate-500 font-semibold border-b">
                <th className="py-2.5 px-3">Cỡ dây (Ký hiệu)</th>
                <th className="py-2.5 px-3">Tiết diện lõi đồng</th>
                <th className="py-2.5 px-3">Cấu trúc sợi đồng</th>
                <th className="py-2.5 px-3">Dòng tải tối đa (Amps)</th>
                <th className="py-2.5 px-3">Ứng dụng tiêu biểu trên xe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {wireGaugeTable.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{w.awg}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{w.sqmm}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{w.strands}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{w.maxAmp}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{w.app}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
