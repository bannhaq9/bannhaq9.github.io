import { GoogleGenAI, Type } from "@google/genai";
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

  const { rawText } = req.body;
  if (!rawText?.trim()) return res.status(400).json({ error: "Missing rawText parameter" });
  if (!ai) return res.status(503).json({ error: "Gemini API client is not initialized. Please ensure GEMINI_API_KEY is configured." });

  try {
    const prompt = `Phân tích thông tin bất động sản thô sau đây và điền vào các thông số, đồng thời viết một bài quảng cáo Facebook cực kỳ chuyên sâu và cuốn hút theo quy định.\n\nThông tin thô khách cung cấp:\n"${rawText}"`;

    cconst systemInstruction = `Bạn là một chuyên gia sáng tạo nội dung bất động sản chuyên nghiệp. Nhiệm vụ của bạn là chuyển đổi các thông tin thô (thông số, vị trí, đặc điểm) của một bất động sản thành thông tin cấu trúc JSON để điền form cùng bài đăng tối ưu để chạy quảng cáo Facebook. Bạn phải tuân thủ nghiêm ngặt các quy tắc sau:

1. Cấu trúc bài viết (nằm trong trường facebookPost):
* Tiêu đề: Phải viết hoa toàn bộ, bắt đầu bằng icon (🔥), tóm tắt điểm nhấn mạnh nhất.
* Mục 1 - THÔNG SỐ & GIÁ BÁN: Mỗi thông tin trên một dòng riêng, liệt kê: Vị trí, Diện tích, Kết cấu, Hướng, Giá bán.
* Mục 2 - HIỆN TRẠNG & TIỀM NĂNG: Mỗi điểm mạnh trên một dòng riêng bắt đầu bằng dấu (-).
*  'Quý khách hàng quan tâm đến tài sản này vui lòng liên hệ để nhận thêm chi tiết và sắp xếp lịch xem nhà/đất.'

2. Nguyên tắc trình bày:
* Giữa Tiêu đề, Mục 1, Mục 2 và Kết bài: cách nhau 1 dòng trống.
* Các dòng trong cùng 1 mục: xuống dòng đơn, KHÔNG có dòng trống giữa các dòng trong cùng mục.
* Tuyệt đối không dùng tiêu đề 'Ưu điểm'.
* Không liệt kê số nhà hoặc tên hẻm cụ thể.
* Tuyệt đối không đề cập ngập lụt, ngập nước.
* Ngôn ngữ trung thực, chuyên nghiệp.

3. Phong cách viết:
* Ngắn gọn, súc tích, đánh mạnh vào giá trị đầu tư và công năng sử dụng.
* Tập trung vào pháp lý minh bạch (sổ hồng, hoàn công).

4. Khi nhận thông tin từ người dùng:
* Nếu thiếu giá hoặc diện tích, viết dựa trên thông tin hiện có, giữ phần kêu gọi liên hệ.
* Luôn ưu tiên trình bày đẹp mắt, dễ đọc trên thiết bị di động.`;

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
            sonha: { type: Type.STRING, description: "Số nhà (bỏ qua nếu không có)" },
            duongpho: { type: Type.STRING, description: "Tên đường đã chuẩn hóa" },
            phuongxa: { type: Type.STRING, description: "Tên phường thuộc TP. Thủ Đức" },
            area: { type: Type.NUMBER, description: "Diện tích m2, trả về 0 nếu không biết" },
            price: { type: Type.NUMBER, description: "Giá bán quy đổi Tỷ, trả về 0 nếu không biết" },
            sotang: { type: Type.STRING, description: "Số tầng kết cấu" },
            bedroom: { type: Type.STRING, description: "Số phòng ngủ" },
            nhavesinh: { type: Type.STRING, description: "Số phòng WC" },
            direction: { type: Type.STRING, description: "Hướng nhà" },
            phaply: { type: Type.STRING, description: "Tình trạng pháp lý" },
            tieu_de: { type: Type.STRING, description: "Tiêu đề VIẾT HOA, bắt đầu bằng 🔥" },
            facebookPost: { type: Type.STRING, description: "Bài đăng Facebook: giữa các mục cách 1 dòng trống, các dòng trong cùng mục xuống dòng đơn, mỗi điểm gạch đầu dòng trên 1 dòng riêng" },
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
}
