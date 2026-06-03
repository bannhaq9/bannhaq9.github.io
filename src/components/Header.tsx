/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Phone, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Header() {
  return (
    <div className="relative bg-slate-950 text-white rounded-b-2xl md:rounded-b-[2.5rem] overflow-hidden shadow-xl mt-14 id-header-el">
      {/* Visual background image with high opacity blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center brightness-[0.2] saturate-[0.8]"
        style={{ 
          backgroundImage: `url('https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` 
        }}
      />

      {/* Radiant vector light overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent z-1"></div>

      {/* Central hero content - Elegant, compact & extremely focused */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-10 text-center space-y-3.5 max-w-3xl animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-400 text-[9px] font-black tracking-widest uppercase backdrop-blur-md border border-white/5">
          <Sparkles className="w-3 h-3 animate-pulse" /> THANH TRÀ BĐS · THÔNG TIN CHÍNH XÁC 100%
        </div>

        <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-amber-200 to-white tracking-wider uppercase italic leading-tight">
          UY TÍN - TẬN TÂM - CHUYÊN NGHIỆP
        </h1>

        <p className="text-slate-300 text-[11px] md:text-xs max-w-xl mx-auto font-medium leading-relaxed">
          Chuyên viên tư vấn &amp; môi giới nhà phố chính chủ tại TP. Thủ Đức. Cam kết pháp lý minh bạch, thông số thật, giá trị tối ưu cho quý khách hàng.
        </p>

        {/* Dynamic call to action row (Compact, clean inline buttons) */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <a
            href="tel:0854100036"
            className="px-4.5 py-1.5 rounded-lg bg-brand-primary hover:bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotline: 0854.100.036</span>
          </a>

          <a
            href="https://zalo.me/0854100036"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span>Nhắn tin Zalo</span>
          </a>
        </div>

        {/* Compact, clean horizontal row of icons */}
        <div className="pt-3.5 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 border-t border-white/5 max-w-xl mx-auto text-center select-none text-[9px] md:text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Pháp lý minh bạch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Đúng thông số</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>Chăm sóc chu đáo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
