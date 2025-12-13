import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, differenceInHours, differenceInDays, parseISO, subDays, subYears, isAfter, isBefore, startOfDay, endOfDay, isValid } from 'date-fns';
import jalaali from 'jalaali-js';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

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
  UserCheck,
  Calendar,
  Filter,
  Maximize2,
  Bell,
  Mic,
  MicOff,
  CheckSquare,
  Wrench,
  Users,
  Moon,
  Sun,
  LogOut // آیکون خروج اضافه شد
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

// --- تنظیمات وردست (Vardast) ---
const VARDAST_API_KEY = "DVmo0Hi2NHQE3kLx-Q7V3NWZBophr_kKDlTXrj7bdtQ";
const VARDAST_CHANNEL_ID = "a5211d3f-f59a-4a0e-b604-dabef603810c"; 
const VARDAST_BASE_URL = "https://apigw.vardast.chat/uaa/public";

// لیست سفید کاربران
const ALLOWED_USERS = ['milad', 'aliH', 'amirreza', 'mahta', 'sajad', 'yara', 'hamid', 'mojtaba', 'farhad'];

// متغیرهای کش
let cachedContactId = null;

const INITIAL_FORM_DATA = {
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

const useTailwind = () => {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        window.tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                slate: { 750: '#2d3748', 850: '#1a202c', 950: '#0f172a' } // Custom dark shades
              }
            }
          }
        };
      };
      document.head.appendChild(script);
      
      const style = document.createElement('style');
      style.innerHTML = `
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .animate-blob { animation: blob 7s infinite; }
        .animate-pulse-red { animation: pulse-red 2s infinite; }
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

// --- Helpers Safe Functions ---
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    if (dateStr instanceof Date) return dateStr.toLocaleDateString('fa-IR');
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const d = new Date(dateStr);
      return isValid(d) ? d.toLocaleDateString('fa-IR') : dateStr;
    }
    return String(dateStr);
  } catch (e) {
    return String(dateStr);
  }
};

const checkSLA = (item) => {
  if (!item?.created_at || typeof item.created_at !== 'string' || !item.created_at.includes('T')) return false; 
  if (item.flag !== 'پیگیری فوری') return false;
  const openStatuses = ['باز', 'بررسی نشده'];
  if (!openStatuses.includes(item.status)) return false;
  try {
    const created = new Date(item.created_at);
    if (!isValid(created)) return false;
    const diff = differenceInHours(new Date(), created);
    return diff >= 2;
  } catch { return false; }
};

const parsePersianDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string' && dateStr.includes('T')) return new Date(dateStr);
  
  try {
    const normalized = String(dateStr).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    const parts = normalized.split('/');
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const g = jalaali.toGregorian(y, m, d);
            return new Date(g.gy, g.gm - 1, g.gd);
        }
    }
  } catch (e) { console.error("Date parse error", e); }
  return null;
};

const normalizeDate = (item) => {
    const dateField = item.created_at || item.frozen_at || item.requested_at || item.date;
    if (!dateField) return null;
    if (dateField instanceof Date) return dateField;
    return parsePersianDate(dateField);
};

const filterDataByTime = (data, range, customRange) => {
    if (!data) return [];
    if (!range && !customRange) return data;
    
    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (customRange && customRange.length === 2) {
        startDate = customRange[0].toDate();
        endDate = customRange[1].toDate();
        endDate.setHours(23, 59, 59, 999);
    } else {
        switch (range) {
            case '1d': startDate = subDays(now, 1); break;
            case '7d': startDate = subDays(now, 7); break;
            case '30d': startDate = subDays(now, 30); break;
            case '1y': startDate = subYears(now, 1); break;
            default: return data;
        }
    }

    return data.filter(item => {
        const date = normalizeDate(item);
        if (!date || !isValid(date)) return false;
        return isAfter(date, startDate) && isBefore(date, endDate);
    });
};

// --- Vardast Logic (Direct) ---
const getDashboardContactId = () => {
  let savedId = localStorage.getItem('vardast_dashboard_contact_id');
  if (!savedId) {
    savedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('vardast_dashboard_contact_id', savedId);
  }
  return savedId;
};

const callVardastAI = async (prompt, isJson = false) => {
  if (!VARDAST_API_KEY) return alert('کلید API وردست وارد نشده است.');
  
  try {
    if (!cachedContactId) {
      cachedContactId = getDashboardContactId();
    }

    const response = await fetch(`${VARDAST_BASE_URL}/messenger/api/chat/public/process`, {
      method: 'POST',
      headers: { 
        'X-API-Key': VARDAST_API_KEY, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        message: prompt,
        channel_id: VARDAST_CHANNEL_ID,
        contact_id: cachedContactId
      }),
    });

    if (response.status === 422) {
       console.error("Vardast 422 Error.");
       return "خطای ۴۲۲: داده نامعتبر.";
    }

    const data = await response.json();

    if (data.status === 'success' && data.response) {
      let resultText = data.response;
      if (isJson) {
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      return resultText;
    } else {
      console.error('Vardast Error:', data);
      return `خطا: ${data.error || 'Unknown error'}`;
    }

  } catch (error) {
    console.error('Vardast Connection Error:', error);
    return "خطای ارتباط با سرور.";
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
  const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600'];
  const colorIndex = safeName.length % colors.length;
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white flex-shrink-0`}>
      {safeName.charAt(0)}
    </div>
  );
};

