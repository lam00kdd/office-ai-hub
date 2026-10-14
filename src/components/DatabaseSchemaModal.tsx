import React, { useState } from 'react';
import { Database, Table, Key, ShieldCheck, Download, Copy, Check, Server, Layout } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'erd' | 'wireframe' | 'sql'>('erd');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copySQL = () => {
    const sqlText = `-- OFFICE AI HUB - SUPABASE POSTGRESQL SCHEMA
-- Xem chi tiết tại src/db/supabase-schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    topic VARCHAR(150) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answers TEXT[] NOT NULL,
    explanation TEXT,
    points NUMERIC(5, 2) DEFAULT 5.0
);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    passing_score_percent NUMERIC(5,2) DEFAULT 70.0,
    status VARCHAR(50) DEFAULT 'published'
);

CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id),
    employee_id UUID REFERENCES employees(id),
    total_score NUMERIC(6,2),
    score_percentage NUMERIC(5,2),
    is_passed BOOLEAN,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tables = [
    {
      name: 'employees',
      desc: 'Thông tin nhân viên, chức vụ, vai trò (admin/manager/employee) và tài khoản',
      pks: ['id (UUID)'],
      fks: ['department_id -> departments(id)'],
      cols: ['employee_code (UNIQUE)', 'full_name', 'email (UNIQUE)', 'position', 'role', 'status'],
    },
    {
      name: 'departments',
      desc: 'Phòng ban công ty, người quản lý, mô tả nghiệp vụ',
      pks: ['id (UUID)'],
      fks: [],
      cols: ['code (UNIQUE)', 'name', 'manager_name', 'description'],
    },
    {
      name: 'questions',
      desc: 'Ngân hàng câu hỏi trắc nghiệm, độ khó, đáp án đúng và điểm số',
      pks: ['id (UUID)'],
      fks: ['created_by -> employees(id)'],
      cols: ['code (UNIQUE)', 'topic', 'difficulty', 'question_type', 'content', 'options (JSONB)', 'correct_answers (ARRAY)', 'points'],
    },
    {
      name: 'exams',
      desc: 'Bài kiểm tra online, thời lượng, ngưỡng đạt, xáo trộn câu hỏi',
      pks: ['id (UUID)'],
      fks: ['department_id -> departments(id)', 'created_by -> employees(id)'],
      cols: ['code (UNIQUE)', 'title', 'duration_minutes', 'passing_score_percent', 'shuffle_questions', 'status'],
    },
    {
      name: 'exam_assignments',
      desc: 'Lượt giao bài kiểm tra cho từng cá nhân hoặc phòng ban',
      pks: ['id (UUID)'],
      fks: ['exam_id -> exams(id)', 'employee_id -> employees(id)'],
      cols: ['assigned_at', 'due_date', 'status (pending, in_progress, completed)'],
    },
    {
      name: 'exam_attempts',
      desc: 'Lịch sử làm bài thi, lưu bất biến đề snapshot, tổng điểm, tỷ lệ đạt',
      pks: ['id (UUID)'],
      fks: ['exam_id -> exams(id)', 'employee_id -> employees(id)'],
      cols: ['started_at', 'submitted_at', 'correct_count', 'total_score', 'score_percentage', 'is_passed', 'exam_snapshot (JSONB)'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Kiến trúc Cơ sở dữ liệu Supabase & Wireframe
              </h2>
              <p className="text-xs text-slate-500">
                Sơ đồ thực thể quan hệ (ERD), Cấu trúc bảng PostgreSQL & Khung Wireframe Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center text-lg font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('erd')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'erd'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-4 h-4" /> Sơ đồ thực thể ERD
          </button>
          <button
            onClick={() => setActiveTab('wireframe')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'wireframe'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layout className="w-4 h-4" /> Wireframe Bảng điều khiển
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" /> Mã nguồn Supabase SQL
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'erd' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <strong>Mô hình dữ liệu chuẩn doanh nghiệp (3NF + JSONB Snapshot):</strong> Đảm bảo toàn vẹn dữ liệu
                  khi quản trị viên cập nhật ngân hàng câu hỏi. Mỗi lượt thi lưu trữ bản chụp (snapshot) của đề thi và
                  từng phương án tại thời điểm thi, ngăn ngừa tình trạng sai lệch điểm số lịch sử.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((tbl) => (
                  <div
                    key={tbl.name}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                        public.{tbl.name}
                      </span>
                      <Table className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{tbl.desc}</p>
                    <div className="space-y-1.5 text-xs">
                      {tbl.pks.map((pk) => (
                        <div key={pk} className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono font-medium">
                          <Key className="w-3 h-3" /> PK: {pk}
                        </div>
                      ))}
                      {tbl.fks.map((fk) => (
                        <div key={fk} className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-mono">
                          FK: {fk}
                        </div>
                      ))}
                      <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 space-y-1 font-mono text-[11px]">
                        {tbl.cols.map((col) => (
                          <div key={col} className="truncate">• {col}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wireframe' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <strong>Wireframe Kiến trúc Bảng điều khiển (Dashboard SaaS Layout):</strong>
                <p className="mt-1">
                  Được thiết kế tối ưu theo 3 cấp độ: Thanh điều hướng cố định (Header) → Thanh công cụ đa cấp
                  (Collapsible Sidebar) → Trung tâm điều hành (Main Workspace) với 8 Card công cụ lớn và 4 Thống kê
                  chính.
                </p>
              </div>

              {/* Wireframe Diagram Box */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/50 font-mono text-xs">
                <div className="border border-slate-400 rounded-lg p-3 mb-4 bg-white dark:bg-slate-800 flex justify-between items-center">
                  <span>[HEADER] Logo Office AI Hub | 🔍 Tìm kiếm công cụ, tài liệu... | 🔔 Thông báo | 👤 Nguyễn Hoàng Lâm (Admin)</span>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  {/* Sidebar mockup */}
                  <div className="col-span-3 border border-slate-400 rounded-lg p-3 bg-white dark:bg-slate-800 space-y-2">
                    <div className="font-bold text-blue-600">SIDEBAR (Vai trò: Admin)</div>
                    <div>• 🏠 Trang chủ / Dashboard</div>
                    <div className="text-slate-500">CÔNG CỤ VĂN PHÒNG</div>
                    <div>• 📊 Excel Tools</div>
                    <div>• 📄 PDF Tools</div>
                    <div>• 📝 Word Tools</div>
                    <div>• 📽️ PowerPoint Tools</div>
                    <div>• 🔄 Chuyển đổi file</div>
                    <div className="text-slate-500">TRỢ LÝ AI</div>
                    <div>• 💬 Chat với AI (Gemini 3.8)</div>
                    <div>• ✨ 12 Công cụ AI văn phòng</div>
                    <div className="text-slate-500">ĐÀO TẠO & THI</div>
                    <div>• 🎯 Ngân hàng câu hỏi</div>
                    <div>• 📋 Tạo đề & Giao bài</div>
                    <div>• ✍️ Làm bài thi online</div>
                    <div>• 📈 Báo cáo & Thống kê</div>
                    <div className="text-slate-500">QUẢN TRỊ</div>
                    <div>• 👥 Nhân viên & Phòng ban</div>
                    <div>• 📜 Nhật ký hoạt động</div>
                  </div>

                  {/* Main content mockup */}
                  <div className="col-span-9 space-y-4">
                    {/* Welcome banner */}
                    <div className="border border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="font-bold text-sm text-blue-600">👋 Chào mừng đến với Office AI Hub!</div>
                      <div className="text-xs text-slate-500">Mọi công cụ văn phòng và đào tạo trong một nền tảng.</div>
                    </div>

                    {/* Quick cards */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📊 Xử lý Excel</div>
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📄 Công cụ PDF</div>
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📝 Soạn Word</div>
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📽️ Slide PPT</div>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="border border-slate-300 rounded p-2 bg-blue-50 dark:bg-slate-800 text-center">
                        <div className="text-[10px] text-slate-500">Tổng nhân viên</div>
                        <div className="font-bold text-base text-blue-600">10 Nhân sự</div>
                      </div>
                      <div className="border border-slate-300 rounded p-2 bg-purple-50 dark:bg-slate-800 text-center">
                        <div className="text-[10px] text-slate-500">Đề thi mở</div>
                        <div className="font-bold text-base text-purple-600">3 Đề</div>
                      </div>
                      <div className="border border-slate-300 rounded p-2 bg-emerald-50 dark:bg-slate-800 text-center">
                        <div className="text-[10px] text-slate-500">Tỷ lệ hoàn thành</div>
                        <div className="font-bold text-base text-emerald-600">86%</div>
                      </div>
                      <div className="border border-slate-300 rounded p-2 bg-amber-50 dark:bg-slate-800 text-center">
                        <div className="text-[10px] text-slate-500">Điểm TB</div>
                        <div className="font-bold text-base text-amber-600">78.5 / 100</div>
                      </div>
                    </div>

                    {/* Recent tables */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-slate-300 rounded p-3 bg-white dark:bg-slate-800">
                        <div className="font-bold mb-2">📋 Bài kiểm tra gần đây</div>
                        <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                          <div>• Kiểm tra Excel cơ bản (25p - 70%)</div>
                          <div>• Bảo mật thông tin nội bộ (20p - 75%)</div>
                        </div>
                      </div>
                      <div className="border border-slate-300 rounded p-3 bg-white dark:bg-slate-800">
                        <div className="font-bold mb-2">🔔 Thông báo & Hoạt động</div>
                        <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                          <div>• Đã cập nhật ngân hàng 20 câu hỏi mới</div>
                          <div>• Lê Văn Công đã hoàn thành bài thi Excel (85.7%)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Chạy đoạn mã này trong <strong>Supabase SQL Editor</strong> để tạo toàn bộ bảng, chỉ mục và RLS.
                </p>
                <button
                  onClick={copySQL}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã sao chép' : 'Sao chép SQL'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed">
{`-- SUPABASE MIGRATION SCRIPT FOR OFFICE AI HUB
-- Bật UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Phòng ban
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Nhân viên & phân quyền
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- 3. Ngân hàng câu hỏi
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    topic VARCHAR(150) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answers TEXT[] NOT NULL,
    explanation TEXT,
    points NUMERIC(5, 2) DEFAULT 5.0
);

-- 4. Bài kiểm tra
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    passing_score_percent NUMERIC(5, 2) DEFAULT 70.0,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'published'
);

-- 5. Lịch sử lượt thi & kết quả chấm
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id),
    employee_id UUID REFERENCES employees(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    correct_count INTEGER DEFAULT 0,
    total_score NUMERIC(6, 2) DEFAULT 0.0,
    score_percentage NUMERIC(5, 2) DEFAULT 0.0,
    is_passed BOOLEAN DEFAULT FALSE,
    exam_snapshot JSONB
);`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-all shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
