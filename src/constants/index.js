// --- Supabase Config ---
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const appPassword = import.meta.env.VITE_APP_PASSWORD || '';

// --- Vardast Settings ---
export const VARDAST_API_KEY = import.meta.env.VITE_VARDAST_API_KEY || "";
export const VARDAST_CHANNEL_ID = "a5211d3f-f59a-4a0e-b604-dabef603810c"; 
export const VARDAST_BASE_URL = "https://apigw.vardast.chat/uaa/public";

// Whitelisted users
export const ALLOWED_USERS = ['milad', 'aliH', 'amirreza', 'mahta', 'sajad', 'yara', 'hamid', 'mojtaba', 'farhad'];

export const INITIAL_FORM_DATA = {
  username: '', phone_number: '', instagram_username: '', telegram_id: '', website: '', bio: '', 
  subscription_status: '', desc_text: '', module: '', type: '', status: '', support: '', resolved_at: '',
  technical_note: '', cause: '', first_frozen_at: '', freeze_count: '',
  last_frozen_at: '', resolve_status: '', note: '', title: '', category: '',
  repeat_count: '', importance: '', internal_note: '', reason: '', duration: '',
  action: '', suggestion: '', can_return: '', sales_source: '', ops_note: '', flag: '', date: '',
  technical_review: false,
  // Onboarding specific
  has_website: false, progress: 0, initial_call_status: '', conversation_summary: '', call_date: '', meeting_date: '', meeting_note: '', followup_date: '', followup_note: '',
  // Meetings specific
  meeting_time: '', result: '', held: false
};
