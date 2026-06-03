/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  sonha?: string;
  duongpho: string;
  phuongxa: string;
  tinhthanh: string;
  area: number; // m2
  price: number; // Tỷ
  sotang: string; // "1", "2", "3", "4", "5", "6+"
  bedroom: string;
  nhavesinh: string;
  direction: string; // "Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Tây Nam", "Đông Bắc", "Tây Bắc"
  tieu_de: string;
  mo_ta: string;
  images: string[];
  views: number;
  created_at: string;
  phaply: string;
  oldPrice?: number;
  priceChangedAt?: string;
}

export interface CustomerLead {
  id: string;
  name: string;
  phone: string;
  note?: string;
  propertyTitle?: string;
  propertyId?: string;
  source: "chatbot" | "contact_form" | "share_click";
  created_at: string;
  status: "new" | "contacted" | "interested" | "closed";
}

export interface SystemStats {
  views: number;
  fbShares: number;
  zaloShares: number;
  linkCopies: number;
  totalLeads: number;
}

export interface ActivityLog {
  id: string;
  type: "view" | "share_fb" | "share_zalo" | "copy_link" | "new_lead" | "create_property" | "edit_property" | "delete_property";
  detail: string;
  timestamp: string;
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "prod_1",
    sonha: "45",
    duongpho: "Nguyễn Duy Trinh",
    phuongxa: "Long Trường",
    tinhthanh: "TP. Thủ Đức, TP.HCM",
    area: 72,
    price: 4.8,
    sotang: "3",
    bedroom: "4",
    nhavesinh: "4",
    direction: "Đông Nam",
    tieu_de: "BÁN NHÀ PHỐ ĐẸP LÒNG ĐƯỜNG Ô TÔ NGUYỄY DUY TRINH, P. LONG TRƯỜNG - SỔ SẴN SÀNG",
    mo_ta: "📍 PHẦN 1: THÔNG SỐ & GIÁ BÁN\n- Vị trí: Đường Nguyễn Duy Trinh, Phường Long Trường, TP. Thủ Đức (Quận 9 cũ).\n- Diện tích: 72m² (Ngang 4.5m x Dài 16m), Kết cấu 3 tầng bê tông cốt thép kiên cố, 4 phòng ngủ rộng khép kín, đường ô tô tránh nhau thoải mái, xe hơi ngủ trong nhà.\n- Giá bán: Chỉ 4.8 Tỷ (Chủ nhà thiện chí bớt lộc).\n\n📍 PHẦN 2: TIỆN ÍCH & VỊ TRÍ CHI TIẾT\n- Tiện ích: Khoảng sân rộng xe hơi ra vào tự do, không gian sống trong lành, yên tĩnh và an ninh.\n- Giao thông kết nối trực tiếp các trục giao thông chính: Ngã ba Nguyễn Duy Trinh - Lã Xuân Oai, cách đường Vành Đai 3 chỉ 2 phút di chuyển, kết nối khu Công Nghệ Cao cực tiện lợi.\n- Địa hình cao, quy hoạch chuẩn chỉnh, cam kết KHÔNG BỊ NGẬP LỤT kể cả mưa lớn dông bão.\n\n📍 PHẦN 3: PHÁP LÝ & LIÊN HỆ\n- Pháp lý: Sổ hồng riêng chính chủ, hoàn công đầy đủ, hỗ trợ vay ngân hàng đến 70% lãi suất ưu đãi.\n- Kính mời Quý khách hàng quan tâm đến tài sản này vui lòng liên hệ sớm để nhận toàn bộ thông tin chi tiết và hẹn lịch xem nhà thực tế.",
    images: [
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/206172/pexels-photo-206172.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    views: 425,
    created_at: "2026-05-28T08:30:00Z",
    phaply: "Sổ hồng riêng"
  },
  {
    id: "prod_2",
    sonha: "12A",
    duongpho: "Lò Lu",
    phuongxa: "Trường Thạnh",
    tinhthanh: "TP. Thủ Đức, TP.HCM",
    area: 90,
    price: 6.2,
    sotang: "4",
    bedroom: "5",
    nhavesinh: "5",
    direction: "Đông Bắc",
    tieu_de: "SIÊU PHẨM BIỆT THỰ PHỐ ĐƯỜNG LÒ LU, TRƯỜNG THẠNH - SÂN VƯỜN RỘNG RÃI",
    mo_ta: "📍 PHẦN 1: THÔNG SỐ & GIÁ BÁN\n- Vị trí: Mặt hẻm lớn Lò Lu, Phường Trường Thạnh, sát vách Tòa án nhân dân Quận 9.\n- Diện tích: 90m² (5m x 18m). Kết cấu 4 tầng hoành tráng phong cách bán cổ điển mới, 5 Phòng ngủ rộng, 5 WC nhập khẩu.\n- Giá mới ưu đãi cực tốt: Chỉ 6.2 Tỷ đồng.\n\n📍 PHẦN 2: TIỆN ÍCH & VỊ TRÍ CHI TIẾT\n- Sân vườn xinh xắn đậu ô tô 7 chỗ vô tư, thiết kế thông gió trời ngập tràn ánh sáng tự nhiên.\n- Giao thông kết nối thuận tiện tới khu đô thị Vinhomes Grand Park, chợ Trường Thạnh, trường học liên cấp.\n- Khu dân cư kiểu mẫu cao ráo tuyệt đối, không lo ngập nước.\n\n📍 PHẦN 3: PHÁP LÝ\n- Sổ hồng vuông vức chuẩn chỉ, mua bán nhanh sang tên trong ngày.\n- Quý khách có nhu cầu xem nhà miễn phí xin liên hệ hotline ngay hôm nay.",
    images: [
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    views: 312,
    created_at: "2026-05-30T10:15:00Z",
    phaply: "Sổ hồng riêng"
  },
  {
    id: "prod_3",
    sonha: "88",
    duongpho: "Hoàng Hữu Nam",
    phuongxa: "Long Thạnh Mỹ",
    tinhthanh: "TP. Thủ Đức, TP.HCM",
    area: 60,
    price: 3.9,
    sotang: "2",
    bedroom: "3",
    nhavesinh: "3",
    direction: "Tây Nam",
    tieu_de: "GẤP BÁN NHÀ 2 TẦNG CHỦ GIẢM SÂU ĐƯỜNG HOÀNG HỮU NAM, LONG THẠNH MỸ",
    mo_ta: "📍 PHẦN 1: THÔNG SỐ & GIÁ BÁN\n- Vị trí: Gần đường Hoàng Hữu Nam, Phường Long Thạnh Mỹ, TP. Thủ Đức.\n- Diện tích: 60m², Mặt tiền 4m dài 15m vuông đẹp. Kết cấu 1 trệt 1 lầu, 3 phòng ngủ tiện ích đủ cho gia đình trẻ sinh sống.\n- Giá ngộp thở: Chỉ 3.9 Tỷ đồng (Giá tốt nhất phân khúc).\n\n📍 PHẦN 2: TIỆN ÍCH & VỊ TRÍ CHI TIẾT\n- Xe hơi chạy tận cổng, hẻm an ninh, sạch sẽ văn minh.\n- Sát bên Bệnh viện Ung Bướu cơ sở 2, bến xe Miền Đông mới và ga Metro cuối cực kỳ có tiềm năng tăng giá.\n- Mặt bằng cao ráo thông thoáng, không khí mát mẻ sạch sẽ.\n\n📍 PHẦF 3: PHÁP LÝ\n- Giấy tờ pháp lý hoàn chỉnh, sổ hồng trao tay.\n- Hãy nhanh chân liên hệ để xem nhà trước khi chủ bán mất.",
    images: [
      "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    views: 189,
    created_at: "2026-06-01T14:20:00Z",
    phaply: "Sổ hồng riêng"
  },
  {
    id: "prod_4",
    sonha: "201",
    duongpho: "Liên Phường",
    phuongxa: "Phú Hữu",
    tinhthanh: "TP. Thủ Đức, TP.HCM",
    area: 120,
    price: 9.5,
    sotang: "4",
    bedroom: "6",
    nhavesinh: "6",
    direction: "Nam",
    tieu_de: "BIỆT THỰ PHỐ ĐẲNG CẤP ĐƯỜNG LIÊN PHƯỜNG, PHÚ HỮU, KHU TRÍ THỨC CAO",
    mo_ta: "📍 PHẦN 1: THÔNG SỐ & GIÁ BÁN\n- Vị trí: Khu dân cư cao cấp mặt tiền đường Liên Phường, Phường Phú Hữu, TP. Thủ Đức.\n- Diện tích: 120m² (6m x 20m). Thiết kế 4 tầng sang trọng phong cách hiện đại với 6 PN rộng thoáng, nội thất cao cấp hoàn thiện.\n- Giá cực tốt: 9.5 Tỷ đồng.\n\n📍 PHẦN 2: TIỆN ÍCH & VỊ TRÍ CHI TIẾT\n- Gần trực tiếp lối lên cao tốc Long Thành - Dầu Giây. Sân rộng đậu 2 ô tô thoải mái, bể cá Koi cực thư thái.\n- Tiện ích dự án đồng bộ: Hồ bơi tràn bờ, GYM, công viên ven sông, siêu thị mini.\n- Quy hoạch thông thoáng hoàn hảo, hạ tầng nước ngầm, không ngập lụt.\n\n📍 PHẦN 3: PHÁP LÝ\n- Sổ hồng hoàn công đầy đủ, giao dịch an toàn.\n- Liên hệ để book lịch xem nhà 24/7.",
    images: [
      "https://images.pexels.com/photos/277667/pexels-photo-277667.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    views: 540,
    created_at: "2026-05-25T03:45:00Z",
    phaply: "Sổ hồng riêng"
  }
];
