import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Key,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Server,
  Layout,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  Globe,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  syncSeedDataToSupabase,
  checkSupabaseGoogleProviderStatus
} from '../services/supabaseClient';
import { toast } from '../services/toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'connect' | 'google-oauth' | 'erd' | 'wireframe' | 'sql';
}

export const DatabaseSchemaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultTab = 'connect',
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'google-oauth' | 'erd' | 'wireframe' | 'sql'>(defaultTab);
  const [copied, setCopied] = useState(false);

  // Connection settings state
  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds.url);
  const [key, setKey] = useState(creds.key);
  const [showKey, setShowKey] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    latencyMs?: number;
    message: string;
  } | null>(null);

  // Google OAuth testing state
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<{
    enabled: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const c = getSupabaseCredentials();
      setUrl(c.url);
      setKey(c.key);
      if (c.url && c.key) {
        handleTestConnection(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (showToast = true) => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const cleanKey = key.trim().replace(/^['"]|['"]$/g, '');
      setUrl(cleanUrl);
      setKey(cleanKey);
      // Save current input before testing
      saveSupabaseCredentials(cleanUrl, cleanKey);
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (showToast) {
        if (res.connected) {
          toast.success(res.message, 'Supabase Cloud');
        } else {
          toast.error(res.message, 'Lỗi kết nối Supabase');
        }
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const res = await syncSeedDataToSupabase();
      if (res.success) {
        toast.success(res.message, 'Đồng bộ Supabase thành công');
      } else {
        toast.error(res.message, 'Lỗi đồng bộ dữ liệu');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleTestGoogleProvider = async () => {
    setTestingGoogle(true);
    setGoogleStatus(null);
    try {
      saveSupabaseCredentials(url, key);
      const res = await checkSupabaseGoogleProviderStatus();
      setGoogleStatus(res);
      if (res.enabled) {
        toast.success(res.message, 'Google OAuth');
      } else {
        toast.error(res.message, 'Google Provider');
      }
    } finally {
      setTestingGoogle(false);
    }
  };

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

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    auth_provider VARCHAR(50) DEFAULT 'google',
    avatar_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    toast.info('Đã sao chép mã SQL vào khay nhớ tạm');
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
      name: 'guests',
      desc: 'Lưu trữ thông tin khách/đối tác đăng nhập qua Google OAuth hoặc Supabase Auth',
      pks: ['id (UUID)'],
      fks: [],
      cols: ['email (UNIQUE)', 'full_name', 'auth_provider', 'avatar_url', 'last_login_at'],
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Trung tâm Cấu hình & Cơ sở dữ liệu Supabase
              </h2>
              <p className="text-xs text-slate-500">
                Kết nối Cloud Supabase, Kiểm tra Ping, Đồng bộ dữ liệu, Sơ đồ thực thể ERD & Wireframe
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
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="w-4 h-4" /> Kết nối & Đồng bộ Supabase
          </button>
          <button
            onClick={() => setActiveTab('google-oauth')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'google-oauth'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Kích hoạt Google OAuth</span>
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'erd'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-4 h-4" /> Sơ đồ thực thể ERD
          </button>
          <button
            onClick={() => setActiveTab('wireframe')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'wireframe'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layout className="w-4 h-4" /> Wireframe Bảng điều khiển
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
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
          {activeTab === 'connect' && (
            <div className="space-y-6">
              {/* Status Box */}
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  testResult?.connected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult?.connected ? (
                    <Wifi className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm">
                      {testResult?.connected
                        ? `Đã kết nối Supabase Cloud (${testResult.latencyMs}ms)`
                        : 'Chế độ Cục bộ (Local Database) / Đang chờ cấu hình'}
                    </h3>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {testResult?.message ||
                        'Dữ liệu hiện được lưu trữ an toàn trong trình duyệt. Khi bạn nhập URL và Key từ bảng điều khiển Supabase, hệ thống sẽ tự động chuyển sang Cloud PostgreSQL.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleTestConnection(true)}
                  disabled={testing}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
                </button>
              </div>

              {/* Form Input URL and Key */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Thông tin kết nối Supabase Project (lấy từ Supabase Settings &gt; API)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVercelGuide(!showVercelGuide)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{showVercelGuide ? 'Ẩn hướng dẫn Vercel ▲' : 'Cách cài đặt trên Vercel ▼'}</span>
                  </button>
                </div>

                {/* Collapsible Vercel Environment Variables Guide */}
                {showVercelGuide && (
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] space-y-2 animate-in fade-in">
                    <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <span>🚀 Tại sao bên AI Studio kết nối được mà khi Public lên Vercel lại báo lỗi?</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-300 leading-relaxed text-[11px]">
                      1. <strong>LocalStorage là riêng biệt theo từng tên miền:</strong> Cài đặt bạn nhập ở link AI Studio chỉ nằm trong trình duyệt của link đó, không tự đồng bộ sang domain Vercel (<code>office-ai-hub.vercel.app</code>).<br />
                      2. <strong>Để website trên Vercel luôn tự động kết nối cho tất cả mọi người:</strong> Bạn hãy thêm 2 biến sau trong <strong>Vercel Dashboard &gt; Project Settings &gt; Environment Variables</strong>, sau đó bấm <em>Redeploy</em>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 select-all">
                        <span className="text-slate-500 font-sans block text-[9px] uppercase tracking-wider font-bold">Key 1:</span>
                        <code className="text-blue-600 dark:text-blue-400 font-bold">VITE_SUPABASE_URL</code>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 select-all">
                        <span className="text-slate-500 font-sans block text-[9px] uppercase tracking-wider font-bold">Key 2:</span>
                        <code className="text-emerald-600 dark:text-emerald-400 font-bold">VITE_SUPABASE_ANON_KEY</code>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL):
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value.trim().replace(/\/+$/, ''))}
                    placeholder="https://your-project-ref.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY):
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {key ? `${key.length} ký tự` : 'Chưa nhập'}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={key}
                      onChange={(e) => setKey(e.target.value.trim().replace(/^['"]|['"]$/g, ''))}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showKey ? 'Ẩn khóa' : 'Hiện khóa để kiểm tra chính xác'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Realtime Key Validation Warning */}
                  {key && (
                    <div className="mt-2">
                      {key.startsWith('eyJ') && key.length > 80 ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Đúng định dạng Supabase JWT Anon Key ({key.length} ký tự)</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Cảnh báo: Khóa API hiện tại ({key.length} ký tự) không phải là Anon Key!</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-200/90">
                            Khóa <strong>anon public</strong> thật của Supabase là một mã JWT dài (thường từ 150 đến 250 ký tự) luôn bắt đầu bằng chữ <code>eyJ...</code>.<br />
                            Trong Supabase Dashboard tab <strong>API Keys / Settings</strong> của bạn: Hãy tìm mục <strong>Project API keys</strong> &gt; dòng <strong>anon (public)</strong> &gt; bấm nút <strong>Copy</strong> rồi dán vào đây. (Tránh dán Mật khẩu Database hay Personal Access Token sbp_...).
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    💡 Khuyên dùng: Nhấn nút <strong>Hiện (Eye)</strong> để kiểm tra chuỗi trước khi lưu.
                  </span>
                  <button
                    onClick={() => handleTestConnection(true)}
                    disabled={testing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span>{testing ? 'Đang kiểm tra...' : 'Lưu & Kiểm tra kết nối'}</span>
                  </button>
                </div>
              </div>

              {/* Seed Data Button */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-600" />
                    Đồng bộ dữ liệu mẫu lên Supabase (1-Click Seed)
                  </h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                    Tự động đẩy 4 phòng ban, 10 nhân viên (Admin Nguyễn Hoàng Lâm), 20 câu hỏi khảo thí và 3 đề thi mẫu vào bảng Supabase của bạn.
                  </p>
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={syncing || !testResult?.connected}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Đang đồng bộ...' : 'Đẩy dữ liệu mẫu lên Supabase'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'google-oauth' && (
            <div className="space-y-5">
              {/* Status Header Box */}
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  googleStatus?.enabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                    : googleStatus
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      googleStatus?.enabled
                        ? 'bg-emerald-600 text-white'
                        : googleStatus
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Trạng thái Google OAuth trên Supabase:</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          googleStatus?.enabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : googleStatus
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {googleStatus?.enabled ? 'Đã kích hoạt (Sẵn sàng)' : googleStatus ? 'Chưa kích hoạt (Lỗi 400)' : 'Chưa kiểm tra'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {googleStatus?.message ||
                        'Nhấn nút kiểm tra bên cạnh để xác định xem Google Provider đã được bật trên dự án Supabase của bạn hay chưa mà không bị gián đoạn trình duyệt.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestGoogleProvider}
                  disabled={testingGoogle}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingGoogle ? 'animate-spin' : ''}`} />
                  <span>{testingGoogle ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}</span>
                </button>
              </div>

              {/* Step-by-Step Activation Guide */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Hướng dẫn 3 bước kích hoạt đăng nhập Google qua Supabase
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Bước 1: Lấy URL chuyển hướng (Redirect Callback URI)</span>
                      <span className="text-[10px] text-blue-600 font-normal">Cần dán vào Google Cloud</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Dán URL callback này vào phần <strong>Authorized redirect URIs</strong> trên Google Cloud Console:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 font-mono text-[11px] select-all break-all border border-slate-200 dark:border-slate-700">
                        {url ? `${url.replace(/\/+$/, '')}/auth/v1/callback` : 'https://[ma-project].supabase.co/auth/v1/callback'}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          const cb = url ? `${url.replace(/\/+$/, '')}/auth/v1/callback` : 'https://[ma-project].supabase.co/auth/v1/callback';
                          navigator.clipboard.writeText(cb);
                          toast.info('Đã sao chép Callback URI');
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Bước 2: Tạo OAuth Client ID trên Google Cloud Console
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] pl-1">
                      <li>Truy cập <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Google Cloud Console &gt; Credentials</a>.</li>
                      <li>Nhấn <strong>Create Credentials</strong> &gt; chọn <strong>OAuth client ID</strong>.</li>
                      <li>Application type: chọn <strong>Web application</strong>.</li>
                      <li>Dán Callback URI ở Bước 1 vào mục <strong>Authorized redirect URIs</strong>.</li>
                      <li>Nhấn <strong>Create</strong> để nhận <code>Client ID</code> và <code>Client Secret</code>.</li>
                    </ol>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Bước 3: Dán khóa vào Supabase Dashboard &amp; Bật Provider
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] pl-1">
                      <li>Truy cập <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Supabase Dashboard</a> &gt; chọn dự án của bạn.</li>
                      <li>Vào mục <strong>Authentication</strong> &gt; chọn tab <strong>Providers</strong> &gt; tìm mục <strong>Google</strong>.</li>
                      <li>Gạt công tắc sang <strong>Enable Google provider</strong>.</li>
                      <li>Dán <code>Client ID</code> và <code>Client Secret</code> vừa lấy ở Bước 2 vào &gt; Nhấn <strong>Save</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Guest Profile Saving Information */}
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <strong>Tự động lưu thông tin khách vào Database:</strong>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                    Mỗi khi khách đăng nhập bằng tài khoản Google (hoặc dùng bộ chọn tài khoản trực tiếp trong ứng dụng), hệ thống sẽ tự động lưu hồ sơ khách (Họ tên, Email, Ảnh đại diện, Thời gian đăng nhập) vào bảng CSDL <code>guests</code> và hiển thị trong mục Quản lý Nhân sự &gt; Khách vãng lai.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  <span>[HEADER] Logo Office AI Hub | 🔍 Tìm kiếm công cụ, tài liệu... | 🟢 Supabase: Kết nối | 🔔 | 👤 Nguyễn Hoàng Lâm (Admin)</span>
                </div>

                <div className="grid grid-cols-12 gap-4">
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

                  <div className="col-span-9 space-y-4">
                    <div className="border border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="font-bold text-sm text-blue-600">👋 Chào mừng đến với Office AI Hub!</div>
                      <div className="text-xs text-slate-500">Mọi công cụ văn phòng và đào tạo trong một nền tảng.</div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📊 Xử lý Excel</div>
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📄 Công cụ PDF</div>
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📝 Soạn Word</div>
                      <div className="border border-slate-300 rounded p-2 text-center bg-white dark:bg-slate-800">📽️ Slide PPT</div>
                    </div>

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
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Trạng thái hiện tại: <strong>{testResult?.connected ? '🟢 Đã kết nối Cloud' : '🟡 Offline Local'}</strong>
          </div>
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
