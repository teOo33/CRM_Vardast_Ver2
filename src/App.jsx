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
  UserCheck,
  RefreshCw,
  Settings
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
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const appPassword = import.meta.env.VITE_APP_PASSWORD || '';

// Vardast Chat API Configuration
const VARDAST_API_BASE = 'https://apigw.vardast.chat/uaa/public';
const VARDAST_API_KEY = 'VdHRqM5x2h18QVj29298Ae3MZ6PG3f3-m6RJ6Yxeg1Q';

const INITIAL_FORM_DATA = {
  username: '', phone_number: '', instagram_username: '', telegram_id: '', website: '', bio: '', 
  subscription_status: '', desc_text: '', module: '', type: '', status: '', support: '', resolved_at: '',
  technical_note: '', cause: '', first_frozen_at: '', freeze_count: '',
  last_frozen_at: '', resolve_status: '', note: '', title: '', category: '',
  repeat_count: '', importance: '', internal_note: '', reason: '', duration: '',
  action: '', suggestion: '', can_return: '', sales_source: '', ops_note: '', flag: '', date: '',
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

// --- Vardast Chat API Service ---
class VardastChatService {
  constructor() {
    this.baseUrl = VARDAST_API_BASE;
    this.apiKey = VARDAST_API_KEY;
    this.channels = [];
    this.assistants = [];
    this.selectedChannelId = null;
    this.selectedAssistantId = null;
    this.contactId = this.getOrCreateContactId();
  }

  getOrCreateContactId() {
    let contactId = localStorage.getItem('vardast_contact_id');
    if (!contactId) {
      contactId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vardast_contact_id', contactId);
    }
    return contactId;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Vardast API Error:', error);
      throw error;
    }
  }

  // Get all available channels
  async getChannels() {
    try {
      const data = await this.request('/messenger/api/channel/');
      this.channels = data.items || data || [];
      return this.channels;
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      return [];
    }
  }

  // Get all available assistants
  async getAssistants() {
    try {
      const data = await this.request('/messenger/api/assistants/');
      this.assistants = data.items || data || [];
      return this.assistants;
    } catch (error) {
      console.error('Failed to fetch assistants:', error);
      return [];
    }
  }

  // Send message to assistant
  async sendMessage(message, channelId = null, assistantId = null) {
    const targetChannelId = channelId || this.selectedChannelId;
    
    if (!targetChannelId) {
      throw new Error('Channel ID is required. Please select a channel first.');
    }

    const payload = {
      message: message,
      channel_id: targetChannelId,
      contact_id: this.contactId
    };

    // assistant_id is optional - if not provided, uses channel's default assistant
    if (assistantId || this.selectedAssistantId) {
      payload.assistant_id = assistantId || this.selectedAssistantId;
    }

    const response = await this.request('/messenger/api/chat/public/process', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return response;
  }

  // Get chat history for current contact
  async getChatHistory(channelId = null, page = 1, size = 50) {
    const targetChannelId = channelId || this.selectedChannelId;
    
    if (!targetChannelId) {
      throw new Error('Channel ID is required');
    }

    const data = await this.request(
      `/messenger/api/chat/${targetChannelId}/${this.contactId}/?page=${page}&size=${size}`
    );
    
    return data;
  }

  setSelectedChannel(channelId) {
    this.selectedChannelId = channelId;
    localStorage.setItem('vardast_selected_channel', channelId);
  }

  setSelectedAssistant(assistantId) {
    this.selectedAssistantId = assistantId;
    localStorage.setItem('vardast_selected_assistant', assistantId);
  }

  loadSavedSelections() {
    this.selectedChannelId = localStorage.getItem('vardast_selected_channel');
    this.selectedAssistantId = localStorage.getItem('vardast_selected_assistant');
  }
}

// Create singleton instance
const vardastChat = new VardastChatService();

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

// Legacy Gemini AI call (kept for backward compatibility)
const callGeminiAI = async (prompt, isJson = false) => {
  if (!geminiApiKey) return alert('کلید هوش مصنوعی وارد نشده است.');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: isJson ? 'application/json' : 'text/plain' },
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error('AI Error:', error);
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
  const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600'];
  const colorIndex = safeName.length % colors.length;
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white flex-shrink-0`}>
      {safeName.charAt(0)}
    </div>
  );
};

// --- Components ---

const UserSearchInput = ({ value, onChange, onSelect, allUsers }) => {
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
    return allUsers.filter(u => 
      (u.username && u.username.toLowerCase().includes(lower)) ||
      (u.phone_number && u.phone_number.includes(lower)) ||
      (u.instagram_username && u.instagram_username.toLowerCase().includes(lower)) ||
      (u.telegram_id && u.telegram_id.toLowerCase().includes(lower))
    ).slice(0, 5); 
  }, [term, allUsers]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input 
          value={term}
          onChange={(e) => { setTerm(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="جستجوی نام کاربری، اینستاگرام، شماره یا تلگرام..."
          className="w-full border p-3 pl-10 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-sm"
        />
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-xl mt-1 border z-50 overflow-hidden">
          {filtered.map((u) => (
            <div 
              key={u.username} 
              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm flex items-center gap-3"
              onClick={() => {
                onChange(u.username);
                if (onSelect) onSelect(u);
                setOpen(false);
              }}
            >
              <UserAvatar name={u.username} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-700">{u.username}</span>
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
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-slate-100/50 rounded-2xl p-4 min-w-[280px] w-80 flex flex-col border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700 text-sm">{statusLabel}</h3>
                  <span className="bg-white px-2 py-0.5 rounded-lg text-xs font-mono text-gray-500 border">{getItemsByStatus(statusId).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {getItemsByStatus(statusId).map((item, index) => {
                    const isSLA = checkSLA(item);
                    return (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-3 rounded-xl shadow-sm border group hover:shadow-md transition relative ${isSLA ? 'border-red-400 animate-pulse-red' : 'border-white'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToProfile(item.username)}>
                                <UserAvatar name={item.username} size="sm" />
                                <span className="font-bold text-xs text-gray-800 truncate max-w-[100px]">{item.username}</span>
                              </div>
                              <button onClick={() => openModal(type, item)} className="text-gray-400 hover:text-blue-500"><Edit size={14}/></button>
                            </div>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-3">{item.desc_text || item.title}</p>
                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span className="font-mono">{formatDate(item.created_at)}</span>
                              {item.flag && <span className={`px-1.5 py-0.5 rounded font-bold border ${item.flag === 'پیگیری فوری' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>{item.flag}</span>}
                            </div>
                            {item.last_updated_by && (
                              <div className="mt-2 pt-2 border-t flex gap-1 items-center text-[9px] text-gray-400">
                                <Clock size={10}/> آپدیت: {item.last_updated_by} ({formatDate(item.last_updated_at)})
                              </div>
                            )}
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

const OnboardingTab = ({ onboardings, openModal, navigateToProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><GraduationCap size={24} className="text-indigo-500"/> ورود کاربران جدید</h2>
        <button onClick={() => openModal('onboarding')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold">
          <Plus size={16} /> ثبت کاربر جدید
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {onboardings.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 hover:shadow-md transition relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToProfile(item.username)}>
                <UserAvatar name={item.username} size="md" />
                <div>
                  <h3 className="font-bold text-gray-800">{item.username}</h3>
                  <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{item.phone_number}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => openModal('onboarding', item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Edit size={16}/></button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                <span>پیشرفت آنبوردینگ</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl mb-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400">تماس اولیه</span>
                <span className={`font-bold ${item.initial_call_status === 'پاسخ داد' ? 'text-emerald-600' : 'text-red-500'}`}>{item.initial_call_status || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400">وبسایت</span>
                <span className="font-bold text-gray-700">{item.has_website ? 'دارد' : 'ندارد'}</span>
              </div>
            </div>
            {item.conversation_summary && (
               <p className="text-xs text-gray-600 bg-indigo-50/50 p-3 rounded-xl italic line-clamp-2">{item.conversation_summary}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const HeatmapChart = ({ issues }) => {
  const data = useMemo(() => {
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    issues.forEach(i => {
      if (!i.created_at || !i.created_at.includes('T')) return;
      const date = new Date(i.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      grid[day][hour]++;
    });
    
    const flatData = [];
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    grid.forEach((hours, dayIdx) => {
      hours.forEach((count, hourIdx) => {
        if (count > 0) flatData.push({ day: days[dayIdx], hour: hourIdx, count, dayIdx });
      });
    });
    return flatData;
  }, [issues]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="hour" name="ساعت" unit="h" domain={[0, 23]} tickCount={24} />
        <YAxis type="category" dataKey="day" name="روز" allowDuplicatedCategory={false} />
        <ZAxis type="number" dataKey="count" range={[50, 500]} name="تعداد" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Issues" data={data} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`rgba(136, 132, 216, ${Math.min(entry.count / 5 + 0.2, 1)})`} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

const CohortChart = ({ onboardings }) => {
  const data = useMemo(() => {
    const cohorts = {};
    onboardings.forEach(u => {
      if (!u.created_at || !u.created_at.includes('T')) return;
      const date = new Date(u.created_at);
      const month = date.toLocaleDateString('fa-IR', { month: 'long' });
      if (!cohorts[month]) cohorts[month] = { month, total: 0, active: 0 };
      cohorts[month].total++;
      if (u.progress > 0) cohorts[month].active++;
    });
    return Object.values(cohorts).map(c => ({ ...c, retention: Math.round((c.active / c.total) * 100) }));
  }, [onboardings]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis unit="%" />
        <Tooltip />
        <Area type="monotone" dataKey="retention" stroke="#82ca9d" fill="#82ca9d" name="نرخ فعال‌سازی" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const UserProfile = ({ allUsers, issues, frozen, features, refunds, openModal, profileSearch, setProfileSearch }) => {
    const [search, setSearch] = useState(profileSearch || '');
    const [selectedUserStats, setSelectedUserStats] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        setSearch(profileSearch || '');
    }, [profileSearch]);

    useEffect(() => {
        const found = allUsers.find(u => u.username === search);
        setSelectedUserStats(found || null);
    }, [search, allUsers]);

    const handleSearch = (val) => {
        setSearch(val);
        setProfileSearch(val);
        if (val) {
            const lowerVal = val.toLowerCase();
            setSuggestions(allUsers.filter(u => 
                u.username.toLowerCase().includes(lowerVal) || 
                (u.phone_number && u.phone_number.includes(lowerVal)) || 
                (u.instagram_username && u.instagram_username.toLowerCase().includes(lowerVal))
            ).slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const userRecords = useMemo(() => {
        if (!search) return [];
        return [
            ...issues.map(x => ({ ...x, src: 'issue', date: x.created_at })),
            ...frozen.map(x => ({ ...x, src: 'frozen', date: x.frozen_at })),
            ...features.map(x => ({ ...x, src: 'feature', date: x.created_at })),
            ...refunds.map(x => ({ ...x, src: 'refund', date: x.requested_at }))
        ].filter(r => r.username === search)
         .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [search, issues, frozen, features, refunds]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white relative z-20">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2"><User size={20} className="text-blue-600"/> پروفایل کاربر</h2>
                    <button onClick={() => openModal('profile')} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-200 flex items-center gap-1 hover:bg-blue-700 transition">
                        <Plus size={14}/> پروفایل جدید
                    </button>
                </div>
                <div className="relative">
                    <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50/50 overflow-hidden focus-within:ring-2 ring-blue-100 transition-all">
                        <div className="pl-3 pr-4 text-gray-400"><Search size={18} /></div>
                        <input 
                            placeholder="جستجو (نام کاربری، شماره، اینستاگرام)..." 
                            value={search} 
                            className="w-full p-3 bg-transparent outline-none text-sm" 
                            onChange={(e) => handleSearch(e.target.value)} 
                        />
                    </div>
                    {suggestions.length > 0 && search !== suggestions[0]?.username && (
                        <div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-2xl mt-2 max-h-60 overflow-auto border z-50 p-1">
                            {suggestions.map((u) => (
                                <div key={u.username} onClick={() => handleSearch(u.username)} className="p-3 hover:bg-blue-50 cursor-pointer rounded-xl text-sm flex gap-3 items-center transition-colors">
                                    <UserAvatar name={u.username} size="sm" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700">{u.username}</span>
                                        <div className="flex gap-3 text-[10px] text-gray-400">
                                            {u.phone_number && <span>{u.phone_number}</span>}
                                            {u.instagram_username && <span>@{u.instagram_username}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedUserStats ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-l from-blue-50 to-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                        <UserAvatar name={selectedUserStats.username} size="lg" />
                        <div className="flex-1 text-center md:text-right z-10 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 mb-1">{selectedUserStats.username}</h2>
                                    {selectedUserStats.bio && <p className="text-gray-500 text-sm max-w-lg">{selectedUserStats.bio}</p>}
                                </div>
                                <button onClick={() => openModal('profile', selectedUserStats)} className="text-blue-600 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition mt-3 md:mt-0 flex gap-2 items-center">
                                    <Edit size={14}/> ویرایش پروفایل
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                {selectedUserStats.phone_number && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border text-sm text-gray-600 shadow-sm"><Phone size={14} className="text-emerald-500"/>{selectedUserStats.phone_number}</span>}
                                {selectedUserStats.instagram_username && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border text-sm text-gray-600 shadow-sm"><Instagram size={14} className="text-rose-500"/>{selectedUserStats.instagram_username}</span>}
                                {selectedUserStats.telegram_id && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border text-sm text-gray-600 shadow-sm"><Send size={14} className="text-sky-500"/>{selectedUserStats.telegram_id}</span>}
                                {selectedUserStats.website && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border text-sm text-gray-600 shadow-sm"><Globe size={14} className="text-indigo-500"/>{selectedUserStats.website}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onClick={() => openModal('issue', { username: selectedUserStats.username })} className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col items-center gap-2 group">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition"><AlertTriangle size={20}/></div>
                            <span className="text-xs font-bold text-gray-600">ثبت مشکل</span>
                        </button>
                         <button onClick={() => openModal('frozen', { username: selectedUserStats.username })} className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col items-center gap-2 group">
                            <div className="p-2 bg-sky-50 text-sky-600 rounded-full group-hover:scale-110 transition"><Snowflake size={20}/></div>
                            <span className="text-xs font-bold text-gray-600">ثبت فریز</span>
                        </button>
                         <button onClick={() => openModal('feature', { username: selectedUserStats.username })} className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col items-center gap-2 group">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-full group-hover:scale-110 transition"><Lightbulb size={20}/></div>
                            <span className="text-xs font-bold text-gray-600">ثبت فیچر</span>
                        </button>
                         <button onClick={() => openModal('refund', { username: selectedUserStats.username })} className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col items-center gap-2 group">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-full group-hover:scale-110 transition"><CreditCard size={20}/></div>
                            <span className="text-xs font-bold text-gray-600">ثبت بازگشت وجه</span>
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-white">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><History size={18} className="text-gray-500"/> تاریخچه فعالیت‌ها</h3>
                        {userRecords.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:right-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                {userRecords.map((r, i) => (
                                    <div key={i} className="relative pr-10">
                                        <div className={`absolute right-4 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                                            r.src === 'issue' ? 'bg-amber-400' : 
                                            r.src === 'frozen' ? 'bg-blue-400' : 
                                            r.src === 'feature' ? 'bg-purple-400' : 'bg-rose-400'
                                        }`}></div>
                                        <div className="bg-slate-50 border rounded-2xl p-4 hover:bg-white hover:shadow-md transition group">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-mono bg-white px-2 py-0.5 rounded border">{formatDate(r.date)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] ${
                                                        r.src === 'issue' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                                        r.src === 'frozen' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                        r.src === 'feature' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                                        'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                        {r.src === 'issue' ? 'مشکل فنی' : r.src === 'frozen' ? 'اکانت فریز' : r.src === 'feature' ? 'درخواست فیچر' : 'بازگشت وجه'}
                                                    </span>
                                                </div>
                                                <button onClick={() => openModal(r.src, r)} className="text-xs px-3 py-1.5 rounded-xl border bg-white hover:bg-blue-600 hover:text-white transition opacity-0 group-hover:opacity-100">ویرایش</button>
                                            </div>
                                            <div className="font-bold text-sm text-gray-800 mb-2">{r.desc_text || r.reason || r.title}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                    ['حل‌شده', 'انجام شد', 'رفع شد'].includes(r.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-gray-500'
                                                }`}>
                                                    وضعیت: {r.status || r.action || 'نامشخص'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
                                <History size={40} className="opacity-20"/>
                                <span className="text-sm">هیچ سابقه‌ای یافت نشد.</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                search && (
                    <div className="text-center py-20">
                        <User size={64} className="mx-auto text-gray-200 mb-4"/>
                        <p className="text-gray-400 text-sm">کاربری با این مشخصات یافت نشد.</p>
                        <button onClick={() => openModal('profile', { username: search })} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:scale-105 transition">
                            ساخت پروفایل جدید برای "{search}"
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

// --- NEW: AI Analysis Tab with Vardast Chat Integration ---
const AIAnalysisTab = ({ issues, onboardings, navigateToProfile }) => {
    const [aiQuery, setAiQuery] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    
    // Vardast API state
    const [channels, setChannels] = useState([]);
    const [assistants, setAssistants] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [selectedAssistant, setSelectedAssistant] = useState('');
    const [apiStatus, setApiStatus] = useState('loading'); // 'loading' | 'connected' | 'error'
    const [showSettings, setShowSettings] = useState(false);
    
    const chatContainerRef = useRef(null);

    // Initialize Vardast Chat
    useEffect(() => {
        initializeVardastChat();
    }, []);

    const initializeVardastChat = async () => {
        setApiStatus('loading');
        try {
            // Load saved selections
            vardastChat.loadSavedSelections();
            
            // Fetch channels and assistants
            const [fetchedChannels, fetchedAssistants] = await Promise.all([
                vardastChat.getChannels(),
                vardastChat.getAssistants()
            ]);
            
            setChannels(fetchedChannels);
            setAssistants(fetchedAssistants);
            
            // Set default selections
            if (vardastChat.selectedChannelId) {
                setSelectedChannel(vardastChat.selectedChannelId);
            } else if (fetchedChannels.length > 0) {
                setSelectedChannel(fetchedChannels[0].id);
                vardastChat.setSelectedChannel(fetchedChannels[0].id);
            }
            
            if (vardastChat.selectedAssistantId) {
                setSelectedAssistant(vardastChat.selectedAssistantId);
            } else if (fetchedAssistants.length > 0) {
                setSelectedAssistant(fetchedAssistants[0].id);
                vardastChat.setSelectedAssistant(fetchedAssistants[0].id);
            }
            
            setApiStatus('connected');
            
            // Load chat history if channel is selected
            if (vardastChat.selectedChannelId) {
                await loadChatHistory();
            }
        } catch (error) {
            console.error('Failed to initialize Vardast Chat:', error);
            setApiStatus('error');
        }
    };

    const loadChatHistory = async () => {
        try {
            const history = await vardastChat.getChatHistory();
            if (history && history.items) {
                const formattedMessages = history.items.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    isUser: !msg.ai_created,
                    timestamp: msg.timestamp
                })).reverse(); // Reverse to show oldest first
                setChatMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const handleChannelChange = (channelId) => {
        setSelectedChannel(channelId);
        vardastChat.setSelectedChannel(channelId);
        setChatMessages([]); // Clear messages when changing channel
        loadChatHistory();
    };

    const handleAssistantChange = (assistantId) => {
        setSelectedAssistant(assistantId);
        vardastChat.setSelectedAssistant(assistantId);
    };

    // Send message to Vardast AI
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;
        
        if (!selectedChannel) {
            alert('لطفا ابتدا یک کانال انتخاب کنید.');
            setShowSettings(true);
            return;
        }

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatLoading(true);

        // Add user message to chat
        setChatMessages(prev => [...prev, {
            id: Date.now(),
            text: userMessage,
            isUser: true,
            timestamp: new Date().toISOString()
        }]);

        try {
            const response = await vardastChat.sendMessage(userMessage, selectedChannel, selectedAssistant || null);
            
            if (response.status === 'success') {
                setChatMessages(prev => [...prev, {
                    id: response.message_id || Date.now() + 1,
                    text: response.response,
                    isUser: false,
                    timestamp: new Date().toISOString()
                }]);
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `خطا در ارتباط با هوش مصنوعی: ${error.message}`,
                isUser: false,
                isError: true,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Legacy analysis functions (using Gemini as fallback)
    const handleOnboardingAnalysis = async () => {
        setLoading(true);
        const prompt = `تحلیل روند آنبوردینگ کاربران: ${JSON.stringify(onboardings.slice(0, 30).map(u => ({ progress: u.progress, note: u.meeting_note || u.followup_note })))}. لطفا موانع اصلی پیشرفت و پیشنهادات برای افزایش نرخ تکمیل پروفایل را بگو.`;
        
        // Try Vardast first, fallback to Gemini
        if (selectedChannel) {
            try {
                const response = await vardastChat.sendMessage(prompt, selectedChannel, selectedAssistant);
                if (response.status === 'success') {
                    setAiResult(response.response);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.log('Vardast failed, falling back to Gemini');
            }
        }
        
        const res = await callGeminiAI(prompt);
        setAiResult(res || 'خطا در ارتباط با هوش مصنوعی');
        setLoading(false);
    };

    const handleGeneralAnalysis = async () => {
        setLoading(true);
        const prompt = `تحلیل کلی مشکلات اخیر: ${JSON.stringify(issues.slice(0, 50).map(i => ({ type: i.type, desc: i.desc_text })))}. لطفا مهمترین الگوها و پیشنهادات بهبود را بگو.`;
        
        // Try Vardast first, fallback to Gemini
        if (selectedChannel) {
            try {
                const response = await vardastChat.sendMessage(prompt, selectedChannel, selectedAssistant);
                if (response.status === 'success') {
                    setAiResult(response.response);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.log('Vardast failed, falling back to Gemini');
            }
        }
        
        const res = await callGeminiAI(prompt);
        setAiResult(res || 'خطا در ارتباط با هوش مصنوعی');
        setLoading(false);
    };

    const handleSemanticSearch = async () => {
        if (!aiQuery) return;
        setLoading(true);
        const prompt = `در بین این مشکلات، کدام‌ها به "${aiQuery}" مربوط می‌شوند؟ لیست کن: ${JSON.stringify(issues.slice(0, 50).map(i => ({ id: i.id, username: i.username, desc: i.desc_text })))}`;
        
        // Try Vardast first, fallback to Gemini
        if (selectedChannel) {
            try {
                const response = await vardastChat.sendMessage(prompt, selectedChannel, selectedAssistant);
                if (response.status === 'success') {
                    setAiResult(response.response);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.log('Vardast failed, falling back to Gemini');
            }
        }
        
        const res = await callGeminiAI(prompt);
        setAiResult(res || 'خطا در ارتباط با هوش مصنوعی');
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header with Status */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                                <Sparkles className="text-amber-300"/> دستیار هوشمند وردست
                            </h2>
                            <p className="text-indigo-100 text-sm">چت با هوش مصنوعی و تحلیل عمیق داده‌ها</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                                apiStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-200' :
                                apiStatus === 'loading' ? 'bg-amber-500/20 text-amber-200' :
                                'bg-red-500/20 text-red-200'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    apiStatus === 'connected' ? 'bg-emerald-400' :
                                    apiStatus === 'loading' ? 'bg-amber-400 animate-pulse' :
                                    'bg-red-400'
                                }`}></div>
                                {apiStatus === 'connected' ? 'متصل' : apiStatus === 'loading' ? 'در حال اتصال...' : 'قطع'}
                            </div>
                            <button 
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
                            >
                                <Settings size={18} />
                            </button>
                            <button 
                                onClick={initializeVardastChat}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
                                title="تلاش مجدد اتصال"
                            >
                                <RefreshCw size={18} className={apiStatus === 'loading' ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4 space-y-3">
                            <h4 className="font-bold text-sm mb-2">تنظیمات API</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-indigo-200 block mb-1">کانال (Channel)</label>
                                    <select 
                                        value={selectedChannel}
                                        onChange={(e) => handleChannelChange(e.target.value)}
                                        className="w-full bg-white/20 border border-white/20 rounded-xl p-2.5 text-sm text-white outline-none focus:border-white/40"
                                    >
                                        <option value="" className="text-gray-800">انتخاب کانال...</option>
                                        {channels.map(ch => (
                                            <option key={ch.id} value={ch.id} className="text-gray-800">
                                                {ch.name} ({ch.platform})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-indigo-200 block mb-1">اسیستنت (اختیاری)</label>
                                    <select 
                                        value={selectedAssistant}
                                        onChange={(e) => handleAssistantChange(e.target.value)}
                                        className="w-full bg-white/20 border border-white/20 rounded-xl p-2.5 text-sm text-white outline-none focus:border-white/40"
                                    >
                                        <option value="" className="text-gray-800">پیش‌فرض کانال</option>
                                        {assistants.map(ast => (
                                            <option key={ast.id} value={ast.id} className="text-gray-800">
                                                {ast.assistant_name} ({ast.model})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="text-[10px] text-indigo-200 mt-2">
                                Contact ID: {vardastChat.contactId}
                            </div>
                        </div>
                    )}

                    {/* Quick Analysis Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button onClick={handleGeneralAnalysis} disabled={loading} className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2">
                            {loading ? <Loader2 size={18} className="animate-spin"/> : <Activity size={18}/>}
                            تحلیل کلی وضعیت
                        </button>
                        <button onClick={handleOnboardingAnalysis} disabled={loading} className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg flex items-center gap-2 border border-indigo-400">
                            {loading ? <Loader2 size={18} className="animate-spin"/> : <GraduationCap size={18}/>}
                            تحلیل آنبوردینگ
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chat Interface */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <MessageSquare size={18} className="text-purple-500"/>
                            چت با هوش مصنوعی
                        </h3>
                        {selectedChannel && (
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">
                                {channels.find(c => c.id === selectedChannel)?.name || 'کانال انتخابی'}
                            </span>
                        )}
                    </div>
                    
                    {/* Chat Messages */}
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                    >
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <BrainCircuit size={48} className="mb-3 opacity-30" />
                                <p className="text-sm">سوال خود را بپرسید...</p>
                            </div>
                        ) : (
                            chatMessages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                        msg.isUser 
                                            ? 'bg-purple-600 text-white rounded-br-sm' 
                                            : msg.isError
                                                ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                    }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        <span className={`text-[10px] mt-1 block ${
                                            msg.isUser ? 'text-purple-200' : 'text-gray-400'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                                    <Loader2 size={20} className="animate-spin text-purple-500" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                                placeholder={selectedChannel ? "پیام خود را بنویسید..." : "ابتدا کانال را انتخاب کنید..."}
                                disabled={!selectedChannel || chatLoading}
                                className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 transition text-sm disabled:opacity-50"
                            />
                            <button 
                                onClick={sendChatMessage}
                                disabled={!selectedChannel || chatLoading || !chatInput.trim()}
                                className="bg-purple-600 text-white px-4 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {chatLoading ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Semantic Search & Results */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Search size={18}/> جستجوی معنایی در مشکلات</h3>
                        <div className="flex gap-2">
                            <input 
                                value={aiQuery} 
                                onChange={(e) => setAiQuery(e.target.value)}
                                placeholder="مثلا: کاربرانی که مشکل درگاه پرداخت داشتند..." 
                                className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 transition text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
                            />
                            <button onClick={handleSemanticSearch} disabled={loading} className="bg-purple-600 text-white px-4 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                                {loading ? <Loader2 size={20} className="animate-spin"/> : <ArrowRight size={20}/>}
                            </button>
                        </div>
                    </div>

                    {/* Analysis Result */}
                    {aiResult && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 animate-in fade-in slide-in-from-bottom-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-500" />
                                نتیجه تحلیل
                            </h4>
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                {aiResult}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
  useTailwind();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isConnected, setIsConnected] = useState(false);
  const [issues, setIssues] = useState([]);
  const [frozen, setFrozen] = useState([]);
  const [features, setFeatures] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [issueViewMode, setIssueViewMode] = useState('table');
  const [featureViewMode, setFeatureViewMode] = useState('table');

  const [isAuthed, setIsAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (!appPassword) return true;
    return localStorage.getItem('vardast_ops_authed') === '1';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [profileSearch, setProfileSearch] = useState('');

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!appPassword) { setIsAuthed(true); return; }
    if (passwordInput === appPassword) {
      setIsAuthed(true);
      localStorage.setItem('vardast_ops_authed', '1');
      setLoginError('');
    } else {
      setLoginError('رمز عبور اشتباه است.');
    }
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
      const { data: d1 } = await supabase.from('issues').select('*').order('id', { ascending: false });
      if (d1) setIssues(d1);
      const { data: d2 } = await supabase.from('frozen').select('*').order('id', { ascending: false });
      if (d2) setFrozen(d2);
      const { data: d3 } = await supabase.from('features').select('*').order('id', { ascending: false });
      if (d3) setFeatures(d3);
      const { data: d4 } = await supabase.from('refunds').select('*').order('id', { ascending: false });
      if (d4) setRefunds(d4);
      const { data: d5 } = await supabase.from('profiles').select('*').order('id', { ascending: false });
      if (d5) setProfiles(d5);
      const { data: d6 } = await supabase.from('onboardings').select('*').order('id', { ascending: false });
      if (d6) setOnboardings(d6);
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
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const allUsers = useMemo(() => {
    const map = {};
    profiles.forEach(p => { map[p.username] = { ...p, source: 'profile' }; });
    [...issues, ...frozen, ...features, ...refunds, ...onboardings].forEach(r => {
      if (!r.username) return;
      if (!map[r.username]) {
        map[r.username] = { 
          username: r.username, 
          phone_number: r.phone_number, 
          instagram_username: r.instagram_username,
          source: 'report' 
        };
      }
    });
    return Object.values(map);
  }, [profiles, issues, frozen, features, refunds, onboardings]);

  const analytics = useMemo(() => {
    const resolved = issues.filter((i) => i.status === 'حل‌شده').length;
    const total = issues.length;
    const ratio = total ? Math.round((resolved / total) * 100) : 0;
    return { solvedRatio: ratio, activeFrozen: frozen.filter((f) => f.status === 'فریز').length, refundCount: refunds.length };
  }, [issues, frozen, refunds]);

  const churnRisks = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIssues = issues.filter(i => {
        if (!i.created_at) return false;
        const date = parsePersianDate(i.created_at);
        return date && date >= thirtyDaysAgo;
    });

    const userCounts = {};
    recentIssues.forEach(i => {
      if (!userCounts[i.username]) userCounts[i.username] = { count: 0, issues: [] };
      userCounts[i.username].count += 1;
      userCounts[i.username].issues.push({ desc: i.desc_text, status: i.status });
    });
    return Object.entries(userCounts)
        .filter(([_, data]) => data.count > 3)
        .map(([username, data]) => ({ username, count: data.count, issues: data.issues }));
  }, [issues]);

  // Updated to use Vardast Chat
  const handleAiChurnAnalysis = async (user) => {
    setAiLoading(true);
    const prompt = `تحلیل خطر ریزش کاربر ${user.username} با ${user.count} گزارش در ۳۰ روز اخیر. لیست مشکلات: ${JSON.stringify(user.issues)}. لطفا خروجی JSON بده شامل: 
    1. summary: خلاصه مشکلات کاربر.
    2. anger_score: نمره خطر ریزش (۱ تا ۱۰).
    3. root_cause: علت اصلی.
    4. message: پیام پیشنهادی برای دلجویی.
    به وضعیت حل شدن یا نشدن مشکلات توجه کن.`;
    
    // Try Vardast Chat first
    if (vardastChat.selectedChannelId) {
        try {
            const response = await vardastChat.sendMessage(prompt);
            if (response.status === 'success') {
                setAiLoading(false);
                try { 
                    const data = JSON.parse(response.response); 
                    alert(`🔥 خطر ریزش: ${data.anger_score}/10\n📝 خلاصه: ${data.summary}\n🔍 علت: ${data.root_cause}\n💬 پیشنهاد: ${data.message}`); 
                } catch(e) { 
                    alert(response.response); 
                }
                return;
            }
        } catch (e) {
            console.log('Vardast failed, falling back to Gemini');
        }
    }
    
    // Fallback to Gemini
    const res = await callGeminiAI(prompt, true);
    setAiLoading(false);
    if (res) {
      try { const data = JSON.parse(res); alert(`🔥 خطر ریزش: ${data.anger_score}/10\n📝 خلاصه: ${data.summary}\n🔍 علت: ${data.root_cause}\n💬 پیشنهاد: ${data.message}`); }
      catch(e) { alert(res); }
    }
  };

  const chartData = useMemo(() => {
    const acc = {};
    issues.forEach((i) => { 
        const d = i.created_at ? (i.created_at.includes('T') ? i.created_at.split('T')[0] : i.created_at.split(' ')[0]) : 'نامشخص'; 
        acc[d] = (acc[d] || 0) + 1; 
    });
    return Object.keys(acc).map((d) => ({ date: d, count: acc[d] }));
  }, [issues]);

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const createdTimestamp = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(); 
    
    let table = '';
    const commonFields = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, flag: formData.flag || null };
    let payload = {};

    if (modalType === 'issue') {
      table = 'issues';
      payload = { ...commonFields, desc_text: formData.desc_text, module: formData.module, type: formData.type, status: formData.status || 'باز', support: formData.support, subscription_status: formData.subscription_status, resolved_at: formData.resolved_at, technical_note: formData.technical_note };
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
      payload = { 
        username: formData.username, 
        phone_number: formData.phone_number, 
        instagram_username: formData.instagram_username,
        telegram_id: formData.telegram_id,
        website: formData.website,
        bio: formData.bio
      };
      if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'onboarding') {
      table = 'onboardings';
      payload = {
        username: formData.username,
        phone_number: formData.phone_number,
        instagram_username: formData.instagram_username,
        telegram_id: formData.telegram_id,
        has_website: formData.has_website === 'true' || formData.has_website === true,
        progress: Number(formData.progress),
        initial_call_status: formData.initial_call_status,
        conversation_summary: formData.conversation_summary,
        call_date: formData.call_date,
        meeting_date: formData.meeting_date,
        meeting_note: formData.meeting_note,
        followup_date: formData.followup_date,
        followup_note: formData.followup_note
      };
      if (!isEdit) payload.created_at = createdTimestamp;
    }

    if (!supabase) return alert('دیتابیس متصل نیست.');
    let error = null;
    if (isEdit) {
      if (['issues', 'features'].includes(table)) {
         payload.last_updated_by = 'Admin';
         payload.last_updated_at = new Date().toISOString();
      }
      const res = await supabase.from(table).update(payload).eq('id', editingId);
      error = res.error;
      if (!error) {
        const updater = (prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r));
        if (table === 'issues') setIssues(updater);
        if (table === 'frozen') setFrozen(updater);
        if (table === 'features') setFeatures(updater);
        if (table === 'refunds') setRefunds(updater);
        if (table === 'profiles') setProfiles(updater);
        if (table === 'onboardings') setOnboardings(updater);
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
        last_updated_by: 'Admin',
        last_updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (!error) {
      if (table === 'issues') {
        setIssues(prev => prev.map(i => i.id.toString() === id ? { ...i, ...payload } : i));
      } else if (table === 'features') {
        setFeatures(prev => prev.map(f => f.id.toString() === id ? { ...f, ...payload } : f));
      }
    }
  };

  const openModal = (t, record = null) => {
    setModalType(t);
    if (record) { 
      setEditingId(record.id); 
      setFormData({ ...INITIAL_FORM_DATA, ...record }); 
    } else { 
      setEditingId(null); 
      setFormData({ ...INITIAL_FORM_DATA }); 
    }
    setIsModalOpen(true);
  };
  
  if (appPassword && !isAuthed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-l from-slate-100 to-white p-4" dir="rtl">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border">
          <h1 className="text-xl font-extrabold mb-4 text-center text-slate-800">ورود به داشبورد پشتیبانی</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="رمز عبور" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            {loginError && <div className="text-xs text-red-500 text-center">{loginError}</div>}
            <button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-sky-500 text-white rounded-xl py-2.5 text-sm font-bold">ورود</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#F3F4F6] overflow-hidden" dir="rtl">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} h-full bg-white/90 backdrop-blur-xl border-l border-gray-200 flex flex-col transition-all duration-300 overflow-hidden fixed md:static inset-y-0 right-0 z-50`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          {isSidebarOpen && <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-purple-600 text-xl">وردست</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl border mr-auto">{isSidebarOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
            { id: 'issues', label: 'مشکلات فنی', icon: AlertTriangle },
            { id: 'frozen', label: 'اکانت فریز', icon: Snowflake },
            { id: 'features', label: 'درخواست فیچر', icon: Lightbulb },
            { id: 'refunds', label: 'بازگشت وجه', icon: CreditCard },
            { id: 'onboarding', label: 'ورود کاربران', icon: GraduationCap },
            { id: 'profile', label: 'پروفایل کاربر', icon: User },
            { id: 'ai-analysis', label: 'دستیار هوشمند', icon: BrainCircuit }
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : 'text-slate-600 hover:bg-gray-50'}`}>
              <item.icon size={18} className="flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-8 py-6 min-h-full">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-white border rounded-xl shadow-sm text-gray-600"><Menu size={20} /></button>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">داشبورد پشتیبانی</h1>
            </div>
            <div className="text-xs text-slate-500 bg-white/60 px-3 py-1.5 rounded-full border">
              امروز {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })} - {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <section className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { title: 'نرخ حل مشکلات', value: `%${analytics.solvedRatio}`, color: 'from-emerald-500 to-teal-400', icon: CheckCircle2 },
                  { title: 'اکانت‌های فریز', value: analytics.activeFrozen, color: 'from-blue-500 to-indigo-400', icon: Snowflake },
                  { title: 'آنبوردینگ', value: onboardings.length, color: 'from-amber-500 to-orange-400', icon: GraduationCap },
                  { title: 'کل تیکت‌ها', value: issues.length, color: 'from-slate-700 to-slate-500', icon: Activity }
                ].map((card, idx) => (
                  <div key={idx} className="bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition">
                    <div className={`absolute -right-6 -top-6 p-4 rounded-full bg-gradient-to-br ${card.color} opacity-10 scale-150`}><card.icon size={50} /></div>
                    <span className="text-xs font-semibold text-gray-500 z-10">{card.title}</span>
                    <h3 className="text-3xl font-black text-slate-800 z-10">{card.value}</h3>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Churn Risk */}
                <div className="xl:col-span-1 bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col h-80">
                  <h4 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><AlertCircle size={14}/></span>
                    ریسک ریزش کاربر (۳۰ روز اخیر)
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {churnRisks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
                        <span className="text-xs">هیچ کاربری در خطر نیست!</span>
                      </div>
                    ) : churnRisks.map((user, idx) => (
                      <div key={idx} className="bg-white border border-red-50 p-3 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToProfile(user.username)}>
                            <UserAvatar name={user.username} size="sm"/>
                            <span className="font-bold text-sm text-gray-800">{user.username}</span>
                          </div>
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-red-100">{user.count} خطا</span>
                        </div>
                        <button onClick={() => handleAiChurnAnalysis(user)} className="w-full flex items-center justify-center gap-1 text-[10px] text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white border border-purple-100 px-3 py-1.5 rounded-lg transition">
                          {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                          تحلیل هوشمند
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics Charts */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
                   <div className="bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col">
                      <h4 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/>روند ثبت مشکلات</h4>
                      <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px'}} />
                            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col">
                      <h4 className="font-bold text-gray-700 text-sm mb-4">نرخ فعال‌سازی کاربران (Cohort)</h4>
                      <div className="flex-1 w-full"><CohortChart onboardings={onboardings} /></div>
                   </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'onboarding' && (
            <OnboardingTab onboardings={onboardings} openModal={openModal} navigateToProfile={navigateToProfile} />
          )}

          {activeTab === 'issues' && (
            <section className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setIssueViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${issueViewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><List size={16}/> جدول</button>
                  <button onClick={() => setIssueViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${issueViewMode === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button>
                </div>
                <button onClick={() => openModal('issue')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 flex items-center gap-2"><Plus size={16}/> ثبت مشکل</button>
              </div>
              {issueViewMode === 'kanban' ? (
                <div className="flex-1 overflow-hidden">
                  <KanbanBoard 
                    items={issues} 
                    onStatusChange={(id, status) => handleStatusChange(id, status, 'issues')} 
                    columns={{'باز': 'باز', 'در حال بررسی': 'در حال بررسی', 'حل‌شده': 'حل‌شده'}}
                    navigateToProfile={navigateToProfile}
                    openModal={openModal}
                    type="issue"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4">تاریخ</th><th className="p-4"></th></tr></thead>
                    <tbody>
                      {issues.map(row => (
                        <tr key={row.id} className={`border-b last:border-0 hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200' : ''}`}>
                          <td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td>
                          <td className="p-4 truncate max-w-xs">{row.desc_text}</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs border border-blue-100">{row.status}</span></td>
                          <td className="p-4 font-mono text-xs text-gray-400">{formatDate(row.created_at)}</td>
                          <td className="p-4 text-left"><button onClick={() => openModal('issue', row)} className="text-gray-400 hover:text-blue-600"><Edit size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'features' && (
            <section className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setFeatureViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${featureViewMode === 'table' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><List size={16}/> جدول</button>
                  <button onClick={() => setFeatureViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${featureViewMode === 'kanban' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button>
                </div>
                <button onClick={() => openModal('feature')} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 flex items-center gap-2"><Plus size={16}/> ثبت فیچر</button>
              </div>
              {featureViewMode === 'kanban' ? (
                <div className="flex-1 overflow-hidden">
                  <KanbanBoard 
                    items={features} 
                    onStatusChange={(id, status) => handleStatusChange(id, status, 'features')} 
                    columns={{'بررسی نشده': 'بررسی نشده', 'در تحلیل': 'در تحلیل', 'در توسعه': 'در توسعه', 'انجام شد': 'انجام شد'}}
                    navigateToProfile={navigateToProfile}
                    openModal={openModal}
                    type="feature"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">عنوان</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4"></th></tr></thead>
                    <tbody>
                      {features.map(row => (
                        <tr key={row.id} className={`border-b last:border-0 hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200' : ''}`}>
                          <td className="p-4 font-bold cursor-pointer hover:text-purple-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td>
                          <td className="p-4 font-bold">{row.title}</td>
                          <td className="p-4 truncate max-w-xs">{row.desc_text}</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs border border-purple-100">{row.status}</span></td>
                          <td className="p-4 text-left"><button onClick={() => openModal('feature', row)} className="text-gray-400 hover:text-purple-600"><Edit size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'profile' && (
            <UserProfile 
              allUsers={allUsers} 
              issues={issues} 
              frozen={frozen} 
              features={features} 
              refunds={refunds} 
              openModal={openModal} 
              profileSearch={profileSearch}
              setProfileSearch={setProfileSearch}
            />
          )}

          {activeTab === 'ai-analysis' && (
            <AIAnalysisTab issues={issues} onboardings={onboardings} navigateToProfile={navigateToProfile} />
          )}

          {/* Simple Tables for Frozen and Refunds */}
          {['frozen', 'refunds'].includes(activeTab) && (
            <div className="bg-white rounded-2xl border overflow-hidden p-6">
                <div className="flex justify-between mb-4">
                    <h2 className="font-bold text-lg">{activeTab === 'frozen' ? 'اکانت‌های فریز شده' : 'درخواست‌های بازگشت وجه'}</h2>
                    <button onClick={() => openModal(activeTab === 'frozen' ? 'frozen' : 'refund')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={16}/></button>
                </div>
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4"></th></tr></thead>
                    <tbody>
                        {(activeTab === 'frozen' ? frozen : refunds).map(row => (
                            <tr key={row.id} className={`border-b hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200' : ''}`}>
                                <td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td>
                                <td className="p-4">{row.desc_text || row.reason}</td>
                                <td className="p-4">{row.status || row.action}</td>
                                <td className="p-4"><button onClick={() => openModal(activeTab === 'frozen' ? 'frozen' : 'refund', row)}><Edit size={16} className="text-gray-400"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-base text-gray-800">
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
                            allUsers={allUsers} 
                        />
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">درصد پیشرفت ({formData.progress}%)</label>
                            <input type="range" min="0" max="100" step="5" value={formData.progress || 0} onChange={(e) => setFormData({...formData, progress: e.target.value})} className="w-full accent-indigo-600 cursor-pointer"/>
                        </div>

                        <select value={formData.has_website || 'false'} onChange={(e) => setFormData({...formData, has_website: e.target.value})} className="border p-3 rounded-xl text-sm w-full"><option value="false">وبسایت ندارد</option><option value="true">وبسایت دارد</option></select>

                        {/* Section 1: Call */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                            <h4 className="font-bold text-gray-700 text-xs">۱. تماس اولیه</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={formData.initial_call_status || ''} onChange={(e) => setFormData({...formData, initial_call_status: e.target.value})} className="border p-2 rounded-lg text-xs w-full"><option value="">وضعیت...</option><option value="پاسخ داد">پاسخ داد</option><option value="پاسخ نداد">پاسخ نداد</option><option value="رد تماس">رد تماس</option></select>
                                <input type="text" placeholder="تاریخ (۱۴۰۳/...)" value={formData.call_date || ''} onChange={(e) => setFormData({...formData, call_date: e.target.value})} className="border p-2 rounded-lg text-xs"/>
                            </div>
                            <textarea placeholder="خلاصه مکالمه..." rows="2" value={formData.conversation_summary || ''} onChange={(e) => setFormData({...formData, conversation_summary: e.target.value})} className="w-full border p-2 rounded-lg text-xs"/>
                        </div>

                        {/* Section 2: Meeting */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                            <h4 className="font-bold text-gray-700 text-xs">۲. جلسه آنلاین</h4>
                            <input type="text" placeholder="تاریخ جلسه" value={formData.meeting_date || ''} onChange={(e) => setFormData({...formData, meeting_date: e.target.value})} className="border p-2 rounded-lg text-xs w-full"/>
                            <textarea placeholder="توضیحات جلسه..." rows="2" value={formData.meeting_note || ''} onChange={(e) => setFormData({...formData, meeting_note: e.target.value})} className="w-full border p-2 rounded-lg text-xs"/>
                        </div>

                        {/* Section 3: Followup */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                            <h4 className="font-bold text-gray-700 text-xs">۳. پیگیری بعدی</h4>
                            <input type="text" placeholder="تاریخ فالوآپ" value={formData.followup_date || ''} onChange={(e) => setFormData({...formData, followup_date: e.target.value})} className="border p-2 rounded-lg text-xs w-full"/>
                            <textarea placeholder="توضیحات پیگیری..." rows="2" value={formData.followup_note || ''} onChange={(e) => setFormData({...formData, followup_note: e.target.value})} className="w-full border p-2 rounded-lg text-xs"/>
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
                                allUsers={allUsers}
                            />
                        </div>
                        
                        {/* Date field for reports (not profile, not onboarding) */}
                        {modalType !== 'profile' && (
                             <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">تاریخ ثبت</label><input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border p-3 rounded-xl text-sm" /></div>
                        )}

                        {/* Common inputs */}
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder="شماره تماس" value={formData.phone_number || ''} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="border p-3 rounded-xl text-sm w-full" />
                            <input placeholder="اینستاگرام" value={formData.instagram_username || ''} onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })} className="border p-3 rounded-xl text-sm w-full" />
                        </div>

                        {modalType === 'profile' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="آیدی تلگرام" value={formData.telegram_id || ''} onChange={(e) => setFormData({...formData, telegram_id: e.target.value})} className="border p-3 rounded-xl text-sm w-full" />
                                    <input placeholder="وبسایت" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} className="border p-3 rounded-xl text-sm w-full" />
                                </div>
                                <textarea placeholder="بیوگرافی..." rows="3" value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                            </>
                        )}
                        
                        {/* Issue Specific */}
                        {modalType === 'issue' && (
                            <>
                                <select value={formData.status || 'باز'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full"><option value="باز">باز</option><option value="در حال بررسی">در حال بررسی</option><option value="حل‌شده">حل‌شده</option></select>
                                <textarea rows="3" placeholder="شرح مشکل..." value={formData.desc_text || ''} onChange={(e) => setFormData({ ...formData, desc_text: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                                <div className="mt-2 text-xs text-gray-500 font-bold">اولویت</div>
                                <select value={formData.flag || ''} onChange={(e) => setFormData({...formData, flag: e.target.value})} className="border p-3 rounded-xl text-sm w-full mt-1"><option value="">عادی</option><option value="پیگیری مهم">پیگیری مهم</option><option value="پیگیری فوری">پیگیری فوری</option></select>
                            </>
                        )}
                        
                        {/* Feature Specific */}
                        {modalType === 'feature' && (
                            <>
                                <select value={formData.status || 'بررسی نشده'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full"><option value="بررسی نشده">بررسی نشده</option><option value="در تحلیل">در تحلیل</option><option value="در توسعه">در توسعه</option><option value="انجام شد">انجام شد</option></select>
                                <input placeholder="عنوان فیچر" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="border p-3 rounded-xl text-sm w-full" />
                                <textarea rows="3" placeholder="توضیحات..." value={formData.desc_text || ''} onChange={(e) => setFormData({ ...formData, desc_text: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                            </>
                        )}

                        {/* Frozen & Refund simple forms */}
                        {(modalType === 'frozen' || modalType === 'refund') && (
                             <textarea rows="3" placeholder="توضیحات..." value={formData.desc_text || formData.reason || ''} onChange={(e) => setFormData({ ...formData, [modalType === 'refund' ? 'reason' : 'desc_text']: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
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
