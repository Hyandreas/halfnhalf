export interface User {
  id: string;
  auth_id: string;
  email: string;
  plan: "free" | "pro";
  role: "user" | "admin";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExportRecord {
  id: string;
  user_id: string;
  exported_at: string;
  clip_top_name: string | null;
  clip_bottom_name: string | null;
}

export interface ExportToken {
  id: string;
  user_id: string;
  token_hash: string;
  issued_at: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
}
