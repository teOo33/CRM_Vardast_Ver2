import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, differenceInHours, differenceInDays, parseISO, subDays, subYears, isAfter, isBefore, isValid } from 'date-fns';
import jalaali from 'jalaali-js';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// آیکون‌ها
import {
  LayoutDashboard, AlertTriangle, Snowflake, Lightbulb, CreditCard, Plus, X, Menu, User, Sparkles, Loader2,
  Download, Phone, Instagram, Search, Activity, TrendingUp, AlertCircle, CheckCircle2, Globe, Send, Edit,
  History, BrainCircuit, MessageSquare, ArrowRight, GraduationCap, List, Columns, Clock, Calendar,
  Filter, Maximize2, Bell, Mic, MicOff, Wrench, Users, Moon, Sun, LogOut
} from 'lucide-react';

// نمودارها
import {
  XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, YAxis, CartesianGrid
} from 'recharts';

// --- ایمپورت ماژول‌های شما ---
import BackgroundBlobs from './components/layout/BackgroundBlobs';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ModalManager from './components/modals/ModalManager';
import IssuesTab from './components/tabs/IssuesTab';
import FeaturesTab from './components/tabs/FeaturesTab';
import SimpleTableTab from './components/tabs/SimpleTableTab';

// --- تنظیمات محیطی ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const appPassword = import.meta.env.VITE_APP_PASSWORD || '';
const ALLOWED_USERS = ['milad', 'aliH', 'amirreza', 'mahta', 'sajad', 'yara', 'hamid', 'mojtaba', 'farhad'];
const VARDAST_API_KEY = "DVmo0Hi2NHQE3kLx-Q7V3NWZBophr_kKDlTXrj7bdtQ";
const VARDAST_CHANNEL_ID = "a5211d3f-f59a-4a0e-b604-dabef603810c"; 
const VARDAST_BASE_URL = "https://apigw.vardast.chat/uaa/public";

// مقادیر اولیه فرم
const INITIAL_FORM_DATA = {
  username: '', phone_number: '', instagram_username: '', telegram_id: '', website: '', bio: '', 
  subscription_status: '', desc_text: '', module: '', type: '', status: '', support: '', resolved_at: '',
  technical_note: '', cause: '', first_frozen_at: '', freeze_count: '',
  last_frozen_at: '', resolve_status: '', note: '', title: '', category: '',
  repeat_count: '', importance: '', internal_note: '', reason: '', duration: '',
  action: '', suggestion: '', can_return: '', sales_source: '', ops_note: '', flag: '', date: '',
  technical_review: false, created_by: '', history: [],
  has_website: false, progress: 0, initial_call_status: '', conversation_summary: '', call_date: '', meeting_date: '', meeting_note: '', followup_date: '', followup_note: '',
  meeting_time: '', result: '', held: false
};

// --- هوک‌ها و توابع کمکی ---
const useTailwind = () => {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => { if (window.tailwind) window.tailwind.config = { darkMode: 'class' }; };
      document.head.appendChild(script);
    }
  }, []);
};

let supabase;
try { if (supabaseUrl && supabaseUrl.startsWith('http')) supabase = createClient(supabaseUrl, supabaseKey); } catch (e) { console.error('Supabase Error:', e); }

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return isValid(d) ? d.toLocaleDateString('fa-IR') : String(dateStr);
  } catch { return String(dateStr); }
};

const checkSLA = (item) => {
  if (!item?.created_at) return false;
  if (item.flag !== 'پیگیری فوری') return false;
  if (!['باز', 'بررسی نشده'].includes(item.status)) return false;
  try { return differenceInHours(new Date(), new Date(item.created_at)) >= 2; } catch { return false; }
};

const normalizeDate = (item) => {
    const field = item.created_at || item.frozen_at || item.requested_at || item.date;
    if (!field) return null;
    const d = new Date(field);
    return isValid(d) ? d : null;
};

const filterDataByTime = (data, range, customRange) => {
    if (!data) return [];
    if (!range && !customRange) return data;
    const now = new Date();
    let start = null, end = now;
    if (customRange?.length === 2) {
        start = customRange[0].toDate();
        end = customRange[1].toDate();
        end.setHours(23, 59, 59);
    } else {
        switch (range) {
            case '1d': start = subDays(now, 1); break;
            case '7d': start = subDays(now, 7); break;
            case '30d': start = subDays(now, 30); break;
            case '1y': start = subYears(now, 1); break;
            default: return data;
        }
    }
    return data.filter(item => {
        const d = normalizeDate(item);
        return d && isAfter(d, start) && isBefore(d, end);
    });
};

