/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import FilterBar, { FilterState } from "./components/FilterBar";
import PropertyGrid from "./components/PropertyGrid";
import PropertyDetail from "./components/PropertyDetail";
import PostForm from "./components/PostForm";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import { 
  X, Scale, Sparkles, TrendingUp, Check, 
  MapPin, Ruler, Bed, Layers, Compass, 
  ShieldCheck, MessageCircle, Eye, RefreshCw 
} from "lucide-react";

import { 
  Property, CustomerLead, SystemStats, ActivityLog, 
  INITIAL_PROPERTIES 
} from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "post">("home");
  const [adminMode, setAdminMode] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);

  // Comparison State
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (property: Property) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, property];
      }
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Core Persisted States inside localStorage
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    views: 1240,
    fbShares: 84,
    zaloShares: 65,
    linkCopies: 120,
    totalLeads: 0
  });
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Filtering states
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    phuongxa: "",
    direction: "",
    dtTu: "",
    dtDen: "",
    tangTu: "",
    tangDen: "",
    duongpho: "",
    giaTu: "",
    giaDen: "",
    keyword: ""
  });

  // Load storage keys on initial startup mount
  useEffect(() => {
    const savedProps = localStorage.getItem("tt_properties");
    if (savedProps) {
      setProperties(JSON.parse(savedProps));
    } else {
      setProperties(INITIAL_PROPERTIES);
      localStorage.setItem("tt_properties", JSON.stringify(INITIAL_PROPERTIES));
    }

    const savedLeads = localStorage.getItem("tt_leads");
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      setLeads([]);
    }

    const savedStats = localStorage.getItem("tt_stats");
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setStats({
        ...parsedStats,
        views: parsedStats.views + 1 // Add 1 page view on initial entry
      });
    } else {
      localStorage.setItem("tt_stats", JSON.stringify(stats));
    }

    const savedLogs = localStorage.getItem("tt_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      const initialLogs: ActivityLog[] = [
        {
          id: `log_init`,
          type: "view",
          detail: "Chào mừng quý khách đến với Thanh Trà BĐS Nhà Phố Thủ Đức!",
          timestamp: new Date().toISOString()
        }
      ];
      setLogs(initialLogs);
      localStorage.setItem("tt_logs", JSON.stringify(initialLogs));
    }
  }, []);

  // Save changes automatically into storage
  useEffect(() => {
    if (properties.length > 0) {
      localStorage.setItem("tt_properties", JSON.stringify(properties));
    }
  }, [properties]);

  useEffect(() => {
    localStorage.setItem("tt_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("tt_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("tt_logs", JSON.stringify(logs));
  }, [logs]);

  // Activity Log Creator Helper
  const logActivity = (type: ActivityLog["type"], detail: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type,
      detail,
      timestamp: new Date().toISOString()
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep latest 50 logs

    // Dynamically adjust statistics based on logs triggered
    setStats((prev) => {
      const updated = { ...prev };
      if (type === "view") updated.views += 1;
      else if (type === "share_fb") updated.fbShares += 1;
      else if (type === "share_zalo") updated.zaloShares += 1;
      else if (type === "copy_link") updated.linkCopies += 1;
      else if (type === "new_lead") updated.totalLeads += 1;
      return updated;
    });
  };

  // Lead registrations handler
  const handleAddLead = (newLead: CustomerLead) => {
    setLeads((prev) => [newLead, ...prev]);
    logActivity("new_lead", `Khách hàng mới: ${newLead.name} (${newLead.phone}) đăng ký từ ${newLead.source}`);
  };

  const handleUpdateLeadStatus = (leadId: string, status: CustomerLead["status"]) => {
    setLeads((prev) => 
      prev.map(l => l.id === leadId ? { ...l, status } : l)
    );
    const matchedLead = leads.find(l => l.id === leadId);
    if (matchedLead) {
      logActivity(
        "edit_property", 
        `Cập nhật trạng thái khách hàng ${matchedLead.name} thành "${
          status === "contacted" ? "Đã liên hệ" : "Giao dịch thành công"
        }"`
      );
    }
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter(l => l.id !== leadId));
    logActivity("delete_property", "Xóa hồ sơ thông tin khách hàng tiềm năng");
  };

  // Save or edit properties list from admin panel
  const handleSaveProperty = (savedProp: Property) => {
    setProperties((prev) => {
      const existingProp = prev.find(p => p.id === savedProp.id);
      if (existingProp) {
        // Compare price change
        if (existingProp.price !== savedProp.price) {
          const finalProp = {
            ...savedProp,
            oldPrice: existingProp.price,
            priceChangedAt: new Date().toISOString()
          };
          return prev.map(p => p.id === savedProp.id ? finalProp : p);
        }
        
        // If price hasn't changed, persist any historical price stamps
        const finalProp = {
          ...savedProp,
          oldPrice: existingProp.oldPrice,
          priceChangedAt: existingProp.priceChangedAt
        };
        return prev.map(p => p.id === savedProp.id ? finalProp : p);
      } else {
        return [savedProp, ...prev];
      }
    });
    setEditPropertyId(null);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter(p => p.id !== id));
    logActivity("delete_property", `Xóa bài đăng rao bán BĐS ID: ${id}`);
  };

  // Safe Property selection detail wrapper
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    
    // Update views counter of selected property state
    setProperties((prev) => 
      prev.map(p => {
        if (p.id === id) {
          const updatedViews = p.views + 1;
          logActivity("view", `Xem chi tiết sản phẩm: ${p.tieu_de}`);
          return { ...p, views: updatedViews };
        }
        return p;
      })
    );
  };

  // Filter Algorithm Coordination
  const filteredProperties = properties.filter((p) => {
    // 0. Quick filter category check (MỚI ĐĂNG - 3 days, GIẢM GIÁ - 2 days, TĂNG GIÁ - 2 days)
    if (currentFilters.quickFilter && currentFilters.quickFilter !== "all") {
      if (currentFilters.quickFilter === "new") {
        const isNew = p.created_at && (Date.now() - new Date(p.created_at).getTime()) / 86400000 <= 3;
        if (!isNew) return false;
      } else if (currentFilters.quickFilter === "reduced") {
        const hasPriceChange = p.priceChangedAt && p.oldPrice && (Date.now() - new Date(p.priceChangedAt).getTime()) / 86400000 <= 2;
        const isPriceReduced = hasPriceChange && p.oldPrice ? p.price < p.oldPrice : false;
        if (!isPriceReduced) return false;
      } else if (currentFilters.quickFilter === "increased") {
        const hasPriceChange = p.priceChangedAt && p.oldPrice && (Date.now() - new Date(p.priceChangedAt).getTime()) / 86400000 <= 2;
        const isPriceIncreased = hasPriceChange && p.oldPrice ? p.price > p.oldPrice : false;
        if (!isPriceIncreased) return false;
      }
    }

    // 1. Phường xã matching block
    if (currentFilters.phuongxa && !p.phuongxa.toLowerCase().includes(currentFilters.phuongxa.toLowerCase())) {
      return false;
    }

    // 2. Hướng Direction
    if (currentFilters.direction && p.direction !== currentFilters.direction) {
      return false;
    }

    // 3. Diện tích m2 bounds
    if (currentFilters.dtTu && p.area < parseFloat(currentFilters.dtTu)) return false;
    if (currentFilters.dtDen && p.area > parseFloat(currentFilters.dtDen)) return false;

    // 4. Số tầng lầu
    if (currentFilters.tangTu && parseInt(p.sotang) < parseInt(currentFilters.tangTu)) return false;
    if (currentFilters.tangDen && parseInt(p.sotang) > parseInt(currentFilters.tangDen)) return false;

    // 5. Tên đường phố
    if (currentFilters.duongpho && !p.duongpho.toLowerCase().includes(currentFilters.duongpho.toLowerCase())) {
      return false;
    }

    // 6. Mức giá Tỷ bounds
    if (currentFilters.giaTu && p.price < parseFloat(currentFilters.giaTu)) return false;
    if (currentFilters.giaDen && p.price > parseFloat(currentFilters.giaDen)) return false;

    // 7. General Keyword quick matching
    if (currentFilters.keyword) {
      const kw = currentFilters.keyword.toLowerCase().trim();
      const matchTitle = p.tieu_de.toLowerCase().includes(kw);
      const matchDesc = p.mo_ta.toLowerCase().includes(kw);
      const matchSt = p.duongpho.toLowerCase().includes(kw);
      const matchWard = p.phuongxa.toLowerCase().includes(kw);
      
      if (!matchTitle && !matchDesc && !matchSt && !matchWard) {
        return false;
      }
    }

    return true;
  });

  const activePropertyDetail = selectedPropertyId 
    ? properties.find(p => p.id === selectedPropertyId) 
    : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 relative id-main-layout pb-12">
      
      {/* Dynamic Header navbar navigation component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setEditPropertyId(null);
        }}
        adminMode={adminMode}
        onToggleAdmin={(enabled) => {
          setAdminMode(enabled);
          if (enabled) logActivity("view", "Đăng nhập giao diện quản trị Admin thành công.");
        }}
      />

      {/* Main tab layouts views container */}
      <div className="flex-1">
        {activeTab === "home" && (
          <div className="space-y-6">
            <Header />
            <FilterBar 
              onFilterChange={setCurrentFilters} 
              resultCount={filteredProperties.length} 
            />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <PropertyGrid
                properties={filteredProperties}
                onSelectProperty={handleSelectProperty}
                adminMode={adminMode}
                onEditProperty={(id) => {
                  setEditPropertyId(id);
                  setActiveTab("post");
                }}
                onDeleteProperty={handleDeleteProperty}
                onLogActivity={logActivity}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
              />
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="pt-20">
            <Dashboard
              properties={properties}
              leads={leads}
              stats={stats}
              logs={logs}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
              onDeleteProperty={handleDeleteProperty}
              onEditProperty={(id) => {
                setEditPropertyId(id);
                setActiveTab("post");
              }}
              adminMode={adminMode}
            />
          </div>
        )}

        {activeTab === "post" && adminMode && (
          <div className="pt-20">
            <PostForm
              onSaveProperty={handleSaveProperty}
              editPropertyId={editPropertyId}
              properties={properties}
              onCancel={() => {
                setActiveTab("home");
                setEditPropertyId(null);
              }}
              onLogActivity={logActivity}
            />
          </div>
        )}
      </div>

      {/* Detail slide out modal drawer */}
      {activePropertyDetail && (
        <PropertyDetail
          property={activePropertyDetail}
          onClose={() => setSelectedPropertyId(null)}
          onZaloChat={() => {
            logActivity("share_zalo", `Inbox Zalo thảo luận BĐS #${activePropertyDetail.id}`);
            window.open("https://zalo.me/0854100036", "_blank");
          }}
          onLogActivity={logActivity}
        />
      )}

      {/* Floating 24/7 Smart Automated Chatbot Widget assistant */}
      <Chatbot
        properties={properties}
        onAddLead={handleAddLead}
        onSelectProperty={(id) => {
          handleSelectProperty(id);
          setActiveTab("home");
        }}
      />

      {/* High-quality UX Vietnamese presentation Footer section */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20 select-none">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#f8fafc] text-sm uppercase tracking-wide">Thanh Trà BĐS Nhà Phố</h4>
            <p className="leading-relaxed">
              Kênh kết nối thông tin giao dịch, mua bán, ký gửi nhà phố uy tín hàng đầu tại TP. Thủ Đức. Cam kết thông số thật - giá trị thật.
            </p>
            <p className="font-semibold text-[10px] text-brand-primary">Tên miền chính thức: THANHTRABDS.VN</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#f8fafc] text-sm uppercase tracking-wide">Thông tin liên lạc văn phòng</h4>
            <ul className="space-y-2">
              <li className="font-semibold text-slate-300">📍 Trụ sở chính: Đường Lò Lu, P. Trường Thạnh, thành phố Thủ Đức, TP.HCM</li>
              <li className="font-semibold text-slate-300">📞 Điện thoại: 0854.100.036</li>
              <li className="font-semibold text-slate-300">📧 Email: thanhtra1996st@gmail.com</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#f8fafc] text-sm uppercase tracking-wide">Môi giới ký gửi chuyên nghiệp</h4>
            <p className="leading-relaxed">
              Bạn có nhu cầu thanh khoản nhanh bất động sản tại TP. Thủ Đức? Hãy liên hệ ngay để đăng tải thông tin quảng bá hoàn toàn miễn phí.
            </p>
            <div className="pt-2 flex gap-4">
              <a href="https://zalo.me/0854100036" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-primary p-2 bg-white/5 rounded-full transition-colors font-bold">ZALO</a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-primary p-2 bg-white/5 rounded-full transition-colors font-bold">FACEBOOK</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/60 mt-8 pt-6 text-center text-[10px] font-semibold text-slate-500">
          © {new Date().getFullYear()} Bản quyền thuộc sở hữu của Thanh Trà BĐS Nhà Phố. Thiết kế UX/UI tối ưu di động chuẩn mực.
        </div>
      </footer>

      {/* Floating Price Comparison Tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-50 text-white select-none animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-extrabold text-[10px] uppercase tracking-wider shrink-0">
              <Scale className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>SO SÁNH GIÁ ({compareList.length}/3)</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 max-w-md md:max-w-xl">
              {compareList.map((item) => {
                const img = item.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';
                return (
                  <div key={item.id} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-755 hover:border-slate-600 rounded-lg pr-2 py-1 pl-1.5 text-[10px] font-bold">
                    <img src={img} alt="Thumb" referrerPolicy="no-referrer" className="w-5 h-5 object-cover rounded-md" />
                    <span className="max-w-[120px] truncate">{item.tieu_de}</span>
                    <button 
                      onClick={() => handleToggleCompare(item)}
                      className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer text-xs font-black p-0.5 ml-1"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 border-t border-slate-800 md:border-0 pt-3 md:pt-0">
            <button
              onClick={handleClearCompare}
              className="px-3 py-2 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Xóa Hộp
            </button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-[11px] font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/10 uppercase tracking-widest text-center"
            >
              So sánh chi tiết 📊
            </button>
          </div>
        </div>
      )}

      {/* Specialty Comparative Deep Analytics Modal overlay */}
      {isCompareModalOpen && compareList.length > 0 && (
        (() => {
          const minPrice = Math.min(...compareList.map(p => p.price));
          const maxArea = Math.max(...compareList.map(p => p.area));
          const minPricePerM2 = Math.min(...compareList.map(p => (p.price * 1000) / p.area));

          return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header title */}
                <div className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-850 text-white flex items-center justify-between select-none">
                  <div>
                    <h3 className="text-sm md:text-base font-black uppercase tracking-widest flex items-center gap-2 text-amber-400">
                      📊 BẢNG SO SÁNH & PHÂN TÍCH GIÁ CHUYÊN SÂU
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-300 mt-1">
                      Công cụ so sánh diện tích, mức giá, đơn giá mỗi m² giúp định giá chính xác và phát hiện tin hời tốt nhất.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Computational Table comparative columns */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                  <div className="min-w-[650px] overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                          <th className="py-4 px-5 text-[11px] font-black uppercase tracking-wider text-slate-400 w-1/4">Thông Số So Sánh</th>
                          {compareList.map((item, idx) => (
                            <th key={item.id} className="py-4 px-5 text-center relative border-l border-slate-100 w-1/4">
                              <div className="flex flex-col items-center gap-2 select-none">
                                <span className="absolute -top-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[8px] font-black tracking-widest">
                                  BẤT ĐỘNG SẢN {idx + 1}
                                </span>
                                <img
                                  src={item.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                                  alt="Thumb"
                                  referrerPolicy="no-referrer"
                                  className="w-20 h-16 object-cover rounded-xl shadow-md border border-slate-100 mt-2.5"
                                />
                                <div className="text-xs font-black line-clamp-1 text-slate-900 px-2 leading-tight uppercase font-sans">
                                  {item.tieu_de}
                                </div>
                                <button
                                  onClick={() => handleToggleCompare(item)}
                                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-all cursor-pointer mt-1"
                                >
                                  Gỡ bỏ ×
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        
                        {/* Row: Tổng giá */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">💰 Tổng giá bán</td>
                          {compareList.map((item) => {
                            const isCheapest = item.price === minPrice;
                            return (
                              <td key={item.id} className={`py-4 px-5 text-center border-l border-slate-100 ${isCheapest ? 'bg-emerald-50/45' : ''}`}>
                                <div className="font-extrabold text-slate-900 text-sm italic">{item.price} TỶ</div>
                                {isCheapest && (
                                  <span className="inline-flex items-center gap-1 mt-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm animate-pulse">
                                    🔥 Giá Tốt Nhất
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row: Diện tích */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">📐 Diện tích sử dụng</td>
                          {compareList.map((item) => {
                            const isBiggest = item.area === maxArea;
                            return (
                              <td key={item.id} className={`py-4 px-5 text-center border-l border-slate-100 ${isBiggest ? 'bg-blue-50/35' : ''}`}>
                                <div className="font-bold text-slate-900 text-xs">{item.area} m²</div>
                                {isBiggest && (
                                  <span className="inline-flex mt-1 bg-blue-100 text-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    ✨ Rộng Nhất
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row: Đơn giá / m² */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">📈 Đơn giá trung bình / m²</td>
                          {compareList.map((item) => {
                            const unitPrice = (item.price * 1000) / item.area;
                            const isBestVal = unitPrice === minPricePerM2;
                            return (
                              <td key={item.id} className={`py-4 px-5 text-center border-l border-slate-100 font-mono ${isBestVal ? 'bg-amber-50/45' : ''}`}>
                                <div className="font-extrabold text-amber-600 text-xs italic">{unitPrice.toFixed(1)} triệu/m²</div>
                                {isBestVal && (
                                  <span className="inline-flex mt-1 bg-amber-100 border border-amber-200 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-bounce">
                                    🏆 Hời Nhất / m²
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row: Số tầng */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">🏢 Kết cấu tầng lầu</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-3 px-5 text-center border-l border-slate-100 text-xs text-slate-800 font-semibold">
                              {item.sotang} Tầng
                            </td>
                          ))}
                        </tr>

                        {/* Row: Bedrooms */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">🛌 Số phòng ngủ</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-3 px-5 text-center border-l border-slate-100 text-xs text-slate-800 font-semibold">
                              {item.bedroom} PN
                            </td>
                          ))}
                        </tr>

                        {/* Row: Toilet */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">🚿 Nhà vệ sinh (WC)</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-3 px-5 text-center border-l border-slate-100 text-xs text-slate-800 font-semibold">
                              {item.nhavesinh} WC
                            </td>
                          ))}
                        </tr>

                        {/* Row: Direction */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">🧭 Hướng nhà đất</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-3 px-5 text-center border-l border-slate-100 text-xs text-slate-800 font-black">
                              {item.direction}
                            </td>
                          ))}
                        </tr>

                        {/* Row: Legal */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700 text-xs">🛡️ Tình trạng pháp lý</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-3 px-5 text-center border-l border-slate-100 text-xs text-emerald-600 font-black">
                              {item.phaply || "Sổ hồng riêng"}
                            </td>
                          ))}
                        </tr>

                        {/* Row: Long-address location */}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-700 text-xs">📍 Vị trí địa lý cụ thể</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-3.5 px-5 text-center border-l border-slate-100 text-[11px] text-slate-600 leading-relaxed font-semibold">
                              Đường {item.duongpho}, P. {item.phuongxa}, TP. Thủ Đức
                            </td>
                          ))}
                        </tr>

                        {/* Row: Interactive Action buttons */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-700 text-xs">📞 Liên hệ thương thảo</td>
                          {compareList.map((item) => (
                            <td key={item.id} className="py-4 px-5 text-center border-l border-slate-100">
                              <div className="flex flex-col gap-2 max-w-[170px] mx-auto select-none">
                                <button
                                  onClick={() => {
                                    setIsCompareModalOpen(false);
                                    handleSelectProperty(item.id);
                                  }}
                                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                                >
                                  <Eye className="w-3 h-3" /> Xem chi tiết
                                </button>
                                <button
                                  onClick={() => {
                                    logActivity("share_zalo", `Thảo luận nhà so sánh ID: ${item.id}`);
                                    window.open("https://zalo.me/0854100036", "_blank");
                                  }}
                                  className="w-full py-1.5 bg-brand-primary hover:bg-amber-400 text-slate-900 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <MessageCircle className="w-3 h-3" /> Chat Zalo
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer close option */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                  >
                    Đóng bảng phân tích
                  </button>
                </div>

              </div>
            </div>
          );
        })()
      )}

    </div>
  );
}
