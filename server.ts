/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// ── Upstash Redis client ──────────────────────────────────────────────────────
let kv: Redis | null = null;
try {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    kv = new Redis({ url, token });
    console.log("✅ Upstash Redis connected");
  } else {
    console.warn("⚠️  UPSTASH_REDIS_REST_URL / TOKEN missing – storage disabled");
  }
} catch (e) {
  console.error("Failed to init Upstash Redis:", e);
}

// ── Gemini AI client ──────────────────────────────────────────────────────────
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const KEYS = {
  propertiesIndex: "tt:properties:index",   // list of IDs (newest first)
  property: (id: string) => `tt:property:${id}`,
  leadsIndex: "tt:leads:index",
  lead: (id: string) => `tt:lead:${id}`,
  stats: "tt:stats",
  logs: "tt:logs",                           // list (capped at 50)
};

// ── Properties ────────────────────────────────────────────────────────────────

// GET /api/properties
app.get("/api/properties", async (_req, res) => {
  if (!kv) return res.json([]);
  try {
    const ids = await kv.lrange(KEYS.propertiesIndex, 0, -1);
    if (!ids.length) return res.json([]);
    const pipeline = kv.pipeline();
    ids.forEach((id) => pipeline.hgetall(KEYS.property(id as string)));
    const results = await pipeline.exec();
    const properties = (results as any[]).filter(Boolean);
    res.json(properties);
  } catch (err: any) {
    console.error("GET /api/properties:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/properties  — create or update
app.post("/api/properties", async (req, res) => {
  if (!kv) return res.status(503).json({ error: "Storage unavailable" });
  const prop = req.body;
  if (!prop?.id) return res.status(400).json({ error: "Missing id" });
  try {
    const existing = await kv.hgetall(KEYS.property(prop.id));
    // Detect price change
    if (existing && (existing as any).price !== undefined) {
      const oldPrice = parseFloat(String((existing as any).price));
      const newPrice = parseFloat(String(prop.price));
      if (oldPrice !== newPrice) {
        prop.oldPrice = oldPrice;
        prop.priceChangedAt = new Date().toISOString();
      } else {
        prop.oldPrice       = (existing as any).oldPrice;
        prop.priceChangedAt = (existing as any).priceChangedAt;
      }
    }
    // Flatten all values to strings (Redis hset requirement)
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(prop)) {
      flat[k] = Array.isArray(v) ? JSON.stringify(v) : String(v ?? "");
    }
    await kv.hset(KEYS.property(prop.id), flat);
    // Add to index only if new
    if (!existing) {
      await kv.lpush(KEYS.propertiesIndex, prop.id);
    }
    res.json({ ok: true, property: prop });
  } catch (err: any) {
    console.error("POST /api/properties:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/properties/:id
app.delete("/api/properties/:id", async (req, res) => {
  if (!kv) return res.status(503).json({ error: "Storage unavailable" });
  const { id } = req.params;
  try {
    await kv.del(KEYS.property(id));
    await kv.lrem(KEYS.propertiesIndex, 0, id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/properties/:id/views — increment view counter
app.patch("/api/properties/:id/views", async (req, res) => {
  if (!kv) return res.json({ ok: true });
  const { id } = req.params;
  try {
    await kv.hincrby(KEYS.property(id), "views", 1);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Leads ─────────────────────────────────────────────────────────────────────

// GET /api/leads
app.get("/api/leads", async (_req, res) => {
  if (!kv) return res.json([]);
  try {
    const ids = await kv.lrange(KEYS.leadsIndex, 0, -1);
    if (!ids.length) return res.json([]);
    const pipeline = kv.pipeline();
    ids.forEach((id) => pipeline.hgetall(KEYS.lead(id as string)));
    const results = await pipeline.exec();
    res.json((results as any[]).filter(Boolean));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads
app.post("/api/leads", async (req, res) => {
  if (!kv) return res.status(503).json({ error: "Storage unavailable" });
  const lead = req.body;
  if (!lead?.id) return res.status(400).json({ error: "Missing id" });
  try {
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(lead)) flat[k] = String(v ?? "");
    await kv.hset(KEYS.lead(lead.id), flat);
    await kv.lpush(KEYS.leadsIndex, lead.id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id — update status
app.patch("/api/leads/:id", async (req, res) => {
  if (!kv) return res.status(503).json({ error: "Storage unavailable" });
  const { id } = req.params;
  const { status } = req.body;
  try {
    await kv.hset(KEYS.lead(id), { status });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id
app.delete("/api/leads/:id", async (req, res) => {
  if (!kv) return res.status(503).json({ error: "Storage unavailable" });
  const { id } = req.params;
  try {
    await kv.del(KEYS.lead(id));
    await kv.lrem(KEYS.leadsIndex, 0, id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stats & Logs ──────────────────────────────────────────────────────────────

// GET /api/stats
app.get("/api/stats", async (_req, res) => {
  if (!kv) return res.json({ views: 0, fbShares: 0, zaloShares: 0, linkCopies: 0, totalLeads: 0 });
  try {
    const raw = await kv.hgetall(KEYS.stats);
    if (!raw) return res.json({ views: 0, fbShares: 0, zaloShares: 0, linkCopies: 0, totalLeads: 0 });
    const stats = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, parseInt(String(v)) || 0])
    );
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stats/increment
app.post("/api/stats/increment", async (req, res) => {
  if (!kv) return res.json({ ok: true });
  const { field } = req.body; // e.g. "views", "fbShares"
  if (!field) return res.status(400).json({ error: "Missing field" });
  try {
    await kv.hincrby(KEYS.stats, field, 1);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs
app.get("/api/logs", async (_req, res) => {
  if (!kv) return res.json([]);
  try {
    const raw = await kv.lrange(KEYS.logs, 0, 49);
    const logs = (raw as string[]).map((item) => {
      try { return JSON.parse(item); } catch { return null; }
    }).filter(Boolean);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs
app.post("/api/logs", async (req, res) => {
  if (!kv) return res.json({ ok: true });
  const log = req.body;
  try {
    await kv.lpush(KEYS.logs, JSON.stringify(log));
    await kv.ltrim(KEYS.logs, 0, 49); // keep latest 50
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI ENDPOINTS (unchanged logic, model name fixed)
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Generate Real Estate Post
app.post("/api/generate-post", async (req, res) => {
  const { rawText } = req.body;
  if (!rawText?.trim()) return res.status(400).json({ error: "Missing rawText parameter" });
  if (!ai) return res.status(503).json({ error: "Gemini API client is not initialized." });

  try {
    const prompt = `Phân tích thông tin bất động sản thô sau đây và điền vào các thông số, đồng thời viết một bài quảng cáo Facebook cực kỳ chuyên sâu và cuốn hút theo quy định.\n\nThông tin thô khách cung cấp:\n"${rawText}"`;

    const systemInstruction = `Bạn là một chuyên gia sáng tạo nội dung bất động sản chuyên nghiệp tại TP. Thủ Đức, TP.HCM. Nhiệm vụ của bạn là chuyển đổi các thông tin thô thành thông tin cấu trúc JSON để điền form cùng bài đăng tối ưu để chạy quảng cáo Facebook.

## QUY TẮC PHÂN TÍCH DỮ LIỆU (QUAN TRỌNG NHẤT):

### Tên đường (duongpho):
- Tìm tên ĐƯỜNG CHÍNH / TÊN HẺM CHÍNH được đề cập, KHÔNG phải số thửa hay số tờ.
- Ví dụ: "Hẻm 383 Long Phước" → duongpho = "Long Phước"
- Ví dụ: "đường Lò Lu" → duongpho = "Lò Lu"
- Nếu có cả số hẻm và tên đường, chỉ lấy TÊN ĐƯỜNG.

### Số nhà (sonha):
- Chỉ điền nếu có số nhà cụ thể (ví dụ: 45A, 12B).
- Số thửa/tờ (ví dụ: "Thửa 591, Tờ 64") KHÔNG phải số nhà → sonha = ""

### Giá (price):
- Chỉ lấy giá bán thực sự (đơn vị tỷ đồng).
- Số thửa đất, số tờ, diện tích KHÔNG phải giá.
- Ví dụ: "Thửa 591" → đây là số thửa, KHÔNG phải giá → price = 0

### Diện tích (area):
- Lấy số m2 rõ ràng. Ví dụ: "51m2" → area = 51

### Số tầng / phòng ngủ / WC / Hướng:
- Chỉ điền nếu đề cập rõ. Nếu không có → để trống ""

### Pháp lý (phaply):
- Tìm từ khóa: "sổ hồng", "sổ đỏ", "hoàn công", v.v. Nếu không → phaply = ""

---

## QUY TẮC VIẾT BÀI FACEBOOK:

1. Tiêu đề: VIẾT HOA, bắt đầu bằng 🔥, tóm tắt điểm nhấn.
2. Mục 1 - THÔNG SỐ & GIÁ BÁN: Vị trí, Diện tích, Kết cấu, Hướng, Giá bán (nếu có).
3. Mục 2 - HIỆN TRẠNG & TIỀM NĂNG: Mỗi điểm mạnh bắt đầu bằng dấu (-).
4. Kết bài: 'Quý khách hàng quan tâm đến tài sản này vui lòng liên hệ để nhận thêm chi tiết và sắp xếp lịch xem nhà/đất.'
5. Giữa các mục cách 1 dòng trống. Tuyệt đối KHÔNG đề cập ngập lụt. KHÔNG dùng tiêu đề 'Ưu điểm'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["sonha","duongpho","phuongxa","area","price","sotang","bedroom","nhavesinh","direction","phaply","tieu_de","facebookPost"],
          properties: {
            sonha:        { type: Type.STRING, description: "Số nhà cụ thể. Để trống nếu không có hoặc chỉ có số thửa/tờ." },
            duongpho:     { type: Type.STRING, description: "Tên đường chính (không bao gồm số hẻm). VD: 'Long Phước', 'Lò Lu'." },
            phuongxa:     { type: Type.STRING, description: "Tên phường thuộc TP. Thủ Đức" },
            area:         { type: Type.NUMBER, description: "Diện tích m2. Trả về 0 nếu không tìm thấy." },
            price:        { type: Type.NUMBER, description: "Giá bán tính bằng tỷ đồng. Trả về 0 nếu không có giá rõ ràng. Không nhầm với số thửa/tờ." },
            sotang:       { type: Type.STRING, description: "Số tầng. Để trống nếu không đề cập." },
            bedroom:      { type: Type.STRING, description: "Số phòng ngủ. Để trống nếu không đề cập." },
            nhavesinh:    { type: Type.STRING, description: "Số phòng WC. Để trống nếu không đề cập." },
            direction:    { type: Type.STRING, description: "Hướng nhà/đất. Để trống nếu không đề cập." },
            phaply:       { type: Type.STRING, description: "Tình trạng pháp lý. Để trống nếu không đề cập." },
            tieu_de:      { type: Type.STRING, description: "Tiêu đề VIẾT HOA, bắt đầu bằng 🔥." },
            facebookPost: { type: Type.STRING, description: "Bài đăng Facebook đầy đủ theo cấu trúc." },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: error.message || "Failed to generate post" });
  }
});

// 2. Chatbot
app.post("/api/chat", async (req, res) => {
  const { message, propertiesContext } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "Missing message parameter" });
  if (!ai) return res.status(503).json({ error: "Gemini API client is not initialized." });

  try {
    const formattedContext = (propertiesContext || [])
      .map((p: any) => `- ID: ${p.id}, Tiêu đề: ${p.tieu_de}, Giá: ${p.price} Tỷ, DT: ${p.area}m², Vị trí: Đường ${p.duongpho}, P. ${p.phuongxa}, Số tầng: ${p.sotang || 3} tầng, Toilet: ${p.nhavesinh || 3}, Phòng ngủ: ${p.bedroom || 3}, Hướng: ${p.direction}, Pháp lý: ${p.phaply || "Sổ hồng riêng"}`)
      .join("\n");

    const systemInstruction = `Bạn là Trợ lý Ảo chăm sóc khách hàng 24/7 của Thanh Trà BĐS, chuyên viên nhà phố & đất nền uy tín tại TP. Thủ Đức, Việt Nam.
Hotline hỗ trợ: 0854.100.036
Link chat Zalo: https://zalo.me/0854100036

KHO HÀNG HIỆN TẠI:
${formattedContext}

Hãy trả lời lịch sự bằng tiếng Việt, xưng "Trà" và gọi người dùng "Anh/Chị". Luôn khuyến khích liên hệ Hotline 0854.100.036 hoặc Zalo.`;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: { systemInstruction, temperature: 0.8 },
    });

    res.json({ reply: chatResponse.text });
  } catch (error: any) {
    console.error("Error in chatbot:", error);
    res.status(500).json({ error: error.message || "Chatbot error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VITE / STATIC
// ═══════════════════════════════════════════════════════════════════════════════

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

setupVite();
