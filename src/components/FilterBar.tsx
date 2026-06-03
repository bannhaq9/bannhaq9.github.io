/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Filter, SlidersHorizontal, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  resultCount: number;
}

export interface FilterState {
  phuongxa: string;
  direction: string;
  dtTu: string;
  dtDen: string;
  tangTu: string;
  tangDen: string;
  duongpho: string;
  giaTu: string;
  giaDen: string;
  keyword: string;
  quickFilter?: "all" | "new" | "reduced" | "increased";
}

const INITIAL_FILTERS: FilterState = {
  phuongxa: "",
  direction: "",
  dtTu: "",
  dtDen: "",
  tangTu: "",
  tangDen: "",
  duongpho: "",
  giaTu: "",
  giaDen: "",
  keyword: "",
  quickFilter: "all"
};

export default function FilterBar({ onFilterChange, resultCount }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const handleInputChange = (key: keyof FilterState, value: string) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    onFilterChange(nextFilters);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    onFilterChange(INITIAL_FILTERS);
  };

  return (
    <div className="bg-white border-y border-slate-100 py-3 relative z-30 id-filterbar-el">
      <div className="container mx-auto px-4">
        
        {/* Toggle trigger bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between select-none shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-bold text-slate-700">
              {isOpen ? "Thu nhỏ khung tìm kiếm nâng cao" : "Tìm kiếm & Lọc bất động sản phù hợp"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest bg-brand-primary/20 text-slate-900 px-2.5 py-1 rounded-md">
              Khớp {resultCount} căn
            </span>
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5 select-none">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Danh mục nhanh:</span>
          {[
            { id: "all", label: "✨ Tất cả" },
            { id: "new", label: "🔥 Mới đăng (3 ngày)" },
            { id: "reduced", label: "📉 Giảm giá (2 ngày)" },
            { id: "increased", label: "📈 Tăng giá (2 ngày)" }
          ].map((tab) => {
            const isActive = (filters.quickFilter || "all") === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const val = tab.id as any;
                  const nextFilters = { ...filters, quickFilter: val };
                  setFilters(nextFilters);
                  onFilterChange(nextFilters);
                }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-all border ${
                  isActive 
                    ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10 cursor-pointer" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Expandable content form */}
        {isOpen && (
          <div className="mt-4 p-5 border border-slate-200 bg-white rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              
              {/* Region fixed selector */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Tỉnh / Thành phố</label>
                <select className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed uppercase" disabled>
                  <option>Hồ Chí Minh</option>
                </select>
              </div>

              {/* District fixed selector */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Quận / Huyện</label>
                <select className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed uppercase" disabled>
                  <option>TP. Thủ Đức</option>
                </select>
              </div>

              {/* Phường xã wards */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Phường / Xã</label>
                <select 
                  value={filters.phuongxa}
                  onChange={(e) => handleInputChange("phuongxa", e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="">-- Tất cả Phường --</option>
                  <option value="Long Trường">Long Trường</option>
                  <option value="Trường Thạnh">Trường Thạnh</option>
                  <option value="Long Thạnh Mỹ">Long Thạnh Mỹ</option>
                  <option value="Phú Hữu">Phú Hữu</option>
                  <option value="Tăng Nhơn Phú A">Tăng Nhơn Phú A</option>
                  <option value="Tăng Nhơn Phú B">Tăng Nhơn Phú B</option>
                  <option value="Hiệp Phú">Hiệp Phú</option>
                  <option value="Linh Đông">Linh Đông</option>
                  <option value="Linh Tây">Linh Tây</option>
                </select>
              </div>

              {/* Hướng Direction */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Hướng tài sản</label>
                <select 
                  value={filters.direction}
                  onChange={(e) => handleInputChange("direction", e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="">-- Tất cả Hướng --</option>
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

              {/* Diện tích range */}
              <div className="space-y-1 col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Diện tích sử dụng (m²)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Từ m²"
                    value={filters.dtTu}
                    onChange={(e) => handleInputChange("dtTu", e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Đến m²"
                    value={filters.dtDen}
                    onChange={(e) => handleInputChange("dtDen", e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mức Giá range */}
              <div className="space-y-1 col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <span className="text-brand-primary font-extrabold text-[10px] uppercase">Mức Giá (Tỷ đồng)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Từ Tỷ"
                    value={filters.giaTu}
                    onChange={(e) => handleInputChange("giaTu", e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Đến Tỷ"
                    value={filters.giaDen}
                    onChange={(e) => handleInputChange("giaDen", e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Số tầng */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Số Tầng tối thiểu</label>
                <input
                  type="number"
                  placeholder="Kể cả lửng..."
                  value={filters.tangTu}
                  onChange={(e) => handleInputChange("tangTu", e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Tên đường */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Đường phố / Khu dự án</label>
                <input
                  type="text"
                  placeholder="Nhập tên đường..."
                  value={filters.duongpho}
                  onChange={(e) => handleInputChange("duongpho", e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Keyword nhanh */}
              <div className="space-y-1 col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Nhập từ khóa tìm nhanh</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Khách ngộp, ô tô, hẻm xe hơi, Võ Văn Ngân..."
                    value={filters.keyword}
                    onChange={(e) => handleInputChange("keyword", e.target.value)}
                    className="w-full text-xs pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

            </div>

            {/* Clear Filters Call to Actions */}
            <div className="flex justify-end gap-2.5 mt-5 border-t border-slate-100 pt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-tighter flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Xóa toàn bộ lọc
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-lg bg-brand-primary hover:bg-amber-400 text-slate-900 text-xs font-black uppercase tracking-tighter transition-colors"
              >
                Áp Dụng Tìm Kiếm
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
