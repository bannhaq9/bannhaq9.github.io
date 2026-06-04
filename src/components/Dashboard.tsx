/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, Users, Eye, Share2, ClipboardList, Clock, 
  CheckCircle2, AlertTriangle, Filter, Search, Trash2, Check, ArrowUpRight,
  Edit, Lock, FileText, Layout, AlertOctagon
} from "lucide-react";
import { Property, CustomerLead, SystemStats, ActivityLog } from "../types";

interface DashboardProps {
  properties: Property[];
  leads: CustomerLead[];
  stats: SystemStats;
  logs: ActivityLog[];
  onUpdateLeadStatus: (leadId: string, status: CustomerLead["status"]) => void;
  onDeleteLead: (leadId: string) => void;
  onDeleteProperty: (id: string) => void;
  onEditProperty: (id: string) => void;
  onResetAll?: () => void;
  adminMode: boolean;
}

export default function Dashboard({ 
  properties, 
  leads, 
  stats, 
  logs, 
  onUpdateLeadStatus, 
  onDeleteLead,
  onDeleteProperty,
  onEditProperty,
  onResetAll,
  adminMode
}: DashboardProps) {
  const [activeSection, setActiveSection] = useState<"leads" | "properties">("leads");
  const [leadFilter, setLeadFilter] = useState<CustomerLead["status"] | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [propertySearchTerm, setPropertySearchTerm] = useState("");

  const totalViews = stats.views;
  const totalShares = stats.fbShares + stats.zaloShares + stats.linkCopies;
  const conversionRate = leads.length > 0 && totalViews > 0 
    ? ((leads.length / totalViews) * 100).toFixed(1)
    : "0.0";

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = leadFilter === "all" || lead.status === leadFilter;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.phone.includes(searchTerm) || 
                          (lead.propertyTitle && lead.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredProperties = properties.filter(p => {
    const term = propertySearchTerm.toLowerCase().trim();
    if (!term) return true;
    return p.tieu_de.toLowerCase().includes(term) ||
           p.duongpho.toLowerCase().includes(term) ||
           p.phuongxa.toLowerCase().includes(term) ||
           (p.phaply && p.phaply.toLowerCase().includes(term));
  });

  const wardCounts: { [key: string]: number } = {};
  properties.forEach(p => {
    const w = p.phuongxa || "Khác";
    wardCounts[w] = (wardCounts[w] || 0) + 1;
  });

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto id-dashboard-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            📊 Báo Cáo &amp; Quản Trị Hệ Thống <span className="bg-brand-primary/10 text-brand-primary text-xs px-2.5 py-1 rounded-full font-medium">Thời gian thực</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi lưu lượng truy cập, tỷ lệ chuyển đổi khách hàng tiềm năng và mức độ tin cậy chia sẻ xã hội.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-100 px-3 py-2 rounded-xl shadow-sm self-start">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")}</span>
          </div>
          {/* NÚT XÓA TẤT CẢ DỮ LIỆU */}
          {adminMode && onResetAll && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
              title="Xóa toàn bộ dữ liệu Redis — không thể hoàn tác!"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Xóa tất cả dữ liệu
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Lượt Xem Website</span>
            <span className="p-1.5 bg-red-50 text-brand-primary rounded-lg"><Eye className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalViews.toLocaleString("vi-VN")}</div>
          <p className="text-[10px] text-brand-green mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +15.4% so với hôm qua
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Lượt Chia Sẻ</span>
            <span className="p-1.5 bg-blue-50 text-brand-blue rounded-lg"><Share2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalShares}</div>
          <div className="flex gap-2 text-[9px] text-slate-500 mt-1.5">
            <span>FB: <b className="text-slate-800">{stats.fbShares}</b></span>
            <span>Zalo: <b className="text-slate-800">{stats.zaloShares}</b></span>
            <span>Copy: <b className="text-slate-800">{stats.linkCopies}</b></span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Khách Tiềm Năng (Leads)</span>
            <span className="p-1.5 bg-yellow-50 text-amber-600 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{leads.length}</div>
          <div className="flex gap-1.5 text-[9px] mt-1.5">
            <span className="text-brand-primary font-medium">New: {leads.filter(l => l.status === "new").length}</span>
            <span className="text-brand-green font-medium">Closed: {leads.filter(l => l.status === "closed").length}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tỷ Lệ Chuyển Đổi</span>
            <span className="p-1.5 bg-green-50 text-brand-green rounded-lg"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{conversionRate}%</div>
          <p className="text-[10px] text-slate-500 mt-1">Lượt đăng ký / Lượt vào trang</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Charts & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-1">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            🗺️ Phân Bố BĐS Theo Phường TP. Thủ Đức
          </h3>
          {Object.keys(wardCounts).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">Chưa có dữ liệu bất động sản.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(wardCounts).map(([ward, count], i) => {
                const maxCount = Math.max(...Object.values(wardCounts));
                const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Phường {ward}</span>
                      <span>{count} sản phẩm</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-primary" /> Nhật Ký Hoạt Động Thời Gian Thực
          </h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center italic">Chưa ghi nhận hoạt động nào...</div>
            ) : (
              logs.map((log) => {
                const badgeColor = 
                  log.type === "new_lead" ? "bg-amber-100 text-amber-800" :
                  log.type === "create_property" || log.type === "edit_property" ? "bg-slate-100 text-slate-800" :
                  "bg-blue-50 text-brand-blue";
                const logTime = new Date(log.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                return (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs text-slate-600 border-b border-slate-50 pb-2">
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{logTime}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeColor} uppercase shrink-0`}>{log.type.replace("_", " ")}</span>
                    <span className="text-slate-700">{log.detail}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-2 select-none">
        <button
          onClick={() => setActiveSection("leads")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider relative px-4 transition-all cursor-pointer ${activeSection === "leads" ? "text-slate-900 font-extrabold border-b-2 border-slate-900" : "text-slate-400 font-semibold hover:text-slate-600"}`}
        >
          📋 Khách Hàng Đăng Ký ({leads.length})
        </button>
        <button
          onClick={() => setActiveSection("properties")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider relative px-4 transition-all ml-4 cursor-pointer ${activeSection === "properties" ? "text-slate-900 font-extrabold border-b-2 border-slate-900" : "text-slate-400 font-semibold hover:text-slate-600"}`}
        >
          🏢 Quản Lý Bài Đăng ({properties.length})
        </button>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {activeSection === "leads" ? (
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  📋 Danh Sách Dữ Liệu Khách Đăng Ký <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{leads.length}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Thông tin khách hàng được thu thập từ chatbot và các form yêu cầu tư vấn.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 p-1 bg-white">
                  {(["all", "new", "contacted", "closed"] as const).map((tag) => (
                    <button key={tag} onClick={() => setLeadFilter(tag)}
                      className={`px-3 py-1 rounded-md text-slate-600 text-[11px] font-semibold transition-all cursor-pointer ${leadFilter === tag ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                      {tag === "all" ? "Tất cả" : tag === "new" ? "Mới" : tag === "contacted" ? "Đã liên hệ" : "Thành công"}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Tìm tên, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none w-[170px]" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500 bg-slate-100/30">
                    <th className="py-3 px-5">Tên khách hàng</th>
                    <th className="py-3 px-5">Số điện thoại</th>
                    <th className="py-3 px-5">Nghiệp vụ / BĐS Quan tâm</th>
                    <th className="py-3 px-5">Nguồn Khách</th>
                    <th className="py-3 px-5">Trạng thái</th>
                    <th className="py-3 px-5 text-right">Thao tác xử lý</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-xs text-slate-400 italic">Không tìm thấy dữ liệu đăng ký tương ứng...</td></tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      let statusColor = "bg-red-50 text-brand-primary border-brand-primary/10";
                      if (lead.status === "contacted") statusColor = "bg-blue-50 text-brand-blue border-brand-blue/10";
                      if (lead.status === "closed") statusColor = "bg-green-50 text-brand-green border-brand-green/10";
                      return (
                        <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs text-slate-700 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-900">{lead.name}</td>
                          <td className="py-3.5 px-5 select-all font-mono tracking-wider">{lead.phone}</td>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-800 line-clamp-1">{lead.note || "Tư vấn tổng quan"}</div>
                            {lead.propertyId && <span className="text-[10px] text-slate-400 font-mono">BĐS ID: {lead.propertyId}</span>}
                          </td>
                          <td className="py-3.5 px-5 capitalize">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <span className={`w-1.5 h-1.5 rounded-full ${lead.source === 'chatbot' ? 'bg-indigo-500' : 'bg-orange-500'}`}></span>
                              {lead.source.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`px-2 py-1 rounded-full border text-[10px] font-bold ${statusColor}`}>
                              {lead.status === "new" ? "🔴 Mới Đăng Ký" : lead.status === "contacted" ? "☎️ Đã Liên Hệ" : "✅ Thành Công"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                            {lead.status === "new" && (
                              <button onClick={() => onUpdateLeadStatus(lead.id, "contacted")}
                                className="p-1 px-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold transition-colors inline-flex items-center gap-1 shadow-sm cursor-pointer">
                                <Check className="w-3.5 h-3.5" /> Gọi điện tư vấn
                              </button>
                            )}
                            {lead.status === "contacted" && (
                              <button onClick={() => onUpdateLeadStatus(lead.id, "closed")}
                                className="p-1 px-2.5 rounded bg-brand-green hover:bg-emerald-600 text-white text-[10px] font-semibold transition-colors inline-flex items-center gap-1 shadow-sm cursor-pointer">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Thành Công
                              </button>
                            )}
                            <button onClick={() => onDeleteLead(lead.id)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-brand-primary rounded transition-colors cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  🏢 Danh Sách Bài Đăng Bất Động Sản <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{properties.length}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {adminMode ? "Bạn đang ở giao diện Quản trị. Có thể sửa thông tin hoặc xóa bài đăng rác." : "⚠️ Sử dụng quyền Quản trị (Admin ON ở góc phải) để chỉnh sửa hoặc xóa tin đăng."}
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Tìm tiêu đề, tên đường, phường..." value={propertySearchTerm} onChange={(e) => setPropertySearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none w-[230px]" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500 bg-slate-100/30">
                    <th className="py-3 px-5">Mô tả thông tin BĐS</th>
                    <th className="py-3 px-5">Vị trí địa chỉ</th>
                    <th className="py-3 px-5">Diện tích &amp; Lầu</th>
                    <th className="py-3 px-5">Mức Giá</th>
                    <th className="py-3 px-5">Pháp lý</th>
                    <th className="py-3 px-5">Số lượt xem</th>
                    <th className="py-3 px-5 text-right">Công cụ thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-xs text-slate-400 italic">Không tìm thấy bài viết bất động sản thích hợp...</td></tr>
                  ) : (
                    filteredProperties.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-xs text-slate-700 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-[280px]" title={p.tieu_de}>{p.tieu_de}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {p.id} · {p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : "Hệ thống"}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-slate-800">Đường {p.duongpho}</span>
                          <div className="text-[10px] text-slate-500 font-medium">P. {p.phuongxa}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-800">{p.area} m² · {p.sotang} tầng</div>
                          <div className="text-[10px] text-slate-500">{p.bedroom} PN · {p.nhavesinh} WC · Hướng {p.direction}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-black text-amber-600 italic">{p.price} TỶ</div>
                          {p.oldPrice && p.price !== p.oldPrice && <div className="text-[9px] text-slate-400 line-through">Cũ: {p.oldPrice} tỷ</div>}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-800 text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded">{p.phaply || "Sổ hồng riêng"}</span>
                        </td>
                        <td className="py-3.5 px-5 font-bold font-mono text-slate-600">{p.views || 0} lượt</td>
                        <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                          {adminMode ? (
                            <>
                              <button onClick={() => onEditProperty(p.id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors inline-flex items-center gap-1 font-bold text-[10px] cursor-pointer">
                                <Edit className="w-3.5 h-3.5 text-slate-500" /> Sửa
                              </button>
                              <button onClick={() => { if (window.confirm(`Xóa vĩnh viễn: "${p.tieu_de}"?`)) onDeleteProperty(p.id); }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors inline-flex items-center gap-1 font-bold text-[10px] cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Xóa
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-bold inline-flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Cần Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