// --- کامپوننت‌های کمکی (Shared Components) ---
// این‌ها باید تعریف شوند تا به فایل‌های ماژولار پاس داده شوند
const UserAvatar = ({ name, size = 'md' }) => {
    const safeName = name || '?';
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600'];
    const idx = safeName.length % colors.length;
    const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
    return <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[idx]} text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white flex-shrink-0`}>{safeName.charAt(0)}</div>;
};

const VoiceRecorder = ({ onTranscript }) => {
    const [isRec, setIsRec] = useState(false);
    const start = () => {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) return alert('مرورگر پشتیبانی نمی‌کند');
        const rec = new Speech();
        rec.lang = 'fa-IR';
        rec.onstart = () => setIsRec(true);
        rec.onend = () => setIsRec(false);
        rec.onresult = (e) => onTranscript(e.results[0][0].transcript);
        rec.start();
    };
    return <button type="button" onClick={start} className={`p-2 rounded-full transition ${isRec ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}><MicOff size={16}/></button>;
};

const FlagFilter = ({ selectedFlags, onChange }) => {
    const toggle = (f) => onChange(selectedFlags.includes(f) ? selectedFlags.filter(x => x !== f) : [...selectedFlags, f]);
    return (
        <div className="flex gap-2 items-center text-xs">
            <span className="text-gray-400 font-medium">فیلتر:</span>
            <button onClick={() => toggle('پیگیری فوری')} className={`px-2 py-1 rounded-lg border ${selectedFlags.includes('پیگیری فوری') ? 'bg-red-100 text-red-700' : 'bg-white'}`}>فوری</button>
            <button onClick={() => toggle('technical_review')} className={`px-2 py-1 rounded-lg border ${selectedFlags.includes('technical_review') ? 'bg-indigo-100 text-indigo-700' : 'bg-white'}`}>فنی</button>
        </div>
    );
};

