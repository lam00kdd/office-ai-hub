import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Boxes,
  Plus,
  Download,
  Search,
  Filter,
  BarChart3,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Zap,
  Wrench,
  Truck,
  Check,
  AlertCircle
} from 'lucide-react';
import { QualityRecord, WarehouseRecord, QualityInspectionStage, InspectionStatus } from '../types';
import { DatabaseService } from '../services/storage';

export const ManufacturingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quality' | 'warehouse' | 'andon'>('quality');
  const [qualityRecords, setQualityRecords] = useState<QualityRecord[]>(DatabaseService.getQualityRecords());
  const [warehouseRecords, setWarehouseRecords] = useState<WarehouseRecord[]>(DatabaseService.getWarehouseRecords());
  
  // Filters for Quality
  const [stageFilter, setStageFilter] = useState<'all' | QualityInspectionStage>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for new Quality Record
  const [showQcModal, setShowQcModal] = useState(false);
  const [qcForm, setQcForm] = useState({
    code: `QC-${Date.now().toString().slice(-6)}`,
    stage: 'inprocess' as QualityInspectionStage,
    part_number: 'WIRE-AVSS-0.5-WB',
    part_name: 'Cuộn cáp điện mỏng AVSS 0.5sq',
    lot_number: 'LOT-2026-M01',
    line_name: 'Chuyền Cắt Dập 1',
    sample_size: 10,
    defect_count: 0,
    status: 'pass' as InspectionStatus,
    defect_notes: '',
    param1_name: 'Chiều cao dập cốt (Crimp Height)',
    param1_std: '0.98 ± 0.03 mm',
    param1_act: '0.985 mm',
    param2_name: 'Lực kéo tuột cốt (Pull-Force)',
    param2_std: '≥ 60 N',
    param2_act: '85 N',
  });

  // Modal for new Warehouse Record
  const [showWhModal, setShowWhModal] = useState(false);
  const [whForm, setWhForm] = useState({
    code: `NK-${Date.now().toString().slice(-5)}`,
    type: 'inbound' as 'inbound' | 'outbound' | 'line_feed',
    part_number: 'TERM-AMP-173850-1',
    part_name: 'Đầu cos đực 090 Sealed Terminal',
    category: 'component' as const,
    quantity: 5000,
    unit: 'cái' as const,
    location: 'Kệ B-02',
    sender_receiver: 'Kho Nguyên Liệu -> Chuyền Dập',
    lot_number: 'LOT-TERM-2603',
    notes: 'Cấp phát cho kế hoạch ca ngày',
  });

  // Live Andon state
  const [andonStatus, setAndonStatus] = useState<Record<string, { status: 'running' | 'warning' | 'stopped'; issue?: string }>>({
    'Line C1 (Cắt dập tự động Komax)': { status: 'running' },
    'Line C2 (Dập cos thủ công & xoắn đôi)': { status: 'warning', issue: 'Đang bảo dưỡng applicator P1' },
    'Line B1 (Lắp giắc & Cắm housing)': { status: 'running' },
    'Line F1 (Bàn Jig test điện & Băng dính)': { status: 'running' },
  });

  // Handlers
  const handleSaveQc = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = DatabaseService.getCurrentUser();
    const newRecord: QualityRecord = {
      id: `qc-${Date.now()}`,
      code: qcForm.code,
      stage: qcForm.stage,
      part_number: qcForm.part_number,
      part_name: qcForm.part_name,
      lot_number: qcForm.lot_number,
      line_name: qcForm.line_name,
      sample_size: Number(qcForm.sample_size),
      defect_count: Number(qcForm.defect_count),
      status: Number(qcForm.defect_count) > 0 ? 'fail' : qcForm.status,
      inspector_name: currentUser.full_name || 'Kỹ thuật viên QA',
      inspector_id: currentUser.id,
      parameters: [
        {
          id: 'p1',
          name: qcForm.param1_name,
          standard: qcForm.param1_std,
          actual: qcForm.param1_act,
          result: 'pass',
        },
        {
          id: 'p2',
          name: qcForm.param2_name,
          standard: qcForm.param2_std,
          actual: qcForm.param2_act,
          result: 'pass',
        },
      ],
      defect_notes: qcForm.defect_notes,
      created_at: new Date().toISOString(),
    };

    DatabaseService.saveQualityRecord(newRecord);
    setQualityRecords(DatabaseService.getQualityRecords());
    setShowQcModal(false);
    DatabaseService.playSuccessSound();
  };

  const handleSaveWh = (e: React.FormEvent) => {
    e.preventDefault();
    const newWh: WarehouseRecord = {
      id: `wh-${Date.now()}`,
      code: whForm.code,
      type: whForm.type,
      part_number: whForm.part_number,
      part_name: whForm.part_name,
      category: whForm.category,
      quantity: Number(whForm.quantity),
      unit: whForm.unit,
      location: whForm.location,
      sender_receiver: whForm.sender_receiver,
      lot_number: whForm.lot_number,
      status: 'completed',
      notes: whForm.notes,
      created_at: new Date().toISOString(),
    };

    DatabaseService.saveWarehouseRecord(newWh);
    setWarehouseRecords(DatabaseService.getWarehouseRecords());
    setShowWhModal(false);
    DatabaseService.playSuccessSound();
  };

  const handleExportQcExcel = () => {
    const rows = qualityRecords.map((r, i) => ({
      STT: i + 1,
      'Mã phiếu': r.code,
      'Công đoạn': r.stage.toUpperCase(),
      'Mã linh kiện': r.part_number,
      'Tên sản phẩm': r.part_name,
      'Số lô Lot': r.lot_number,
      'Vị trí / Chuyền': r.line_name,
      'Cỡ mẫu': r.sample_size,
      'Lỗi (Defects)': r.defect_count,
      'Kết luận': r.status.toUpperCase(),
      'Người kiểm định': r.inspector_name,
      'Thời gian': new Date(r.created_at).toLocaleString('vi-VN'),
      'Ghi chú': r.defect_notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCao_ChatLuong');
    XLSX.writeFile(wb, `OfficeAI_QA_QC_Report_${Date.now()}.xlsx`);
    DatabaseService.playSuccessSound();
  };

  const filteredQuality = qualityRecords.filter(r => {
    const matchStage = stageFilter === 'all' || r.stage === stageFilter;
    const matchSearch =
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lot_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStage && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Industrial Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Factory className="w-3.5 h-3.5 text-blue-400" />
              Smart Factory • Wire Harness & Electronics Assembly
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Quản lý Sản xuất, Kho vận & Chất lượng (QA/QC)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Hệ thống kiểm soát chất lượng 3 cấp chuẩn <strong>IATF 16949</strong> (IQC đầu vào - IPQC công đoạn dập/ráp - OQC xuất kho), quản lý xuất nhập kho vật tư và giám sát chuyền sản xuất Andon.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportQcExcel}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Xuất Excel QA/QC
            </button>
            <button
              onClick={() => setShowQcModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Lập phiếu kiểm tra QC
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2">
        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'quality'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Kiểm soát chất lượng (IQC - IPQC - OQC)</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
            {qualityRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('warehouse')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'warehouse'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4 text-amber-500" />
          <span>Kho vận & Cấp phát chuyền (Warehouse IN-OUT)</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
            {warehouseRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('andon')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'andon'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-rose-500" />
          <span>Bảng Giám sát Chuyền & Andon Real-time</span>
        </button>
      </div>

      {/* TAB 1: KIỂM SOÁT CHẤT LƯỢNG (IQC, IPQC, OQC) */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IQC (Nguyên vật liệu)</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {qualityRecords.filter(r => r.stage === 'iqc').length} <span className="text-xs font-normal text-emerald-600">Lô đạt 100%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dây đồng AVSS, vỏ giắc, đầu cos</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <Boxes className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IPQC (Công đoạn dập & ráp)</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {qualityRecords.filter(r => r.stage === 'inprocess').length} <span className="text-xs font-normal text-blue-600">Phiếu kiểm ca</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Đo Crimp Height CH, test lực kéo N</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <Wrench className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OQC / FQC (Thành phẩm xuất xưởng)</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {qualityRecords.filter(r => r.stage === 'outqc').length} <span className="text-xs font-normal text-emerald-600">Xuất kho đạt</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Test bàn Jig 100% & dán tem QR</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Lọc công đoạn:</span>
              <div className="flex items-center gap-1">
                {(['all', 'iqc', 'inprocess', 'outqc'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStageFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      stageFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'Tất cả' : st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm mã linh kiện, số lô Lot, mã phiếu..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Quality Records Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                    <th className="py-3 px-3.5">Mã phiếu & Công đoạn</th>
                    <th className="py-3 px-3.5">Linh kiện / Dây dẫn</th>
                    <th className="py-3 px-3.5">Lô sản xuất & Vị trí</th>
                    <th className="py-3 px-3.5">Cỡ mẫu / Lỗi</th>
                    <th className="py-3 px-3.5">Thông số kiểm định (IATF 16949)</th>
                    <th className="py-3 px-3.5">Kết luận</th>
                    <th className="py-3 px-3.5">KTV Kiểm định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredQuality.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{r.code}</div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase mt-0.5 ${
                          r.stage === 'iqc'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : r.stage === 'inprocess'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {r.stage.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{r.part_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{r.part_number}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-mono text-slate-700 dark:text-slate-300">{r.lot_number}</div>
                        <div className="text-[11px] text-slate-500">{r.line_name}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Mẫu: {r.sample_size}</div>
                        <div className={`text-[11px] font-bold ${r.defect_count > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          Lỗi: {r.defect_count}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          {r.parameters.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{p.name}:</span>
                              <span className="font-mono text-slate-800 dark:text-white font-bold">{p.actual}</span>
                              <span className="text-slate-400 text-[10px]">({p.standard})</span>
                            </div>
                          ))}
                        </div>
                        {r.defect_notes && (
                          <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-900 p-1 rounded">
                            💬 {r.defect_notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          r.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.status === 'rework'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {r.status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {r.status === 'rework' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {r.status === 'fail' && <XCircle className="w-3.5 h-3.5" />}
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{r.inspector_name}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(r.created_at).toLocaleDateString('vi-VN')} {new Date(r.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KHO VẬN & CẤP CHUYỀN (WAREHOUSE IN-OUT) */}
      {activeTab === 'warehouse' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                Quản lý Giao nhận Kho vật tư & Cấp phát Chuyền sản xuất (Line Feeding)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Áp dụng quy tắc xuất nhập trước FIFO, quản lý mã cuộn/lô Lot nguyên liệu và bàn giao thành phẩm hoàn chỉnh.
              </p>
            </div>
            <button
              onClick={() => setShowWhModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Tạo phiếu Xuất / Nhập kho
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                    <th className="py-3 px-3.5">Mã phiếu</th>
                    <th className="py-3 px-3.5">Loại giao dịch</th>
                    <th className="py-3 px-3.5">Mặt hàng & Mã linh kiện</th>
                    <th className="py-3 px-3.5">Số lượng</th>
                    <th className="py-3 px-3.5">Vị trí kho / Chuyền</th>
                    <th className="py-3 px-3.5">Bên giao / Bên nhận</th>
                    <th className="py-3 px-3.5">Số lô Lot</th>
                    <th className="py-3 px-3.5">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {warehouseRecords.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50">
                      <td className="py-3 px-3.5 font-bold font-mono text-slate-900 dark:text-white">{w.code}</td>
                      <td className="py-3 px-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase ${
                          w.type === 'inbound'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : w.type === 'line_feed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {w.type === 'inbound' ? 'Nhập kho (IN)' : w.type === 'line_feed' ? 'Cấp chuyền' : 'Xuất hàng (OUT)'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{w.part_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{w.part_number}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-bold font-mono text-base text-slate-900 dark:text-white">
                          {w.quantity.toLocaleString('vi-VN')}
                        </span>{' '}
                        <span className="text-slate-500 text-[11px]">{w.unit}</span>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-700 dark:text-slate-300">{w.location}</td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">{w.sender_receiver}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-500">{w.lot_number}</td>
                      <td className="py-3 px-3.5 text-slate-400">
                        {new Date(w.created_at).toLocaleDateString('vi-VN')} {new Date(w.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BẢNG GIÁM SÁT CHUYỀN & ANDON */}
      {activeTab === 'andon' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 to-slate-900 border border-rose-800/60 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Hệ thống Giám sát Chuyền Sản xuất & Cảnh báo Dừng máy Andon</h3>
                <p className="text-xs text-rose-200/80">Công nhân có thể bấm nút báo lỗi để Kỹ thuật PE và QA hỗ trợ ngay lập tức.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
              Hiệu suất OEE: 92.4%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(andonStatus).map(([lineName, info], idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Factory className="w-4 h-4 text-blue-500" />
                    {lineName}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                    info.status === 'running'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : info.status === 'warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      info.status === 'running' ? 'bg-emerald-500 animate-ping' : info.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {info.status === 'running' ? 'Đang hoạt động' : info.status === 'warning' ? 'Cảnh báo PE' : 'Dừng chuyền'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-700 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Kế hoạch ca</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">1,200 pcs</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Thực tế đạt</div>
                    <div className="text-lg font-bold text-blue-600">1,120 pcs</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tỷ lệ lỗi PPM</div>
                    <div className="text-lg font-bold text-emerald-600">12 PPM</div>
                  </div>
                </div>

                {info.issue && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{info.issue}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setAndonStatus(prev => ({
                        ...prev,
                        [lineName]: { status: 'running' },
                      }));
                      DatabaseService.playSuccessSound();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold transition-colors"
                  >
                    Bình thường (Run)
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Nhập nguyên nhân cảnh báo Andon:') || 'Cần kiểm tra kỹ thuật';
                      setAndonStatus(prev => ({
                        ...prev,
                        [lineName]: { status: 'warning', issue: reason },
                      }));
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-bold transition-colors"
                  >
                    Báo Andon ⚠️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QC Modal */}
      {showQcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Lập phiếu Kiểm soát Chất lượng (QA/QC Sheet)
                </h3>
                <p className="text-xs text-slate-500">Tiêu chuẩn IATF 16949 / IPC-WHMA-A-620</p>
              </div>
              <button onClick={() => setShowQcModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveQc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã phiếu QC:</label>
                  <input
                    type="text"
                    required
                    value={qcForm.code}
                    onChange={e => setQcForm({ ...qcForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Công đoạn kiểm tra:</label>
                  <select
                    value={qcForm.stage}
                    onChange={e => setQcForm({ ...qcForm, stage: e.target.value as QualityInspectionStage })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="iqc">IQC - Nguyên vật liệu đầu vào</option>
                    <option value="inprocess">IPQC - Công đoạn cắt dập & lắp ráp</option>
                    <option value="outqc">OQC / FQC - Thành phẩm xuất xưởng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã linh kiện (Part No.):</label>
                  <input
                    type="text"
                    required
                    value={qcForm.part_number}
                    onChange={e => setQcForm({ ...qcForm, part_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số lô sản xuất (Lot No.):</label>
                  <input
                    type="text"
                    required
                    value={qcForm.lot_number}
                    onChange={e => setQcForm({ ...qcForm, lot_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên sản phẩm / Cụm dây:</label>
                <input
                  type="text"
                  required
                  value={qcForm.part_name}
                  onChange={e => setQcForm({ ...qcForm, part_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">Thông số kỹ thuật then chốt:</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={qcForm.param1_name}
                    onChange={e => setQcForm({ ...qcForm, param1_name: e.target.value })}
                    placeholder="Tên thông số"
                    className="px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                  />
                  <input
                    type="text"
                    value={qcForm.param1_std}
                    onChange={e => setQcForm({ ...qcForm, param1_std: e.target.value })}
                    placeholder="Chuẩn quy định"
                    className="px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                  />
                  <input
                    type="text"
                    value={qcForm.param1_act}
                    onChange={e => setQcForm({ ...qcForm, param1_act: e.target.value })}
                    placeholder="Số đo thực tế"
                    className="px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs font-bold text-blue-600"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={qcForm.param2_name}
                    onChange={e => setQcForm({ ...qcForm, param2_name: e.target.value })}
                    placeholder="Tên thông số"
                    className="px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                  />
                  <input
                    type="text"
                    value={qcForm.param2_std}
                    onChange={e => setQcForm({ ...qcForm, param2_std: e.target.value })}
                    placeholder="Chuẩn quy định"
                    className="px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                  />
                  <input
                    type="text"
                    value={qcForm.param2_act}
                    onChange={e => setQcForm({ ...qcForm, param2_act: e.target.value })}
                    placeholder="Số đo thực tế"
                    className="px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cỡ mẫu kiểm:</label>
                  <input
                    type="number"
                    value={qcForm.sample_size}
                    onChange={e => setQcForm({ ...qcForm, sample_size: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số lượng lỗi:</label>
                  <input
                    type="number"
                    value={qcForm.defect_count}
                    onChange={e => setQcForm({ ...qcForm, defect_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kết luận:</label>
                  <select
                    value={qcForm.status}
                    onChange={e => setQcForm({ ...qcForm, status: e.target.value as InspectionStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="pass">PASS (Đạt)</option>
                    <option value="rework">REWORK (Làm lại)</option>
                    <option value="fail">FAIL (Loại bỏ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi chú kiểm định:</label>
                <textarea
                  rows={2}
                  value={qcForm.defect_notes}
                  onChange={e => setQcForm({ ...qcForm, defect_notes: e.target.value })}
                  placeholder="Ghi chú chi tiết về tình trạng linh kiện..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQcModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Lưu phiếu QC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      {showWhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-500" />
                Lập phiếu Xuất / Nhập Kho Vật Tư
              </h3>
              <button onClick={() => setShowWhModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveWh} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã phiếu:</label>
                  <input
                    type="text"
                    required
                    value={whForm.code}
                    onChange={e => setWhForm({ ...whForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại phiếu:</label>
                  <select
                    value={whForm.type}
                    onChange={e => setWhForm({ ...whForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="inbound">Nhập kho (Inbound)</option>
                    <option value="line_feed">Cấp phát chuyền (Line Feed)</option>
                    <option value="outbound">Xuất kho thành phẩm (Outbound)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên mặt hàng:</label>
                  <input
                    type="text"
                    required
                    value={whForm.part_name}
                    onChange={e => setWhForm({ ...whForm, part_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã linh kiện:</label>
                  <input
                    type="text"
                    required
                    value={whForm.part_number}
                    onChange={e => setWhForm({ ...whForm, part_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số lượng:</label>
                  <input
                    type="number"
                    required
                    value={whForm.quantity}
                    onChange={e => setWhForm({ ...whForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-bold text-base text-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    value={whForm.unit}
                    onChange={e => setWhForm({ ...whForm, unit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vị trí kho/Chuyền:</label>
                  <input
                    type="text"
                    value={whForm.location}
                    onChange={e => setWhForm({ ...whForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bên giao / Bên nhận:</label>
                <input
                  type="text"
                  value={whForm.sender_receiver}
                  onChange={e => setWhForm({ ...whForm, sender_receiver: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWhModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md"
                >
                  Xác nhận lưu kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
