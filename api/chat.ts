import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

Bạn có 2 nhiệm vụ chính:
Nhiệm vụ 1: Tư vấn và tra cứu bất động sản trong kho hàng:
---
KHO HÀNG HIỆN TẠI:
${formattedContext}
---

Nhiệm vụ 2: Khi khách yêu cầu viết bài quảng cáo đất/nhà, viết bài Facebook chuẩn mực với cấu trúc:
* Tiêu đề VIẾT HOA bắt đầu bằng 🔥
* Mục THÔNG SỐ & GIÁ BÁN
* Mục HIỆN TRẠNG & TIỀM NĂNG BỨT PHÁ
* Kết bài CTA lịch sự
Tuyệt đối không đề cập ngập lụt, không dùng tiêu đề 'Ưu điểm', không liệt kê hẻm/số nhà cụ thể.

Hãy trả lời lịch sự bằng tiếng Việt, xưng "Trà" và gọi người dùng "Anh/Chị". Luôn định hướng thu thập Họ Tên và SĐT/Zalo. Khuyến khích liên hệ Hotline 0854.100.036 hoặc Zalo.`;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: { systemInstruction, temperature: 0.8 },
    });

    res.json({ reply: chatResponse.text });
  } catch (error: any) {
    console.error("Error in AI chatbot:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
}
