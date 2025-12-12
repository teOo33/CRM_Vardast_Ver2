import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, differenceInHours, parseISO } from 'date-fns';
import jalaali from 'jalaali-js';

import {
  LayoutDashboard,
  AlertTriangle,
  Snowflake,
  Lightbulb,
  CreditCard,
  Plus,
  X,
  Menu,
  User,
  Sparkles,
  Loader2,
  Download,
  Phone,
  Instagram,
  Search,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Globe,
  Send,
  Edit,
  History,
  UserPlus,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
  GraduationCap,
  List,
  Columns,
  Clock,
  UserCheck
} from 'lucide-react';

import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  YAxis,
  ZAxis,
  CartesianGrid
} from 'recharts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const appPassword = import.meta.env.VITE_APP_PASSWORD || '';

// ------ Vardast AI config (همه هاردکد مطابق خواسته‌ی شما) ------
const VARDAST_BASE_URL = 'https://apigw.vardast.chat/uaa/public';
const VARDAST_API_KEY = 'DVmo0Hi2NHQE3kLx-Q7V3NWZBophr_kKDlTXrj7bdtQ'; // X-API-Key
const VARDAST_CONTACT_ID = 'a5211d3f-f59a-4a0e-b604-dabef603810c';       // contact_id
const VARDAST_CHANNEL_NAME = 'Dashboard AI';                              // اسم کانال در وردست
const VARDAST_CHANNEL_ID = ''; // اگر channel_id دقیق رو داشتی، اینجا بذار و دیگه نیازی به اسم نیست

let vardastChannelId = null;

const INITIAL_FORM_DATA = {
  username: '', phone_number: '', instagram_username: '', telegram_id: '', website: '', bio: '', 
  subscription_status: '', desc_text: '', module: '', type: '', status: '', support: '', resolved_at: '',
  technical_note: '', cause: '', first_frozen_at: '', freeze_count: '',
  last_frozen_at: '', resolve_status: '', note: '', title: '', category: '',
  repeat_count: '', importance: '', internal_note: '', reason: '', duration: '',
  action: '', suggestion: '', can_return: '', sales_source: '', ops_note: '', flag: '', date: '',
  // Onboarding specific
  has_website: false, progress: 0, initial_call_status: '', conversation_summary: '', call_date: '', meeting_date: '', meeting_note: '', followup_date: '', followup_note: ''
};

const useTailwind = () => {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
      
      const style = document.createElement('style');
      style.innerHTML = `
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-pulse-red { animation: pulse-red 2s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `;
      document.head.appendChild(style);
    }
  }, []);
};

let supabase;
try {
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.error('Supabase init error:', e);
}

// --- Helpers ---
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  if (dateStr.includes('T')) {
    try {
      return new Date(dateStr).toLocaleDateString('fa-IR');
    } catch {
      return dateStr;
    }
  }
  return dateStr;
};

const checkSLA = (item) => {
  if (!item.created_at || !item.created_at.includes('T')) return false;
  if (item.flag !== 'پیگیری فوری') return false;
  const openStatuses = ['باز', 'بررسی نشده'];
  if (!openStatuses.includes(item.status)) return false;

  const created = new Date(item.created_at);
  const diff = differenceInHours(new Date(), created);
  return diff >= 2;
};

const parsePersianDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      try {
        const g = jalaali.toGregorian(y, m, d);
        return new Date(g.gy, g.gm - 1, g.gd);
      } catch (e) { return null; }
    }
  }
  return null;
};

// --------- گرفتن channel_id از وردست (یا استفاده از مقدار هاردکد) ----------
const ensureVardastChannelId = async () => {
  if (vardastChannelId) return vardastChannelId;

  // اگر مستقیم channel_id رو گذاشتی، همونو استفاده کن
  if (VARDAST_CHANNEL_ID) {
    vardastChannelId = VARDAST_CHANNEL_ID;
    return vardastChannelId;
  }

  if (!VARDAST_API_KEY) {
    alert('X-API-Key وردست تنظیم نشده است.');
    return null;
  }

  try {
    const res = await fetch(`${VARDAST_BASE_URL}/messenger/api/channel/`, {
      method: 'GET',
      headers: {
        'X-API-Key': VARDAST_API_KEY,
      },
    });

    const data = await res.json();
    const items = data.items || data;

    if (!Array.isArray(items)) {
      console.error('Unexpected channel list format from Vardast:', data);
      alert('فرمت لیست کانال‌های وردست نامعتبر است.');
      return null;
    }

    console.log(
      'Vardast channels:',
      items.map((c) => ({ id: c.id, name: c.name, platform: c.platform }))
    );

    const chByName = items.find((c) => c.name === VARDAST_CHANNEL_NAME);

    if (chByName) {
      vardastChannelId = chByName.id;
      return vardastChannelId;
    }

    if (items.length === 1) {
      vardastChannelId = items[0].id;
      alert(`هیچ کانالی به نام "${VARDAST_CHANNEL_NAME}" پیدا نشد، ولی چون فقط یک کانال وجود داشت از "${items[0].name}" استفاده شد.`);
      return vardastChannelId;
    }

    alert(
      `کانالی با نام "${VARDAST_CHANNEL_NAME}" در وردست پیدا نشد.\n` +
      'لیست کانال‌ها را در Console ببین و channel_id صحیح را در VARDAST_CHANNEL_ID قرار بده.'
    );
    return null;
  } catch (error) {
    console.error('Error fetching Vardast channels:', error);
    alert('خطا در گرفتن لیست کانال‌های وردست.');
    return null;
  }
};

// --------- جایگزین Gemini: همین تابع در بقیه‌ی کد استفاده می‌شود ----------
const callGeminiAI = async (prompt, isJson = false) => {
  if (!VARDAST_API_KEY || !VARDAST_CONTACT_ID) {
    alert('تنظیمات وردست (API Key یا contact_id) موجود نیست.');
    return null;
  }

  const channelId = await ensureVardastChannelId();
  if (!channelId) return null;

  const finalPrompt = isJson
    ? `فقط یک JSON معتبر بدون هیچ متن اضافی برگردان.\n\n${prompt}`
    : prompt;

  try {
    const response = await fetch(
      `${VARDAST_BASE_URL}/messenger/api/chat/public/process`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': VARDAST_API_KEY,
        },
        body: JSON.stringify({
          message: finalPrompt,
          channel_id: channelId,
          contact_id: VARDAST_CONTACT_ID,
          assistant_id: null,
        }),
      }
    );

    const data = await response.json();

    if (data.status !== 'success') {
      console.error('Vardast AI error response:', data);
      alert(data.error || 'خطا در پاسخ وردست.');
      return null;
    }

    return data.response; // رشته‌ی متنی خروجی مدل
  } catch (error) {
    console.error('Vardast AI Error:', error);
    alert('خطا در اتصال به وردست.');
    return null;
  }
};

const downloadCSV = (data, fileName) => {
  if (!data || !data.length) return alert('داده‌ای وجود ندارد.');
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((f) => `"${(row[f] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};

const UserAvatar = ({ name, size = 'md' }) => {
  const safeName = name || '?';
  const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-emerald-400]()
