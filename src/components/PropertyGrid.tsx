/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Eye, MapPin, Ruler, Bed, Bath, Compass, ChevronLeft, ChevronRight, Share2, CornerDownRight, MessageCircle, AlertCircle, Edit, Trash2, TrendingUp } from "lucide-react";
import { Property } from "../types";

interface PropertyGridProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
  adminMode: boolean;
  onEditProperty: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  onLogActivity: (type: string, detail: string) => void;
  compareList?: Property[];
  onToggleCompare?: (property: Property) => void;
}

export default function PropertyGrid({
  properties,
  onSelectProperty,
  adminMode,
  onEditProperty,
  onDeleteProperty,
  onLogActivity,
  compareList = [],
  onToggleCompare
}: PropertyGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [slideIndexes, setSlideIndexes] = useState<{ [key: string]: number }>({});
  const [toastMsg, setToastMsg] = useState("");

  const POSTS_PER_PAGE = 12;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Pagination bounds
  const totalPages = Math.ceil(properties.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = Math.min(startIndex + POSTS_PER_PAGE, properties.length);
  const currentItems = properties.slice(startIndex, endIndex);

  const handleNextPhoto = (e: React.MouseEvent, propId: string, imageCount: number) => {
    e.stopPropagation();
    const curIdx = slideIndexes[propId] || 0;
    const nextIdx = (curIdx + 1) % imageCount;
    setSlideIndexes((prev) => ({ ...prev, [propId]: nextIdx }));
  };

  const handlePrevPhoto = (e: React.MouseEvent, propId: string, imageCount: number) => {
    e.stopPropagation();
    const curIdx = slideIndexes[propId] || 0;
    const prevIdx = (curIdx - 1 + imageCount) % imageCount;
    setSlideIndexes((prev) => ({ ...prev, [propId]: prevIdx }));
  };

  // FB Share copy support from File 3
  const handleFacebookShare = (e: React.MouseEvent, p: Property) => {
    e.stopPropagation();
    const fullAddr = [p.sonha, p.duongpho, p.phuongxa, p.tinhthanh].filter(Boolean).join(", ");
    const textToCopy = `🏠 ${p.tieu_de}\n📍 Khu vực: ${fullAddr}\n📐 Diện tích: ${p.area}m² | Hướng: ${p.direction}\n💰 Giá bán: ${p.price} Tỷ\n\n👉 Anh/Chị quan tâm inbox ngay Thanh Trà BĐS để book lịch xem nhà thực tế nhé!`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      onLogActivity("share_fb", `Chia sẻ tin #${p.id} lên Facebook`);
      showToast("Đã tự động COPY thông tin BĐS! Mở tab FB & dán để đăng bài nhé 🎉");
      setTimeout(() => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
      }, 1000);
    }).catch(() => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
    });
  };

  // Zalo directly links contact
  const handleZaloShare = (e: React.MouseEvent, p: Property) => {
    e.stopPropagation();
    onLogActivity("share_zalo", `Liên hệ Zalo xem tin #${p.id}`);
    window.open("https://zalo.me/0854100036", "_blank");
  };

  return (
    <div className="space-y-8 id-property-grid-root">
      
      {/* Toast display popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl border border-white/10 animate-in slide-in-from-right-5 max-w-sm">
          {toastMsg}
        </div>
      )}

      {/* Grid Display header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
        <h3 className="text-sm md:text-lg font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-2">
          🔥 GIỎ HÀNG NHÀ PHỐ THỦ ĐỨC MỚI NHẤT 
          <span className="text-[9px] font-black bg-brand-primary text-slate-900 px-2.5 py-0.5 rounded-md uppercase tracking-widest">
            {properties.length} CĂN
          </span>
        </h3>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest hidden sm:block">
          Hiển thị {startIndex + 1} - {endIndex} của {properties.length} tài sản
        </p>
      </div>

      {/* Grid listing */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm text-slate-500 space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-400" />
          <h4 className="font-bold text-sm text-slate-800">Không tìm thấy tài sản nào phù hợp</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Vui lòng thử điều chỉnh lại bộ dữ liệu lọc nâng cao của bạn hoặc nhấn nút Xóa bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((p) => {
            const curIdx = slideIndexes[p.id] || 0;
            const currentImg = p.images[curIdx] || p.images[0] || "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";
            const isNew = p.created_at && (Date.now() - new Date(p.created_at).getTime()) / 86400000 <= 3;
            
            // Pricing change badge checks
            const hasPriceChange = p.priceChangedAt && p.oldPrice && (Date.now() - new Date(p.priceChangedAt).getTime()) / 86400000 <= 2;
            const isPriceReduced = hasPriceChange && p.oldPrice ? p.price < p.oldPrice : false;
            const isPriceIncreased = hasPriceChange && p.oldPrice ? p.price > p.oldPrice : false;

            const fullAddress = [p.duongpho, p.phuongxa, "TP. Thủ Đức"].filter(Boolean).join(", ");

            return (
              <div
                key={p.id}
                onClick={() => onSelectProperty(p.id)}
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300 overflow-hidden flex flex-col cursor-pointer group"
              >
                {/* Upper visual housing banner with sliding controls */}
                <div className="relative h-48 bg-slate-950 overflow-hidden shrink-0">
                  <img
                    src={currentImg}
                    alt={p.tieu_de}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badge elements */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isNew && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded bg-opacity-95 uppercase tracking-widest shadow-md">
                        🔥 MỚI ĐĂNG
                      </span>
                    )}
                    {isPriceReduced && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded bg-opacity-95 uppercase tracking-widest shadow-md">
                        📉 GIẢM GIÁ
                      </span>
                    )}
                    {isPriceIncreased && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded bg-opacity-95 uppercase tracking-widest shadow-md">
                        📈 TĂNG GIÁ
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{p.views + (slideIndexes[p.id] ? 1 : 0)} xem</span>
                  </div>

                  {/* Compare toggle button overlay */}
                  {onToggleCompare && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(p);
                      }}
                      className={`absolute bottom-3 left-3 z-20 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md cursor-pointer border ${
                        compareList.some(item => item.id === p.id)
                          ? "bg-amber-400 text-slate-900 border-amber-300 font-extrabold scale-105"
                          : "bg-slate-900/85 text-white border-slate-700/60 hover:bg-slate-900"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${compareList.some(item => item.id === p.id) ? "bg-slate-900 animate-ping" : "bg-emerald-400 animate-pulse"}`}></span>
                      {compareList.some(item => item.id === p.id) ? "Đang so sánh" : "So sánh giá"}
                    </button>
                  )}

                  {/* Slider Control buttons */}
                  {p.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevPhoto(e, p.id, p.images.length)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-brand-primary text-white rounded-full flex items-center justify-center transition-all z-10"
                        title="Ảnh trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleNextPhoto(e, p.id, p.images.length)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-brand-primary text-white rounded-full flex items-center justify-center transition-all z-10"
                        title="Ảnh kế"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 right-2.5 bg-black/60 text-white text-[8px] font-semibold px-2 py-0.5 rounded-full tracking-wider">
                        {curIdx + 1} / {p.images.length} ảnh
                      </div>
                    </>
                  )}
                </div>

                {/* Central details info grid */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Property title in uppercase format */}
                    <h4 
                      className="font-bold text-slate-900 text-xs md:text-sm tracking-wide leading-snug line-clamp-2 uppercase min-h-[2.4rem] hover:text-brand-primary transition-colors"
                      title={p.tieu_de}
                    >
                      {p.tieu_de}
                    </h4>

                    {/* Specifications grid aligning details */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1 bg-slate-50 rounded-xl px-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span className="truncate" title={fullAddress}>{fullAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Ruler className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>DT: {p.area} m² <span className="text-[10px] text-brand-primary font-black">({((p.price * 1000) / p.area).toFixed(1)} Tr/m²)</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Bed className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{p.bedroom} PN</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Compass className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Hướng: {p.direction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions buttons at bottom */}
                  <div className="border-t border-slate-100 pt-3 mt-4 flex flex-col gap-2">
                    <div className="flex items-baseline justify-between select-none">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Giá phát lộc</span>
                      <div className="flex items-baseline gap-1.5">
                        {p.oldPrice && p.price !== p.oldPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-bold">
                            {p.oldPrice} TỶ
                          </span>
                        )}
                        <div className="flex flex-col items-end">
                          <span className="text-sm md:text-base font-black text-amber-600 tracking-tighter uppercase italic">{p.price} TỶ</span>
                          <span className="text-[9px] font-bold text-slate-500 tracking-tighter hover:text-brand-primary">~ {((p.price * 1000) / p.area).toFixed(1)} triệu/m²</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {/* Zalo Contact click trigger */}
                      <button
                        onClick={(e) => handleZaloShare(e, p)}
                        className="px-3 py-2 bg-brand-primary text-slate-900 hover:bg-amber-400 text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Liên Hệ Zalo</span>
                      </button>

                      {/* Facebook copy post click trigger */}
                      <button
                        onClick={(e) => handleFacebookShare(e, p)}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Đăng FB</span>
                      </button>
                    </div>

                    {/* Admin settings trigger blocks if admin on */}
                    {adminMode && (
                      <div className="grid grid-cols-2 gap-1.5 bg-amber-50 rounded-xl p-1.5 border border-amber-200/50 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProperty(p.id);
                          }}
                          className="py-1 px-2.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if(confirm("Bạn có chắc muốn xóa tin đăng này không?")) {
                              onDeleteProperty(p.id);
                            }
                          }}
                          className="py-1 px-2.5 rounded bg-red-650 hover:bg-red-750 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Styled Pagination Controls list */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-6 sticky bottom-0">
          <button
            onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-tighter hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quay Lại
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 text-xs font-black rounded-lg transition-colors ${
                currentPage === i + 1 
                  ? "bg-brand-primary text-slate-900 shadow-md shadow-brand-primary/20 animate-pulse" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-tighter hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp Theo
          </button>
        </div>
      )}

    </div>
  );
}
