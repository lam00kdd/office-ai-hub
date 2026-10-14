import { Department, Employee, Question, Exam, ExamAssignment, ExamAttempt, ActivityLog, WordTemplate } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    code: 'KT',
    name: 'Phòng Kế toán',
    manager_name: 'Nguyễn Hoàng Lâm',
    description: 'Quản lý tài chính, hạch toán kế toán và ngân sách công ty',
    employee_count: 3,
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'dept-2',
    code: 'NS',
    name: 'Phòng Nhân sự',
    manager_name: 'Trần Thị Bình',
    description: 'Tuyển dụng, đào tạo, chế độ phúc lợi và văn hóa doanh nghiệp',
    employee_count: 3,
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'dept-3',
    code: 'KD',
    name: 'Phòng Kinh doanh',
    manager_name: 'Phạm Thị Dung',
    description: 'Phát triển thị trường, bán hàng và chăm sóc đối tác khách hàng',
    employee_count: 2,
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'dept-4',
    code: 'IT',
    name: 'Phòng Công nghệ Thông tin',
    manager_name: 'Hoàng Minh Đức',
    description: 'Hạ tầng hệ thống, an ninh mạng và phát triển phần mềm nội bộ',
    employee_count: 2,
    created_at: '2025-01-10T08:00:00Z',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employee_code: 'NV001',
    full_name: 'Nguyễn Hoàng Lâm',
    email: 'nh.lam19382@gmail.com',
    phone: '0901234567',
    department_id: 'dept-1',
    department_name: 'Phòng Kế toán',
    position: 'Tổng Quản trị viên (Admin)',
    role: 'admin',
    status: 'active',
    password: 'admin123',
    auth_provider: 'internal',
    avatar_url: '/admin-avatar.svg',
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'emp-2',
    employee_code: 'NV002',
    full_name: 'Trần Thị Bình',
    email: 'binh.tran@congty.com',
    phone: '0902345678',
    department_id: 'dept-2',
    department_name: 'Phòng Nhân sự',
    position: 'Trưởng phòng Nhân sự',
    role: 'manager',
    status: 'active',
    password: '123456',
    auth_provider: 'internal',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-01-15T08:00:00Z',
  },
  {
    id: 'emp-3',
    employee_code: 'NV003',
    full_name: 'Lê Văn Công',
    email: 'cong.le@congty.com',
    phone: '0903456789',
    department_id: 'dept-3',
    department_name: 'Phòng Kinh doanh',
    position: 'Chuyên viên Kinh doanh',
    role: 'employee',
    status: 'active',
    password: '123456',
    auth_provider: 'internal',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'emp-4',
    employee_code: 'NV004',
    full_name: 'Phạm Thị Dung',
    email: 'dung.pham@congty.com',
    phone: '0904567890',
    department_id: 'dept-3',
    department_name: 'Phòng Kinh doanh',
    position: 'Trưởng phòng Kinh doanh',
    role: 'manager',
    status: 'active',
    password: '123456',
    auth_provider: 'internal',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-02-05T08:00:00Z',
  },
  {
    id: 'emp-5',
    employee_code: 'NV005',
    full_name: 'Hoàng Minh Đức',
    email: 'duc.hoang@congty.com',
    phone: '0905678901',
    department_id: 'dept-4',
    department_name: 'Phòng Công nghệ Thông tin',
    position: 'Kỹ sư Trưởng hệ thống',
    role: 'admin',
    status: 'active',
    password: 'admin123',
    auth_provider: 'internal',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-02-10T08:00:00Z',
  },
  {
    id: 'emp-6',
    employee_code: 'NV006',
    full_name: 'Vũ Thị Hoa',
    email: 'hoa.vu@congty.com',
    phone: '0906789012',
    department_id: 'dept-1',
    department_name: 'Phòng Kế toán',
    position: 'Kế toán viên',
    role: 'employee',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-03-01T08:00:00Z',
  },
  {
    id: 'emp-7',
    employee_code: 'NV007',
    full_name: 'Đặng Quốc Khánh',
    email: 'khanh.dang@congty.com',
    phone: '0907890123',
    department_id: 'dept-2',
    department_name: 'Phòng Nhân sự',
    position: 'Chuyên viên Tuyển dụng',
    role: 'employee',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-03-05T08:00:00Z',
  },
  {
    id: 'emp-8',
    employee_code: 'NV008',
    full_name: 'Bùi Thị Lan',
    email: 'lan.bui@congty.com',
    phone: '0908901234',
    department_id: 'dept-1',
    department_name: 'Phòng Kế toán',
    position: 'Kế toán thanh toán',
    role: 'employee',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-03-10T08:00:00Z',
  },
  {
    id: 'emp-9',
    employee_code: 'NV009',
    full_name: 'Đỗ Tiến Mạnh',
    email: 'manh.do@congty.com',
    phone: '0909012345',
    department_id: 'dept-4',
    department_name: 'Phòng Công nghệ Thông tin',
    position: 'Chuyên viên An ninh mạng',
    role: 'employee',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-03-15T08:00:00Z',
  },
  {
    id: 'emp-10',
    employee_code: 'NV010',
    full_name: 'Mai Phương Nga',
    email: 'nga.mai@congty.com',
    phone: '0900123456',
    department_id: 'dept-2',
    department_name: 'Phòng Nhân sự',
    position: 'Chuyên viên Đào tạo',
    role: 'employee',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=256&q=80',
    created_at: '2025-03-20T08:00:00Z',
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    code: 'EX01',
    topic: 'Kỹ năng Excel',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Hàm nào sau đây dùng để tính tổng các ô trong một vùng dữ liệu trong Excel?',
    options: [
      { key: 'A', text: 'AVERAGE()', is_correct: false },
      { key: 'B', text: 'SUM()', is_correct: true },
      { key: 'C', text: 'COUNT()', is_correct: false },
      { key: 'D', text: 'MAX()', is_correct: false },
    ],
    correct_answers: ['B'],
    explanation: 'Hàm SUM() dùng để cộng tất cả các số trong một dải ô được chọn.',
    points: 5,
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'q-2',
    code: 'EX02',
    topic: 'Kỹ năng Excel',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: 'Phím tắt nào để khóa cố định địa chỉ ô tuyệt đối ($A$1) khi viết công thức trong Excel?',
    options: [
      { key: 'A', text: 'F2', is_correct: false },
      { key: 'B', text: 'F4', is_correct: true },
      { key: 'C', text: 'F9', is_correct: false },
      { key: 'D', text: 'Ctrl + F', is_correct: false },
    ],
    correct_answers: ['B'],
    explanation: 'Phím F4 giúp chuyển đổi nhanh giữa địa chỉ tương đối và tuyệt đối trong Excel.',
    points: 5,
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'q-3',
    code: 'EX03',
    topic: 'Kỹ năng Excel',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: 'Cú pháp của hàm VLOOKUP yêu cầu tham số thứ 4 (range_lookup) là số mấy nếu muốn tìm kiếm chính xác tuyệt đối?',
    options: [
      { key: 'A', text: '1 hoặc TRUE', is_correct: false },
      { key: 'B', text: '0 hoặc FALSE', is_correct: true },
      { key: 'C', text: '2', is_correct: false },
      { key: 'D', text: '-1', is_correct: false },
    ],
    correct_answers: ['B'],
    explanation: '0 hoặc FALSE chỉ định tìm kiếm kết quả khớp chính xác 100%.',
    points: 5,
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'q-4',
    code: 'EX04',
    topic: 'Kỹ năng Excel',
    difficulty: 'hard',
    question_type: 'multiple_choice',
    content: 'Những hàm nào sau đây có thể dùng để tra cứu dữ liệu linh hoạt mà không bị giới hạn cột dò tìm phải nằm bên trái? (Chọn các phương án đúng)',
    options: [
      { key: 'A', text: 'XLOOKUP()', is_correct: true },
      { key: 'B', text: 'INDEX() kết hợp MATCH()', is_correct: true },
      { key: 'C', text: 'VLOOKUP() thông thường', is_correct: false },
      { key: 'D', text: 'HLOOKUP()', is_correct: false },
    ],
    correct_answers: ['A', 'B'],
    explanation: 'XLOOKUP và bộ đôi INDEX + MATCH cho phép tra cứu đa chiều sang trái, sang phải mà không phụ thuộc thứ tự cột.',
    points: 5,
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'q-5',
    code: 'EX05',
    topic: 'Kỹ năng Excel',
    difficulty: 'easy',
    question_type: 'true_false',
    content: 'Hàm COUNTIF() chỉ có thể đếm số ô thỏa mãn duy nhất 1 điều kiện.',
    options: [
      { key: 'A', text: 'Đúng', is_correct: true },
      { key: 'B', text: 'Sai', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'COUNTIF() chỉ hỗ trợ 1 điều kiện, nếu cần nhiều điều kiện phải dùng COUNTIFS().',
    points: 5,
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'q-6',
    code: 'WD01',
    topic: 'Soạn thảo văn bản',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Theo quy chuẩn văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP), phông chữ chuẩn bắt buộc là:',
    options: [
      { key: 'A', text: 'Times New Roman (bộ mã Unicode TCVN 6909:2001)', is_correct: true },
      { key: 'B', text: 'Arial', is_correct: false },
      { key: 'C', text: 'Calibri', is_correct: false },
      { key: 'D', text: '.VnTime (TCVN3)', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Nghị định 30/2020/NĐ-CP quy định phông chữ sử dụng là Times New Roman, bộ mã ký tự Unicode.',
    points: 5,
    created_at: '2025-02-02T08:00:00Z',
  },
  {
    id: 'q-7',
    code: 'WD02',
    topic: 'Soạn thảo văn bản',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: 'Khổ giấy chuẩn và quy định lề trang (Top - Bottom - Left - Right) văn bản hành chính theo NĐ 30 là:',
    options: [
      { key: 'A', text: 'Khổ A4: Trên 20-25mm, Dưới 20-25mm, Trái 30-35mm, Phải 15-20mm', is_correct: true },
      { key: 'B', text: 'Khổ Letter: Đều 25.4mm các cạnh', is_correct: false },
      { key: 'C', text: 'Khổ A4: Đều 20mm các cạnh', is_correct: false },
      { key: 'D', text: 'Khổ Legal: Trái 40mm, các cạnh còn lại 20mm', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Nghị định 30/2020/NĐ-CP quy định căn lề: mép trên & dưới 20-25mm, mép trái 30-35mm, mép phải 15-20mm.',
    points: 5,
    created_at: '2025-02-02T08:00:00Z',
  },
  {
    id: 'q-8',
    code: 'WD03',
    topic: 'Soạn thảo văn bản',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Phím tắt nào để căn đều 2 bên đoạn văn bản (Justify) trong Microsoft Word?',
    options: [
      { key: 'A', text: 'Ctrl + J', is_correct: true },
      { key: 'B', text: 'Ctrl + E', is_correct: false },
      { key: 'C', text: 'Ctrl + R', is_correct: false },
      { key: 'D', text: 'Ctrl + L', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Ctrl + J căn đều 2 mép văn bản.',
    points: 5,
    created_at: '2025-02-02T08:00:00Z',
  },
  {
    id: 'q-9',
    code: 'SEC01',
    topic: 'Bảo mật & An toàn thông tin',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Khi nhận được email lạ chứa tệp đính kèm .exe hoặc yêu cầu bấm link đăng nhập khẩn cấp, hành động ĐÚNG là:',
    options: [
      { key: 'A', text: 'Mở ngay xem nội dung là gì', is_correct: false },
      { key: 'B', text: 'Không click link, báo ngay cho bộ phận IT / An ninh thông tin', is_correct: true },
      { key: 'C', text: 'Forward cho đồng nghiệp khác cùng kiểm tra', is_correct: false },
      { key: 'D', text: 'Tải tệp về máy cá nhân quét', is_correct: false },
    ],
    correct_answers: ['B'],
    explanation: 'Cảnh giác với email giả mạo (Phishing), tuyệt đối không bấm link lạ và báo ngay cho IT.',
    points: 5,
    created_at: '2025-02-03T08:00:00Z',
  },
  {
    id: 'q-10',
    code: 'SEC02',
    topic: 'Bảo mật & An toàn thông tin',
    difficulty: 'medium',
    question_type: 'multiple_choice',
    content: 'Những yếu tố nào sau đây giúp tạo nên một mật khẩu mạnh và an toàn? (Chọn các phương án đúng)',
    options: [
      { key: 'A', text: 'Độ dài tối thiểu từ 10 - 12 ký tự trở lên', is_correct: true },
      { key: 'B', text: 'Kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt (@, #, $...)', is_correct: true },
      { key: 'C', text: 'Dùng ngày tháng năm sinh hoặc số điện thoại', is_correct: false },
      { key: 'D', text: 'Không dùng lại mật khẩu cũ trên nhiều dịch vụ khác nhau', is_correct: true },
    ],
    correct_answers: ['A', 'B', 'D'],
    explanation: 'Mật khẩu mạnh cần đủ độ dài, tính ngẫu nhiên, kết hợp ký tự và không trùng lặp thông tin cá nhân dễ đoán.',
    points: 5,
    created_at: '2025-02-03T08:00:00Z',
  },
  {
    id: 'q-11',
    code: 'SEC03',
    topic: 'Bảo mật & An toàn thông tin',
    difficulty: 'easy',
    question_type: 'true_false',
    content: 'Khi rời khỏi vị trí làm việc (đi ăn trưa, họp), nhân viên có nghĩa vụ khóa màn hình máy tính (Windows + L).',
    options: [
      { key: 'A', text: 'Đúng', is_correct: true },
      { key: 'B', text: 'Sai', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Quy tắc bàn làm việc sạch (Clean Desk) và khóa màn hình máy tính khi vắng mặt là chuẩn an ninh thông tin bắt buộc.',
    points: 5,
    created_at: '2025-02-03T08:00:00Z',
  },
  {
    id: 'q-12',
    code: 'PR01',
    topic: 'Quy trình văn phòng',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Khi gửi email công việc cho khách hàng hoặc đối tác bên ngoài, địa chỉ email nội bộ của người quản lý nên đặt ở đâu để theo dõi mà không làm rối người nhận chính?',
    options: [
      { key: 'A', text: 'Trường To', is_correct: false },
      { key: 'B', text: 'Trường Cc hoặc Bcc tùy tính chất bảo mật', is_correct: true },
      { key: 'C', text: 'Dưới chữ ký email', is_correct: false },
      { key: 'D', text: 'Không bao giờ gửi', is_correct: false },
    ],
    correct_answers: ['B'],
    explanation: 'Cc dùng để đồng kính gửi công khai cho người liên quan, Bcc dùng khi cần theo dõi kín đáo.',
    points: 5,
    created_at: '2025-02-04T08:00:00Z',
  },
  {
    id: 'q-13',
    code: 'PR02',
    topic: 'Quy trình văn phòng',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: 'Trong quản lý tài liệu lưu trữ, nguyên tắc 5S của Nhật Bản gồm những bước nào sau đây?',
    options: [
      { key: 'A', text: 'Sàng lọc - Sắp xếp - Sạch sẽ - Săn sóc - Sẵn sàng', is_correct: true },
      { key: 'B', text: 'Soạn thảo - Sao lưu - Sửa đổi - Sắp đặt - Sổ sách', is_correct: false },
      { key: 'C', text: 'Sáng tạo - Siêng năng - Sâu sát - Sòng phẳng - Sau cùng', is_correct: false },
      { key: 'D', text: 'Sản xuất - Sản phẩm - Sức kéo - Sắp lịch - Sơ đồ', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: '5S gồm: Seiri (Sàng lọc), Seiton (Sắp xếp), Seiso (Sạch sẽ), Seiketsu (Săn sóc), Shitsuke (Sẵn sàng).',
    points: 5,
    created_at: '2025-02-04T08:00:00Z',
  },
  {
    id: 'q-14',
    code: 'PPT01',
    topic: 'Kỹ năng PowerPoint',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Quy tắc 10/20/30 nổi tiếng của Guy Kawasaki trong thiết kế slide thuyết trình đề cập đến:',
    options: [
      { key: 'A', text: '10 slide, 20 phút trình bày, cỡ chữ tối thiểu 30pt', is_correct: true },
      { key: 'B', text: '10 hình ảnh, 20 màu sắc, 30 dòng chữ', is_correct: false },
      { key: 'C', text: '10 tiêu đề, 20 gạch đầu dòng, 30 người nghe', is_correct: false },
      { key: 'D', text: '10 bảng biểu, 20 trang ghi chú, 30 phút thảo luận', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Quy tắc 10/20/30: không quá 10 slide, không quá 20 phút, và font chữ không nhỏ hơn 30pt.',
    points: 5,
    created_at: '2025-02-05T08:00:00Z',
  },
  {
    id: 'q-15',
    code: 'PPT02',
    topic: 'Kỹ năng PowerPoint',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Phím tắt để bắt đầu trình chiếu slide từ trang đầu tiên trong PowerPoint là:',
    options: [
      { key: 'A', text: 'F5', is_correct: true },
      { key: 'B', text: 'Shift + F5', is_correct: false },
      { key: 'C', text: 'Ctrl + P', is_correct: false },
      { key: 'D', text: 'Alt + S', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'F5 chiếu từ đầu, Shift + F5 chiếu từ slide hiện tại.',
    points: 5,
    created_at: '2025-02-05T08:00:00Z',
  },
  {
    id: 'q-16',
    code: 'PDF01',
    topic: 'Xử lý file & định dạng',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Định dạng PDF (Portable Document Format) được ưu tiên sử dụng khi gửi hợp đồng, báo giá vì:',
    options: [
      { key: 'A', text: 'Bảo toàn nguyên vẹn định dạng phông chữ, bố cục trên mọi thiết bị và hệ điều hành', is_correct: true },
      { key: 'B', text: 'Luôn có dung lượng nhỏ hơn tất cả các định dạng khác', is_correct: false },
      { key: 'C', text: 'Tự động sửa lỗi chính tả', is_correct: false },
      { key: 'D', text: 'Có thể tự động gửi lại cho khách', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'PDF giữ nguyên phông chữ, ngắt dòng và bố cục in ấn trên bất kỳ màn hình nào.',
    points: 5,
    created_at: '2025-02-06T08:00:00Z',
  },
  {
    id: 'q-17',
    code: 'EX06',
    topic: 'Kỹ năng Excel',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: 'Để loại bỏ hoàn toàn các dòng dữ liệu trùng lặp trong một bảng Excel, tính năng nào được tích hợp sẵn?',
    options: [
      { key: 'A', text: 'Remove Duplicates trong thẻ Data', is_correct: true },
      { key: 'B', text: 'Clear All trong thẻ Home', is_correct: false },
      { key: 'C', text: 'Delete Cells', is_correct: false },
      { key: 'D', text: 'Conditional Formatting', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Tính năng Remove Duplicates trong thẻ Data lọc và xóa các dòng trùng lặp dựa theo các cột chỉ định.',
    points: 5,
    created_at: '2025-02-06T08:00:00Z',
  },
  {
    id: 'q-18',
    code: 'SEC04',
    topic: 'Bảo mật & An toàn thông tin',
    difficulty: 'hard',
    question_type: 'single_choice',
    content: 'Xác thực hai yếu tố (2FA / MFA) bảo vệ tài khoản nhân viên như thế nào?',
    options: [
      { key: 'A', text: 'Yêu cầu thêm một phương thức xác minh thứ hai (mã OTP, ứng dụng xác thực) ngoài mật khẩu', is_correct: true },
      { key: 'B', text: 'Yêu cầu nhập mật khẩu hai lần liên tiếp', is_correct: false },
      { key: 'C', text: 'Tự động đổi mật khẩu sau 2 ngày', is_correct: false },
      { key: 'D', text: 'Chỉ cho phép đăng nhập từ hai thiết bị cố định', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: '2FA yêu cầu kết hợp giữa mật khẩu (cái bạn biết) và thiết bị/mã token (cái bạn sở hữu).',
    points: 5,
    created_at: '2025-02-06T08:00:00Z',
  },
  {
    id: 'q-19',
    code: 'AI01',
    topic: 'Ứng dụng Trợ lý AI',
    difficulty: 'easy',
    question_type: 'single_choice',
    content: 'Khi cung cấp prompt cho AI văn phòng (Gemini) để viết email báo cáo, kỹ thuật nào mang lại kết quả chính xác nhất?',
    options: [
      { key: 'A', text: 'Cung cấp vai trò, mục tiêu cụ thể, bối cảnh dữ liệu và yêu cầu giọng văn rõ ràng', is_correct: true },
      { key: 'B', text: 'Chỉ gõ 1 từ duy nhất "Báo cáo"', is_correct: false },
      { key: 'C', text: 'Viết càng ngắn gọn không dấu càng tốt', is_correct: false },
      { key: 'D', text: 'Copy toàn bộ dữ liệu bí mật quốc gia lên', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Prompt tốt cần Role + Context + Task + Tone + Constraints (Khuôn khổ).',
    points: 5,
    created_at: '2025-02-07T08:00:00Z',
  },
  {
    id: 'q-20',
    code: 'EX07',
    topic: 'Kỹ năng Excel',
    difficulty: 'medium',
    question_type: 'single_choice',
    content: 'Kết quả của công thức =IF(10>5, "ĐẠT", "KHÔNG ĐẠT") trong Excel là gì?',
    options: [
      { key: 'A', text: 'ĐẠT', is_correct: true },
      { key: 'B', text: 'KHÔNG ĐẠT', is_correct: false },
      { key: 'C', text: 'TRUE', is_correct: false },
      { key: 'D', text: '#VALUE!', is_correct: false },
    ],
    correct_answers: ['A'],
    explanation: 'Vì điều kiện 10 > 5 là Đúng (TRUE), hàm trả về giá trị đối số thứ 2 là "ĐẠT".',
    points: 5,
    created_at: '2025-02-07T08:00:00Z',
  },
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    code: 'EXAM-EXCEL-01',
    title: 'Kiểm tra kỹ năng Excel cơ bản & nâng cao',
    description: 'Đánh giá năng lực xử lý bảng tính, các hàm văn phòng (SUM, VLOOKUP, INDEX/MATCH) và quản lý dữ liệu cho nhân viên văn phòng.',
    topic: 'Kỹ năng Excel',
    department_name: 'Toàn công ty',
    target_audience: 'all',
    duration_minutes: 25,
    total_questions: 7,
    total_points: 35,
    passing_score_percent: 70,
    max_attempts: 2,
    shuffle_questions: true,
    shuffle_options: true,
    show_answers_after_submission: true,
    allow_retake: true,
    status: 'published',
    questions: INITIAL_QUESTIONS.filter(q => q.topic === 'Kỹ năng Excel'),
    created_by: 'emp-1',
    created_at: '2025-02-10T08:00:00Z',
  },
  {
    id: 'exam-2',
    code: 'EXAM-SEC-02',
    title: 'Kiểm tra Quy định & Bảo mật thông tin nội bộ',
    description: 'Bài kiểm tra bắt buộc định kỳ về quy định an toàn thông tin, phòng chống email lừa đảo (Phishing) và chuẩn bảo mật máy tính doanh nghiệp.',
    topic: 'Bảo mật & An toàn thông tin',
    department_name: 'Toàn công ty',
    target_audience: 'all',
    duration_minutes: 20,
    total_questions: 4,
    total_points: 20,
    passing_score_percent: 75,
    max_attempts: 3,
    shuffle_questions: true,
    shuffle_options: true,
    show_answers_after_submission: true,
    allow_retake: true,
    status: 'published',
    questions: INITIAL_QUESTIONS.filter(q => q.topic === 'Bảo mật & An toàn thông tin'),
    created_by: 'emp-5',
    created_at: '2025-02-15T08:00:00Z',
  },
  {
    id: 'exam-3',
    code: 'EXAM-DOC-03',
    title: 'Kỹ năng soạn thảo văn bản hành chính theo NĐ 30',
    description: 'Khảo sát kiến thức soạn thảo công văn, thông báo, quy chuẩn căn lề, phông chữ và bố cục văn bản hành chính Việt Nam.',
    topic: 'Soạn thảo văn bản',
    department_name: 'Phòng Hành chính - Nhân sự',
    target_audience: 'dept-2',
    duration_minutes: 15,
    total_questions: 3,
    total_points: 15,
    passing_score_percent: 70,
    max_attempts: 1,
    shuffle_questions: false,
    shuffle_options: true,
    show_answers_after_submission: true,
    allow_retake: false,
    status: 'published',
    questions: INITIAL_QUESTIONS.filter(q => q.topic === 'Soạn thảo văn bản'),
    created_by: 'emp-2',
    created_at: '2025-02-20T08:00:00Z',
  },
];

export const INITIAL_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att-1',
    exam_id: 'exam-1',
    exam_title: 'Kiểm tra kỹ năng Excel cơ bản & nâng cao',
    employee_id: 'emp-3',
    employee_code: 'NV003',
    employee_name: 'Lê Văn Công',
    department_name: 'Phòng Kinh doanh',
    attempt_number: 1,
    started_at: '2025-03-01T09:00:00Z',
    submitted_at: '2025-03-01T09:18:24Z',
    time_spent_seconds: 1104,
    total_questions: 7,
    correct_count: 6,
    incorrect_count: 1,
    skipped_count: 0,
    total_score: 30,
    max_score: 35,
    score_percentage: 85.7,
    is_passed: true,
    status: 'submitted',
    answers: [],
  },
  {
    id: 'att-2',
    exam_id: 'exam-1',
    exam_title: 'Kiểm tra kỹ năng Excel cơ bản & nâng cao',
    employee_id: 'emp-6',
    employee_code: 'NV006',
    employee_name: 'Vũ Thị Hoa',
    department_name: 'Phòng Kế toán',
    attempt_number: 1,
    started_at: '2025-03-02T10:15:00Z',
    submitted_at: '2025-03-02T10:32:10Z',
    time_spent_seconds: 1030,
    total_questions: 7,
    correct_count: 7,
    incorrect_count: 0,
    skipped_count: 0,
    total_score: 35,
    max_score: 35,
    score_percentage: 100,
    is_passed: true,
    status: 'submitted',
    answers: [],
  },
  {
    id: 'att-3',
    exam_id: 'exam-2',
    exam_title: 'Kiểm tra Quy định & Bảo mật thông tin nội bộ',
    employee_id: 'emp-7',
    employee_code: 'NV007',
    employee_name: 'Đặng Quốc Khánh',
    department_name: 'Phòng Nhân sự',
    attempt_number: 1,
    started_at: '2025-03-03T14:00:00Z',
    submitted_at: '2025-03-03T14:12:00Z',
    time_spent_seconds: 720,
    total_questions: 4,
    correct_count: 3,
    incorrect_count: 1,
    skipped_count: 0,
    total_score: 15,
    max_score: 20,
    score_percentage: 75,
    is_passed: true,
    status: 'submitted',
    answers: [],
  },
  {
    id: 'att-4',
    exam_id: 'exam-1',
    exam_title: 'Kiểm tra kỹ năng Excel cơ bản & nâng cao',
    employee_id: 'emp-8',
    employee_code: 'NV008',
    employee_name: 'Bùi Thị Lan',
    department_name: 'Phòng Kế toán',
    attempt_number: 1,
    started_at: '2025-03-04T08:30:00Z',
    submitted_at: '2025-03-04T08:52:00Z',
    time_spent_seconds: 1320,
    total_questions: 7,
    correct_count: 4,
    incorrect_count: 3,
    skipped_count: 0,
    total_score: 20,
    max_score: 35,
    score_percentage: 57.1,
    is_passed: false,
    status: 'submitted',
    answers: [],
  },
];

export const INITIAL_ASSIGNMENTS: ExamAssignment[] = [
  {
    id: 'asg-1',
    exam_id: 'exam-1',
    exam_title: 'Kiểm tra kỹ năng Excel cơ bản & nâng cao',
    employee_id: 'emp-1',
    employee_name: 'Nguyễn Hoàng Lâm',
    department_name: 'Phòng Kế toán',
    assigned_by: 'Hệ thống Quản trị',
    assigned_at: '2025-03-01T08:00:00Z',
    due_date: '2025-04-30T23:59:59Z',
    status: 'completed',
  },
  {
    id: 'asg-2',
    exam_id: 'exam-1',
    exam_title: 'Kiểm tra kỹ năng Excel cơ bản & nâng cao',
    employee_id: 'emp-3',
    employee_name: 'Lê Văn Công',
    department_name: 'Phòng Kinh doanh',
    assigned_by: 'Trần Thị Bình',
    assigned_at: '2025-03-01T08:00:00Z',
    due_date: '2025-04-30T23:59:59Z',
    status: 'completed',
  },
  {
    id: 'asg-3',
    exam_id: 'exam-2',
    exam_title: 'Kiểm tra Quy định & Bảo mật thông tin nội bộ',
    employee_id: 'emp-10',
    employee_name: 'Mai Phương Nga',
    department_name: 'Phòng Nhân sự',
    assigned_by: 'Hoàng Minh Đức',
    assigned_at: '2025-03-05T08:00:00Z',
    due_date: '2025-04-15T23:59:59Z',
    status: 'pending',
  },
  {
    id: 'asg-4',
    exam_id: 'exam-3',
    exam_title: 'Kỹ năng soạn thảo văn bản hành chính theo NĐ 30',
    employee_id: 'emp-7',
    employee_name: 'Đặng Quốc Khánh',
    department_name: 'Phòng Nhân sự',
    assigned_by: 'Trần Thị Bình',
    assigned_at: '2025-03-06T08:00:00Z',
    due_date: '2025-04-20T23:59:59Z',
    status: 'pending',
  },
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    employee_name: 'Nguyễn Hoàng Lâm',
    action: 'Đăng nhập',
    module: 'Xác thực',
    details: 'Đăng nhập thành công với vai trò Quản trị viên (Admin)',
    created_at: '2025-03-10T08:00:00Z',
  },
  {
    id: 'log-2',
    employee_name: 'Trần Thị Bình',
    action: 'Giao bài kiểm tra',
    module: 'Đào tạo',
    details: 'Đã giao bài "Kỹ năng soạn thảo văn bản" cho nhân viên Phòng Nhân sự',
    created_at: '2025-03-10T08:45:00Z',
  },
  {
    id: 'log-3',
    employee_name: 'Lê Văn Công',
    action: 'Nộp bài thi',
    module: 'Khảo thí',
    details: 'Hoàn thành bài "Kiểm tra kỹ năng Excel", kết quả: 85.7% (ĐẠT)',
    created_at: '2025-03-10T09:20:00Z',
  },
  {
    id: 'log-4',
    employee_name: 'Hoàng Minh Đức',
    action: 'Cập nhật ngân hàng',
    module: 'Ngân hàng câu hỏi',
    details: 'Thêm mới 5 câu hỏi chủ đề Bảo mật & An toàn thông tin',
    created_at: '2025-03-10T10:10:00Z',
  },
];

export const INITIAL_WORD_TEMPLATES: WordTemplate[] = [
  {
    id: 'tpl-cong-van',
    title: 'Công văn hành chính',
    description: 'Mẫu công văn gửi đối tác hoặc cơ quan nhà nước theo chuẩn Nghị định 30/2020/NĐ-CP',
    category: 'administrative',
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-------------------------

CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG OFFICE AI
Số: 12/CV-OAI                               Hà Nội, ngày ... tháng ... năm 2026

V/v: Phối hợp triển khai chương trình đào tạo nghiệp vụ văn phòng số

Kính gửi: Ban Giám đốc Quý Công ty đối tác

Căn cứ Kế hoạch phát triển nguồn nhân lực số năm 2026 của Công ty Cổ phần Công nghệ và Truyền thông Office AI;
Căn cứ thỏa thuận hợp tác đào tạo và nâng cao năng lực ứng dụng công nghệ giữa hai bên ký kết ngày 15/01/2026.

Công ty chúng tôi xin trân trọng gửi tới Quý Công ty đề xuất kế hoạch phối hợp tổ chức khóa đào tạo "Kỹ năng Tin học văn phòng & Ứng dụng Trợ lý AI trong Doanh nghiệp" với các nội dung chi tiết như sau:

1. Mục tiêu đào tạo:
- Nâng cao năng lực xử lý số liệu trên bảng tính Excel và công cụ phân tích tự động.
- Chuẩn hóa quy trình soạn thảo văn bản hành chính theo quy định hiện hành.
- Khai thác hiệu quả trợ lý ảo AI để tối ưu hóa thời gian xử lý công văn, email và báo cáo.

2. Thời gian và địa điểm:
- Thời gian: Khai giảng lúc 08h30 ngày ... tháng ... năm 2026.
- Hình thức: Trực tuyến trên hệ thống Office AI Hub kết hợp hội thảo trực tiếp.

Rất mong nhận được sự đồng thuận và phản hồi từ Quý Công ty trước ngày ... tháng ... năm 2026 để công tác chuẩn bị được chu đáo.

Xin trân trọng cảm ơn!

Nơi nhận:                                                      GIÁM ĐỐC ĐIỀU HÀNH
- Như trên;                                                       (Ký và ghi rõ họ tên)
- Lưu: VT, ĐT.`,
  },
  {
    id: 'tpl-thong-bao',
    title: 'Thông báo nội bộ',
    description: 'Mẫu thông báo phổ biến quy định, lịch nghỉ lễ hoặc lịch thi đánh giá năng lực',
    category: 'administrative',
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-------------------------

CÔNG TY CỔ PHẦN OFFICE AI HUB
Số: 28/TB-OAI                               Hà Nội, ngày 10 tháng 03 năm 2026

THÔNG BÁO
Về việc triển khai kỳ kiểm tra định kỳ kỹ năng văn phòng Quý I/2026

Kính gửi: Toàn thể Cán bộ - Nhân viên Công ty

Thực hiện kế hoạch chuẩn hóa năng lực làm việc năm 2026 và nâng cao chất lượng hiệu suất làm việc văn phòng;
Phòng Đào tạo & Nhân sự xin thông báo tới toàn thể cán bộ nhân viên về việc tham gia Kỳ kiểm tra định kỳ Quý I/2026 trên nền tảng Office AI Hub với các nội dung sau:

1. Đối tượng tham gia:
Toàn thể nhân viên chính thức và thử việc thuộc các Khối Kế toán, Nhân sự, Kinh doanh và Vận hành.

2. Danh mục bài kiểm tra:
- Bài 1: Kỹ năng xử lý dữ liệu và hàm tính Excel (Thời lượng: 25 phút).
- Bài 2: Quy định bảo mật thông tin và ứng xử văn hóa doanh nghiệp (Thời lượng: 20 phút).

3. Thời gian thực hiện:
- Hệ thống mở bài từ 08h00 ngày 15/03/2026 đến hết 23h59 ngày 25/03/2026.
- Nhân viên tự giác sắp xếp thời gian làm bài trực tuyến trong khung giờ trên.

4. Yêu cầu và chỉ tiêu đạt:
- Điểm đạt tối thiểu: 70/100 điểm.
- Kết quả kiểm tra là một trong những tiêu chí xét thưởng định kỳ và đánh giá hoàn thành nhiệm vụ.

Đề nghị Trưởng các bộ phận đôn đốc nhân sự tham gia đúng hạn.

Nơi nhận:                                                       TRƯỞNG PHÒNG NHÂN SỰ
- Như trên;                                                       (Ký, đóng dấu)
- Ban Giám đốc (để b/c);
- Lưu: VT, HR.`,
  },
  {
    id: 'tpl-bien-ban',
    title: 'Biên bản cuộc họp',
    description: 'Mẫu ghi chép nội dung cuộc họp giao ban, họp dự án và phân công nhiệm vụ',
    category: 'meeting',
    content: `CÔNG TY CỔ PHẦN OFFICE AI HUB
PHÒNG HÀNH CHÍNH QUẢN TRỊ
-------------------------

BIÊN BẢN CUỘC HỌP GIAO BAN TUẦN
Thời gian: 09h00 ngày 10 tháng 03 năm 2026
Địa điểm: Phòng họp tầng 3 & Trực tuyến qua Office AI Hub

I. THÀNH PHẦN THAM DỰ:
1. Chủ trì: Ông/Bà Nguyễn Hoàng Lâm - Tổng Giám đốc điều hành (Admin)
2. Thư ký: Ông/Bà Trần Thị Bình - Chuyên viên nhân sự
3. Thành phần: Trưởng các bộ phận Kế toán, Kinh doanh, IT và Đào tạo (có mặt 10/10 thành viên).

II. NỘI DUNG CUỘC HỌP:
1. Báo cáo tiến độ công việc tuần qua:
- Phòng Kế toán: Đã hoàn tất báo cáo tài chính tháng 2, không có sai lệch công nợ.
- Phòng IT: Nâng cấp thành công phân hệ AI Gemini 3.8 và công cụ xử lý file PDF trên toàn hệ thống.
- Phòng Nhân sự: Triển khai ngân hàng 20 câu hỏi kiểm tra kỹ năng mới trên nền tảng thi online.

2. Thảo luận các vướng mắc:
- Cần tối ưu hóa quy trình xuất chứng chỉ điện tử cho nhân viên đạt kết quả kiểm tra trên 80%.
- Bổ sung thêm tính năng trích xuất văn bản OCR cho tài liệu scan chất lượng thấp.

III. KẾT LUẬN VÀ PHÂN CÔNG NHIỆM VỤ:
1. Phòng IT: Tiếp tục giám sát hiệu năng máy chủ, hỗ trợ người dùng trong kỳ thi sắp tới. Hạn chót: 15/03/2026.
2. Phòng Nhân sự: Gửi email nhắc nhở toàn thể nhân viên kích hoạt tài khoản và làm bài kiểm tra trước hạn. Hạn chót: 14/03/2026.
3. Ban Thư ký: Hoàn thành biên bản và gửi báo cáo Ban Giám đốc trong ngày hôm nay.

Cuộc họp kết thúc vào hồi 10h45 cùng ngày. Biên bản đã được thông qua các thành viên tham dự./.

THƯ KÝ CUỘC HỌP                                                CHỦ TRÌ CUỘC HỌP
(Ký, ghi rõ họ tên)                                            (Ký, ghi rõ họ tên)`,
  },
  {
    id: 'tpl-ke-hoach',
    title: 'Kế hoạch công tác tuần',
    description: 'Bản kế hoạch phân bổ đầu việc, mục tiêu và chỉ số KPI theo tuần',
    category: 'planning',
    content: `CÔNG TY CỔ PHẦN OFFICE AI HUB
BỘ PHẬN: QUẢN LÝ DỰ ÁN & VẬN HÀNH
-------------------------

KẾ HOẠCH CÔNG TÁC TUẦN 11/2026
(Từ ngày 16/03/2026 đến ngày 22/03/2026)

I. MỤC TIÊU TRỌNG TÂM:
- Triển khai 100% nhân viên hoàn thành đợt kiểm tra kỹ năng văn phòng Quý I.
- Nâng cao tỷ lệ xử lý hóa đơn, công văn số trên hệ thống đạt 95%.
- Hoàn thiện tài liệu hướng dẫn sử dụng bộ công cụ Office AI Hub cho người dùng mới.

II. BẢNG PHÂN CÔNG CHI TIẾT:
1. Thứ Hai:
- 08h30: Họp giao ban đầu tuần, duyệt chỉ tiêu KPI tuần.
- 14h00: Kiểm tra trạng thái hệ thống máy chủ và cơ sở dữ liệu Supabase.
2. Thứ Ba & Thứ Tư:
- Hỗ trợ nhân sự thực hiện các bài thi online.
- Thống kê danh sách nhân viên chưa làm bài để nhắc nhở kịp thời.
3. Thứ Năm:
- Tổng hợp dữ liệu kết quả thi, trích xuất file Excel báo cáo cho Ban Giám đốc.
- Thử nghiệm các mẫu slide PowerPoint tự động bằng AI Gemini.
4. Thứ Sáu:
- Đánh giá chỉ số hài lòng của nhân viên với các công cụ Excel & PDF Tools.
- Họp tổng kết tuần và lập kế hoạch cho tuần kế tiếp.

Người lập kế hoạch: ...................................
Trưởng bộ phận phê duyệt: .............................`,
  },
  {
    id: 'tpl-don-de-nghi',
    title: 'Đơn đề nghị trang cấp thiết bị / công cụ',
    description: 'Mẫu đơn đề nghị nội bộ dành cho nhân viên gửi cấp quản lý phê duyệt',
    category: 'hr',
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-------------------------

ĐƠN ĐỀ NGHỊ TRANG CẤP CÔNG CỤ LÀM VIỆC

Kính gửi:
- Ban Giám đốc Công ty Cổ phần Office AI Hub;
- Phòng Hành chính - Quản trị tài sản.

Tôi tên là: ...................................................................................
Mã nhân viên: ....................................... Chức vụ: ..............................
Bộ phận / Phòng ban: ..........................................................................

Kính xin trình bày với Quý cấp một việc như sau:
Để phục vụ hiệu quả cho công tác chuyên môn tại bộ phận, đặc biệt là việc xử lý khối lượng lớn tài liệu kế toán, chuyển đổi tài liệu số và phân tích dữ liệu bảng tính, tôi kính đề nghị Công ty xem xét trang cấp:

1. Danh mục trang thiết bị đề nghị:
- Bản quyền phần mềm / Bản nâng cấp tài khoản Office AI Hub Pro.
- Thiết bị chuyên dụng (màn hình phụ / chuột công thái học...).

2. Lý do trang cấp:
Đảm bảo tốc độ xử lý công việc nhanh chóng, giảm thiểu sai sót và đáp ứng kịp thời hạn báo cáo định kỳ theo yêu cầu của Ban Giám đốc.

Kính mong Ban Giám đốc và Phòng Hành chính xem xét và phê duyệt.
Tôi xin chân thành cảm ơn!

Hà Nội, ngày ... tháng ... năm 2026
Ý KIẾN TRƯỞNG BỘ PHẬN                                              NGƯỜI LÀM ĐƠN
(Ký và ghi rõ họ tên)                                            (Ký và ghi rõ họ tên)`,
  },
];
