import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format, differenceInDays, isAfter } from 'date-fns';
import DatePicker from "react-multi-date-picker";
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
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  List,
  Columns,
  Maximize2,
  Bell,
  Wrench,
  Users,
  Moon,
  Sun,
  LogOut,
  BrainCircuit,
  History,
  Edit
} from 'lucide-react';

import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  YAxis
} from 'recharts';

// Hooks
import { useTailwind } from './hooks/useTailwind';

// Utils
import { 
  formatDate, 
  parsePersianDate, 
  normalizeDate, 
  filterDataByTime 
} from './utils/helpers';
import { callVardastAI } from './utils/vardast';

// Constants
import { 
  supabaseUrl, 
  supabaseKey, 
  ALLOWED_USERS, 
  INITIAL_FORM_DATA 
} from './constants';

// Components
import UserAvatar from './components/UserAvatar';
import UserSearchInput from './components/UserSearchInput';
import VoiceRecorder from './components/VoiceRecorder';
import FlagFilter from './components/FlagFilter';
import TimeFilter from './components/TimeFilter';
import HistoryLogModal from './components/HistoryLogModal';
import ChartModal from './components/ChartModal';
import KanbanBoard from './components/KanbanBoard';
import OnboardingTab from './components/OnboardingTab';
import MeetingsTab from './components/MeetingsTab';
import AIAnalysisTab from './components/AIAnalysisTab';
import CohortChart from './components/CohortChart';
import UserProfile from './components/UserProfile';
import UsersTab from './components/UsersTab';
import logo from './assets/logo.png';

