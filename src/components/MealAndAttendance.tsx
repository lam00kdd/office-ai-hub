import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Utensils,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  Calendar,
  Coffee,
  AlertCircle,
  Users,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { MealBooking, AttendanceRecord, MealShift, MealOption } from '../types';
import { DatabaseService } from '../services/storage';

export const MealAndAttendance: React.FC = () => {
  const [subTab, setSubTab] = useState<'meal' | 'attendance'>('meal');
  const [mealBookings, setMealBookings] = useState<MealBooking[]>(DatabaseService.getMealBookings());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(DatabaseService.getAttendanceRecords());
  const currentUser = DatabaseService.getCurrentUser();

  // Booking Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [shift, setShift] = useState<MealShift>('ca_1_sang');
  const [mealOption, setMealOption] = useState<MealOption>('com_man');
  const [specialDiet, setSpecialDiet] = useState('');

  // Attendance OT form
  const [showOtModal, setShowOtModal] = useState(false);
  const [otHours, setOtHours] = useState(2.0);
  const [otReason, setOtReason] = useState('Tăng ca gia công gấp cụm dây táplô cho xe ô tô');

  // Meal booking handler
  const handleBookMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: MealBooking = {
      id: `meal-${Date.now()}`,
      employee_id: currentUser.id,
      employee_code: currentUser.employee_code,
      full_name: currentUser.full_name,
      department_name: currentUser.department_name || 'Phân xưởng Lắp ráp',
      line_name: 'Chuyền sản xuất',
      booking_date: bookingDate,
      shift: shift,
      meal_option: mealOption,
      status: 'confirmed',
      special_diet: specialDiet,
      created_at: new Date().toISOString(),
    };

    DatabaseService.bookMeal(newBooking);
    setMealBookings(DatabaseService.getMealBookings());
    DatabaseService.playSuccessSound();
  };

  const handleCancelMeal = (id: string) => {
    DatabaseService.cancelMeal(id);
    setMealBookings(DatabaseService.getMealBookings());
  };

  // 1-Click Check In Handler
  const handleCheckInNow = () => {
    const timeNow = new Date().toLocaleTimeString('vi-VN');
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employee_id: currentUser.id,
      employee_code: currentUser.employee_code,
      full_name: currentUser.full_name,
      department_name: currentUser.department_name || 'Khối sản xuất',
      line_name: 'Chuyền lắp ráp',
      date: todayStr,
      shift: 'ca_1',
      check_in: timeNow,
      status: 'on_time',
      ot_hours: 0,
      created_at: new Date().toISOString(),
    };

    DatabaseService.checkInAttendance(newRecord);
    setAttendanceRecords(DatabaseService.getAttendanceRecords());
    DatabaseService.playSuccessSound();
  };

  // Submit OT
  const handleSubmitOt = (e: React.FormEvent) => {
    e.preventDefault();
    const myRecord = attendanceRecords.find(a => a.employee_id === currentUser.id && a.date === todayStr);
    if (myRecord) {
      DatabaseService.requestOvertime(myRecord.id, otHours, otReason, 'Quản đốc phân xưởng duyệt');
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employee_id: currentUser.id,
        employee_code: currentUser.employee_code,
        full_name: currentUser.full_name,
        department_name: currentUser.department_name || 'Khối sản xuất',
        line_name: 'Chuyền sản xuất',
        date: todayStr,
        shift: 'ca_1',
        check_in: '07:30:00',
        check_out: '19:30:00',
        status: 'on_time',
        ot_hours: otHours,
        ot_reason: otReason,
        ot_approved_by: 'Quản đốc phân xưởng duyệt',
        created_at: new Date().toISOString(),
      };
      DatabaseService.checkInAttendance(newRecord);
    }
    setAttendanceRecords(DatabaseService.getAttendanceRecords());
    setShowOtModal(false);
    DatabaseService.playSuccessSound();
  };

  // Export Meal to Excel
  const handleExportMealExcel = () => {
    const rows = mealBookings.map((b, i) => ({
      STT: i + 1,
      'Mã NV': b.employee_code,
      'Họ và tên': b.full_name,
      'Bộ phận': b.department_name,
      'Ngày ăn': b.booking_date,
      'Ca làm việc': b.shift === 'ca_1_sang' ? 'Ca 1 (Sáng)' : b.shift === 'ca_2_chieu' ? 'Ca 2 (Chiều)' : b.shift === 'ca_3_dem' ? 'Ca 3 (Đêm)' : 'Tăng ca OT',
      'Loại suất ăn': b.meal_option === 'com_man' ? 'Cơm mặn' : b.meal_option === 'com_chay' ? 'Cơm chay' : 'Suất ăn nhẹ',
      'Trạng thái': b.status === 'confirmed' ? 'Đã xác nhận' : 'Hủy',
      'Ghi chú': b.special_diet || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCom_NhaBep');
    XLSX.writeFile(wb, `OfficeAI_Danh_Sach_Bao_Com_${todayStr}.xlsx`);
    DatabaseService.playSuccessSound();
  };

  // Summary counts for Cafeteria Kitchen
  const confirmedMeals = mealBookings.filter(b => b.status === 'confirmed');
  const countComMan = confirmedMeals.filter(b => b.meal_option === 'com_man').length;
  const countComChay = confirmedMeals.filter(b => b.meal_option === 'com_chay').length;
  const countSuatNhe = confirmedMeals.filter(b => b.meal_option === 'suat_an_nhe').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              Đời sống & Hành chính Phân xưởng sản xuất
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Báo Cơm Nhà Ăn & Điểm Danh Chấm Công / Tăng Ca (OT)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Hỗ trợ công nhân và nhân viên văn phòng báo cơm trước giờ chốt bếp (Ca sáng, Ca chiều, Ca đêm, Suất ăn nhẹ tăng ca) và điểm danh ca kíp, đăng ký tăng ca OT minh bạch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMealExcel}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Xuất danh sách báo cơm
            </button>
            <button
              onClick={handleCheckInNow}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all"
            >
              <Clock className="w-4 h-4" /> Điểm danh vào ca 1 chạm
            </button>
          </div>
        </div>
      </div>

      {/* 2 Sub Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2">
        <button
          onClick={() => setSubTab('meal')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            subTab === 'meal'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Báo cơm ca làm việc (Meal Booking)</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 font-bold">
            {confirmedMeals.length} suất
          </span>
        </button>

        <button
          onClick={() => setSubTab('attendance')}
          className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            subTab === 'attendance'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Điểm danh ca kíp & Đăng ký Tăng ca (OT)</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
            {attendanceRecords.length}
          </span>
        </button>
      </div>

      {/* SUB TAB 1: BÁO CƠM CA */}
      {subTab === 'meal' && (
        <div className="space-y-6">
          {/* Cafeteria Summary Cards for Kitchen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Suất Cơm Mặn</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {countComMan} <span className="text-xs font-normal text-slate-400">suất</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Thịt, cá, tôm theo ngày</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 font-bold text-xl">
                🍖
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Suất Cơm Chay</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {countComChay} <span className="text-xs font-normal text-slate-400">suất</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Đậu phụ, nấm, rau củ quả</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 font-bold text-xl">
                🥗
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Ăn Nhẹ Tăng Ca (OT)</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {countSuatNhe} <span className="text-xs font-normal text-slate-400">suất</span>
                </div>
                <div className="text-[11px] text-blue-600 font-medium mt-0.5">Bánh mì thịt, sữa chua</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 font-bold text-xl">
                🥛
              </div>
            </div>
          </div>

          {/* Quick Booking Form */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Đăng ký suất ăn cá nhân cho ca làm việc
            </h3>

            <form onSubmit={handleBookMeal} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày dùng bữa:</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ca làm việc:</label>
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value as MealShift)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="ca_1_sang">Ca 1 (Sáng: 06h00 - 14h00)</option>
                  <option value="ca_2_chieu">Ca 2 (Chiều: 14h00 - 22h00)</option>
                  <option value="ca_3_dem">Ca 3 (Đêm: 22h00 - 06h00)</option>
                  <option value="tang_ca_ot">Tăng ca OT (Suất ăn nhẹ)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại khẩu phần:</label>
                <select
                  value={mealOption}
                  onChange={e => setMealOption(e.target.value as MealOption)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                >
                  <option value="com_man">Cơm mặn tiêu chuẩn</option>
                  <option value="com_chay">Cơm chay thanh đạm</option>
                  <option value="suat_an_nhe">Suất ăn nhẹ (Bánh mì / Sữa)</option>
                  <option value="an_kieng">Ăn kiêng / Bệnh lý</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Xác nhận báo cơm 🍚
                </button>
              </div>
            </form>
          </div>

          {/* Meal List Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200">
              Danh sách nhân viên & công nhân đã báo cơm nhà ăn ({mealBookings.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750 text-slate-500 font-semibold border-b">
                    <th className="py-2.5 px-3">Mã NV</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Phòng ban / Chuyền</th>
                    <th className="py-2.5 px-3">Ngày ăn</th>
                    <th className="py-2.5 px-3">Ca làm việc</th>
                    <th className="py-2.5 px-3">Khẩu phần</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {mealBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{b.employee_code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{b.full_name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{b.department_name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{b.booking_date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {b.shift === 'ca_1_sang' ? 'Ca 1 (Sáng)' : b.shift === 'ca_2_chieu' ? 'Ca 2 (Chiều)' : b.shift === 'ca_3_dem' ? 'Ca 3 (Đêm)' : 'Tăng ca OT'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          b.meal_option === 'com_man'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : b.meal_option === 'com_chay'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {b.meal_option === 'com_man' ? 'Cơm mặn' : b.meal_option === 'com_chay' ? 'Cơm chay' : 'Ăn nhẹ'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'confirmed' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                        }`}>
                          {b.status === 'confirmed' ? 'Đã chốt' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelMeal(b.id)}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Hủy báo cơm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: CHẤM CÔNG & ĐIỂM DANH CA KÍP / TĂNG CA */}
      {subTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Sổ Nhật ký Điểm danh Ca kíp & Phê duyệt Tăng ca (OT)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận giờ vào ca, giờ kết thúc và số giờ tăng ca có xác nhận của Quản đốc phân xưởng.
              </p>
            </div>
            <button
              onClick={() => setShowOtModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Đăng ký Tăng ca (OT)
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750 text-slate-500 font-semibold border-b">
                    <th className="py-3 px-3.5">Mã NV</th>
                    <th className="py-3 px-3.5">Họ và tên</th>
                    <th className="py-3 px-3.5">Bộ phận / Chuyền</th>
                    <th className="py-3 px-3.5">Ngày</th>
                    <th className="py-3 px-3.5">Giờ vào (Check-in)</th>
                    <th className="py-3 px-3.5">Giờ ra (Check-out)</th>
                    <th className="py-3 px-3.5">Số giờ OT</th>
                    <th className="py-3 px-3.5">Lý do tăng ca & Quản lý duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {attendanceRecords.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{a.employee_code}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">{a.full_name}</td>
                      <td className="py-3 px-3.5 text-slate-500">{a.department_name}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-slate-300">{a.date}</td>
                      <td className="py-3 px-3.5 font-mono font-bold text-emerald-600">{a.check_in || '--:--'}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-500">{a.check_out || '--:--'}</td>
                      <td className="py-3 px-3.5">
                        {a.ot_hours > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold rounded">
                            +{a.ot_hours} giờ
                          </span>
                        ) : (
                          <span className="text-slate-400">0 h</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="text-slate-700 dark:text-slate-300">{a.ot_reason || 'Làm theo ca chuẩn'}</div>
                        {a.ot_approved_by && (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                            ✓ {a.ot_approved_by}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OT Modal */}
      {showOtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Đăng ký Làm Thêm Giờ (Overtime - OT)
              </h3>
              <button onClick={() => setShowOtModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitOt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số giờ đăng ký tăng ca (OT):</label>
                <select
                  value={otHours}
                  onChange={e => setOtHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm text-indigo-600"
                >
                  <option value={1.0}>1.0 Giờ (Sau ca làm việc)</option>
                  <option value={1.5}>1.5 Giờ</option>
                  <option value={2.0}>2.0 Giờ (Tăng ca ca tối)</option>
                  <option value={3.0}>3.0 Giờ (Chạy đơn hàng gấp)</option>
                  <option value={4.0}>4.0 Giờ (Tối đa ca kíp)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lý do tăng ca & Công đoạn phụ trách:</label>
                <textarea
                  rows={3}
                  required
                  value={otReason}
                  onChange={e => setOtReason(e.target.value)}
                  placeholder="Ghi rõ đơn hàng, cụm dây điện hoặc công đoạn dập/test..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowOtModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Gửi duyệt OT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
