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
  area: number;
  price: number;
  sotang: string;
  bedroom: string;
  nhavesinh: string;
  direction: string;
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

// Không còn INITIAL_PROPERTIES với ảnh placeholder — tất cả tin đăng phải có ảnh thật
export const INITIAL_PROPERTIES: Property[] = [];
