-- ==============================================================================
-- OFFICE AI HUB - HỆ THỐNG CƠ SỞ DỮ LIỆU TOÀN DIỆN CHO SUPABASE / POSTGRESQL
-- ==============================================================================

-- Bật UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG PHÒNG BAN (departments)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BẢNG NHÂN VIÊN & TÀI KHOẢN (employees)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BẢNG NGÂN HÀNG CÂU HỎI (questions)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    topic VARCHAR(150) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_type VARCHAR(50) NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
    content TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Mảng các lựa chọn [{ key: 'A', text: '...', is_correct: true }]
    correct_answers TEXT[] NOT NULL,           -- Mảng key đúng ví dụ ['A'] hoặc ['A', 'C']
    explanation TEXT,
    points NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BẢNG ĐỀ THI / BÀI KIỂM TRA (exams)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(150),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    target_audience VARCHAR(100) DEFAULT 'all',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_questions INTEGER NOT NULL DEFAULT 0,
    total_points NUMERIC(6, 2) NOT NULL DEFAULT 100.0,
    passing_score_percent NUMERIC(5, 2) NOT NULL DEFAULT 70.0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    max_attempts INTEGER NOT NULL DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    show_answers_after_submission BOOLEAN DEFAULT TRUE,
    allow_retake BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BẢNG LIÊN KẾT ĐỀ THI - CÂU HỎI (exam_questions)
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    points NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(exam_id, question_id)
);

-- 6. BẢNG GIAO BÀI KIỂM TRA CHO NHÂN VIÊN (exam_assignments)
CREATE TABLE IF NOT EXISTS exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, employee_id)
);

-- 7. BẢNG LƯỢT THI / LỊCH SỬ LÀM BÀI (exam_attempts)
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    total_score NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    max_score NUMERIC(6, 2) NOT NULL DEFAULT 100.0,
    score_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('in_progress', 'submitted', 'timed_out')),
    exam_snapshot JSONB, -- Lưu lại trạng thái câu hỏi & đáp án tại thời điểm thi (không bị thay đổi khi sửa ngân hàng)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. BẢNG CHI TIẾT CÂU TRẢ LỜI CỦA TỪNG LƯỢT THI (attempt_answers)
CREATE TABLE IF NOT EXISTS attempt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    selected_options TEXT[] NOT NULL DEFAULT '{}',
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. BẢNG NHẬT KÝ HOẠT ĐỘNG (activity_logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    employee_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. BẢNG CÀI ĐẶT HỆ THỐNG (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TẠO CHỈ MỤC TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_emp ON exam_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_emp ON exam_attempts(employee_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);

-- CHÍNH SÁCH BẢO MẬT ROW LEVEL SECURITY (RLS) SUPABASE
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc chung trong nội bộ công ty
CREATE POLICY "Public Read Employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Public Read Exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public Read Questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public Read Attempts" ON exam_attempts FOR SELECT USING (true);
