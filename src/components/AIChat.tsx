import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { DatabaseService } from '../services/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content:
        'Xin chào! Tôi là Trợ lý AI của Office AI Hub. Tôi có thể giúp bạn viết email, soạn thảo công văn, gợi ý công thức Excel, tạo đề thi trắc nghiệm và phân tích dữ liệu văn phòng.\n\nBạn cần hỗ trợ công việc gì hôm nay?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState('Chuyên nghiệp, chuẩn mực văn phòng');
  const [aiConnected, setAiConnected] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check AI server health
    fetch('/api/gemini/status')
      .then((res) => res.json())
      .then((data) => setAiConnected(!!data.connected))
      .catch(() => setAiConnected(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi xử lý');
      }

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Không nhận được phản hồi từ AI.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      DatabaseService.playSuccessSound();
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Chưa thể kết nối tới Gemini AI. Vui lòng cấu hình GEMINI_API_KEY trong hệ thống.'}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content: 'Hội thoại đã được làm mới. Tôi có thể hỗ trợ gì cho bạn?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const promptSuggestions = [
    '📧 Viết email thông báo nghỉ lễ 30/4 cho khách hàng',
    '📊 Gợi ý công thức Excel dò tìm đa điều kiện (INDEX MATCH)',
    '📝 Soạn công văn đề nghị thanh toán theo chuẩn NĐ 30',
    '🎯 Tạo 5 câu hỏi trắc nghiệm về an toàn thông tin văn phòng',
  ];

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs animate-in fade-in duration-200">
      {/* Chat Header (matching UI screen 12) */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Trợ lý AI Văn phòng (Gemini 3.8 Flash)</span>
              {aiConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  Chờ API Key
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Trợ lý thông minh hỗ trợ xử lý công văn, Excel, slide và khảo thí
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="Chuyên nghiệp, chuẩn mực văn phòng">Giọng điệu: Chuyên nghiệp</option>
            <option value="Ngắn gọn, súc tích, chỉ gạch đầu dòng">Giọng điệu: Ngắn gọn</option>
            <option value="Hành chính công văn trang trọng">Giọng điệu: Hành chính</option>
            <option value="Thân thiện, động viên nhân viên">Giọng điệu: Thân thiện</option>
          </select>
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Làm mới hội thoại"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300'
                }`}
              >
                {isUser ? 'Tôi' : <Bot className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-750 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700'
                  }`}
                >
                  {m.content}
                </div>
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-slate-600 flex items-center gap-1"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-750 text-xs text-slate-500 rounded-tl-none">
              Gemini AI đang suy nghĩ và chuẩn bị phản hồi...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Gợi ý nhanh:
          </span>
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-purple-400 whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Box (matching UI screen 12) */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi hoặc yêu cầu của bạn (ví dụ: Viết email nhắc nhở nộp báo cáo...)"
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700/60 border-none rounded-xl text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span>Gửi</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
