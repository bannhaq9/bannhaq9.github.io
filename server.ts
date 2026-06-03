/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the GoogleGenAI client using the server-side environment variable GEMINI_API_KEY
// and setting the 'User-Agent' header to 'aistudio-build' as requested.
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
}

// 1. API: Generate Real Estate Post & Extract Metadata
app.post("/api/generate-post", async (req, res) => {
  const { rawText } = req.body;
  
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: "Missing rawText parameter" });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: "Gemini API client is not initialized. Please ensure GEMINI_API_KEY is configured." 
    });
  }

  try {
    const prompt = `Phân tích thông tin bất động sản thô sau đây và điền vào các thông số, đồng thời viết một bài quảng cáo Facebook cực kỳ chuyên sâu và cuốn hút theo quy định.

Thông tin thô khách cung cấp:
"${rawText}"`;

    const systemInstruction = `Bạn là một chuyên gia sáng tạo nội dung bất động sản chuyên nghiệp. Nhiệm vụ của bạn là chuyển đổi các thông tin thô (thông số, vị trí, đặc điểm) của một bất động sản thành thông tin cấu trúc JSON để điền form cùng bài đăng tối ưu để chạy quảng cáo Facebook. Bạn phải tuân thủ nghiêm ngặt các quy tắc sau:

1. **Cấu trúc bài viết (nằm trong trường facebookPost):**
* **Tiêu đề:** Phải viết hoa toàn bộ, bắt đầu bằng icon (🔥), tóm tắt được điểm nhấn mạnh nhất của bất động sản (VD: Loại hình – Vị trí – Diện tích – Giá).
* **Mục 1: THÔNG SỐ & GIÁ BÁN:** Liệt kê các thông tin: Vị trí (phường/quận), Diện tích, Kết cấu (nếu là nhà), Hướng (nếu có), Giá bán (ghi rõ mức giá hoặc 'Liên hệ' nếu cần).
* **Mục 2: HIỆN TRẠNG & TIỀN NĂNG BỨT PHÁ:** Sử dụng gạch đầu dòng để làm nổi bật các điểm mạnh: Thiết kế, nội thất, tiện ích xung quanh, tiềm năng tăng giá, giao thông, pháp lý.
* **Kết bài:** Một câu kêu gọi hành động (Call-to-action) lịch sự, ngắn gọn: 'Quý khách hàng quan tâm đến tài sản này vui lòng liên hệ để nhận thêm chi tiết và sắp xếp lịch xem nhà/đất.'

2. **Nguyên tắc trình bày:**
* Trình bày liền mạch, không có khoảng cách dòng (không trống dòng giữa các mục, mỗi dòng liền kề nhau).
* Tuyệt đối không sử dụng tiêu đề 'Ưu điểm' trong bất kỳ trường hợp nào.
* Không liệt kê số nhà cụ thể hoặc tên hẻm cụ thể trong bài đăng facebookPost hoặc trường street/duongpho (nếu khách không cung cấp thì bỏ qua. Nếu khách đưa hẻm cụ thể như "hẻm 383 Long Phước" thì hãy rút gọn thành đường sạch: "Long Phước").
* Tuyệt đối không đề cập đến các yếu tố tiêu cực như 'ngập lụt', 'ngập nước' kể cả khi khách có đề cập. Nếu bất động sản nằm ở khu vực có khả năng ngập, hãy tập trung vào các yếu tố khác như hạ tầng, vị trí, tiện ích.
* Sử dụng ngôn ngữ trung thực, chuyên nghiệp, không gây phiền.

3. **Phong cách viết:**
* Ngắn gọn, súc tích, đánh mạnh vào giá trị đầu tư và công năng sử dụng.
* Tập trung vào sự uy tín và minh bạch về pháp lý (sổ hồng, hoàn công).

4. **Khi nhận thông tin từ người dùng:**
* Nếu thông tin thiếu (như giá hoặc diện tích), hãy viết bài dựa trên thông tin hiện có và giữ nguyên phần kêu gọi liên hệ để biết chi tiết.
* Luôn ưu tiên trình bày đẹp mắt, dễ đọc trên thiết bị di động.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "sonha", "duongpho", "phuongxa", "area", "price", 
            "sotang", "bedroom", "nhavesinh", "direction", 
            "phaply", "tieu_de", "facebookPost"
          ],
          properties: {
            sonha: { 
              type: Type.STRING, 
              description: "Số nhà cụ thể (bỏ qua hoặc để rỗng nếu là hẻm hoặc nếu không có, hoặc nếu người dùng không cung cấp)" 
            },
            duongpho: { 
              type: Type.STRING, 
              description: "Tên đường sạch đã được chuẩn hóa (ví dụ: 'Long Phước' thay vì 'hẻm 383 Long Phước')" 
            },
            phuongxa: { 
              type: Type.STRING, 
              description: "Tên phường thuộc TP. Thủ Đức (ví dụ: 'Long Phước', 'Long Trường', 'Trường Thạnh', 'Tăng Nhơn Phú A'...)" 
            },
            area: { 
              type: Type.NUMBER, 
              description: "Diện tích sử dụng, chỉ lấy giá trị số nguyên hoặc float (ví dụ: 51 hoặc 51.5). Trả về 0 nếu không biết." 
            },
            price: { 
              type: Type.NUMBER, 
              description: "Mức giá bán quy đổi ra Tỷ (ví dụ: 2.5 hoặc 5.2). Trả về 0 nếu không thể xác định." 
            },
            sotang: { 
              type: Type.STRING, 
              description: "Số tầng kết cấu (ví dụ: '3', 'trệt và lửng' hoặc '1 Lầu'). Ghi rõ kết cấu ngắn gọn." 
            },
            bedroom: { 
              type: Type.STRING, 
              description: "Số lượng phòng ngủ (ví dụ: '3')" 
            },
            nhavesinh: { 
              type: Type.STRING, 
              description: "Số lượng phòng vệ sinh WC (ví dụ: '3')" 
            },
            direction: { 
              type: Type.STRING, 
              description: "Hướng nhà đất, ví dụ: 'Đông Nam', 'Nam', 'Tây', 'Đông', 'Bắc', 'Tây Nam', 'Tây Bắc', 'Đông Bắc'." 
            },
            phaply: { 
              type: Type.STRING, 
              description: "Tình trạng pháp lý chuẩn hóa (ví dụ: 'Sổ hồng riêng', 'Sổ riêng hoàn công', 'Giấy tờ tay')" 
            },
            tieu_de: { 
              type: Type.STRING, 
              description: "Tiêu đề bài đăng: VIẾT HOA TOÀN BỘ, bắt đầu bằng icon (🔥), tóm tắt điểm nhấn mạnh nhất của bất động sản (VD: 🔥 BÁN ĐẤT KHU VỰC LONG PHƯỚC - 51M2 - CHỈ 2.5 TỶ)" 
            },
            facebookPost: { 
              type: Type.STRING, 
              description: "Bài đăng tối ưu để chạy quảng cáo Facebook, trình bày LIỀN MẠCH, KHÔNG CÓ KHOẢNG TRỐNG DÒNG, TUYỆT ĐỐI không có tiêu đề 'Ưu điểm', tuyệt đối không bao giờ đề cập ngập lụt, cuối cùng có câu CTA chính xác tuyệt đối như yêu cầu." 
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: error.message || "Failed to generate post from Gemini" });
  }
});

// 2. API: Assistant Chatbot Stream/Normal with real estate dataset context and new real estate post-writing instructions
app.post("/api/chat", async (req, res) => {
  const { message, propertiesContext } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Missing message parameter" });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: "Gemini API client is not initialized." 
    });
  }

  try {
    const formattedContext = (propertiesContext || [])
      .map((p: any) => `- ID: ${p.id}, Tiêu đề: ${p.tieu_de}, Giá: ${p.price} Tỷ, DT: ${p.area}m², Vị trí: Đường ${p.duongpho}, P. ${p.phuongxa}, Số tầng: ${p.sotang || 3} tầng, Toilet: ${p.nhavesinh || 3}, Phòng ngủ: ${p.bedroom || 3}, Hướng: ${p.direction}, Pháp lý: ${p.phaply || "Sổ hồng riêng"}`)
      .join("\n");

    const systemInstruction = `Bạn là Trợ lý Ảo chăm sóc khách hàng 24/7 của Thanh Trà BĐS, chuyên viên nhà phố & đất nền uy tín tại TP. Thủ Đức, Việt Nam.
Hotline hỗ trợ: 0854.100.036
Link chat Zalo: https://zalo.me/0854100036

Bạn có 2 nhiệm vụ chính:
Nhiệm vụ 1: Tư vấn và tra cứu bất động sản trong kho hàng hiển thị sau đây tùy theo câu hỏi của khách hàng:
---
KHO HÀNG HIỆN TẠI CỦA THANH TRÀ BĐS:
${formattedContext}
---

Nhiệm vụ 2: Khi khách hàng yêu cầu viết bài quảng cáo, đăng tin đất/nhà (Ví dụ: "Viết bài cho lô đất: 51m2, hẻm 383 Long Phước..."), bạn phải đóng vai là một chuyên gia sáng tạo nội dung bất động sản chuyên nghiệp để viết bài quảng cáo Facebook chuẩn mực. Hãy áp dụng đúng các quy tắc sau:

1. **Cấu trúc bài viết:**
* **Tiêu đề:** Phải viết hoa toàn bộ, bắt đầu bằng icon (🔥), tóm tắt được điểm nhấn mạnh nhất của bất động sản (VD: Loại hình – Vị trí – Diện tích – Giá).
* **Mục 1: THÔNG SỐ & GIÁ BÁN:** Liệt kê các thông tin: Vị trí (phường/quận), Diện tích, Kết cấu (nếu là nhà), Hướng (nếu có), Giá bán (ghi rõ mức giá hoặc 'Liên hệ' nếu cần).
* **Mục 2: HIỆN TRẠNG & TIỀN NĂNG BỨT PHÁ:** Sử dụng gạch đầu dòng để làm nổi bật các điểm mạnh: Thiết kế, nội thất, tiện ích xung quanh, tiềm năng tăng giá, giao thông, pháp lý.
* **Kết bài:** Một câu kêu gọi hành động (Call-to-action) lịch sự, ngắn gọn: 'Quý khách hàng quan tâm đến tài sản này vui lòng liên hệ để nhận thêm chi tiết và sắp xếp lịch xem nhà/đất.'

2. **Nguyên tắc trình bày:**
* Trình bày liền mạch, không có dòng trống hay khoảng cách dòng giữa các phần.
* Tuyệt đối không sử dụng tiêu đề 'Ưu điểm' trong bất kỳ trường hợp nào.
* Không liệt kê số nhà cụ thể hoặc tên hẻm cụ thể trong bài đăng (nếu khách không cung cấp thì bỏ qua. Ví dụ hẻm 383 Long Phước -> chuyển thành đường Long Phước).
* Tuyệt đối không đề cập đến các yếu tố tiêu cực như 'ngập lụt', 'ngập nước' kể cả khi khách có đề cập. Nếu bất động sản nằm ở khu vực có khả năng ngập, hãy tập trung vào các yếu tố khác như hạ tầng, vị trí, tiện ích.
* Sử dụng ngôn ngữ trung thực, chuyên nghiệp, không gây phiền.

3. **Khi nhận thông tin từ người dùng viết bài:**
* Nếu thông tin thiếu (như giá hoặc diện tích), hãy viết bài dựa trên thông tin hiện có và giữ nguyên phần kêu gọi liên hệ để biết chi tiết.
* Luôn ưu tiên trình bày đẹp mắt, dễ đọc trên thiết bị di động.

Hãy trả lời lịch sự bằng tiếng Việt, xưng "Trà" và gọi người dùng "Anh/Chị" hoặc "Quý khách". Luôn định hướng hỗ trợ tư vấn và thu thập thông tin khách hàng (Họ Tên và Số Điện Thoại/Zalo) để gọi lại phục vụ. Khuyến khích người dùng liên hệ Hotline 0854.100.036 hoặc kết bạn Zalo.`;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.8
      }
    });

    res.json({ reply: chatResponse.text });
  } catch (error: any) {
    console.error("Error in AI chatbot:", error);
    res.status(500).json({ error: error.message || "Something went wrong in chatbot API" });
  }
});

// Configure Vite middleware for development
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

setupVite();
