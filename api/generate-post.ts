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

    const systemInstruction = `Bạn là một chuyên gia sáng tạo nội dung bất động sản chuyên nghiệp tại TP. Thủ Đức, TP.HCM. Nhiệm vụ của bạn là chuyển đổi các thông tin thô thành thông tin cấu trúc JSON để điền form cùng bài đăng tối ưu để chạy quảng cáo Facebook.

## QUY TẮC PHÂN TÍCH DỮ LIỆU (QUAN TRỌNG NHẤT):

### Tên đường (duongpho):
- Tìm tên ĐƯỜNG CHÍNH / TÊN HẺM CHÍNH được đề cập, KHÔNG phải số thửa hay số tờ.
- Ví dụ: "Hẻm 383 Long Phước" → duongpho = "Long Phước"
- Ví dụ: "đường Lò Lu" → duongpho = "Lò Lu"
- Ví dụ: "hẻm 12 Nguyễn Duy Trinh" → duongpho = "Nguyễn Duy Trinh"
- Nếu có cả số hẻm và tên đường, chỉ lấy TÊN ĐƯỜNG.

### Số nhà (sonha):
- Chỉ điền nếu có số nhà cụ thể (ví dụ: 45A, 12B).
- Số thửa/tờ (ví dụ: "Thửa 591, Tờ 64") KHÔNG phải số nhà → sonha = ""

### Giá (price):
- Chỉ lấy giá bán thực sự (đơn vị tỷ đồng).
- Số thửa đất, số tờ, diện tích KHÔNG phải giá.
- Ví dụ: "Thửa 591" → đây là số thửa, KHÔNG phải giá → price = 0 nếu không có giá rõ ràng.
- Ví dụ: "giá 3.5 tỷ" → price = 3.5
- Ví dụ: "bán 1.2 tỷ" → price = 1.2

### Diện tích (area):
- Lấy số m2 rõ ràng. Ví dụ: "51m2" → area = 51

### Số tầng (sotang):
- Chỉ điền nếu đề cập rõ số tầng/lầu. Nếu không có → sotang = ""
- Ví dụ: "3 tầng", "1 trệt 2 lầu" → sotang = "3"

### Phòng ngủ (bedroom) và WC (nhavesinh):
- Chỉ điền nếu đề cập rõ. Nếu không có trong thông tin thô → bedroom = "", nhavesinh = ""

### Hướng (direction):
- Chỉ điền nếu đề cập rõ hướng. Nếu không có → direction = ""

### Pháp lý (phaply):
- Tìm từ khóa: "sổ hồng", "sổ đỏ", "hoàn công", "chưa có sổ", v.v.
- Nếu không đề cập → phaply = ""

---

## QUY TẮC VIẾT BÀI FACEBOOK (trường facebookPost):

1. Cấu trúc bài viết:
   * Tiêu đề: VIẾT HOA toàn bộ, bắt đầu bằng 🔥, tóm tắt điểm nhấn mạnh nhất.
   * Mục 1 - THÔNG SỐ & GIÁ BÁN: Mỗi thông tin trên một dòng riêng, liệt kê: Vị trí, Diện tích, Kết cấu (nếu có), Hướng (nếu có), Giá bán (nếu có).
   * Mục 2 - HIỆN TRẠNG & TIỀM NĂNG: Mỗi điểm mạnh trên một dòng riêng bắt đầu bằng dấu (-).
   * Kết bài: 'Quý khách hàng quan tâm đến tài sản này vui lòng liên hệ để nhận thêm chi tiết và sắp xếp lịch xem nhà/đất.'

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
            sonha:       { type: Type.STRING, description: "Số nhà cụ thể (ví dụ: 45A). Để trống nếu không có hoặc chỉ có số thửa/tờ." },
            duongpho:    { type: Type.STRING, description: "Tên đường/phố chính (không bao gồm số hẻm). Ví dụ: 'Long Phước', 'Lò Lu', 'Nguyễn Duy Trinh'." },
            phuongxa:    { type: Type.STRING, description: "Tên phường thuộc TP. Thủ Đức" },
            area:        { type: Type.NUMBER, description: "Diện tích m2 thực tế. Trả về 0 nếu không tìm thấy." },
            price:       { type: Type.NUMBER, description: "Giá bán tính bằng tỷ đồng. Trả về 0 nếu không có giá rõ ràng. Không nhầm với số thửa/tờ." },
            sotang:      { type: Type.STRING, description: "Số tầng (ví dụ: '3', '4'). Để trống nếu không đề cập." },
            bedroom:     { type: Type.STRING, description: "Số phòng ngủ. Để trống nếu không đề cập." },
            nhavesinh:   { type: Type.STRING, description: "Số phòng WC. Để trống nếu không đề cập." },
            direction:   { type: Type.STRING, description: "Hướng nhà/đất. Để trống nếu không đề cập." },
            phaply:      { type: Type.STRING, description: "Tình trạng pháp lý (sổ hồng riêng, sổ đỏ, v.v.). Để trống nếu không đề cập." },
            tieu_de:     { type: Type.STRING, description: "Tiêu đề VIẾT HOA, bắt đầu bằng 🔥, tóm tắt điểm nhấn. KHÔNG được nhầm số thửa thành giá." },
            facebookPost:{ type: Type.STRING, description: "Bài đăng Facebook đầy đủ theo cấu trúc: Tiêu đề → (dòng trống) → Mục 1 → (dòng trống) → Mục 2 → (dòng trống) → Kết bài." },
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
