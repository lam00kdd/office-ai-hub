import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Plus,
  Search,
  Download,
  Building,
  Edit2,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Globe,
} from 'lucide-react';
import { Employee, Department, UserRole } from '../types';
import { DatabaseService } from '../services/storage';

export const StaffManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'guests'>('employees');
  const [employees, setEmployees] = useState<Employee[]>(DatabaseService.getEmployees());
  const [departments, setDepartments] = useState<Department[]>(DatabaseService.getDepartments());
  const [guests, setGuests] = useState<Employee[]>(DatabaseService.getGuests());
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<{
    employee_code: string;
    full_name: string;
    email: string;
    phone: string;
    department_id: string;
    position: string;
    role: UserRole;
    status: 'active' | 'inactive';
  }>({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    role: 'employee',
    status: 'active',
  });

  const handleOpenCreateEmp = () => {
    setEditingEmployee(null);
    setEmpForm({
      employee_code: `NV0${employees.length + 1}`.slice(-5),
      full_name: '',
      email: '',
      phone: '',
      department_id: departments[0]?.id || '',
      position: 'Chuyên viên',
      role: 'employee',
      status: 'active',
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmp = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === empForm.department_id);
    const newEmp: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp-${Date.now()}`,
      employee_code: empForm.employee_code.trim().toUpperCase(),
      full_name: empForm.full_name.trim(),
      email: empForm.email.trim(),
      phone: empForm.phone.trim(),
      department_id: empForm.department_id,
      department_name: dept?.name || 'Phòng ban',
      position: empForm.position,
      role: empForm.role,
      status: empForm.status,
      avatar_url: editingEmployee?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      created_at: editingEmployee ? editingEmployee.created_at : new Date().toISOString(),
    };

    const res = DatabaseService.saveEmployee(newEmp);
    if (!res.success) {
      setStatusMessage(res.error || 'Lỗi lưu nhân sự');
      return;
    }

    setEmployees(DatabaseService.getEmployees());
    setShowEmployeeModal(false);
    setStatusMessage(`Đã lưu hồ sơ nhân viên "${newEmp.full_name}" thành công.`);
    DatabaseService.playSuccessSound();
  };

  const handleDeleteEmp = (id: string) => {
    DatabaseService.deleteEmployee(id);
    setEmployees(DatabaseService.getEmployees());
    setStatusMessage('Đã ngừng kích hoạt tài khoản nhân viên.');
  };

  const handleExportExcel = () => {
    const rows = employees.map((e, idx) => ({
      STT: idx + 1,
      'Mã NV': e.employee_code,
      'Họ và tên': e.full_name,
      'Email': e.email,
      'Số điện thoại': e.phone || '',
      'Phòng ban': e.department_name,
      'Chức vụ': e.position,
      'Vai trò': e.role,
      'Trạng thái': e.status === 'active' ? 'Đang làm việc' : 'Nghỉ việc',
      'Ngày tạo': new Date(e.created_at).toLocaleDateString('vi-VN'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NhanVien');
    XLSX.writeFile(wb, 'OfficeAI_Danh_Sach_Nhan_Vien.xlsx');
    setStatusMessage('Xuất danh sách nhân viên ra Excel thành công.');
    DatabaseService.playSuccessSound();
  };

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.full_name.toLowerCase().includes(q) ||
      e.employee_code.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Quản trị nhân sự & Phòng ban
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Danh mục Nhân viên & Phân quyền hệ thống
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quản lý mã nhân sự duy nhất, phòng ban phụ trách, vai trò phân quyền (Admin, Manager, Employee).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button
            onClick={handleOpenCreateEmp}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm nhân viên
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" /> {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Danh sách nhân viên ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Danh sách phòng ban ({departments.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('guests');
            setGuests(DatabaseService.getGuests());
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'guests'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" /> Khách & Đối tác (Google / Supabase) ({guests.length})
        </button>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm mã NV, họ tên hoặc email..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-750 border-none rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Mã NV</th>
                  <th className="p-3.5">Họ và tên</th>
                  <th className="p-3.5">Email liên hệ</th>
                  <th className="p-3.5">Phòng ban</th>
                  <th className="p-3.5">Chức vụ</th>
                  <th className="p-3.5">Vai trò</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {e.employee_code}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={e.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span>{e.full_name}</span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{e.email}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">{e.department_name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{e.position}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          e.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : e.role === 'manager'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {e.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đang hoạt động
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteEmp(e.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Ngừng kích hoạt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {d.code}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{d.employee_count} nhân sự</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                Trưởng bộ phận: <strong className="text-slate-900 dark:text-white">{d.manager_name}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guests & External Partners Tab */}
      {activeTab === 'guests' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Danh sách Khách vãng lai & Đối tác đã lưu trong CSDL
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động thu thập hồ sơ khi khách đăng nhập qua Google OAuth hoặc Supabase Auth.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl self-start sm:self-auto">
              Tổng số khách: {guests.length}
            </span>
          </div>

          {guests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Khách hàng</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Xác thực qua</th>
                    <th className="py-2.5 px-3">Quyền hạn</th>
                    <th className="py-2.5 px-3">Ngày ghé thăm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {guests.map((g, idx) => (
                    <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={g.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
                            alt={g.full_name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">{g.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{g.email}</td>
                      <td className="py-3 px-3">
                        {g.auth_provider === 'google' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-900/40">
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            Google OAuth
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-900/40">
                            <Globe className="w-3 h-3" />
                            Supabase Auth
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[11px]">
                          Chỉ công cụ & AI
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(g.created_at).toLocaleDateString('vi-VN')} {new Date(g.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có khách nào đăng nhập. Khách đăng nhập bằng Google hoặc Supabase Auth sẽ tự động xuất hiện tại đây.
            </div>
          )}
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Thêm mới hồ sơ nhân sự
              </h3>
              <button onClick={() => setShowEmployeeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEmp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã nhân viên (*duy nhất):</label>
                  <input
                    type="text"
                    required
                    value={empForm.employee_code}
                    onChange={(e) => setEmpForm({ ...empForm, employee_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và tên:</label>
                  <input
                    type="text"
                    required
                    value={empForm.full_name}
                    onChange={(e) => setEmpForm({ ...empForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email:</label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng ban:</label>
                  <select
                    value={empForm.department_id}
                    onChange={(e) => setEmpForm({ ...empForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chức vụ:</label>
                  <input
                    type="text"
                    value={empForm.position}
                    onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vai trò phân quyền:</label>
                <select
                  value={empForm.role}
                  onChange={(e) => setEmpForm({ ...empForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="employee">Employee (Nhân viên thông thường)</option>
                  <option value="manager">Manager (Trưởng phòng / Quản lý)</option>
                  <option value="admin">Admin (Quản trị viên toàn hệ thống)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Lưu nhân viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
