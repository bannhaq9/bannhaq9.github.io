/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Phone, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Header() {
  return (
    <div className="relative bg-slate-950 text-white rounded-t-none rounded-b-[2rem] md:rounded-b-[3.5rem] overflow-hidden shadow-2xl mr-0 ml-0 mt-16 id-header-el">
      {/* Visual background image with high opacity blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center brightness-[0.25] saturate-[0.8] scale-105"
        style={{ 
          backgroundImage: `url('https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` 
        }}
      />

      {/* Radiant vector light overlay */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent z-1"></div>

      {/* Central hero content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center space-y-6 max-w-4xl animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-primary text-[10px] font-black tracking-widest uppercase backdrop-blur-md border border-white/10">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" /> THANH TRÀ BĐS - LIVE DATA FEED
        </div>

        <h1 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-amber-200 to-white tracking-widest uppercase italic">
          UY TÍN - TẬN TÂM - CHUYÊN NGHIỆP
        </h1>

        <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto font-medium">
          Chuyên viên tư vấn &amp; môi giới bất động sản nhà phố hàng đầu tại khu vực TP. Thủ Đức (Quận 2, Quận 9, Thủ Đức). Pháp lý chuẩn chỉ, thông tin chính xác 100%.
        </p>

        {/* Dynamic call to action row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="tel:0854100036"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-amber-400 text-slate-900 text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-brand-primary/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Phone className="w-4 h-4" />
            <span>Hotline: 0854.100.036</span>
          </a>

          <a
            href="https://zalo.me/0854100036"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="w-2.5 h-2.5 bg-brand-green border border-white rounded-full animate-ping"></span>
            <span>Kết nối qua Zalo</span>
          </a>
        </div>

        {/* Core value bullet point ribbon */}
        <div className="pt-8 grid grid-cols-3 gap-3 md:gap-6 border-t border-white/5 max-w-3xl mx-auto text-center">
          <div className="space-y-1">
            <span className="p-2 bg-white/5 rounded-lg inline-flex text-orange-400"><ShieldCheck className="w-5 h-5 mx-auto" /></span>
            <span className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Pháp lý minh bạch</span>
          </div>
          <div className="space-y-1">
            <span className="p-2 bg-white/5 rounded-lg inline-flex text-red-400"><Sparkles className="w-5 h-5 mx-auto" stroke="currentColor" /></span>
            <span className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Đúng thông số</span>
          </div>
          <div className="space-y-1">
            <span className="p-2 bg-white/5 rounded-lg inline-flex text-yellow-400"><HeartHandshake className="w-5 h-5 mx-auto" /></span>
            <span className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Chăm sóc chu đáo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
