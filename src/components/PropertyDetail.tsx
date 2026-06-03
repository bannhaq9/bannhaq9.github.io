/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, MapPin, Ruler, Bed, Bath, Compass, Calendar, ArrowLeft, 
  Phone, Eye, Heart, Share2, Clipboard, ShieldAlert, Layers,
  ShieldCheck, TrendingUp
} from "lucide-react";
import { Property } from "../types";

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  onLogActivity: (type: string, detail: string) => void;
  onZaloChat: () => void;
}

export default function PropertyDetail({ 
  property, 
  onClose, 
  onLogActivity,
  onZaloChat 
}: PropertyDetailProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"];

  const handleCopyMetaText = () => {
    const fullAddr = [property.sonha, property.duongpho, property.phuongxa, property.tinhthanh].filter(Boolean).join(", ");
    const textToCopy = `🏠 ${property.tieu_de}\n📍 Vị trí: ${fullAddr}\n📐 Diện tích: ${property.area}m² (Số tầng: ${property.sotang})\n💰 Mức giá cực lộc: ${property.price} Tỷ\n👉 Liên hệ xem nhà 24/7 ngay: 0854.100.036 (Zalo)`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      onLogActivity("copy_link", `Sao chép thông tin BĐS #${property.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareFacebook = () => {
    onLogActivity("share_fb", `Chia sẻ tin #${property.id} trên Facebook`);
    
    // Fallback share link opening
    const shareUrl = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const formattedDate = property.created_at 
    ? new Date(property.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric"
      })
    : "Vừa mới đăng";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-300 id-property-detail-overlay">
      
      {/* Detail Slide out Drawer Panel */}
      <div className="w-full max-w-4xl bg-[#f8fafc] h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative">
        
        {/* Floating Top Nav bar */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between z-20">
          <button 
            onClick={onClose}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 text-brand-primary" />
            <span>Quay lại trang chủ</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyMetaText}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sao chép thông tin nhanh"
            >
              <Clipboard className="w-4 h-4 text-slate-500" />
              <span>{copied ? "Đã sao chép!" : "Sao chép Tin"}</span>
            </button>
            <button 
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content detail layout */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          
          {/* Main info row & Gallery visual */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gallery module (2/3 col on widescreen) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Big active viewer */}
              <div className="relative aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden shadow-md group">
                <img
                  src={images[activeImageIdx]}
                  alt="Ảnh bất động sản chi tiết"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Ảnh chụp thực tế {activeImageIdx + 1}</span>
                </div>
              </div>

              {/* Thumbnails row list */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-opacity relative group ${
                        activeImageIdx === idx 
                          ? "border-brand-primary opacity-100" 
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thép thu nhỏ ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Detail narrative blocks description */}
              <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-l-4 border-brand-primary pl-3 uppercase">
                  📄 Mô tả chi tiết bất động sản
                </h3>
                <p className="text-xs md:text-[13px] leading-relaxed text-slate-600 whitespace-pre-line">
                  {property.mo_ta}
                </p>
              </div>

              {/* Specifications stats summary table */}
              <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-l-4 border-brand-primary pl-3 uppercase">
                  📐 Thông số kỹ thuật chi tiết
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-blue-500" /> Diện tích sử dụng
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{property.area} m²</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-rose-500" /> Đơn giá / m²
                    </span>
                    <span className="text-brand-primary text-xs font-black">{((property.price * 1000) / property.area).toFixed(1)} triệu/m²</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-500" /> Kết cấu xây dựng
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{property.sotang} tầng</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-emerald-500" /> Số phòng ngủ
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{property.bedroom} Phòng</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-teal-500" /> Số nhà vệ sinh (WC)
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{property.nhavesinh} Phòng</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-amber-500" /> Hướng sinh tài
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{property.direction}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-500" /> Tình trạng pháp lý
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{property.phaply || "Sổ hồng riêng"}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-violet-500" /> Ngày xuất bản tin
                    </span>
                    <span className="text-slate-900 text-xs font-extrabold">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar widgets panel (1/3 on widescreen) */}
            <div className="space-y-6">
              
              {/* Price & Address block */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <span className="inline-flex px-2.5 py-1 rounded bg-red-50 text-brand-primary text-[9px] font-bold uppercase tracking-wider">
                  💥 Giá ngộp giảm sâu
                </span>
                
                <div className="text-3xl font-black text-brand-primary tracking-tight">
                  💰 {property.price} Tỷ <span className="text-xs text-slate-500 font-extrabold">~ {((property.price * 1000) / property.area).toFixed(1)} triệu/m²</span>
                </div>

                <div className="space-y-2 border-t border-slate-50 pt-3">
                  <h2 className="text-sm font-bold text-slate-900 uppercase">
                    {property.tieu_de}
                  </h2>
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 font-semibold pt-1">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    <span>
                      {[property.sonha, property.duongpho, property.phuongxa, property.tinhthanh].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Counter metrics views */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold border-t border-slate-50 pt-3">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" /> {property.views} lượt xem</span>
                </div>
              </div>

              {/* Consultation and contacts cards */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-5 text-center">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center font-extrabold text-lg shadow-sm">
                    TT
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">Thanh Trà BĐS Nhà Phố</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Chuyên Viên Tư Vấn Cấp Cao</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <a
                    href="tel:0854100036"
                    className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-red-650 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Gọi Điện: 0854.100.036</span>
                  </a>

                  <button
                    onClick={onZaloChat}
                    className="w-full py-2.5 rounded-xl bg-brand-zalo hover:bg-blue-600 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
                  >
                    <span>💬 Nhắn Zalo Tư Vấn Ngay</span>
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ lên Facebook</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                  Nhấp tư vấn để nhận ngay ảnh sổ đỏ thực tế, thỏa thuận giá chính chủ 24/7.
                </p>
              </div>

              {/* Warning informational widget */}
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Thanh Trà cam kết 100% không đăng giá ảo, không kê giá ăn chênh lệch. Gặp trực tiếp thương lượng với chính chủ tài sản.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
