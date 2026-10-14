import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini SDK with user agent telemetry
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health & Status check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiAvailable: !!ai,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/gemini/status', (_req: Request, res: Response) => {
  res.json({
    connected: !!ai,
    model: 'gemini-3.8-flash',
    message: ai
      ? 'Đã kết nối Gemini AI thành công.'
      : 'Chưa cấu hình GEMINI_API_KEY trong biến môi trường. Vui lòng cấu hình trong Settings > Secrets.',
  });
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa kết nối AI. Vui lòng thêm GEMINI_API_KEY vào biến môi trường để sử dụng tính năng này.',
      });
    }

    const { messages, tone, systemPrompt } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    const lastMessage = messages[messages.length - 1];
    const systemInstruction = (systemPrompt || '') +
      `\nBạn là Office AI Hub - Trợ lý văn phòng & Quản lý đào tạo thông minh hàng đầu.
Giọng điệu: ${tone || 'Chuyên nghiệp, chuẩn mực văn phòng Việt Nam'}.
Nhiệm vụ: Hỗ trợ công việc văn phòng, xử lý Excel, Word, PDF, soạn thảo công văn, email, phân tích dữ liệu, tạo đề thi trắc nghiệm và đào tạo nhân viên. Trả lời bằng tiếng Việt rõ ràng, chuẩn ngữ pháp, định dạng markdown đẹp.`;

    // Build contents from previous messages
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || 'Không có phản hồi từ AI.',
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi xử lý phản hồi từ Gemini AI.',
    });
  }
});

// Gemini Prompt Generator Endpoint for Office Tools & Exam generation
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa kết nối AI. Vui lòng thêm GEMINI_API_KEY vào biến môi trường.',
      });
    }

    const { prompt, context, toolType, responseFormat } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Thiếu nội dung yêu cầu.' });
    }

    const systemInstruction = `Bạn là trợ lý văn phòng cao cấp thuộc Office AI Hub.
Công cụ chuyên biệt: ${toolType || 'Văn phòng tổng hợp'}.
${context ? `Ngữ cảnh / Dữ liệu bổ sung: ${JSON.stringify(context)}` : ''}
Hãy tạo kết quả chính xác, chuẩn phong cách hành chính và nghiệp vụ văn phòng Việt Nam.`;

    const config: any = {
      systemInstruction,
      temperature: 0.6,
    };

    if (responseFormat === 'json') {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    res.json({
      result: response.text || '',
    });
  } catch (error: any) {
    console.error('Gemini Generate Error:', error);
    res.status(500).json({
      error: error?.message || 'Lỗi xử lý yêu cầu với Gemini AI.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Office AI Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
