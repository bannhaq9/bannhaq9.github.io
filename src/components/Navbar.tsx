/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Home, Shield, BarChart3, PlusCircle, LogIn, LogOut, Check, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "dashboard" | "post";
  setActiveTab: (tab: "home" | "dashboard" | "post") => void;
  adminMode: boolean;
  onToggleAdmin: (enabled: boolean, pass?: string) => void;
}

export default function Navbar({ activeTab, setActiveTab, adminMode, onToggleAdmin }: NavbarProps) {
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminClick = () => {
    if (adminMode) {
      onToggleAdmin(false);
      if (activeTab === "post") setActiveTab("home");
    } else {
      setShowPassModal(true);
      setErrorMsg("");
      setPassInput("");
    }
  };

  const handleVerifyPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === "131996" || passInput.toLowerCase() === "admin") {
      onToggleAdmin(true, passInput);
      setShowPassModal(false);
    } else {
      setErrorMsg("Mật khẩu quản trị không chính xác!");
    }
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16 z-40 flex items-center shadow-sm id-navbar-el">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Brand Logo - Bold Typography Theme */}
          <div 
            onClick={() => setActiveTab("home")} 
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-slate-900 font-black tracking-tighter shadow-sm">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black tracking-tighter text-slate-900 uppercase leading-none">
                THANHTRA<span className="text-brand-primary">BDS</span>.VN
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5 leading-none">
                NHÀ PHỐ THỦ ĐỨC
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "home" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Sản Phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "dashboard" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Báo Cáo</span>
            </button>

            {adminMode && (
              <button
                onClick={() => setActiveTab("post")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black tracking-tighter transition-all text-slate-900 bg-brand-primary hover:bg-amber-400 shadow-sm uppercase`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Đăng Tin</span>
              </button>
            )}

            {/* Admin trigger button with lock indicator */}
            <button
              onClick={handleAdminClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminMode 
                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{adminMode ? "Admin ON" : "Quản Trị"}</span>
              <span className="sm:hidden">{adminMode ? "ON" : "Admin"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Verification Modal popover */}
      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-primary" /> Đăng nhập quyền Quản trị
              </h4>
              <button 
                onClick={() => setShowPassModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold h-7 w-7 hover:bg-slate-100 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleVerifyPass} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Mật khẩu Admin (mặc định: 131996)
                </label>
                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full text-xs font-medium px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all"
                  required
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-[10px] text-brand-primary font-semibold mt-1">
                    ⚠️ {errorMsg}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-slate-900 text-xs font-black uppercase tracking-tighter rounded-lg hover:bg-amber-400 transition-colors shadow-md shadow-brand-primary/10"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
