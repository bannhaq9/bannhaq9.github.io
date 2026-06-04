/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, MapPin, Sliders, Clipboard, Image as ImageIcon, 
  Sparkles, Save, Trash2, CheckCircle2, AlertCircle, RefreshCcw 
} from "lucide-react";
import { Property } from "../types";

interface PostFormProps {
  onSaveProperty: (property: Property) => void;
  editPropertyId?: string | null;
  properties: Property[];
  onCancel: () => void;
  onLogActivity: (type: string, detail: string) => void;
}

export default function PostForm({
  onSaveProperty,
  editPropertyId,
  properties,
  onCancel,
  onLogActivity
}: PostFormProps) {
  const [formData, setFormData] = useState({
    sonha: "",
    duongpho: "",
    phuongxa: "",
    tinhthanh: "TP. Thủ Đức, TP.HCM",
    area: "",
    price: "",
    sotang: "3",
    bedroom: "3",
    nhavesinh: "3",
    direction: "Đông Nam",
    phaply: "Sổ hồng riêng",
    tieu_de: "",
    mo_ta: "",
    rawText: ""
  });

  const [images, setImages] = useState<string[]>([]);
  const [copiedImageAlert, setCopiedImageAlert] = useState("");
  const [aiNote, setAiNote] = useState({ text: "", type: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // If in edit mode, load existing data
  useEffect(() => {
    if (editPropertyId) {
      const match = properties.find(p => p.id === editPropertyId);
      if (match) {
        setFormData({
          sonha: match.sonha || "",
          duongpho: match.duongpho || "",
          phuongxa: match.phuongxa || "",
          tinhthanh: match.tinhthanh || "TP. Thủ Đức, TP.HCM",
          area: String(match.area),
          price: String(match.price),
          sotang: match.sotang || "3",
          bedroom: match.bedroom || "3",
          nhavesinh: match.nhavesinh || "3",
          direction: match.direction || "Đông Nam",
          phaply: match.phaply || "Sổ hồng riêng",
          tieu_de: match.tieu_de || "",
          mo_ta: match.mo_ta || "",
          rawText: ""
        });
        setImages(match.images || []);
      }
    }
  }, [editPropertyId, properties]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Image upload — convert file to Base64 dataURL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files) as File[];
    const validFiles = filesArray.filter(f => f.size <= 5 * 1024 * 1024); // 5MB limit
    if (validFiles.length < filesArray.length) {
      setCopiedImageAlert("Một số ảnh kích thước vượt quá 5MB đã bị lược bỏ.");
    }

    const availableLimit = 10 - images.length;
    const filesToLoad = validFiles.slice(0, availableLimit);

    filesToLoad.forEach(file => {
      const reader = new FileReader();
      reader.onload = (eEvent) => {
        if (eEvent.target?.result) {
          setImages((prev) => [...prev, eEvent.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAIAnalyze = async () => {
    const text = formData.rawText.trim();
    if (!text) {
      setAiNote({
        text: "⚠️ Vui lòng dán nội dung tin đăng thô vào khung phía trên trước!",
        type: "error"
      });
      return;
    }

    setIsAnalyzing(true);
    setAiNote({ text: "", type: "" });

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với dịch vụ Gemini AI");
      }

      const resData = await response.json();
      
      onLogActivity("copy_link", "Sử dụng Gemini AI phân tích & viết bài tự động");

      setFormData((prev) => ({
        ...prev,
        sonha: resData.sonha || "",
        duongpho: resData.duongpho || "",
        phuongxa: resData.phuongxa || "",
        area: resData.area ? String(resData.area) : prev.area,
        price: resData.price ? String(resData.price) : prev.price,
        sotang: resData.sotang ? String(resData.sotang) : prev.sotang,
        bedroom: resData.bedroom ? String(resData.bedroom) : prev.bedroom,
        nhavesinh: resData.nhavesinh ? String(resData.nhavesinh) : prev.nhavesinh,
        direction: resData.direction || prev.direction,
        phaply: resData.phaply || prev.phaply,
        tieu_de: resData.tieu_de || prev.tieu_de,
        mo_ta: resData.facebookPost || prev.mo_ta
      }));

      setIsAnalyzing(false);
      setAiNote({
        text: "🎉 Trợ lý Gemini AI đã phân tích tin thô, tạo bài đăng Facebook tối ưu và tự động điền các thông số thành công! Vui lòng upload ảnh thực tế của bất động sản.",
        type: "success"
      });

    } catch (err: any) {
      console.warn("Gemini API error, falling back to local regex extraction:", err);
      onLogActivity("copy_link", "Sử dụng Hệ thống phân tích tin thô cục bộ (Fallback)");

      // 1. Robust Area (dt) extraction
      let dt = "";
      const areaKeywords = ["diện tích", "dt", "đo", "d.tích", "dientich", "d diện tích", "diện tich"];
      const areaM2Match = text.match(/(\d+[,.]?\d*)\s*(m2|m²|mét vuông|met vuong)/i);
      if (areaM2Match) {
        dt = areaM2Match[1].replace(",", ".");
      } else {
        for (const kw of areaKeywords) {
          const regex = new RegExp(`${kw}\\s*[:\\-]?\\s*(\\d+[,.]?\\d*)`, "i");
          const m = text.match(regex);
          if (m) { dt = m[1].replace(",", "."); break; }
        }
      }

      // 2. Pricing Match
      let prObj = "";
      const priceMatch = text.match(/(\d+[,.]?\d*)\s*(tỷ|tỉ|ty|t|billion)/i);
      if (priceMatch) prObj = priceMatch[1].replace(",", ".");

      // 3. Street name extraction
      let street = "";
      const famousStreets = [
        "Nguyễn Duy Trinh", "Võ Văn Ngân", "Lò Lu", "Liên Phường", "Đỗ Xuân Hợp", "Hoàng Hữu Nam",
        "Kha Vạn Cân", "Phạm Văn Đồng", "Đặng Văn Bi", "Lê Văn Việt", "Nguyễn Xiển", "Man Thiện",
        "Tô Ngọc Vân", "Tây Hòa", "Lương Định Của", "Trần Não", "Nguyễn Thị Định", "Quốc Lộ 13",
        "Võ Chí Công", "Song Hành", "Lê Văn Thịnh", "Đồng Văn Cống"
      ];
      for (const st of famousStreets) {
        if (text.toLowerCase().includes(st.toLowerCase())) { street = st; break; }
      }
      if (!street) {
        const streetRegexes = [
          /(?:đường|đ\.|\bphố|hẻm|mt|mặt tiền)\s+([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝỲỸỶỰỬỮỰỨỪỬỸ][a-zàáâãèéêìíòóôõùúăđĩũơưýỳỹỷựửữựứừửỹ]*(\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝỲỸỶỰỬỮỰỨỪỬỸ][a-zàáâãèéêìíòóôõùúăđĩũơưýỳỹỷựửữựứừửỹ]*){0,3})/i,
          /(?:đường|đ\.|\bphố|hẻm|mt|mặt tiền)\s+([a-z0-9àáâãèéêìíòóôõùúăđĩũơưýỳỹỷựửữựứừửỹ\s]+?)(?=\s+(phường|p\.|quận|q\.|tp|thành phố|dt|diện tích|giá|kết cấu|$))/i
        ];
        for (const rx of streetRegexes) {
          const match = text.match(rx);
          if (match && match[1] && match[1].trim().length > 2) {
            street = match[1].trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            break;
          }
        }
      }

      // 4. Ward name extraction
      let ward = "";
      const famousWards = [
        "Long Trường", "Trường Thạnh", "Phú Hữu", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B",
        "Hiệp Bình Chánh", "Hiệp Bình Phước", "Linh Đông", "Linh Tây", "Linh Chiểu",
        "Linh Trung", "Linh Xuân", "Tam Phú", "Tam Bình", "Bình Chiểu", "Trường Thọ",
        "Bình Thọ", "Tân Phú", "Long Bình", "Long Thạnh Mỹ", "Long Phước", "Bình Khánh",
        "An Phú", "Thảo Điền", "An Khánh", "An Lợi Đông", "Thủ Thiêm", "Thạnh Mỹ Lợi",
        "Cát Lái", "Phước Long A", "Phước Long B", "Phước Bình"
      ];
      for (const w of famousWards) {
        if (text.toLowerCase().includes(w.toLowerCase())) { ward = w; break; }
      }
      if (!ward) {
        const wardRegexes = [
          /(phường|p\.)\s*([0-9]+)/i,
          /(phường|p\.)\s+([A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝỲỸỶỰỬỮỰỨỪỬỸàáâãèéêìíòóôõùúăđĩũơưýỳỹỷựửữựứừửỹ\s]+?)(?=\s+(quận|q\.|tp|thành phố|dt|diện tích|giá|kết cấu|$))/i,
          /(phường|p\.)\s+([A-Za-z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯÝỲỸỶỰỬỮỰỨỪỬỸàáâãèéêìíòóôõùúăđĩũơưýỳỹỷựửữựứừửỹ\s]+?)(?=,|\.|$)/i
        ];
        for (const rx of wardRegexes) {
          const match = text.match(rx);
          if (match && match[2]) {
            ward = match[2].trim();
            if (/^\d+$/.test(ward)) ward = "Phường " + ward;
            else ward = ward.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            break;
          }
        }
      }

      // 5. Structure extraction
      let floors = "3";
      if (text.match(/1\s*(trệt|tầng|lầu)/i)) floors = "1";
      else if (text.match(/2\s*(tầng|lầu)/i)) floors = "2";
      else if (text.match(/3\s*(tầng|lầu)/i)) floors = "3";
      else if (text.match(/4\s*(tầng|lầu)/i)) floors = "4";
      else if (text.match(/5\s*(tầng|lầu)/i)) floors = "5";

      let beds = "3";
      const bedMatch = text.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
      if (bedMatch) beds = bedMatch[1];

      let baths = "3";
      const bathMatch = text.match(/(\d+)\s*(wc|nhà vệ sinh|phòng tắm)/i);
      if (bathMatch) baths = bathMatch[1];

      let dir = "Đông Nam";
      if (text.toLowerCase().includes("hướng nam") || text.toLowerCase().includes("h nam")) dir = "Nam";
      else if (text.toLowerCase().includes("hướng tây") || text.toLowerCase().includes("h tây")) dir = "Tây";
      else if (text.toLowerCase().includes("hướng đông") || text.toLowerCase().includes("h đông")) dir = "Đông";
      else if (text.toLowerCase().includes("hướng bắc") || text.toLowerCase().includes("h bắc")) dir = "Bắc";
      else if (text.toLowerCase().includes("tây nam")) dir = "Tây Nam";
      else if (text.toLowerCase().includes("tây bắc")) dir = "Tây Bắc";
      else if (text.toLowerCase().includes("đông bắc")) dir = "Đông Bắc";

      // 6. Pháp Lý
      let phap_ly = "Sổ hồng riêng";
      if (text.toLowerCase().includes("sổ hồng riêng") || text.toLowerCase().includes("sh riêng") || text.toLowerCase().includes("shr")) {
        phap_ly = "Sổ hồng riêng";
      } else if (text.toLowerCase().includes("sổ đỏ") || text.toLowerCase().includes("sổ riêng")) {
        phap_ly = "Sổ đỏ riêng";
      } else if (text.toLowerCase().includes("hoàn công") || text.toLowerCase().includes("sổ hồng hoàn công")) {
        phap_ly = "Sổ hồng hoàn công";
      } else if (text.toLowerCase().includes("hợp đồng mua bán") || text.toLowerCase().includes("hđmb") || text.toLowerCase().includes("hợp đồng")) {
        phap_ly = "Hợp đồng mua bán";
      } else if (text.toLowerCase().includes("giấy tờ tay") || text.toLowerCase().includes("giấy tay")) {
        phap_ly = "Giấy tờ tay";
      }

      const finalStreet = street || "Lò Lu";
      const finalWard = ward || "Trường Thạnh";
      const finalPrice = prObj || "5.2";
      const finalArea = dt || "75";

      const finalTitle = `🔥 BÁN NHÀ PHỐ ĐẸP ĐƯỜNG ${finalStreet.toUpperCase()}, P. ${finalWard.toUpperCase()} - CỰC NGỘP CHỈ ${finalPrice} TỶ`;
      const finalDesc = `🔥 BÁN NHÀ PHỐ ĐẸP ĐƯỜNG ${finalStreet.toUpperCase()}, P. ${finalWard.toUpperCase()} - CỰC NGỘP CHỈ ${finalPrice} TỶ\n\n📌 THÔNG SỐ & GIÁ BÁN:\n- Vị trí: Đường ${finalStreet}, Phường ${finalWard}, TP. Thủ Đức, TP.HCM.\n- Diện tích: ${finalArea}m², kết cấu xây dựng gồm ${floors} tầng kiên cố, bố trí ${beds} phòng ngủ thoáng mát.\n- Hướng: ${dir}\n- Giá bán: ${finalPrice} Tỷ đồng.\n\n📌 HIỆN TRẠNG & TIỀN NĂNG BỨT PHÁ:\n- Khu dân cư yên tĩnh, văn minh lịch sự, quy mô đồng bộ cao cấp.\n- Kết nối cực ngắn ra chợ, siêu thị, trường học liên cấp, vành đai 3, khu Công Nghệ Cao.\n- Địa thế đất cao ráo vững chãi, quy hoạch thoát nước hoàn hảo, cam kết 100% không hề bị vấn đề thời tiết ngập ảnh hưởng.\n- Pháp lý chuẩn mực: ${phap_ly}, chính chủ cất két, sẵn sàng sang tên công chứng ngay.\n\nQuý khách hàng quan tâm đến tài sản này vui lòng liên hệ để nhận thêm chi tiết và sắp xếp lịch xem nhà/đất.`;

      setFormData((prev) => ({
        ...prev,
        duongpho: finalStreet,
        phuongxa: finalWard,
        area: finalArea,
        price: finalPrice,
        sotang: floors,
        bedroom: beds,
        nhavesinh: baths,
        direction: dir,
        phaply: phap_ly,
        tieu_de: finalTitle,
        mo_ta: finalDesc
      }));

      setIsAnalyzing(false);
      setAiNote({
        text: "🎉 Hệ thống cục bộ đã phân tích tin thô & tự động điền các thông số thành công (Fallback)! Vui lòng upload ảnh thực tế của bất động sản.",
        type: "success"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.duongpho || !formData.phuongxa || !formData.tieu_de || !formData.mo_ta) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (images.length === 0) {
      alert("⚠️ Vui lòng upload ít nhất 1 ảnh thực tế cho bất động sản này!");
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const areaNum = parseFloat(formData.area) || 0;

    const savedProp: Property = {
      id: editPropertyId || `prod_${Date.now()}`,
      sonha: formData.sonha,
      duongpho: formData.duongpho,
      phuongxa: formData.phuongxa,
      tinhthanh: formData.tinhthanh,
      area: areaNum,
      price: priceNum,
      sotang: formData.sotang,
      bedroom: formData.bedroom,
      nhavesinh: formData.nhavesinh,
      direction: formData.direction,
      phaply: formData.phaply || "Sổ hồng riêng",
      tieu_de: formData.tieu_de,
      mo_ta: formData.mo_ta,
      images: images,
      views: editPropertyId ? (properties.find(p => p.id === editPropertyId)?.views || 0) : 0,
      created_at: editPropertyId ? (properties.find(p => p.id === editPropertyId)?.created_at || new Date().toISOString()) : new Date().toISOString()
    };

    onLogActivity(
      editPropertyId ? "edit_property" : "create_property",
      `${editPropertyId ? "Cập nhật" : "Đăng tin mới"} căn nhà ở đường ${formData.duongpho}`
    );

    onSaveProperty(savedProp);
    onCancel();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 lg:p-8 id-postform-root">
      
      {/* Navigation upper element */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-brand-primary" />
          <span>Quay lại danh sách</span>
        </button>
        <span className="text-[10px] uppercase font-mono text-slate-400 font-extrabold">Quyền Quản Trị Hệ Thống</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-5 md:p-8 space-y-8">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            📋 {editPropertyId ? "✏️ Chỉnh Sửa Tin Bất Động Sản" : "🚀 Đăng Bài Rao Bán Nhà Phố Mới"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Điền đầy đủ thông tin hoặc sử dụng công cụ AI phân tích thô để tự động hoàn thành copywriting chỉ trong 1 giây.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Position location details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1">
              <MapPin className="w-4 h-4 text-brand-primary" /> 1. Vị Trí Bất Động Sản (Thành Phố Thủ Đức)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Số Nhà</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 45A (nếu có)"
                  value={formData.sonha}
                  onChange={(e) => handleInputChange("sonha", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[10px] uppercase font-bold text-slate-500">Tên Đường Phố *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lò Lu..."
                  value={formData.duongpho}
                  onChange={(e) => handleInputChange("duongpho", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500">Phường / Xã trực thuộc *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trường Thạnh..."
                  value={formData.phuongxa}
                  onChange={(e) => handleInputChange("phuongxa", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500">Quận / Tỉnh Thành</label>
                <input
                  type="text"
                  value={formData.tinhthanh}
                  onChange={(e) => handleInputChange("tinhthanh", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed uppercase"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Core Specifications */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1">
              <Sliders className="w-4 h-4 text-brand-primary" /> 2. Thông số chi tiết cấu trúc
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Diện tích (m²) *</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 72"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <span className="text-brand-primary font-bold">Giá bán (Tỷ đồng) *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 5.5"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Số phòng ngủ</label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.bedroom}
                  onChange={(e) => handleInputChange("bedroom", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Số phòng vệ sinh (WC)</label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.nhavesinh}
                  onChange={(e) => handleInputChange("nhavesinh", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Số tầng lầu/trệt</label>
                <input
                  type="text"
                  placeholder="3"
                  value={formData.sotang}
                  onChange={(e) => handleInputChange("sotang", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Hướng tài sản</label>
                <select
                  value={formData.direction}
                  onChange={(e) => handleInputChange("direction", e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="Đông">Đông</option>
                  <option value="Tây">Tây</option>
                  <option value="Nam">Nam</option>
                  <option value="Bắc">Bắc</option>
                  <option value="Đông Nam">Đông Nam</option>
                  <option value="Tây Nam">Tây Nam</option>
                  <option value="Đông Bắc">Đông Bắc</option>
                  <option value="Tây Bắc">Tây Bắc</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Pháp lý *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sổ hồng riêng..."
                  value={formData.phaply}
                  onChange={(e) => handleInputChange("phaply", e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* AI Helper tool box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 pt-3">
            <h5 className="text-[11px] uppercase font-bold text-slate-900 tracking-wider flex items-center justify-between">
              <span>🤖 Trợ lý thông minh AI tự điền thông tin</span>
              <span className="bg-emerald-50 text-brand-green border border-brand-green/15 text-[9px] px-2.5 py-0.5 rounded">Hoạt động</span>
            </h5>
            <textarea
              placeholder="📌 Dán mô tả thô của bạn ở đây. Ví dụ: 'Nhà Liên Phường Phú Hữu DT 90m2 ngang 5m kết cấu 4 tầng 5pn giá 6.2 tỷ hướng tây nam...' Sau đó nhấn phân tích."
              value={formData.rawText}
              onChange={(e) => handleInputChange("rawText", e.target.value)}
              rows={4}
              className="w-full text-xs font-medium p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={isAnalyzing}
              className="py-2.5 px-5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAnalyzing ? "Đang xử lý phân tích bài viết thô..." : "Phân tích và điền tự động"}</span>
            </button>
            {aiNote.text && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                aiNote.type === "success"
                  ? "bg-emerald-50 text-brand-green border border-brand-green/10"
                  : "bg-red-50 text-brand-primary border border-brand-primary/10"
              }`}>
                {aiNote.type === "success" ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                <p className="font-semibold">{aiNote.text}</p>
              </div>
            )}
          </div>

          {/* Copywriting Titles and Descriptions */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1">
              <Clipboard className="w-4 h-4 text-brand-primary" /> 3. Tiêu đề và Mô tả copywriting
            </h4>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Tiêu đề bài viết rực rỡ *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: BÁN SẬP GIÁ CĂN NHÀ GÓC 3 TẦNG ĐƯỜNG LÒ LU..."
                  value={formData.tieu_de}
                  onChange={(e) => handleInputChange("tieu_de", e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Nội dung mô tả đầy đủ hấp dẫn *</label>
                <textarea
                  placeholder="Dùng icon đầu dòng để tăng tỷ lệ chuyển đổi khi chia sẻ..."
                  value={formData.mo_ta}
                  onChange={(e) => handleInputChange("mo_ta", e.target.value)}
                  rows={8}
                  className="w-full text-xs font-semibold p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image attachments — bắt buộc upload ảnh thật */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1">
              <ImageIcon className="w-4 h-4 text-brand-primary" /> 4. Đính kèm hình ảnh thực tế *
              <span className="ml-auto text-[10px] font-bold text-brand-primary normal-case">Bắt buộc ít nhất 1 ảnh</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-colors inline-flex items-center gap-1.5 shadow-sm">
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <span>Chọn tệp tin ảnh từ máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <span className={`text-[10px] font-bold ${images.length === 0 ? "text-brand-primary" : "text-slate-400"}`}>
                  {images.length === 0 ? "⚠️ Chưa có ảnh — bắt buộc upload!" : `Đã chọn: ${images.length} / 10 ảnh`}
                </span>
              </div>

              {copiedImageAlert && (
                <p className="text-[10px] text-orange-500 font-semibold italic">⚠️ {copiedImageAlert}</p>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl bg-slate-900 border border-slate-200 overflow-hidden group">
                      <img src={img} alt="Ảnh bất động sản" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-brand-primary text-white text-[10px] rounded-full flex items-center justify-center transition-all shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="flex gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all border border-slate-200 select-none text-center"
            >
              Hủy bỏ thay đổi
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-brand-primary hover:bg-red-650 text-white text-xs font-extrabold rounded-xl transition-all text-center shadow-lg shadow-red-500/10 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{editPropertyId ? "Lưu thay đổi cập nhật" : "Xuất bản tin đăng lên Website"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