let supabase;
try {
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.error('Supabase init error:', e);
}

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
  const [frozenViewMode, setFrozenViewMode] = useState('table');
  const [refundViewMode, setRefundViewMode] = useState('table');
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
    setActiveTab('users');
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

  const handleGenerateFeatureTitle = async () => {
      if (!formData.desc_text) return alert('لطفا توضیحات را وارد کنید');
      setAiLoading(true);
      const context = features.map(f => `Title: ${f.title}, Desc: ${f.desc_text}`).join('\n---\n');
      const prompt = `Context (Existing Features):\n${context}\n\nNew Feature Description: "${formData.desc_text}"\n\nTask: Generate a short, concise Persian title for this new feature based on its description. Return ONLY the title.`;
      const res = await callVardastAI(prompt);
      setAiLoading(false);
      if (res) setFormData(prev => ({ ...prev, title: res }));
  };

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
      payload = { ...commonFields, reason: formData.reason, duration: formData.duration, category: formData.category, action: formData.action || 'در حال بررسی', status: formData.status || 'در بررسی', suggestion: formData.suggestion, can_return: formData.can_return, sales_source: formData.sales_source, ops_note: formData.ops_note };
      if (!isEdit) payload.requested_at = createdTimestamp;
    } else if (modalType === 'profile') {
      table = 'profiles';
      payload = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, telegram_id: formData.telegram_id, website: formData.website, bio: formData.bio };
      if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'meeting') {
        table = 'meetings';
        payload = { username: formData.username, date: formData.date ? (formData.date.toDate ? formData.date.toDate().toISOString() : new Date(formData.date).toISOString()) : new Date().toISOString(), meeting_time: formData.meeting_time, reason: formData.reason, result: formData.result, held: formData.held === true || formData.held === 'true', created_by: formData.created_by || loggedInUser };
        if (!isEdit) payload.created_at = createdTimestamp;
    } else if (modalType === 'onboarding') {
      table = 'onboardings';
      payload = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, telegram_id: formData.telegram_id, has_website: formData.has_website === 'true' || formData.has_website === true, progress: Number(formData.progress), initial_call_status: formData.initial_call_status, conversation_summary: formData.conversation_summary, call_date: formData.call_date, meeting_date: formData.meeting_date, meeting_note: formData.meeting_note, followup_date: formData.followup_date, followup_note: formData.followup_note };
      if (!isEdit) payload.created_at = createdTimestamp;
      
      const createMeeting = async (date, type) => {
          let mDate = date;
          if (mDate && typeof mDate !== 'string') {
              if (mDate.toDate) mDate = mDate.toDate().toISOString();
              else if (mDate instanceof Date) mDate = mDate.toISOString();
          }
          if (!mDate) return;
          const meetingPayload = { username: payload.username, date: mDate, meeting_time: '10:00', reason: `جلسه آنبوردینگ (${type})`, created_by: loggedInUser, held: false, history: [] }; 
          await supabase.from('meetings').insert([meetingPayload]);
      };

      if (!isEdit && payload.meeting_date) { 
          createMeeting(payload.meeting_date, 'اولیه');
      } else if (isEdit) {
          const oldRecord = onboardings.find(r => r.id === editingId);
          if (payload.meeting_date && (!oldRecord.meeting_date || new Date(payload.meeting_date).getTime() !== new Date(oldRecord.meeting_date).getTime())) {
               createMeeting(payload.meeting_date, 'ویرایش شده');
          }
          if (payload.followup_date && (!oldRecord.followup_date || new Date(payload.followup_date).getTime() !== new Date(oldRecord.followup_date).getTime())) {
               createMeeting(payload.followup_date, 'پیگیری');
          }
      }
    }

    if (!supabase) {
        setIsModalOpen(false); setEditingId(null); setFormData({ ...INITIAL_FORM_DATA }); return;
    }
    
    // Audit Logic
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
        payload.created_by = payload.created_by || currentUser;
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
    let payload = {};
    if (table === 'onboardings') {
        const progressMap = { '0_percent': 0, '100_percent': 100, 'in_progress': 50 };
        payload = { 
            progress: progressMap[newStatus] ?? 0,
            last_updated_by: loggedInUser || 'Admin', 
            last_updated_at: new Date().toISOString()
        };
    } else {
        payload = { 
            status: newStatus,
            last_updated_by: loggedInUser || 'Admin',
            last_updated_at: new Date().toISOString()
        };
        if (table === 'issues' && newStatus === 'حل‌شده') {
            payload.flag = null;
        }
    }

    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (!error) {
      if (table === 'issues') { setIssues(prev => prev.map(i => i.id.toString() === id ? { ...i, ...payload } : i)); } 
      else if (table === 'features') { setFeatures(prev => prev.map(f => f.id.toString() === id ? { ...f, ...payload } : f)); }
      else if (table === 'onboardings') { setOnboardings(prev => prev.map(o => o.id.toString() === id ? { ...o, ...payload } : o)); }
      else if (table === 'refunds') { setRefunds(prev => prev.map(r => r.id.toString() === id ? { ...r, ...payload } : r)); }
      else if (table === 'frozen') { setFrozen(prev => prev.map(f => f.id.toString() === id ? { ...f, ...payload } : f)); }
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
      
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} h-full bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-xl border-l border-gray-200 flex flex-col transition-all duration-300 overflow-hidden fixed md:static inset-y-0 right-0 z-50 liquid-glass`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          {isSidebarOpen && <img src={logo} alt="Vardast" className="h-10 w-auto" />}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white rounded-xl border dark:border-slate-700 mr-auto">{isSidebarOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
              { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard }, 
              { id: 'users', label: 'کاربران', icon: Users },
              { id: 'issues', label: 'مشکلات فنی', icon: AlertTriangle }, 
              { id: 'features', label: 'درخواست فیچر', icon: Lightbulb }, 
              { id: 'frozen', label: 'فریز ها', icon: Snowflake }, 
              { id: 'refunds', label: 'بازگشت وجه', icon: CreditCard }, 
              { id: 'onboarding', label: 'آنبوردینگ', icon: GraduationCap }, 
              { id: 'ai-analysis', label: 'تحلیل هوشمند', icon: BrainCircuit },
              { id: 'meetings', label: 'جلسات تیم', icon: Users }
            ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              <item.icon size={18} className="flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-4">
             <div className="flex items-center justify-between w-full">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition" title="تغییر تم">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
                <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-red-500 dark:text-red-400 transition" title="خروج"><LogOut size={18}/></button>
             </div>
             {isSidebarOpen && <div className="text-[10px] text-center text-gray-400 font-bold">طراحی شده توسط میلاد :D<br/>قدرت گرفته از وردست</div>}
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
                  <div key={idx} className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition liquid-glass">
                    <div className={`absolute -right-6 -top-6 p-4 rounded-full bg-gradient-to-br ${card.color} opacity-10 scale-150`}><card.icon size={50} /></div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 z-10">{card.title}</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white z-10">{card.value}</h3>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col h-64 liquid-glass">
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
                    <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col h-64 liquid-glass">
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
                   <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col cursor-pointer hover:border-blue-200 transition liquid-glass" onClick={() => setExpandedChart('trend')}>
                      <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4 flex items-center gap-2 justify-between"><span className="flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/>روند ثبت مشکلات</span><Maximize2 size={14} className="text-gray-400"/></h4>
                      <div className="flex-1 w-full pointer-events-none"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px'}} /><Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" /></AreaChart></ResponsiveContainer></div>
                   </div>
                   <div className="bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col cursor-pointer hover:border-green-200 transition liquid-glass" onClick={() => setExpandedChart('cohort')}>
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
          {activeTab === 'onboarding' && <OnboardingTab onboardings={filteredOnboardings} openModal={openModal} navigateToProfile={navigateToProfile} setHistoryModalData={setHistoryModalData} onStatusChange={(id, status) => handleStatusChange(id, status, 'onboardings')} />}
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
              {issueViewMode === 'kanban' ? (<div className="flex-1 overflow-hidden"><KanbanBoard items={filteredIssues} onStatusChange={(id, status) => handleStatusChange(id, status, 'issues')} columns={{'باز': 'باز', 'در حال بررسی': 'در حال بررسی', 'حل‌شده': 'حل‌شده'}} navigateToProfile={navigateToProfile} openModal={openModal} type="issue" setHistoryModalData={setHistoryModalData} /></div>) : (<div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto"><table className="w-full text-sm text-right whitespace-nowrap"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4">ثبت کننده</th><th className="p-4">تاریخ</th><th className="p-4"></th></tr></thead><tbody>{filteredIssues.map(row => (<tr key={row.id} className={`border-b last:border-0 hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200 blink-slow' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200 blink-slow' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4"><div className="flex items-center gap-2">{row.technical_review && <div className="bg-indigo-100 p-1 rounded-md text-indigo-600" title="بررسی فنی"><Wrench size={12}/></div>}<span className="truncate max-w-xs">{row.desc_text}</span></div></td><td className="p-4"><span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs border border-blue-100">{row.status}</span></td><td className="p-4 text-xs text-gray-500 flex items-center gap-1">{row.created_by && <span className="bg-gray-100 px-2 py-0.5 rounded">{row.created_by}</span>}{row.history && row.history.length > 0 && <button onClick={() => setHistoryModalData(row.history)} className="text-blue-400 hover:text-blue-600"><History size={14}/></button>}</td><td className="p-4 font-mono text-xs text-gray-400">{formatDate(row.created_at)}</td><td className="p-4 text-left"><button onClick={() => openModal('issue', row)} className="text-gray-400 hover:text-blue-600"><Edit size={16}/></button></td></tr>))}</tbody></table></div>)}
            </section>
          )}
          {activeTab === 'features' && (
            <section className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl"><button onClick={() => setFeatureViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${featureViewMode === 'table' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><List size={16}/> جدول</button><button onClick={() => setFeatureViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${featureViewMode === 'kanban' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button></div>
                <div className="flex gap-2"><button onClick={() => { setActiveTab('ai-analysis'); }} className="bg-white text-purple-600 px-4 py-2 rounded-xl text-sm font-bold border border-purple-200 hover:bg-purple-50 flex items-center gap-2"><Sparkles size={16}/> تحلیل هوشمند</button><button onClick={() => openModal('feature')} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 flex items-center gap-2"><Plus size={16}/> ثبت فیچر</button></div>
              </div>
              {featureViewMode === 'kanban' ? (<div className="flex-1 overflow-hidden"><KanbanBoard items={filteredFeatures} onStatusChange={(id, status) => handleStatusChange(id, status, 'features')} columns={{'بررسی نشده': 'بررسی نشده', 'در تحلیل': 'در تحلیل', 'در توسعه': 'در توسعه', 'انجام شد': 'انجام شد'}} navigateToProfile={navigateToProfile} openModal={openModal} type="feature" setHistoryModalData={setHistoryModalData} /></div>) : (<div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto"><table className="w-full text-sm text-right whitespace-nowrap"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">عنوان</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4">ثبت کننده</th><th className="p-4"></th></tr></thead><tbody>{filteredFeatures.map(row => (<tr key={row.id} className={`border-b last:border-0 hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200 blink-slow' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200 blink-slow' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-purple-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4 font-bold">{row.title}</td><td className="p-4 truncate max-w-xs">{row.desc_text}</td><td className="p-4"><span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs border border-purple-100">{row.status}</span></td><td className="p-4 text-xs text-gray-500 flex items-center gap-1">{row.created_by && <span className="bg-gray-100 px-2 py-0.5 rounded">{row.created_by}</span>}{row.history && row.history.length > 0 && <button onClick={() => setHistoryModalData(row.history)} className="text-blue-400 hover:text-blue-600"><History size={14}/></button>}</td><td className="p-4 text-left"><button onClick={() => openModal('feature', row)} className="text-gray-400 hover:text-purple-600"><Edit size={16}/></button></td></tr>))}</tbody></table></div>)}
            </section>
          )}
          {activeTab === 'users' && (profileSearch ? <UserProfile usersData={allUsers} issues={issues} frozen={frozen} features={features} refunds={refunds} onboardings={onboardings} meetings={meetings} openModal={openModal} profileSearch={profileSearch} setProfileSearch={setProfileSearch} /> : <UsersTab users={allUsers} navigateToProfile={navigateToProfile} />)}
          {activeTab === 'ai-analysis' && <AIAnalysisTab issues={filteredIssues} onboardings={filteredOnboardings} features={filteredFeatures} navigateToProfile={navigateToProfile} />}
          {activeTab === 'frozen' && (
             <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl"><button onClick={() => setFrozenViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${frozenViewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><List size={16}/> جدول</button><button onClick={() => setFrozenViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${frozenViewMode === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button></div>
                <button onClick={() => openModal('frozen')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16}/> ثبت فریز</button>
              </div>
              {frozenViewMode === 'kanban' ? (<div className="flex-1 overflow-hidden"><KanbanBoard items={filteredFrozen} onStatusChange={(id, status) => handleStatusChange(id, status, 'frozen')} columns={{'فریز': 'فریز', 'در حال رفع': 'در حال رفع', 'رفع شد': 'رفع شد'}} navigateToProfile={navigateToProfile} openModal={openModal} type="frozen" setHistoryModalData={setHistoryModalData} /></div>) : (<div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto"><table className="w-full text-sm text-right whitespace-nowrap"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4">ثبت کننده</th><th className="p-4"></th></tr></thead><tbody>{filteredFrozen.map(row => (<tr key={row.id} className={`border-b hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200 blink-slow' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200 blink-slow' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4">{row.desc_text}</td><td className="p-4">{row.status}</td><td className="p-4 text-xs text-gray-500 flex items-center gap-1">{row.created_by && <span className="bg-gray-100 px-2 py-0.5 rounded">{row.created_by}</span>}{row.history && row.history.length > 0 && <button onClick={() => setHistoryModalData(row.history)} className="text-blue-400 hover:text-blue-600"><History size={14}/></button>}</td><td className="p-4"><button onClick={() => openModal('frozen', row)}><Edit size={16} className="text-gray-400"/></button></td></tr>))}</tbody></table></div>)}
             </div>
          )}
          {activeTab === 'refunds' && (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border shadow-sm">
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setRefundViewMode('table')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${refundViewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><List size={16}/> جدول</button>
                        <button onClick={() => setRefundViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${refundViewMode === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Columns size={16}/> کانبان</button>
                    </div>
                    <button onClick={() => openModal('refund')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16}/> ثبت بازگشت وجه</button>
                </div>
                {refundViewMode === 'kanban' ? (
                     <div className="flex-1 overflow-hidden">
                       <KanbanBoard 
                           items={filteredRefunds} 
                           onStatusChange={(id, status) => handleStatusChange(id, status, 'refunds')} 
                           columns={{'بازپرداخت شد': 'بازپرداخت شد', 'در بررسی': 'در بررسی', 'رد شد': 'رد شد'}} 
                           navigateToProfile={navigateToProfile} 
                           openModal={openModal} 
                           type="refund"
                           setHistoryModalData={setHistoryModalData}
                       />
                     </div>
                ) : (
                    <div className="bg-white rounded-2xl border overflow-hidden p-6 liquid-glass overflow-x-auto">
                        <table className="w-full text-sm text-right whitespace-nowrap"><thead className="bg-slate-50 text-gray-500 border-b"><tr><th className="p-4">کاربر</th><th className="p-4">توضیح</th><th className="p-4">وضعیت</th><th className="p-4">ثبت کننده</th><th className="p-4"></th></tr></thead><tbody>{filteredRefunds.map(row => (<tr key={row.id} className={`border-b hover:bg-slate-50 ${row.flag === 'پیگیری فوری' ? 'bg-red-100 hover:bg-red-200 blink-slow' : row.flag === 'پیگیری مهم' ? 'bg-amber-100 hover:bg-amber-200 blink-slow' : ''}`}><td className="p-4 font-bold cursor-pointer hover:text-blue-600" onClick={() => navigateToProfile(row.username)}>{row.username}</td><td className="p-4">{row.reason}</td><td className="p-4">{row.action}</td><td className="p-4 text-xs text-gray-500 flex items-center gap-1">{row.created_by && <span className="bg-gray-100 px-2 py-0.5 rounded">{row.created_by}</span>}{row.history && row.history.length > 0 && <button onClick={() => setHistoryModalData(row.history)} className="text-blue-400 hover:text-blue-600"><History size={14}/></button>}</td><td className="p-4"><button onClick={() => openModal('refund', row)}><Edit size={16} className="text-gray-400"/></button></td></tr>))}</tbody></table>
                    </div>
                )}
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
                                <div className="grid grid-cols-2 gap-3">
                                   <select value={formData.status || 'باز'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="باز">باز</option><option value="در حال بررسی">در حال بررسی</option><option value="حل‌شده">حل‌شده</option></select>
                                   <select value={formData.module || ''} onChange={(e) => setFormData({...formData, module: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                      <option value="">بخش مربوطه...</option>
                                      {['پرامپت', 'ویزارد', 'دایرکت هوشمند', 'کامنت هوشمند', 'اتصال تلگرام', 'اتصال اینستاگرام', 'اتصال وبسایت', 'نیمچت', 'گزارشات', 'UI/UX', 'خواندت محصولات از وبسایت', 'استوری‌های هوشمند', 'اکسس توکن منقضی شده', 'فالو اجباری', 'ویجت', 'سایر'].map(o => <option key={o} value={o}>{o}</option>)}
                                   </select>
                                </div>
                                <select value={formData.type || ''} onChange={(e) => setFormData({...formData, type: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="">نوع مشکل...</option>
                                    {['باگ فنی', 'خطای کاربر', 'کندی سیستم', 'محدودیت API', 'طراحی UX', 'خطای مشتری', 'سایر'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
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
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 font-bold">وضعیت</label>
                                    <select value={formData.status || 'بررسی نشده'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="بررسی نشده">بررسی نشده</option><option value="در تحلیل">در تحلیل</option><option value="در توسعه">در توسعه</option><option value="انجام شد">انجام شد</option></select>
                                </div>
                                <div className="space-y-2">
                                     <label className="text-xs text-gray-500 font-bold">ثبت کننده (درخواست دهنده)</label>
                                     <input placeholder="نام ثبت کننده" value={loggedInUser} disabled className="border p-3 rounded-xl text-sm w-full bg-gray-100 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400 cursor-not-allowed" />
                                </div>
                                <div className="relative flex items-center gap-2">
                                     <input placeholder="عنوان فیچر" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                     <button type="button" onClick={handleGenerateFeatureTitle} disabled={aiLoading} className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition" title="تولید عنوان با هوش مصنوعی">{aiLoading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>}</button>
                                </div>
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
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-medium">برگزار کننده</label>
                                    <select value={formData.created_by || loggedInUser} onChange={(e) => setFormData({...formData, created_by: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                        {ALLOWED_USERS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
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

                        {modalType === 'frozen' && (
                             <>
                                <select value={formData.status || 'فریز'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="فریز">فریز</option><option value="در حال رفع">در حال رفع</option><option value="رفع شد">رفع شد</option></select>
                                <div className="relative">
                                    <textarea rows="3" placeholder="توضیحات..." value={formData.desc_text || ''} onChange={(e) => setFormData({ ...formData, desc_text: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                                    <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, desc_text: (p.desc_text || '') + ' ' + text}))} /></div>
                                </div>
                             </>
                        )}
                        
                         {modalType === 'refund' && (
                             <>
                                <select value={formData.status || 'در بررسی'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-3 rounded-xl text-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="بازپرداخت شد">بازپرداخت شد</option><option value="در بررسی">در بررسی</option><option value="رد شد">رد شد</option></select>
                                <div className="relative">
                                    <textarea rows="3" placeholder="توضیحات..." value={formData.reason || ''} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full border p-3 rounded-xl text-sm" />
                                    <div className="absolute left-2 bottom-2"><VoiceRecorder onTranscript={(text) => setFormData(p => ({...p, reason: (p.reason || '') + ' ' + text}))} /></div>
                                </div>
                             </>
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
