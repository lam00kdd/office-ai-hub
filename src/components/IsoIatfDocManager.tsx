import React, { useState } from 'react';
import {
  FileCheck,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Eye,
  Check,
  Download,
  Search,
  Filter,
  UserCheck,
  Building2,
  FileSignature,
  Stamp,
  Printer,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { IsoDocument, IsoDocStatus, IsoDocType } from '../types';
import { DatabaseService } from '../services/storage';

export const IsoIatfDocManager: React.FC = () => {
  const [docs, setDocs] = useState<IsoDocument[]>(DatabaseService.getIsoDocs());
  const [selectedDoc, setSelectedDoc] = useState<IsoDocument | null>(docs[0] || null);
  const [statusFilter, setStatusFilter] = useState<'all' | IsoDocStatus>('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = DatabaseService.getCurrentUser();
  const canApprove = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Form for new ISO doc
  const [form, setForm] = useState({
    doc_code: `SOP-PROD-${Date.now().toString().slice(-4)}`,
    title: '',
    standard: 'IATF 16949' as const,
    doc_type: 'SOP' as IsoDocType,
    revision: 'Rev 01.0',
    department: 'Phòng Kỹ thuật Sản xuất (PE)',
    summary: '',
    step1: 'Chuẩn bị trang thiết bị, kiểm tra tình trạng máy móc trước khi thao tác',
    step2: 'Đối chiếu thông số kỹ thuật và bản vẽ gia công dây dẫn điện',
    step3: 'Thực hiện thao tác sản xuất theo đúng trình tự hướng dẫn',
    step4: 'Lấy mẫu kiểm tra chất lượng đầu ca và lưu vào sổ nhật ký',
  });

  const handleApprove = (docId: string) => {
    DatabaseService.updateIsoDocStatus(
      docId,
      'published',
      'Đã soát xét đạt chuẩn chất lượng IATF 16949',
      currentUser.full_name
    );
    const updated = DatabaseService.getIsoDocs();
    setDocs(updated);
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(updated.find(d => d.id === docId) || null);
    }
    DatabaseService.playSuccessSound();
  };

  const handleSendToReview = (docId: string) => {
    DatabaseService.updateIsoDocStatus(
      docId,
      'reviewing',
      'Gửi cấp Trưởng phòng QA/PE soát xét nội dung'
    );
    const updated = DatabaseService.getIsoDocs();
    setDocs(updated);
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(updated.find(d => d.id === docId) || null);
    }
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: IsoDocument = {
      id: `iso-${Date.now()}`,
      doc_code: form.doc_code,
      title: form.title,
      standard: form.standard,
      doc_type: form.doc_type,
      revision: form.revision,
      department: form.department,
      author_name: currentUser.full_name || 'Kỹ sư soạn thảo',
      author_id: currentUser.id,
      status: 'draft',
      summary: form.summary,
      key_steps: [form.step1, form.step2, form.step3, form.step4].filter(Boolean),
      controlled_copy: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    DatabaseService.saveIsoDoc(newDoc);
    const updated = DatabaseService.getIsoDocs();
    setDocs(updated);
    setSelectedDoc(newDoc);
    setShowCreateModal(false);
    DatabaseService.playSuccessSound();
  };

  const filteredDocs = docs.filter(d => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchSearch =
      d.doc_code.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* ISO Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              IATF 16949:2016 & ISO 9001:2015 QMS
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Quy trình Quản lý Tài liệu ISO & IATF 16949
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Quy trình 4 bước chuẩn mực: <strong>1. Biên soạn</strong> &rarr; <strong>2. Soát xét</strong> &rarr; <strong>3. Phê duyệt điện tử</strong> &rarr; <strong>4. Ban hành con dấu Controlled Copy</strong>. Quản lý toàn bộ SOP, WI, Control Plan và FMEA của xưởng sản xuất.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Soạn tài liệu ISO / SOP mới
          </button>
        </div>
      </div>

      {/* 4-Step Standard Pipeline Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Biên soạn (Draft)</div>
            <div className="text-[10px] text-slate-400">Kỹ sư PE / KTV soạn</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Kiểm tra (Review)</div>
            <div className="text-[10px] text-slate-400">Trưởng nhóm / Kỹ sư QA</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Phê duyệt (Approve)</div>
            <div className="text-[10px] text-slate-400">Giám đốc / Trưởng phòng</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ban hành (Published)</div>
            <div className="text-[10px] text-emerald-600 font-bold">Dấu Controlled Copy</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm mã tài liệu SOP, WI, Control Plan..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['all', 'draft', 'reviewing', 'published'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 text-[11px] transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st === 'all' ? 'Tất cả' : st === 'draft' ? 'Bản thảo' : st === 'reviewing' ? 'Đang duyệt' : 'Đã ban hành'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
            {filteredDocs.map(d => {
              const isSelected = selectedDoc?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoc(d)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400">
                      {d.doc_code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      d.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : d.status === 'reviewing'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {d.status === 'published' ? 'Đã ban hành' : d.status === 'reviewing' ? 'Đang soát xét' : 'Bản thảo'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {d.title}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="font-semibold">{d.doc_type} • {d.revision}</span>
                    <span>{d.standard}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Document Details & Official Stamp (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
              {/* Top Document Header & Official Red Stamp */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-600">{selectedDoc.doc_code}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-bold">
                      {selectedDoc.revision}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                      {selectedDoc.standard}
                    </span>
                  </div>
                  <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                    {selectedDoc.title}
                  </h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Đơn vị áp dụng: <strong>{selectedDoc.department}</strong>
                  </div>
                </div>

                {/* RED OFFICIAL STAMP (TÀI LIỆU KIỂM SOÁT) */}
                {selectedDoc.controlled_copy ? (
                  <div className="border-2 border-dashed border-red-600 text-red-600 p-2.5 rounded-xl text-center rotate-[-3deg] shadow-xs select-none shrink-0 bg-red-50/50 dark:bg-red-950/20">
                    <div className="text-[10px] font-black uppercase tracking-widest">IATF 16949 / ISO 9001</div>
                    <div className="text-sm font-black uppercase tracking-tight my-0.5">TÀI LIỆU KIỂM SOÁT</div>
                    <div className="text-[9px] font-mono">CONTROLLED COPY • 2026</div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 text-slate-400 p-2 rounded-xl text-center text-xs shrink-0">
                    <div>Bản thảo / Dự thảo</div>
                    <div className="text-[10px]">Chưa đóng dấu</div>
                  </div>
                )}
              </div>

              {/* Author, Reviewer, Approver Meta Box */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">1. Người biên soạn</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedDoc.author_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(selectedDoc.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">2. Người soát xét</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedDoc.reviewer_name || 'Chưa phân công'}
                  </div>
                  {selectedDoc.reviewer_notes && (
                    <div className="text-[10px] text-blue-600 italic line-clamp-1">{selectedDoc.reviewer_notes}</div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">3. Người phê duyệt</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedDoc.approver_name || 'Chờ phê duyệt'}
                  </div>
                  {selectedDoc.approver_signature && (
                    <div className="text-[9px] font-mono text-emerald-600 font-bold">
                      ✓ Đã ký số điện tử
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mục đích & Phạm vi áp dụng:
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* Key Steps / Procedures */}
              {selectedDoc.key_steps && selectedDoc.key_steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Các bước quy trình chuẩn hóa (Standard Operation Procedure):
                  </h4>
                  <div className="space-y-2">
                    {selectedDoc.key_steps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Actions Bar */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Trạng thái hiện tại:{' '}
                  <strong className="text-slate-900 dark:text-white uppercase">{selectedDoc.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDoc.status === 'draft' && (
                    <button
                      onClick={() => handleSendToReview(selectedDoc.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" /> Gửi duyệt soát xét
                    </button>
                  )}

                  {canApprove && selectedDoc.status !== 'published' && (
                    <button
                      onClick={() => handleApprove(selectedDoc.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <FileSignature className="w-4 h-4" /> Ký duyệt & Đóng dấu Controlled Copy
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> In / Xuất PDF
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              Chọn một tài liệu bên danh sách để xem chi tiết và ký duyệt.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Biên soạn tài liệu tiêu chuẩn ISO / IATF 16949 mới
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã tài liệu (Doc Code):</label>
                  <input
                    type="text"
                    required
                    value={form.doc_code}
                    onChange={e => setForm({ ...form, doc_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại tài liệu:</label>
                  <select
                    value={form.doc_type}
                    onChange={e => setForm({ ...form, doc_type: e.target.value as IsoDocType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="SOP">SOP - Tiêu chuẩn thao tác (Standard Operating Procedure)</option>
                    <option value="WI">WI - Hướng dẫn công việc (Work Instruction)</option>
                    <option value="CONTROL_PLAN">Control Plan - Kế hoạch kiểm soát</option>
                    <option value="FMEA">FMEA - Phân tích rủi ro tiềm ẩn</option>
                    <option value="DRAWING">Bản vẽ kỹ thuật dây dẫn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề tài liệu:</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Quy trình Thao tác Băng keo Định hình Bó dây táplô..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu chuẩn áp dụng:</label>
                  <select
                    value={form.standard}
                    onChange={e => setForm({ ...form, standard: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-bold text-blue-600"
                  >
                    <option value="IATF 16949">IATF 16949 (Hệ thống quản lý ô tô)</option>
                    <option value="ISO 9001">ISO 9001 (Quản lý chất lượng chung)</option>
                    <option value="ISO 14001">ISO 14001 (Môi trường)</option>
                    <option value="ISO 45001">ISO 45001 (An toàn sức khỏe nghề nghiệp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phiên bản (Revision):</label>
                  <input
                    type="text"
                    value={form.revision}
                    onChange={e => setForm({ ...form, revision: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tóm tắt mục đích & phạm vi:</label>
                <textarea
                  rows={2}
                  required
                  value={form.summary}
                  onChange={e => setForm({ ...form, summary: e.target.value })}
                  placeholder="Mô tả phạm vi áp dụng trên các chuyền sản xuất..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
                <div className="font-bold text-slate-800 dark:text-slate-200">Trình tự các bước thực hiện:</div>
                <input
                  type="text"
                  value={form.step1}
                  onChange={e => setForm({ ...form, step1: e.target.value })}
                  placeholder="Bước 1"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                />
                <input
                  type="text"
                  value={form.step2}
                  onChange={e => setForm({ ...form, step2: e.target.value })}
                  placeholder="Bước 2"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                />
                <input
                  type="text"
                  value={form.step3}
                  onChange={e => setForm({ ...form, step3: e.target.value })}
                  placeholder="Bước 3"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                />
                <input
                  type="text"
                  value={form.step4}
                  onChange={e => setForm({ ...form, step4: e.target.value })}
                  placeholder="Bước 4"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 rounded-lg border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Tạo bản thảo (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
