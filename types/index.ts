export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";
export type OrderStatus = "pending" | "dispatched" | "completed" | "cancelled";

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  role: UserRole;
  status: UserStatus;
  xp: number;
  total_kg: number;
  total_cash: number;
  created_at: string;
}

export interface Pickup {
  id: number;
  user_id: string;
  user_name: string;
  user_city: string | null;
  type: string;
  kg: number;
  cash: number;
  xp: number;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: string;
  user_name: string;
  user_city: string | null;
  trash_types: string[];
  address: string | null;
  notes: string | null;
  status: OrderStatus;
  weight_kg: number | null;
  cash_paid: number | null;
  xp_awarded: number | null;
  scheduled_date: string | null;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  description: string | null;
  category: string;
  emoji: string;
  city: string | null;
  portal_slug: string;
  active: boolean;
  created_at: string;
  items?: PartnerItem[];
}

export interface PartnerItem {
  id: string;
  partner_id: string;
  name: string;
  description: string | null;
  price_pkr: number;
  expiry_days: number;
  active: boolean;
  created_at: string;
}

export interface ScrapRate {
  slug: string;
  name: string;
  emoji: string;
  rate_pkr: number;
  hot: boolean;
}

export interface Coupon {
  id: string;
  user_id: string;
  partner_id: string;
  item_id: string;
  code: string;
  status: "active" | "used" | "expired";
  expires_at: string;
  used_at: string | null;
  notes: string | null;
  created_at: string;
  partner?: Partner;
  item?: PartnerItem;
}