const KanbanBoard = ({ items, onStatusChange, columns, navigateToProfile, openModal, type }) => {
    const onDragEnd = (res) => {
        if (!res.destination) return;
        if (res.source.droppableId !== res.destination.droppableId) onStatusChange(res.draggableId, res.destination.droppableId);
    };
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                {Object.entries(columns).map(([id, label]) => (
                    <Droppable key={id} droppableId={id}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 min-w-[280px] w-80 border dark:border-slate-700">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4">{label} <span className="bg-white dark:bg-slate-700 px-2 rounded text-xs">{items.filter(i => i.status === id).length}</span></h3>
                                <div className="space-y-3">
                                    {items.filter(i => i.status === id).map((item, idx) => (
                                        <Draggable key={item.id} draggableId={String(item.id)} index={idx}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm border ${checkSLA(item) ? 'border-red-400 animate-pulse' : 'border-white dark:border-slate-600'}`}>
                                                    <div className="flex justify-between mb-2">
                                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username} size="sm"/><span className="font-bold text-xs dark:text-white">{item.username}</span></div>
                                                        <button onClick={() => openModal(type, item)}><Edit size={14} className="text-gray-400"/></button>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{item.desc_text || item.title}</p>
                                                    <div className="mt-2 text-[10px] text-gray-400">{formatDate(item.created_at)}</div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
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

const UserSearchInput = ({ value, onChange, onSelect, allUsers }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <input value={value || ''} onChange={e => { onChange(e.target.value); setOpen(true); }} placeholder="جستجو..." className="w-full border p-3 pl-10 rounded-xl outline-none text-sm dark:bg-slate-700 dark:text-white" />
            <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
            {open && value && (
                <div className="absolute top-full w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl mt-1 z-50 max-h-48 overflow-auto">
                    {(allUsers || []).filter(u => u.username?.includes(value)).slice(0, 5).map(u => (
                        <div key={u.username} onClick={() => { onChange(u.username); if (onSelect) onSelect(u); setOpen(false); }} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer text-sm flex gap-2 items-center">
                            <UserAvatar name={u.username} size="sm" />
                            <span className="dark:text-white">{u.username}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- کامپوننت‌های تب‌هایی که هنوز فایل جدا ندارند (برای جلوگیری از حذف شدن) ---
const DashboardTab = ({ analytics, filteredOnboardings, filteredIssues, followUpList, churnRisks, navigateToProfile, handleDismissFollowUp, chartData }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[{ t: 'نرخ حل', v: `%${analytics.solvedRatio}`, c: 'emerald' }, { t: 'فریز', v: analytics.activeFrozen, c: 'blue' }, { t: 'آنبوردینگ', v: filteredOnboardings.length, c: 'amber' }, { t: 'تیکت‌ها', v: filteredIssues.length, c: 'slate' }].map((x, i) => (
                <div key={i} className={`bg-white/70 dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-${x.c}-100 flex flex-col h-32 justify-between`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{x.t}</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{x.v}</h3>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             <div className="bg-white/70 dark:bg-slate-800 p-5 rounded-2xl h-64 overflow-y-auto custom-scrollbar">
                <h4 className="font-bold text-sm mb-4 dark:text-white">پیگیری‌های مورد نیاز</h4>
                {followUpList.map((item, i) => (
                    <div key={i} className="flex justify-between items-center mb-3 bg-white dark:bg-slate-700 p-2 rounded-xl border dark:border-slate-600">
                        <div className="flex gap-2 items-center">
                            <UserAvatar name={item.username} size="sm"/>
                            <div>
                                <div className="text-sm font-bold dark:text-white">{item.username}</div>
                                <div className="text-[10px] text-gray-500 line-clamp-1">{item.issue.desc_text}</div>
                            </div>
                        </div>
                        <button onClick={() => handleDismissFollowUp(item.username)}><CheckCircle2 size={16} className="text-gray-400 hover:text-green-500"/></button>
                    </div>
                ))}
             </div>
             <div className="xl:col-span-2 bg-white/70 dark:bg-slate-800 p-5 rounded-2xl h-64">
                <h4 className="font-bold text-sm mb-4 dark:text-white">روند ثبت مشکلات</h4>
                <div className="h-full pb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}><XAxis dataKey="date" /><Tooltip /><Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1}/></AreaChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </div>
    </div>
);

const MeetingsTab = ({ meetings, openModal, navigateToProfile }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <h2 className="font-bold text-lg dark:text-white flex gap-2"><Users className="text-teal-500"/> جلسات تیم</h2>
            <button onClick={() => openModal('meeting')} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex gap-2"><Plus size={16}/> ثبت جلسه</button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border dark:border-slate-700">
            <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300"><tr><th className="p-4">زمان</th><th className="p-4">کاربر</th><th className="p-4">علت</th><th className="p-4">وضعیت</th><th className="p-4"></th></tr></thead>
                <tbody className="divide-y dark:divide-slate-700">
                    {meetings.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{formatDate(m.date)} {m.meeting_time}</td>
                            <td className="p-4 font-bold dark:text-white cursor-pointer" onClick={() => navigateToProfile(m.username)}>{m.username}</td>
                            <td className="p-4 truncate max-w-xs dark:text-gray-300">{m.reason}</td>
                            <td className="p-4">{m.held ? <span className="bg-green-100 text-green-700 px-2 rounded text-xs">برگزار شد</span> : <span className="bg-gray-100 text-gray-500 px-2 rounded text-xs">در انتظار</span>}</td>
                            <td className="p-4"><button onClick={() => openModal('meeting', m)}><Edit size={16} className="text-gray-400"/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const OnboardingTab = ({ onboardings, openModal, navigateToProfile }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <h2 className="font-bold text-lg dark:text-white flex gap-2"><GraduationCap className="text-indigo-500"/> آنبوردینگ</h2>
            <button onClick={() => openModal('onboarding')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex gap-2"><Plus size={16}/> ثبت جدید</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {onboardings.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-indigo-50 dark:border-slate-700">
                    <div className="flex justify-between mb-4">
                        <div className="flex gap-3 items-center cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username}/><h3 className="font-bold dark:text-white">{item.username}</h3></div>
                        <button onClick={() => openModal('onboarding', item)}><Edit size={16} className="text-gray-400"/></button>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 flex justify-between"><span>پیشرفت</span><span>{item.progress}%</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4"><div className="bg-indigo-500 h-2 rounded-full" style={{width: `${item.progress}%`}}></div></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 p-2 rounded">{item.conversation_summary || 'بدون توضیح'}</p>
                </div>
            ))}
        </div>
    </div>
);

// --- APP Main Component ---
export default function App() {
  useTailwind();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Data States
  const [issues, setIssues] = useState([]);
  const [frozen, setFrozen] = useState([]);
  const [features, setFeatures] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // Filters & UI States
  const [globalTimeFilter, setGlobalTimeFilter] = useState(null);
  const [globalCustomRange, setGlobalCustomRange] = useState(null);
  const [tabTimeFilter, setTabTimeFilter] = useState(null);
  const [tabCustomRange, setTabCustomRange] = useState(null);
  const [flagFilter, setFlagFilter] = useState([]);
  const [issueViewMode, setIssueViewMode] = useState('table');
  const [featureViewMode, setFeatureViewMode] = useState('table');
  const [profileSearch, setProfileSearch] = useState('');
  
  // Auth
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem('vardast_ops_authed') === '1' && !!localStorage.getItem('vardast_ops_user'));
  const [loginStep, setLoginStep] = useState('username');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('vardast_ops_user') || '');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);

  const [dismissedFollowUps, setDismissedFollowUps] = useState(() => JSON.parse(localStorage.getItem('dismissedFollowUps') || '[]'));

  // --- Auth Handlers ---
  const handleUsernameSubmit = async (e) => {
      e.preventDefault();
      if (!ALLOWED_USERS.includes(loginUsername)) return setLoginError('دسترسی ندارید');
      if (!supabase) return setLoginStep('password');
      const { data } = await supabase.from('users').select('*').eq('username', loginUsername).single();
      setLoginStep(data?.password ? 'password' : 'set-password');
  };

  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (!supabase) { finishLogin(); return; }
      if (loginStep === 'set-password') {
          await supabase.from('users').upsert({ username: loginUsername, password: loginPassword });
          finishLogin();
      } else {
          const { data } = await supabase.from('users').select('password').eq('username', loginUsername).single();
          if (data?.password === loginPassword) finishLogin(); else setLoginError('رمز اشتباه است');
      }
  };

  const finishLogin = () => {
      setIsAuthed(true); setLoggedInUser(loginUsername);
      localStorage.setItem('vardast_ops_authed', '1'); localStorage.setItem('vardast_ops_user', loginUsername);
  };

  const handleLogout = () => {
      localStorage.removeItem('vardast_ops_authed'); localStorage.removeItem('vardast_ops_user');
      setIsAuthed(false); setLoginUsername(''); setLoginPassword(''); setLoginStep('username');
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!supabase) return;
    const fetchAll = async () => {
        const { data: d1 } = await supabase.from('issues').select('*').order('id', { ascending: false }); if(d1) setIssues(d1);
        const { data: d2 } = await supabase.from('frozen').select('*').order('id', { ascending: false }); if(d2) setFrozen(d2);
        const { data: d3 } = await supabase.from('features').select('*').order('id', { ascending: false }); if(d3) setFeatures(d3);
        const { data: d4 } = await supabase.from('refunds').select('*').order('id', { ascending: false }); if(d4) setRefunds(d4);
        const { data: d5 } = await supabase.from('profiles').select('*').order('id', { ascending: false }); if(d5) setProfiles(d5);
        const { data: d6 } = await supabase.from('onboardings').select('*').order('id', { ascending: false }); if(d6) setOnboardings(d6);
        const { data: d7 } = await supabase.from('meetings').select('*').order('id', { ascending: false }); if(d7) setMeetings(d7);
    };
    fetchAll();
    // Subscribe to changes (simplified)
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchAll()).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // --- Derived Data & Filtering ---
  const getFiltered = (data, isGlobal) => filterDataByTime(data, isGlobal ? globalTimeFilter : tabTimeFilter, isGlobal ? globalCustomRange : tabCustomRange);
  
  const filteredIssues = useMemo(() => {
      let data = getFiltered(issues, activeTab === 'dashboard');
      if (activeTab === 'issues' && flagFilter.length > 0) {
          data = data.filter(i => flagFilter.some(f => i.flag === f || (f === 'technical_review' && i.technical_review)));
      }
      return data;
  }, [issues, globalTimeFilter, tabTimeFilter, flagFilter, activeTab]);
  
  const filteredOnboardings = useMemo(() => getFiltered(onboardings, activeTab === 'dashboard'), [onboardings, globalTimeFilter, tabTimeFilter, activeTab]);
  const filteredFeatures = useMemo(() => getFiltered(features, activeTab === 'dashboard'), [features, globalTimeFilter, tabTimeFilter, activeTab]);
  const filteredMeetings = useMemo(() => getFiltered(meetings, activeTab === 'dashboard'), [meetings, globalTimeFilter, tabTimeFilter, activeTab]);
  const filteredFrozen = useMemo(() => getFiltered(frozen, activeTab === 'dashboard'), [frozen, globalTimeFilter, tabTimeFilter, activeTab]);
  const filteredRefunds = useMemo(() => getFiltered(refunds, activeTab === 'dashboard'), [refunds, globalTimeFilter, tabTimeFilter, activeTab]);

  // Analytics Logic
  const analytics = useMemo(() => ({
      solvedRatio: filteredIssues.length ? Math.round((filteredIssues.filter(i => i.status === 'حل‌شده').length / filteredIssues.length) * 100) : 0,
      activeFrozen: filteredFrozen.filter(f => f.status === 'فریز').length,
      refundCount: filteredRefunds.length
  }), [filteredIssues, filteredFrozen, filteredRefunds]);

  const followUpList = useMemo(() => {
      const now = new Date();
      return issues
          .filter(i => !dismissedFollowUps.includes(i.username))
          .map(i => ({ ...i, days: differenceInDays(now, normalizeDate(i)) }))
          .filter(i => i.days >= 7 && i.days <= 12)
          .slice(0, 10);
  }, [issues, dismissedFollowUps]);

  const churnRisks = useMemo(() => {
      const counts = {};
      filteredIssues.forEach(i => { counts[i.username] = (counts[i.username] || 0) + 1; });
      return Object.entries(counts).filter(([_, c]) => c > 3).map(([u, c]) => ({ username: u, count: c }));
  }, [filteredIssues]);

  const chartData = useMemo(() => {
      const acc = {};
      filteredIssues.forEach(i => {
          const d = i.created_at ? format(new Date(i.created_at), 'yyyy-MM-dd') : 'N/A';
          acc[d] = (acc[d] || 0) + 1;
      });
      return Object.entries(acc).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
  }, [filteredIssues]);

  const allUsersList = useMemo(() => {
      const map = {};
      profiles.forEach(p => map[p.username] = p);
      issues.forEach(i => { if(!map[i.username]) map[i.username] = { username: i.username, phone_number: i.phone_number }; });
      return Object.values(map);
  }, [profiles, issues]);

  // --- Handlers ---
  const handleSave = async (e) => {
      e.preventDefault();
      let table = modalType === 'issue' ? 'issues' : modalType === 'meeting' ? 'meetings' : modalType + 's';
      if (modalType === 'frozen') table = 'frozen'; 
      if (modalType === 'profile') table = 'profiles';
      
      const payload = { ...formData, last_updated_by: loggedInUser, last_updated_at: new Date().toISOString() };
      if (!editingId) {
          payload.created_by = loggedInUser;
          payload.created_at = new Date().toISOString();
      }

      if (supabase) {
          const { error } = editingId 
              ? await supabase.from(table).update(payload).eq('id', editingId)
              : await supabase.from(table).insert([payload]);
          if (error) alert(error.message);
          else { setIsModalOpen(false); setEditingId(null); }
      }
      
      // Sync Onboarding -> Meetings
      if (!editingId && modalType === 'onboarding' && payload.meeting_date && supabase) {
          await supabase.from('meetings').insert([{ 
              username: payload.username, date: payload.meeting_date, meeting_time: '10:00', 
              reason: 'جلسه آنبوردینگ (خودکار)', created_by: loggedInUser 
          }]);
      }
  };

  const handleStatusChange = async (id, status, table) => {
      if(supabase) await supabase.from(table).update({ status, last_updated_by: loggedInUser }).eq('id', id);
  };

  const openModal = (type, record = null) => {
      setModalType(type);
      setEditingId(record?.id || null);
      setFormData(record || INITIAL_FORM_DATA);
      setIsModalOpen(true);
  };

  const navigateToProfile = (username) => {
      setProfileSearch(username);
      setActiveTab('profile');
  };

  // --- Render ---
  if (!isAuthed) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4" dir="rtl">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h1 className="text-xl font-bold mb-6 text-center">ورود به پنل</h1>
              <form onSubmit={loginStep === 'username' ? handleUsernameSubmit : handlePasswordSubmit} className="space-y-4">
                  {loginStep === 'username' ? (
                      <input className="w-full border p-3 rounded-xl text-left" dir="ltr" placeholder="نام کاربری" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} autoFocus />
                  ) : (
                      <input className="w-full border p-3 rounded-xl text-left" type="password" placeholder="کلمه عبور" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoFocus />
                  )}
                  {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                  <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">{loginStep === 'username' ? 'ادامه' : 'ورود'}</button>
              </form>
          </div>
      </div>
  );

  return (
    <div className="h-screen w-screen flex bg-[#F3F4F6] overflow-hidden" dir="rtl">
      <BackgroundBlobs />
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} 
        navItems={[
          { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
          { id: 'meetings', label: 'جلسات', icon: Users },
          { id: 'issues', label: 'مشکلات فنی', icon: AlertTriangle },
          { id: 'frozen', label: 'اکانت فریز', icon: Snowflake },
          { id: 'features', label: 'درخواست فیچر', icon: Lightbulb },
          { id: 'refunds', label: 'بازگشت وجه', icon: CreditCard },
          { id: 'onboarding', label: 'ورود کاربران', icon: GraduationCap },
          { id: 'profile', label: 'پروفایل', icon: User }
        ]}
      />
      
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-8 py-6 min-h-full">
          <Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} 
            TimeFilter={TimeFilter} 
            globalTimeFilter={globalTimeFilter} setGlobalTimeFilter={setGlobalTimeFilter}
            globalCustomRange={globalCustomRange} setGlobalCustomRange={setGlobalCustomRange}
            tabTimeFilter={tabTimeFilter} setTabTimeFilter={setTabTimeFilter}
            tabCustomRange={tabCustomRange} setTabCustomRange={setTabCustomRange}
          />

          {activeTab === 'dashboard' && <DashboardTab analytics={analytics} filteredOnboardings={filteredOnboardings} filteredIssues={filteredIssues} followUpList={followUpList} churnRisks={churnRisks} navigateToProfile={navigateToProfile} handleDismissFollowUp={(u) => setDismissedFollowUps([...dismissedFollowUps, u])} chartData={chartData} />}
          {activeTab === 'issues' && <IssuesTab filteredIssues={filteredIssues} issueViewMode={issueViewMode} setIssueViewMode={setIssueViewMode} flagFilter={flagFilter} setFlagFilter={setFlagFilter} openModal={openModal} handleStatusChange={handleStatusChange} navigateToProfile={navigateToProfile} KanbanBoard={KanbanBoard} FlagFilter={FlagFilter} formatDate={formatDate} />}
          {activeTab === 'features' && <FeaturesTab filteredFeatures={filteredFeatures} featureViewMode={featureViewMode} setFeatureViewMode={setFeatureViewMode} openModal={openModal} handleStatusChange={handleStatusChange} navigateToProfile={navigateToProfile} KanbanBoard={KanbanBoard} />}
          {activeTab === 'onboarding' && <OnboardingTab onboardings={filteredOnboardings} openModal={openModal} navigateToProfile={navigateToProfile} />}
          {activeTab === 'meetings' && <MeetingsTab meetings={filteredMeetings} openModal={openModal} navigateToProfile={navigateToProfile} />}
          {/* Profile Tab implementation integrated here for brevity, usually in own component */}
          {activeTab === 'profile' && (
              <div className="space-y-6">
                  <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                      <UserSearchInput value={profileSearch} onChange={setProfileSearch} onSelect={u => setProfileSearch(u.username)} allUsers={allUsersList} />
                  </div>
                  {/* Profile Details Here (Simplified) */}
                  {profileSearch && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm">
                          <h2 className="text-xl font-bold mb-4">{profileSearch}</h2>
                          {/* Timeline of user activity */}
                          <div className="space-y-4">
                             {[...issues, ...meetings, ...onboardings].filter(x => x.username === profileSearch).map((x, i) => (
                                 <div key={i} className="border-b pb-2">
                                     <div className="text-sm font-bold">{x.desc_text || x.reason || 'فعالیت'}</div>
                                     <div className="text-xs text-gray-500">{formatDate(x.created_at)}</div>
                                 </div>
                             ))}
                          </div>
                          <button onClick={() => openModal('meeting', { username: profileSearch })} className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm">ست کردن جلسه</button>
                      </div>
                  )}
              </div>
          )}
          {['frozen', 'refunds'].includes(activeTab) && <SimpleTableTab activeTab={activeTab} rows={activeTab === 'frozen' ? filteredFrozen : filteredRefunds} openModal={openModal} navigateToProfile={navigateToProfile} />}
        </div>
      </main>

      <ModalManager isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalType={modalType} formData={formData} setFormData={setFormData} handleSave={handleSave} allUsers={allUsersList} UserSearchInput={UserSearchInput} VoiceRecorder={VoiceRecorder} />
      <div className="fixed bottom-4 left-4 z-50"><button onClick={handleLogout} className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition" title="خروج"><LogOut size={20}/></button></div>
    </div>
  );
}