// ... Components: UserSearchInput, VoiceRecorder, FlagFilter, TimeFilter, HistoryLogModal, ChartModal, KanbanBoard ...
const UserSearchInput = ({ value, onChange, onSelect, usersData = [] }) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => { setTerm(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!term) return [];
    const lower = term.toLowerCase();
    return (usersData || []).filter(u => 
      (u.username && u.username.toLowerCase().includes(lower)) ||
      (u.phone_number && u.phone_number.includes(lower)) ||
      (u.instagram_username && u.instagram_username.toLowerCase().includes(lower)) ||
      (u.telegram_id && u.telegram_id.toLowerCase().includes(lower)) ||
      (u.website && u.website.toLowerCase().includes(lower))
    ).slice(0, 5); 
  }, [term, usersData]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input 
          value={term}
          onChange={(e) => { setTerm(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="جستجوی نام کاربری، اینستاگرام، شماره یا تلگرام..."
          className="w-full border p-3 pl-10 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-xl mt-1 border z-50 overflow-hidden dark:bg-slate-800 dark:border-slate-600">
          {filtered.map((u) => (
            <div 
              key={u.username} 
              className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700 last:border-0 text-sm flex items-center gap-3"
              onClick={() => {
                onChange(u.username);
                if (onSelect) onSelect(u);
                setOpen(false);
              }}
            >
              <UserAvatar name={u.username} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-700 dark:text-gray-200">{u.username}</span>
                <div className="flex gap-2 text-[10px] text-gray-400">
                  {u.instagram_username && <span>IG: {u.instagram_username}</span>}
                  {u.phone_number && <span>PH: {u.phone_number}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('مرورگر شما از قابلیت تبدیل صدا به متن پشتیبانی نمی‌کند.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => { console.error('Speech error', event.error); setIsRecording(false); };
    recognition.onresult = (event) => { onTranscript(event.results[0][0].transcript); };
    recognition.start();
  };
  return (
    <button type="button" onClick={startRecording} className={`p-2 rounded-full transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="تبدیل گفتار به متن">
      {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
};

const FlagFilter = ({ selectedFlags, onChange }) => {
  const toggleFlag = (flag) => {
    if (selectedFlags.includes(flag)) onChange(selectedFlags.filter(f => f !== flag));
    else onChange([...selectedFlags, flag]);
  };
  return (
    <div className="flex gap-2 items-center text-xs">
      <span className="text-gray-400 font-medium">فیلتر:</span>
      <button onClick={() => toggleFlag('پیگیری فوری')} className={`px-2 py-1 rounded-lg border transition ${selectedFlags.includes('پیگیری فوری') ? 'bg-red-100 border-red-200 text-red-700 font-bold' : 'bg-white text-gray-500'}`}>فوری</button>
      <button onClick={() => toggleFlag('پیگیری مهم')} className={`px-2 py-1 rounded-lg border transition ${selectedFlags.includes('پیگیری مهم') ? 'bg-amber-100 border-amber-200 text-amber-700 font-bold' : 'bg-white text-gray-500'}`}>مهم</button>
      <button onClick={() => toggleFlag('technical_review')} className={`px-2 py-1 rounded-lg border transition ${selectedFlags.includes('technical_review') ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-bold' : 'bg-white text-gray-500'}`}>بررسی فنی</button>
    </div>
  );
};

const TimeFilter = ({ value, onChange, customRange, onCustomChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 shadow-sm">
            {['1d', '7d', '30d', '1y'].map((range) => (
                <button key={range} onClick={() => { onChange(range); onCustomChange(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${value === range ? 'bg-blue-100 text-blue-700' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    {range === '1d' ? '۲۴ ساعت' : range === '7d' ? '۷ روز' : range === '30d' ? '۳۰ روز' : 'یک سال'}
                </button>
            ))}
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <DatePicker
                value={customRange}
                onChange={(date) => { onCustomChange(date); onChange('custom'); }}
                range
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-left"
                render={(value, openCalendar) => (
                    <button onClick={openCalendar} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${value ? 'bg-blue-100 text-blue-700' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                        <Calendar size={14}/>
                        {value ? value.toString() : 'تاریخ دلخواه'}
                    </button>
                )}
            />
            {value && <button onClick={() => { onChange(null); onCustomChange(null); }} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"><X size={14}/></button>}
        </div>
    );
};

const HistoryLogModal = ({ isOpen, onClose, history }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                    <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2"><History size={18}/> تاریخچه تغییرات</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-red-500"/></button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {(!history || history.length === 0) ? (
                        <p className="text-center text-gray-400 text-sm py-4">تغییری ثبت نشده است.</p>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="flex gap-3 text-sm border-b dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                                <UserAvatar name={h.user} size="sm"/>
                                <div>
                                    <div className="font-bold text-gray-700 dark:text-gray-200">{h.user}</div>
                                    <div className="text-xs text-gray-400">{formatDate(h.date)} - {new Date(h.date).toLocaleTimeString('fa-IR')}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{h.action === 'edit' ? 'ویرایش اطلاعات' : 'ایجاد رکورد'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
    );
};

const ChartModal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full h-full max-w-5xl max-h-[80vh] rounded-3xl p-6 flex flex-col relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400"><X size={24}/></button>
                </div>
                <div className="flex-1 w-full h-full min-h-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

const KanbanBoard = ({ items, onStatusChange, columns, navigateToProfile, openModal, type }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    if (result.source.droppableId !== destination.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };
  const getItemsByStatus = (status) => items.filter(i => i.status === status);
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {Object.entries(columns).map(([statusId, statusLabel]) => (
          <Droppable key={statusId} droppableId={statusId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 min-w-[280px] w-80 flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{statusLabel}</h3>
                  <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg text-xs font-mono text-gray-500 dark:text-gray-300 border dark:border-slate-600">{getItemsByStatus(statusId).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {getItemsByStatus(statusId).map((item, index) => {
                    const isSLA = checkSLA(item);
                    return (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm border group hover:shadow-md transition relative ${isSLA ? 'border-red-400 animate-pulse-red' : 'border-white dark:border-slate-600'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username} size="sm" /><span className="font-bold text-xs text-gray-800 dark:text-white truncate max-w-[100px]">{item.username}</span></div>
                              <button onClick={() => openModal(type, item)} className="text-gray-400 hover:text-blue-500"><Edit size={14}/></button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">{item.desc_text || item.title}</p>
                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span className="font-mono">{formatDate(item.created_at)}</span>
                              {item.flag && <span className={`px-1.5 py-0.5 rounded font-bold border ${item.flag === 'پیگیری فوری' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>{item.flag}</span>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

// ... MeetingsTab, OnboardingTab, AIAnalysisTab, AIChatBox, UserProfile ...
const OnboardingTab = ({ onboardings, openModal, navigateToProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><GraduationCap size={24} className="text-indigo-500"/> ورود کاربران جدید</h2>
        <div className="flex gap-2">
            <button onClick={() => openModal('onboarding')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold">
            <Plus size={16} /> ثبت کاربر جدید
            </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {onboardings.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 hover:shadow-md transition relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username} size="md" /><div><h3 className="font-bold text-gray-800">{item.username}</h3><div className="flex gap-2 text-xs text-gray-400 mt-0.5"><span>{item.phone_number}</span></div></div></div>
              <button onClick={() => openModal('onboarding', item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Edit size={16}/></button>
            </div>
            <div className="mb-4"><div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>پیشرفت آنبوردینگ</span><span>{item.progress}%</span></div><div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div></div></div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl mb-3"><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-400">تماس اولیه</span><span className={`font-bold ${item.initial_call_status === 'پاسخ داد' ? 'text-emerald-600' : 'text-red-500'}`}>{item.initial_call_status || '-'}</span></div><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-400">وبسایت</span><span className="font-bold text-gray-700">{item.has_website ? 'دارد' : 'ندارد'}</span></div></div>
            {item.conversation_summary && (<p className="text-xs text-gray-600 bg-indigo-50/50 p-3 rounded-xl italic line-clamp-2">{item.conversation_summary}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
};

const MeetingsTab = ({ meetings, openModal, navigateToProfile }) => {
    const [teamFilter, setTeamFilter] = useState('');
    const filtered = teamFilter ? meetings.filter(m => m.created_by === teamFilter) : meetings;
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
                <div className="flex items-center gap-4"><h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><Users size={24} className="text-teal-500"/> جلسات تیم</h2><select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="bg-slate-50 border p-2 rounded-xl text-sm outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="">همه اعضا</option>{ALLOWED_USERS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                <button onClick={() => openModal('meeting')} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-teal-700 shadow-lg shadow-teal-200 font-bold"><Plus size={16} /> ثبت جلسه جدید</button>
            </div>
            <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl border overflow-hidden">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 border-b dark:border-slate-600"><tr><th className="p-4">زمان</th><th className="p-4">مشتری</th><th className="p-4">علت جلسه</th><th className="p-4">نتیجه</th><th className="p-4">برگزار شد؟</th><th className="p-4">ثبت کننده</th><th className="p-4"></th></tr></thead>
                    <tbody className="divide-y dark:divide-slate-700">{filtered.map((m) => (<tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700"><td className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">{formatDate(m.date)} - {m.meeting_time}</td><td className="p-4 font-bold cursor-pointer hover:text-blue-600 dark:text-white" onClick={() => navigateToProfile(m.username)}>{m.username}</td><td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{m.reason}</td><td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{m.result || '-'}</td><td className="p-4">{m.held ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">بله</span> : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">خیر</span>}</td><td className="p-4 text-xs text-gray-500 dark:text-gray-400">{m.created_by}</td><td className="p-4"><button onClick={() => openModal('meeting', m)} className="text-gray-400 hover:text-teal-600"><Edit size={16}/></button></td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
};

const AIChatBox = ({ contextData }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
    const handleSend = async () => { if (!input.trim()) return; const userMsg = { role: 'user', text: input }; setMessages(prev => [...prev, userMsg]); setInput(''); setLoading(true); const prompt = `Context: ${JSON.stringify(contextData)}\n\nQuestion: ${userMsg.text}`; const res = await callVardastAI(prompt); setMessages(prev => [...prev, { role: 'ai', text: res || 'Error fetching response' }]); setLoading(false); };
    return (
        <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="bg-slate-50 p-4 border-b font-bold text-gray-700 flex items-center gap-2"><MessageSquare size={18} className="text-purple-600"/> چت با دستیار هوشمند</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>{messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-purple-100 text-purple-900 rounded-br-none' : 'bg-slate-100 text-gray-800 rounded-bl-none'}`}>{m.text}</div></div>))}</div>
            <div className="p-3 border-t bg-slate-50 flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="پیام خود را بنویسید..." className="flex-1 border rounded-xl px-4 py-2 outline-none focus:border-purple-500"/><button onClick={handleSend} disabled={loading} className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition"><Send size={20} /></button></div>
        </div>
    );
};

const AIAnalysisTab = ({ issues, onboardings, features }) => {
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const handleAnalysis = async (type) => { setLoading(true); let data = []; if (type === 'onboarding') { data = onboardings.map(u => ({ progress: u.progress, note: u.meeting_note || u.followup_note })); } else if (type === 'features') { data = features.filter(f => f.status !== 'انجام شد').map(f => ({ title: f.title, desc: f.desc_text, status: f.status, votes: f.repeat_count })); } else { data = issues.map(i => ({ type: i.type, desc: i.desc_text })); } const prompt = `Data: ${JSON.stringify(data)}`; const res = await callVardastAI(prompt); setAnalysisResult(res || 'Error'); setLoading(false); };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10"><h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Sparkles className="text-amber-300"/> تحلیل خودکار</h2><div className="flex gap-3 flex-wrap"><button onClick={() => handleAnalysis('general')} disabled={loading} className="bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Activity size={16}/>}مشکلات فنی</button><button onClick={() => handleAnalysis('onboarding')} disabled={loading} className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg flex items-center gap-2 border border-indigo-400 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <GraduationCap size={16}/>}آنبوردینگ</button><button onClick={() => handleAnalysis('features')} disabled={loading} className="bg-amber-400 text-indigo-900 px-4 py-2 rounded-xl font-bold hover:bg-amber-300 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Lightbulb size={16}/>}فیچرها</button></div></div>
                </div>
                {analysisResult && <div className="bg-white p-6 rounded-3xl shadow-sm border prose prose-sm max-w-none">{analysisResult}</div>}
            </div>
            <AIChatBox contextData={{ issues: issues.length, onboardings: onboardings.length, features: features?.length, sample_issues: issues.slice(0, 10) }} />
        </div>
    );
};

const CohortChart = ({ onboardings }) => {
  const data = useMemo(() => { const cohorts = {}; onboardings.forEach(u => { if (!u.created_at || !u.created_at.includes('T')) return; const date = new Date(u.created_at); const month = date.toLocaleDateString('fa-IR', { month: 'long' }); if (!cohorts[month]) cohorts[month] = { month, total: 0, active: 0 }; cohorts[month].total++; if (u.progress > 0) cohorts[month].active++; }); return Object.values(cohorts).map(c => ({ ...c, retention: Math.round((c.active / c.total) * 100) })); }, [onboardings]);
  return (<ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis unit="%" /><Tooltip /><Area type="monotone" dataKey="retention" stroke="#82ca9d" fill="#82ca9d" name="نرخ فعال‌سازی" /></AreaChart></ResponsiveContainer>);
};

const UserProfile = ({ usersData = [], issues, frozen, features, refunds, onboardings, meetings, openModal, profileSearch, setProfileSearch }) => {
    const [search, setSearch] = useState(profileSearch || '');
    const [selectedUserStats, setSelectedUserStats] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => { setSearch(profileSearch || ''); }, [profileSearch]);
    useEffect(() => { const found = (usersData || []).find(u => u.username === search); setSelectedUserStats(found || null); }, [search, usersData]);
    const handleSearch = (val) => { setSearch(val); setProfileSearch(val); if (val) { const lowerVal = val.toLowerCase(); setSuggestions((usersData || []).filter(u => u.username.toLowerCase().includes(lowerVal) || (u.phone_number && u.phone_number.includes(lowerVal)) || (u.instagram_username && u.instagram_username.toLowerCase().includes(lowerVal)) || (u.telegram_id && u.telegram_id.toLowerCase().includes(lowerVal)) || (u.website && u.website.toLowerCase().includes(lowerVal))).slice(0, 5)); } else { setSuggestions([]); } };
    const userRecords = useMemo(() => { if (!search) return []; return [...issues.map(x => ({ ...x, src: 'issue', date: x.created_at })), ...frozen.map(x => ({ ...x, src: 'frozen', date: x.frozen_at })), ...features.map(x => ({ ...x, src: 'feature', date: x.created_at })), ...refunds.map(x => ({ ...x, src: 'refund', date: x.requested_at })), ...onboardings.map(x => ({ ...x, src: 'onboarding', date: x.created_at })), ...meetings.map(x => ({ ...x, src: 'meeting', date: x.date }))].filter(r => r.username === search).sort((a, b) => (b.date || '').localeCompare(a.date || '')); }, [search, issues, frozen, features, refunds, onboardings, meetings]);
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
           <div className="bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white relative z-20"><div className="flex justify-between items-center mb-3"><h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><User size={20} className="text-blue-600"/> پروفایل کاربر</h2><button onClick={() => openModal('profile')} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-200 flex items-center gap-1 hover:bg-blue-700 transition"><Plus size={14}/> پروفایل جدید</button></div><div className="relative"><div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50/50 dark:bg-slate-700/50 overflow-hidden focus-within:ring-2 ring-blue-100 transition-all"><div className="pl-3 pr-4 text-gray-400"><Search size={18} /></div><input placeholder="جستجو (نام، تماس، اینستاگرام، تلگرام، سایت)..." value={search} className="w-full p-3 bg-transparent outline-none text-sm dark:text-white" onChange={(e) => handleSearch(e.target.value)} /></div>{suggestions.length > 0 && search !== suggestions[0]?.username && (<div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-2xl mt-2 max-h-60 overflow-auto border z-50 p-1">{suggestions.map((u) => (<div key={u.username} onClick={() => handleSearch(u.username)} className="p-3 hover:bg-blue-50 cursor-pointer rounded-xl text-sm flex gap-3 items-center transition-colors"><UserAvatar name={u.username} size="sm" /><div className="flex flex-col"><span className="font-semibold text-gray-700">{u.username}</span><div className="flex flex-wrap gap-2 text-[10px] text-gray-400">{u.phone_number && <span>{u.phone_number}</span>}{u.instagram_username && <span>IG: {u.instagram_username}</span>}</div></div></div>))}</div>)}</div></div>
           {selectedUserStats ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-l from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                        <UserAvatar name={selectedUserStats.username} size="lg" />
                        <div className="flex-1 text-center md:text-right z-10 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{selectedUserStats.username}</h2>
                                    {selectedUserStats.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 max-w-lg leading-relaxed">{selectedUserStats.bio}</p>}
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start text-xs text-gray-600 dark:text-gray-300">
                                        {selectedUserStats.phone_number && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">📞 {selectedUserStats.phone_number}</span>}
                                        {selectedUserStats.instagram_username && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">📸 {selectedUserStats.instagram_username}</span>}
                                        {selectedUserStats.telegram_id && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">✈️ {selectedUserStats.telegram_id}</span>}
                                        {selectedUserStats.website && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">🌐 {selectedUserStats.website}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                    <button onClick={() => openModal('profile', selectedUserStats)} className="text-blue-600 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition flex gap-2 items-center justify-center"><Edit size={14}/> ویرایش پروفایل</button>
                                    <button onClick={() => openModal('meeting', { username: selectedUserStats.username })} className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-teal-200 flex items-center gap-2 hover:bg-teal-600 transition justify-center"><Clock size={16}/> تنظیم جلسه</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur p-6 rounded-3xl shadow-sm border border-white"><h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><History size={18} className="text-gray-500"/> تاریخچه فعالیت‌ها</h3>{userRecords.length > 0 ? (<div className="space-y-6 relative before:absolute before:right-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">{userRecords.map((r, i) => (<div key={i} className="relative pr-10"><div className={`absolute right-4 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${r.src === 'issue' ? 'bg-amber-400' : 'bg-blue-400'}`}></div><div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition"><div className="flex flex-wrap items-center justify-between gap-2 mb-2"><div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border dark:border-slate-700">{formatDate(r.date)}</span><span className="px-2 py-0.5 rounded-full border text-[10px]">{r.src}</span></div><button onClick={() => openModal(r.src, r)} className="text-xs px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 dark:text-white hover:bg-blue-600 hover:text-white transition opacity-0 group-hover:opacity-100">ویرایش</button></div><div className="font-bold text-sm text-gray-800 dark:text-white mb-2">{r.desc_text || r.title || r.reason}</div></div></div>))}</div>) : (<div className="text-center text-gray-400 py-10">هیچ سابقه‌ای یافت نشد.</div>)}</div>
                </div>
           ) : null}
        </div>
    );
};

export default function App() {
  useTailwind();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Data States
  const [issues, setIssues] = useState([]);
  const [frozen, setFrozen] = useState([]);
  const [features, setFeatures] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  // Filter States
  const [globalTimeFilter, setGlobalTimeFilter] = useState(null); 
  const [globalCustomRange, setGlobalCustomRange] = useState(null);
  const [tabTimeFilter, setTabTimeFilter] = useState(null);
  const [tabCustomRange, setTabCustomRange] = useState(null);
  const [flagFilter, setFlagFilter] = useState([]); 

  const [dismissedFollowUps, setDismissedFollowUps] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('dismissedFollowUps');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // View Modes
  const [issueViewMode, setIssueViewMode] = useState('table'); 
  const [featureViewMode, setFeatureViewMode] = useState('table');
  const [expandedChart, setExpandedChart] = useState(null); 
  const [historyModalData, setHistoryModalData] = useState(null);

  const allUsers = useMemo(() => {
    const map = {};
    const process = (arr) => {
      if(!arr) return;
      arr.forEach(r => {
        if(r.username) {
            if(!map[r.username]) map[r.username] = { username: r.username };
            if(r.phone_number) map[r.username].phone_number = r.phone_number;
            if(r.instagram_username) map[r.username].instagram_username = r.instagram_username;
            if(r.telegram_id) map[r.username].telegram_id = r.telegram_id;
            if(r.website) map[r.username].website = r.website;
            if(r.bio) map[r.username].bio = r.bio;
        }
      });
    };
    process(issues);
    process(frozen);
    process(features);
    process(refunds);
    process(profiles);
    process(onboardings);
    process(meetings);
    return Object.values(map);
  }, [issues, frozen, features, refunds, profiles, onboardings, meetings]);

  // Authentication State
  const [loggedInUser, setLoggedInUser] = useState(() => localStorage.getItem('vardast_ops_user') || '');
  const [isAuthed, setIsAuthed] = useState(() => {
      if (typeof window === 'undefined') return false;
      const authed = localStorage.getItem('vardast_ops_authed') === '1';
      const user = localStorage.getItem('vardast_ops_user');
      // Only authorize if BOTH flag is set AND user exists
      return authed && !!user;
  });

  const [loginStep, setLoginStep] = useState('username');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vardast_ops_theme') === 'dark');
  const [profileSearch, setProfileSearch] = useState('');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('vardast_ops_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const user = loginUsername.trim();
    
    if (!ALLOWED_USERS.includes(user)) {
      setLoginError('شما اجازه ورود ندارید.');
      return;
    }

    if (!supabase) {
        if (user) setLoginStep('password'); 
        return;
    }

    try {
        const { data, error } = await supabase.from('users').select('*').eq('username', user).single();
        if (error && error.code !== 'PGRST116') {
            console.error(error);
            setLoginError('خطای ارتباط با سرور');
            return;
        }

        if (data) {
            if (data.password) {
                setLoginStep('password');
            } else {
                setLoginStep('set-password');
            }
        } else {
            setLoginStep('set-password');
        }
    } catch (e) {
        console.error(e);
        setLoginError('خطای ناشناخته');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!supabase) {
        finishLogin(loginUsername);
        return;
    }

    if (loginStep === 'set-password') {
        const { error } = await supabase.from('users').upsert({ 
            username: loginUsername, 
            password: loginPassword,
            created_at: new Date().toISOString()
        }, { onConflict: 'username' });
        
        if (error) {
            setLoginError('خطا در ثبت کلمه عبور: ' + error.message);
        } else {
            finishLogin(loginUsername);
        }
    } else {
        const { data, error } = await supabase.from('users').select('password').eq('username', loginUsername).single();
        if (error || !data) {
             setLoginError('کاربر یافت نشد.');
        } else if (data.password === loginPassword) {
             finishLogin(loginUsername);
        } else {
             setLoginError('کلمه عبور اشتباه است.');
        }
    }
  };

  const finishLogin = (user) => {
      setIsAuthed(true);
      setLoggedInUser(user);
      localStorage.setItem('vardast_ops_authed', '1');
      localStorage.setItem('vardast_ops_user', user);
      setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('vardast_ops_authed');
    localStorage.removeItem('vardast_ops_user');
    setIsAuthed(false);
    setLoggedInUser('');
    setLoginStep('username');
    setLoginUsername('');
    setLoginPassword('');
  };

  const navigateToProfile = (username) => {
    setProfileSearch(username);
    setActiveTab('profile');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  useEffect(() => {
    if (!supabase) return;
    setIsConnected(true);
    const fetchAll = async () => {
      const { data: d1 } = await supabase.from('issues').select('*').order('id', { ascending: false }); if (d1) setIssues(d1);
      const { data: d2 } = await supabase.from('frozen').select('*').order('id', { ascending: false }); if (d2) setFrozen(d2);
      const { data: d3 } = await supabase.from('features').select('*').order('id', { ascending: false }); if (d3) setFeatures(d3);
      const { data: d4 } = await supabase.from('refunds').select('*').order('id', { ascending: false }); if (d4) setRefunds(d4);
      const { data: d5 } = await supabase.from('profiles').select('*').order('id', { ascending: false }); if (d5) setProfiles(d5);
      const { data: d6 } = await supabase.from('onboardings').select('*').order('id', { ascending: false }); if (d6) setOnboardings(d6);
      const { data: d7 } = await supabase.from('meetings').select('*').order('id', { ascending: false }); if (d7) setMeetings(d7);
    };
    fetchAll();
    const channel = supabase.channel('updates').on('postgres_changes', { event: 'INSERT', schema: 'public' }, (payload) => {
      const newRow = payload.new;
      if (payload.table === 'issues') setIssues((prev) => [newRow, ...prev]);
      if (payload.table === 'frozen') setFrozen((prev) => [newRow, ...prev]);
      if (payload.table === 'features') setFeatures((prev) => [newRow, ...prev]);
      if (payload.table === 'refunds') setRefunds((prev) => [newRow, ...prev]);
      if (payload.table === 'profiles') setProfiles((prev) => [newRow, ...prev.filter(p => p.username !== newRow.username)]);
      if (payload.table === 'onboardings') setOnboardings((prev) => [newRow, ...prev]);
      if (payload.table === 'meetings') setMeetings((prev) => [newRow, ...prev]);
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const getFiltered = (data, isGlobal = true) => { const r = isGlobal ? globalTimeFilter : tabTimeFilter; const c = isGlobal ? globalCustomRange : tabCustomRange; return filterDataByTime(data, r, c); };
  const filteredIssues = useMemo(() => { let data = getFiltered(issues, activeTab === 'dashboard' || activeTab === 'ai-analysis'); if (activeTab === 'issues' && flagFilter.length > 0) { data = data.filter(i => { if (flagFilter.includes('technical_review')) { if (i.technical_review) return true; } const priorityFilters = flagFilter.filter(f => f !== 'technical_review'); if (priorityFilters.length > 0) { if (priorityFilters.includes(i.flag)) return true; } return false; }); } return data; }, [issues, globalTimeFilter, globalCustomRange, tabTimeFilter, tabCustomRange, activeTab, flagFilter]);
  const filteredFrozen = useMemo(() => getFiltered(frozen, activeTab === 'dashboard' || activeTab === 'ai-analysis'), [frozen, globalTimeFilter, globalCustomRange, tabTimeFilter, tabCustomRange, activeTab]);
  const filteredRefunds = useMemo(() => getFiltered(refunds, activeTab === 'dashboard' || activeTab === 'ai-analysis'), [refunds, globalTimeFilter, globalCustomRange, tabTimeFilter, tabCustomRange, activeTab]);
  const filteredOnboardings = useMemo(() => getFiltered(onboardings, activeTab === 'dashboard' || activeTab === 'ai-analysis'), [onboardings, globalTimeFilter, globalCustomRange, tabTimeFilter, tabCustomRange, activeTab]);
  const filteredFeatures = useMemo(() => getFiltered(features, activeTab === 'dashboard' || activeTab === 'ai-analysis'), [features, globalTimeFilter, globalCustomRange, tabTimeFilter, tabCustomRange, activeTab]);
  const filteredMeetings = useMemo(() => getFiltered(meetings, activeTab === 'dashboard' || activeTab === 'ai-analysis'), [meetings, globalTimeFilter, globalCustomRange, tabTimeFilter, tabCustomRange, activeTab]);

  const analytics = useMemo(() => { const resolved = filteredIssues.filter((i) => i.status === 'حل‌شده').length; const total = filteredIssues.length; const ratio = total ? Math.round((resolved / total) * 100) : 0; return { solvedRatio: ratio, activeFrozen: filteredFrozen.filter((f) => f.status === 'فریز').length, refundCount: filteredRefunds.length }; }, [filteredIssues, filteredFrozen, filteredRefunds]);
  const churnRisks = useMemo(() => { const userCounts = {}; filteredIssues.forEach(i => { if (!userCounts[i.username]) userCounts[i.username] = { count: 0, issues: [] }; userCounts[i.username].count += 1; userCounts[i.username].issues.push({ desc: i.desc_text, status: i.status }); }); return Object.entries(userCounts).filter(([_, data]) => data.count > 3).map(([username, data]) => ({ username, count: data.count, issues: data.issues })); }, [filteredIssues]);
  const followUpList = useMemo(() => { const userLastIssue = {}; issues.forEach(i => { const date = normalizeDate(i); if (!date) return; if (!userLastIssue[i.username] || isAfter(date, userLastIssue[i.username].date)) { userLastIssue[i.username] = { date, issue: i }; } }); const now = new Date(); const result = []; Object.entries(userLastIssue).forEach(([username, { date, issue }]) => { if (dismissedFollowUps.includes(username)) return; const daysDiff = differenceInDays(now, date); if (daysDiff >= 7 && daysDiff <= 12) { result.push({ username, days: daysDiff, lastDate: date, issue }); } }); return result.sort((a, b) => b.days - a.days); }, [issues, dismissedFollowUps]);
  const handleDismissFollowUp = (username) => { const newDismissed = [...dismissedFollowUps, username]; setDismissedFollowUps(newDismissed); localStorage.setItem('dismissedFollowUps', JSON.stringify(newDismissed)); };
  const handleAiChurnAnalysis = async (user) => { setAiLoading(true); const prompt = `User: ${user.username}, Count: ${user.count}, Issues: ${JSON.stringify(user.issues)}`; const res = await callVardastAI(prompt); setAiLoading(false); if (res) alert(res); };
  const chartData = useMemo(() => { const acc = {}; filteredIssues.forEach((i) => { const date = normalizeDate(i); const d = date ? format(date, 'yyyy-MM-dd') : 'نامشخص'; acc[d] = (acc[d] || 0) + 1; }); return Object.keys(acc).map((d) => ({ date: d, count: acc[d] })).sort((a,b) => a.date.localeCompare(b.date)); }, [filteredIssues]);

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    let finalDate = new Date();
    if (formData.date) {
        if (typeof formData.date === 'string') finalDate = parsePersianDate(formData.date) || new Date(formData.date);
        else if (formData.date?.toDate) finalDate = formData.date.toDate();
        else finalDate = formData.date;
    }
    const createdTimestamp = finalDate.toISOString();
    
    let table = '';
    const commonFields = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, flag: formData.flag || null };
    let payload = {};

    // Determine Table and Payload
    if (modalType === 'issue') {
      table = 'issues';
      payload = { ...commonFields, desc_text: formData.desc_text, module: formData.module, type: formData.type, status: formData.status || 'باز', support: formData.support, subscription_status: formData.subscription_status, resolved_at: formData.resolved_at, technical_note: formData.technical_note, technical_review: formData.technical_review };
      if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'frozen') {
      table = 'frozen';
      payload = { ...commonFields, desc_text: formData.desc_text, module: formData.module, cause: formData.cause, status: formData.status || 'فریز', subscription_status: formData.subscription_status, first_frozen_at: formData.first_frozen_at, freeze_count: formData.freeze_count ? Number(formData.freeze_count) : null, last_frozen_at: formData.last_frozen_at, resolve_status: formData.resolve_status, note: formData.note };
      if (!isEdit) payload.frozen_at = createdTimestamp;
    } else if (modalType === 'feature') {
      table = 'features';
      payload = { ...commonFields, desc_text: formData.desc_text, title: formData.title, category: formData.category, status: formData.status || 'بررسی نشده', repeat_count: formData.repeat_count ? Number(formData.repeat_count) : null, importance: formData.importance ? Number(formData.importance) : null, internal_note: formData.internal_note };
      if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'refund') {
      table = 'refunds';
      payload = { ...commonFields, reason: formData.reason, duration: formData.duration, category: formData.category, action: formData.action || 'در حال بررسی', suggestion: formData.suggestion, can_return: formData.can_return, sales_source: formData.sales_source, ops_note: formData.ops_note };
      if (!isEdit) payload.requested_at = createdTimestamp;
    } else if (modalType === 'profile') {
      table = 'profiles';
      payload = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, telegram_id: formData.telegram_id, website: formData.website, bio: formData.bio };
      if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'meeting') {
        table = 'meetings';
        payload = { username: formData.username, date: formData.date ? (formData.date.toDate ? formData.date.toDate().toISOString() : new Date(formData.date).toISOString()) : new Date().toISOString(), meeting_time: formData.meeting_time, reason: formData.reason, result: formData.result, held: formData.held === true || formData.held === 'true' };
        if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'onboarding') {
      table = 'onboardings';
      payload = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, telegram_id: formData.telegram_id, has_website: formData.has_website === 'true' || formData.has_website === true, progress: Number(formData.progress), initial_call_status: formData.initial_call_status, conversation_summary: formData.conversation_summary, call_date: formData.call_date, meeting_date: formData.meeting_date, meeting_note: formData.meeting_note, followup_date: formData.followup_date, followup_note: formData.followup_note };
      if (!isEdit) payload.created_at = createdTimestamp;
      if (!isEdit && payload.meeting_date) { 
          // Parse meeting date if it's coming from DatePicker
          let mDate = payload.meeting_date;
          if (mDate && typeof mDate !== 'string') {
              if (mDate.toDate) mDate = mDate.toDate().toISOString();
              else if (mDate instanceof Date) mDate = mDate.toISOString();
          }
          const meetingPayload = { username: payload.username, date: mDate, meeting_time: '10:00', reason: 'جلسه آنبوردینگ (خودکار)', created_by: loggedInUser, held: false, history: [] }; 
          supabase.from('meetings').insert([meetingPayload]).then(({ error }) => { if (error) console.error('Error auto-creating meeting:', error); }); 
      }
    }

    if (!supabase) {
        setIsModalOpen(false); setEditingId(null); setFormData({ ...INITIAL_FORM_DATA }); return;
    }
    
    // Audit Logic - Ensure loggedInUser is used
    const currentUser = loggedInUser || 'Unknown';
    
    if (isEdit) {
        let currentRecord = null;
        if (table === 'issues') currentRecord = issues.find(r => r.id === editingId);
        else if (table === 'frozen') currentRecord = frozen.find(r => r.id === editingId);
        else if (table === 'features') currentRecord = features.find(r => r.id === editingId);
        else if (table === 'refunds') currentRecord = refunds.find(r => r.id === editingId);
        else if (table === 'profiles') currentRecord = profiles.find(r => r.id === editingId);
        else if (table === 'onboardings') currentRecord = onboardings.find(r => r.id === editingId);
        else if (table === 'meetings') currentRecord = meetings.find(r => r.id === editingId);

        const prevHistory = currentRecord?.history || [];
        const newEntry = { user: currentUser, date: new Date().toISOString(), action: 'edit' };
        payload.history = [newEntry, ...prevHistory];
        payload.last_updated_by = currentUser;
        payload.last_updated_at = new Date().toISOString();
    } else {
        payload.created_by = currentUser;
        payload.history = [];
    }

    let error = null;
    if (isEdit) {
      const res = await supabase.from(table).update(payload).eq('id', editingId);
      error = res.error;
      if (!error) {
        const updater = (prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r));
        if (table === 'issues') setIssues(updater); if (table === 'frozen') setFrozen(updater); if (table === 'features') setFeatures(updater); if (table === 'refunds') setRefunds(updater); if (table === 'profiles') setProfiles(updater); if (table === 'onboardings') setOnboardings(updater); if (table === 'meetings') setMeetings(updater);
      }
    } else {
      const res = await supabase.from(table).insert([payload]);
      error = res.error;
    }
    if (error) alert('خطا: ' + error.message);
    else { setIsModalOpen(false); setEditingId(null); setFormData({ ...INITIAL_FORM_DATA }); }
  };

  const handleStatusChange = async (id, newStatus, table) => {
    if (!supabase) return;
    const payload = { 
        status: newStatus,
        last_updated_by: loggedInUser || 'Admin', // Use loggedInUser
        last_updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (!error) {
      if (table === 'issues') { setIssues(prev => prev.map(i => i.id.toString() === id ? { ...i, ...payload } : i)); } 
      else if (table === 'features') { setFeatures(prev => prev.map(f => f.id.toString() === id ? { ...f, ...payload } : f)); }
    }
  };

  const openModal = (t, record = null) => {
    setModalType(t);
    if (record) { setEditingId(record.id); setFormData({ ...INITIAL_FORM_DATA, ...record }); } 
    else { setEditingId(null); setFormData({ ...INITIAL_FORM_DATA }); }
    setIsModalOpen(true);
  };

  useEffect(() => { setTabTimeFilter(null); setTabCustomRange(null); }, [activeTab]);
  
  if (!isAuthed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-l from-slate-100 to-white dark:from-slate-900 dark:to-black p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-3xl p-8 w-full max-w-md border dark:border-slate-700">
          <h1 className="text-xl font-extrabold mb-4 text-center text-slate-800 dark:text-white">ورود به داشبورد پشتیبانی</h1>
          {loginStep === 'username' ? (
              <form onSubmit={handleUsernameSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                <div><label className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 block">نام کاربری</label><input type="text" className="w-full border dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 text-left dark:bg-slate-700 dark:text-white" dir="ltr" placeholder="username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} autoFocus /></div>
                {loginError && <div className="text-xs text-red-500 text-center">{loginError}</div>}
                <button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-sky-500 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2">ادامه <ArrowRight size={16}/></button>
              </form>
          ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-gray-700 dark:text-gray-300">{loginUsername}</span><button type="button" onClick={() => { setLoginStep('username'); setLoginError(''); }} className="text-xs text-blue-500 hover:underline">تغییر کاربر</button></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 block">{loginStep === 'set-password' ? 'تعیین کلمه عبور جدید' : 'کلمه عبور'}</label><input type="password" className="w-full border dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-white" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoFocus /></div>
                {loginError && <div className="text-xs text-red-500 text-center">{loginError}</div>}
                <button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-sky-500 text-white rounded-xl py-2.5 text-sm font-bold">{loginStep === 'set-password' ? 'ثبت و ورود' : 'ورود'}</button>
              </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#F3F4F6] dark:bg-slate-950 overflow-hidden transition-colors duration-300" dir="rtl">
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none dark:opacity-10"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none dark:opacity-10"></div>
      
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} h-full bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-xl border-l border-gray-200 flex flex-col transition-all duration-300 overflow-hidden fixed md:static inset-y-0 right-0 z-50`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          {isSidebarOpen && <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-purple-600 text-xl">وردست</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white rounded-xl border dark:border-slate-700 mr-auto">{isSidebarOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[{ id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard }, { id: 'meetings', label: 'جلسات تیم', icon: Users }, { id: 'issues', label: 'مشکلات فنی', icon: AlertTriangle }, { id: 'frozen', label: 'اکانت فریز', icon: Snowflake }, { id: 'features', label: 'درخواست فیچر', icon: Lightbulb }, { id: 'refunds', label: 'بازگشت وجه', icon: CreditCard }, { id: 'onboarding', label: 'ورود کاربران', icon: GraduationCap }, { id: 'profile', label: 'پروفایل کاربر', icon: User }, { id: 'ai-analysis', label: 'تحلیل هوشمند', icon: BrainCircuit }].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              <item.icon size={18} className="flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition" title="تغییر تم">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
             <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-red-500 dark:text-red-400 transition" title="خروج"><LogOut size={18}/></button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-8 py-6 min-h-full">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 border rounded-xl shadow-sm text-gray-600"><Menu size={20} /></button>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">داشبورد پشتیبانی</h1>
              {loggedInUser && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">کاربر: {loggedInUser}</span>}
            </div>
            {activeTab === 'dashboard' && (<TimeFilter value={globalTimeFilter} onChange={setGlobalTimeFilter} customRange={globalCustomRange} onCustomChange={setGlobalCustomRange} />)}
            {['issues', 'frozen', 'features', 'refunds', 'onboarding', 'meetings'].includes(activeTab) && (<TimeFilter value={tabTimeFilter} onChange={setTabTimeFilter} customRange={tabCustomRange} onCustomChange={setTabCustomRange} />)}
          </header>

          {activeTab === 'dashboard' && (
            <section className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[{ title: 'نرخ حل مشکلات', value: `%${analytics.solvedRatio}`, color: 'from-emerald-500 to-teal-400', icon: CheckCircle2 }, { title: 'اکانت‌های فریز', value: analytics.activeFrozen, color: 'from-blue-500 to-indigo-400', icon: Snowflake }, { title: 'آنبوردینگ', value: filteredOnboardings.length, color: 'from-amber-500 to-orange-400', icon: GraduationCap }, { title: 'کل تیکت‌ها', value: filteredIssues.length, color: 'from-slate-700 to-slate-500', icon: Activity }].map((card, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition">
                    <div className={`absolute -right-6 -top-6 p-4 rounded-full bg-gradient-to-br ${card.color} opacity-10 scale-150`}><card.icon size={50} /></div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 z-10">{card.title}</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white z-10">{card.value}</h3>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col h-64">
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center"><Bell size={14}/></span>پیگیری‌های مورد نیاز (۷-۱۲ روز)</h4>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {followUpList.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-gray-400"><CheckCircle2 size={32} className="text-emerald-500 mb-2" /><span className="text-xs">هیچ پیگیری نیاز نیست!</span></div>) : followUpList.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-700 border border-orange-50 dark:border-slate-600 p-3 rounded-xl shadow-sm flex justify-between items-center group">
                                    <div className="flex items-center gap-2"><UserAvatar name={item.username} size="sm"/><div className="flex flex-col"><span className="font-bold text-sm text-gray-800 dark:text-white cursor-pointer hover:text-blue-400" onClick={() => navigateToProfile(item.username)}>{item.username}</span><span className="text-[10px] text-gray-400 line-clamp-1 max-w-[150px]">{item.lastDate ? formatDate(item.lastDate) : ''}: {item.issue?.desc_text}</span></div></div>
                                    <button onClick={() => handleDismissFollowUp(item.username)} className="text-gray-300 hover:text-emerald-500 transition" title="انجام شد/رد کردن"><CheckCircle2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col h-64">
                    <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><AlertCircle size={14}/></span>ریسک ریزش</h4>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {churnRisks.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-gray-400"><CheckCircle2 size={40} className="text-emerald-500 mb-2" /><span className="text-xs">هیچ کاربری در خطر نیست!</span></div>) : churnRisks.map((user, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-700 border border-red-50 dark:border-slate-600 p-3 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToProfile(user.username)}><UserAvatar name={user.username} size="sm"/><span className="font-bold text-sm text-gray-800 dark:text-white">{user.username}</span></div><span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-red-100">{user.count} خطا</span></div>
                            <button onClick={() => handleAiChurnAnalysis(user)} className="w-full flex items-center justify-center gap-1 text-[10px] text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white border border-purple-100 px-3 py-1.5 rounded-lg transition">{aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}تحلیل هوشمند</button>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
                   <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col cursor-pointer hover:border-blue-200 transition" onClick={() => setExpandedChart('trend')}>
                      <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4 flex items-center gap-2 justify-between"><span className="flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/>روند ثبت مشکلات</span><Maximize2 size={14} className="text-gray-400"/></h4>
                      <div className="flex-1 w-full pointer-events-none"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px'}} /><Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" /></AreaChart></ResponsiveContainer></div>
                   </div>
                   <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col cursor-pointer hover:border-green-200 transition" onClick={() => setExpandedChart('cohort')}>
                      <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4 flex items-center justify-between"><span>نرخ فعال‌سازی کاربران</span><Maximize2 size={14} className="text-gray-400"/></h4>
                      <div className="flex-1 w-full pointer-events-none"><CohortChart onboardings={filteredOnboardings} /></div>
                   </div>
                </div>
              </div>
            </section>
          )}

          <ChartModal isOpen={expandedChart === 'trend'} onClose={() => setExpandedChart(null)} title="روند ثبت مشکلات">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <defs><linearGradient id="colorCountModal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip contentStyle={{borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCountModal)" />
                </AreaChart>
              </ResponsiveContainer>
          </ChartModal>
          <ChartModal isOpen={expandedChart === 'cohort'} onClose={() => setExpandedChart(null)} title="نرخ فعال‌سازی کاربران"><CohortChart onboardings={filteredOnboardings} /></ChartModal>
          <HistoryLogModal isOpen={!!historyModalData} onClose={() => setHistoryModalData(null)} history={historyModalData} />
          {activeTab === 'onboarding' && <OnboardingTab onboardings={filteredOnboardings} openModal={openModal} navigateToProfile={navigateToProfile} />}
          {activeTab === 'meetings' && <MeetingsTab meetings={filteredMeetings} openModal={openModal} navigateToProfile={navigateToProfile} />}
          {activeTab === 'issues' && (
            <section className="h-full flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm gap-3">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl"><button onClick={() => setIssueViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${issueViewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><List size={16}/> جدول</button><button onClick={() => setIssueViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${issueViewMode === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button></div>
                    <FlagFilter selectedFlags={flagFilter} onChange={setFlagFilter} />
                </div>
                <button onClick={() => openModal('issue')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 flex items-center gap-2"><Plus size={16}/> ثبت مشکل</button>
              </div>
              {issueViewMode === 'kanban' ? (<div className="flex-1 overflow-hidden"><KanbanBoard items={filteredIssues} onStatusChange={(id, status) => handleStatusChange(id, status, 'issues')} columns={{'باز': 'باز', 'در حال بررسی': 'در حال بررسی', 'حل‌شده': 'حل‌شده'}} navigateToProfile={navigateToProfile} openModal={openModal} type="issue" /></div>) : (<div className="bg-white rounded-2xl border overflow-hidden"><table className="w-full text-sm text-right"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4">ثبت کننده</th><th className="p-4">تاریخ</th><th className="p-4"></th></tr></thead><tbody>{filteredIssues.map(row => (<tr key={row.id} className={`border-b last:border-0 hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4"><div className="flex items-center gap-2">{row.technical_review && <div className="bg-indigo-100 p-1 rounded-md text-indigo-600" title="بررسی فنی"><Wrench size={12}/></div>}<span className="truncate max-w-xs">{row.desc_text}</span></div></td><td className="p-4"><span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs border border-blue-100">{row.status}</span></td><td className="p-4 text-xs text-gray-500 flex items-center gap-1">{row.created_by && <span className="bg-gray-100 px-2 py-0.5 rounded">{row.created_by}</span>}{row.history && row.history.length > 0 && <button onClick={() => setHistoryModalData(row.history)} className="text-blue-400 hover:text-blue-600"><History size={14}/></button>}</td><td className="p-4 font-mono text-xs text-gray-400">{formatDate(row.created_at)}</td><td className="p-4 text-left"><button onClick={() => openModal('issue', row)} className="text-gray-400 hover:text-blue-600"><Edit size={16}/></button></td></tr>))}</tbody></table></div>)}
            </section>
          )}
          {activeTab === 'features' && (
            <section className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl"><button onClick={() => setFeatureViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${featureViewMode === 'table' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><List size={16}/> جدول</button><button onClick={() => setFeatureViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${featureViewMode === 'kanban' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button></div>
                <div className="flex gap-2"><button onClick={() => { setActiveTab('ai-analysis'); }} className="bg-white text-purple-600 px-4 py-2 rounded-xl text-sm font-bold border border-purple-200 hover:bg-purple-50 flex items-center gap-2"><Sparkles size={16}/> تحلیل هوشمند</button><button onClick={() => openModal('feature')} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 flex items-center gap-2"><Plus size={16}/> ثبت فیچر</button></div>
              </div>
              {featureViewMode === 'kanban' ? (<div className="flex-1 overflow-hidden"><KanbanBoard items={filteredFeatures} onStatusChange={(id, status) => handleStatusChange(id, status, 'features')} columns={{'بررسی نشده': 'بررسی نشده', 'در تحلیل': 'در تحلیل', 'در توسعه': 'در توسعه', 'انجام شد': 'انجام شد'}} navigateToProfile={navigateToProfile} openModal={openModal} type="feature" /></div>) : (<div className="bg-white rounded-2xl border overflow-hidden"><table className="w-full text-sm text-right"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">عنوان</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4"></th></tr></thead><tbody>{filteredFeatures.map(row => (<tr key={row.id} className={`border-b last:border-0 hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-purple-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4 font-bold">{row.title}</td><td className="p-4 truncate max-w-xs">{row.desc_text}</td><td className="p-4"><span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs border border-purple-100">{row.status}</span></td><td className="p-4 text-left"><button onClick={() => openModal('feature', row)} className="text-gray-400 hover:text-purple-600"><Edit size={16}/></button></td></tr>))}</tbody></table></div>)}
            </section>
          )}
          {activeTab === 'profile' && <UserProfile usersData={allUsers} issues={issues} frozen={frozen} features={features} refunds={refunds} onboardings={onboardings} meetings={meetings} openModal={openModal} profileSearch={profileSearch} setProfileSearch={setProfileSearch} />}
          {activeTab === 'ai-analysis' && <AIAnalysisTab issues={filteredIssues} onboardings={filteredOnboardings} features={filteredFeatures} navigateToProfile={navigateToProfile} />}
          {['frozen', 'refunds'].includes(activeTab) && (
            <div className="bg-white rounded-2xl border overflow-hidden p-6">
                <div className="flex justify-between mb-4"><h2 className="font-bold text-lg">{activeTab === 'frozen' ? 'اکانت‌های فریز شده' : 'درخواست‌های بازگشت وجه'}</h2><button onClick={() => openModal(activeTab === 'frozen' ? 'frozen' : 'refund')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={16}/></button></div>
                <table className="w-full text-sm text-right"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4"></th></tr></thead><tbody>{(activeTab === 'frozen' ? filteredFrozen : filteredRefunds).map(row => (<tr key={row.id} className={`border-b hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4">{row.desc_text || row.reason}</td><td className="p-4">{row.status || row.action}</td><td className="p-4"><button onClick={() => openModal(activeTab === 'frozen' ? 'frozen' : 'refund', row)}><Edit size={16} className="text-gray-400"/></button></td></tr>))}</tbody></table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-base text-gray-800 dark:text-white">
                {modalType === 'onboarding' ? 'مدیریت آنبوردینگ' : 'ثبت/ویرایش اطلاعات'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                {/* Onboarding Specific Fields */}
                {modalType === 'onboarding' ? (
                    <div className="space-y-4">
                        <UserSearchInput 
                            value={formData.username} 
                            onChange={(val) => setFormData(p => ({ ...p, username: val }))} 
                            onSelect={(u) => setFormData(p => ({ ...p, username: u.username, phone_number: u.phone_number || '' }))}
                            usersData={allUsers} 
                        />
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">درصد پیشرفت ({formData.progress}%)</label>
                            <input type="range" min="0" max="100" step="5" value={formData.progress || 0} onChange={(e) => setFormData({...formData, progress: e.target.value})} className="w-full accent-indigo-600 cursor-pointer"/>
                        </div>

                        <select value={formData.has_website || 'false'} onChange={(e) => setFormData({...formData, has_website: e.target.value})} className="border p-3 rounded-xl text-sm w-full"><option value="false">وبسایت ندارد</option><option value="true">وبسایت دارد</option></select>

                        {/* Section 1: Call */}
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl space-y-2 border dark:border-slate-600">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-xs">۱. تماس اولیه</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={formData.initial_call_status || ''} onChange={(e) => setFormData({...formData, initial_call_status: e.target.value})} className="border p-2 rounded-lg text-xs w-full dark:bg-slate-800 dark:border-slate-600 dark:text-white"><option value="">وضعیت...</option><option value="پاسخ داد">پاسخ داد</option><option value="پاسخ نداد">پاسخ نداد</option><option value="رد تماس">رد تماس</option></select>
                                <div className="w-full">
                                     <DatePicker 
                                        calendar={persian} 
                                        locale={persian_fa} 
                                        value={formData.call_date || ''} 
                                        onChange={(date) => setFormData({...formData, call_date: date})}
                                        placeholder="تاریخ تماس"
                                        inputClass="w-full border p-2 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none"
                                     />
                                </div>
                            </div>
                            <div className="relative">
                                <textarea placeholder="خلاصه مکالمه..." rows="2" value={formData.conversation_summary || ''} onChange={(e) => setFormData({...formData, conversation_summary: e.target.value})} className="w-full border p-2 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                                <div className="absolute left-1 bottom-1"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, conversation_summary: (p.conversation_summary || '') + ' ' + text}))} /></div>
                            </div>
                        </div>

                        {/* Section 2: Meeting */}
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl space-y-2 border dark:border-slate-600">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-xs">۲. جلسه آنلاین</h4>
                            <div className="w-full">
                                 <DatePicker 
                                    calendar={persian} 
                                    locale={persian_fa} 
                                    value={formData.meeting_date || ''} 
                                    onChange={(date) => setFormData({...formData, meeting_date: date})}
                                    placeholder="تاریخ جلسه"
                                    inputClass="w-full border p-2 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none"
                                 />
                            </div>
                            <div className="relative">
                                <textarea placeholder="توضیحات جلسه..." rows="2" value={formData.meeting_note || ''} onChange={(e) => setFormData({...formData, meeting_note: e.target.value})} className="w-full border p-2 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                                <div className="absolute left-1 bottom-1"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, meeting_note: (p.meeting_note || '') + ' ' + text}))} /></div>
                            </div>
                        </div>

                        {/* Section 3: Followup */}
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl space-y-2 border dark:border-slate-600">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-xs">۳. پیگیری بعدی</h4>
                            <div className="w-full">
                                 <DatePicker 
                                    calendar={persian} 
                                    locale={persian_fa} 
                                    value={formData.followup_date || ''} 
                                    onChange={(date) => setFormData({...formData, followup_date: date})}
                                    placeholder="تاریخ پیگیری"
                                    inputClass="w-full border p-2 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none"
                                 />
                            </div>
                            <div className="relative">
                                <textarea placeholder="توضیحات پیگیری..." rows="2" value={formData.followup_note || ''} onChange={(e) => setFormData({...formData, followup_note: e.target.value})} className="w-full border p-2 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                                <div className="absolute left-1 bottom-1"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, followup_note: (p.followup_note || '') + ' ' + text}))} /></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Default Fields for other types */
                    <>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium">نام کاربری</label>
                            <UserSearchInput 
                                value={formData.username || ''} 
                                onChange={(val) => setFormData(prev => ({ ...prev, username: val }))} 
                                onSelect={(u) => setFormData(prev => ({ ...prev, username: u.username, phone_number: u.phone_number || prev.phone_number, instagram_username: u.instagram_username || prev.instagram_username }))}
                        usersData={allUsers}
                            />
                        </div>
                        
                        {/* Date field for reports (not profile, not onboarding) */}
                        {modalType !== 'profile' && (
                             <div className="space-y-1">
                                 <label className="text-xs text-gray-500 font-medium">تاریخ ثبت</label>
                                 <div className="w-full">
                                     <DatePicker 
                                        calendar={persian} 
                                        locale={persian_fa} 
                                        value={formData.date || new Date()} 
                                        onChange={(date) => setFormData({...formData, date: date})}
                                        inputClass="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                     />
                                 </div>
                             </div>
                        )}

                        {/* Common inputs */}
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder="شماره تماس" value={formData.phone_number || ''} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            <input placeholder="اینستاگرام" value={formData.instagram_username || ''} onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>

                        {modalType === 'profile' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="آیدی تلگرام" value={formData.telegram_id || ''} onChange={(e) => setFormData({...formData, telegram_id: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    <input placeholder="وبسایت" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                </div>
                                <textarea placeholder="بیوگرافی..." rows="3" value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full border p-3 rounded-xl text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </>
                        )}
                        
                        {/* Issue Specific */}
                        {modalType === 'issue' && (
                            <>
                                <select value={formData.status || 'باز'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="باز">باز</option><option value="در حال بررسی">در حال بررسی</option><option value="حل‌شده">حل‌شده</option></select>
                                <div className="relative">
                                    <textarea rows="3" placeholder="شرح مشکل..." value={formData.desc_text || ''} onChange={(e) => setFormData({ ...formData, desc_text: e.target.value })} className="w-full border p-3 rounded-xl text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, desc_text: (p.desc_text || '') + ' ' + text}))} /></div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <input type="checkbox" id="tech_review" checked={formData.technical_review || false} onChange={(e) => setFormData({...formData, technical_review: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                    <label htmlFor="tech_review" className="text-sm text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1"><Wrench size={14} className="text-gray-500"/> بررسی توسط تیم فنی</label>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-bold">اولویت</div>
                                <select value={formData.flag || ''} onChange={(e) => setFormData({...formData, flag: e.target.value})} className="border p-3 rounded-xl text-sm w-full mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="">عادی</option><option value="پیگیری مهم">پیگیری مهم</option><option value="پیگیری فوری">پیگیری فوری</option></select>
                            </>
                        )}
                        
                        {/* Feature Specific */}
                        {modalType === 'feature' && (
                            <>
                                <select value={formData.status || 'بررسی نشده'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="بررسی نشده">بررسی نشده</option><option value="در تحلیل">در تحلیل</option><option value="در توسعه">در توسعه</option><option value="انجام شد">انجام شد</option></select>
                                <input placeholder="عنوان فیچر" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                <div className="relative">
                                    <textarea rows="3" placeholder="توضیحات..." value={formData.desc_text || ''} onChange={(e) => setFormData({ ...formData, desc_text: e.target.value })} className="w-full border p-3 rounded-xl text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, desc_text: (p.desc_text || '') + ' ' + text}))} /></div>
                                </div>
                            </>
                        )}

                        {/* Meeting Form */}
                        {modalType === 'meeting' && (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-medium">تاریخ و زمان جلسه</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <DatePicker 
                                                calendar={persian} 
                                                locale={persian_fa} 
                                                value={formData.date || new Date()} 
                                                onChange={(date) => setFormData({...formData, date: date})}
                                                inputClass="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <input type="time" value={formData.meeting_time || ''} onChange={(e) => setFormData({...formData, meeting_time: e.target.value})} className="border p-3 rounded-xl text-sm w-24 outline-none focus:border-blue-500"/>
                                    </div>
                                </div>
                                <div className="relative">
                                    <textarea rows="2" placeholder="علت جلسه..." value={formData.reason || ''} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                                    <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, reason: (p.reason || '') + ' ' + text}))} /></div>
                                </div>
                                <div className="relative">
                                    <textarea rows="2" placeholder="نتیجه جلسه..." value={formData.result || ''} onChange={(e) => setFormData({ ...formData, result: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                                    <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, result: (p.result || '') + ' ' + text}))} /></div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input type="checkbox" id="meeting_held" checked={formData.held || false} onChange={(e) => setFormData({...formData, held: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                    <label htmlFor="meeting_held" className="text-sm text-gray-700 font-bold">جلسه برگزار شد</label>
                                </div>
                            </div>
                        )}

                        {/* Frozen & Refund simple forms */}
                        {(modalType === 'frozen' || modalType === 'refund') && (
                             <div className="relative">
                                 <textarea rows="3" placeholder="توضیحات..." value={formData.desc_text || formData.reason || ''} onChange={(e) => setFormData({ ...formData, [modalType === 'refund' ? 'reason' : 'desc_text']: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                                 <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => {
                                     const field = modalType === 'refund' ? 'reason' : 'desc_text';
                                     setFormData(p => ({...p, [field]: (p[field] || '') + ' ' + text}));
                                 }} /></div>
                             </div>
                        )}
                    </>
                )}

                <button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-blue-500 text-white p-3 rounded-xl font-bold hover:shadow-lg mt-4 text-sm">ذخیره</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
