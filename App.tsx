import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import DocumentationView from './components/DocumentationView';
import { UserRole, UserContext, AttendanceRecord, Student, Stats, SchoolEvent, SyncLog } from './types';
import { MOCK_STATS, HOLIDAY_LIST, VACATION_LIST } from './constants';
import { supabase } from './supabaseClient';
import { 
  Users, UserCheck, Clock, AlertCircle, Search, Plus, Fingerprint, 
  Calendar, ShieldCheck, Edit, X, Save, CheckCircle2,
  TrendingDown, ArrowRight, ArrowLeft, School, Cloud,
  QrCode, TrendingUp, Zap, CalendarDays,
  Megaphone, Trash2, BellRing, RefreshCw, LayoutGrid, FileText, Flame, Sunrise, Shield,
  MonitorPlay, Maximize2, LogOut, Check, Sun, Moon, Command, Activity,
  PieChart as PieChartIcon, BarChart3, Target, Radio, Cpu, Server, HardDrive, GraduationCap, Baby, Terminal,
  Sliders, Bell, Lock, Download, AlertTriangle, Palmtree, MapPin, Coffee, CalendarCheck
} from 'lucide-react';

// --- SKELETON COMPONENTS (For Smooth Loading) ---
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm h-32 animate-skeleton">
    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-white/5 animate-skeleton">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    </div>
    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-fadeIn">
    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-skeleton"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[350px] bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/5 animate-skeleton"></div>
      <div className="h-[350px] bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/5 animate-skeleton"></div>
    </div>
  </div>
);

// --- TOAST CONTEXT ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
const ToastContext = createContext<{ addToast: (msg: string, type: 'success'|'error'|'info') => void }>({ addToast: () => {} });

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slideUpFade ${
          t.type === 'success' ? 'bg-white dark:bg-slate-900 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' :
          t.type === 'error' ? 'bg-white dark:bg-slate-900 border-rose-500/50 text-rose-600 dark:text-rose-400' :
          'bg-white dark:bg-slate-900 border-blue-500/50 text-blue-600 dark:text-blue-400'
        }`}>
          {t.type === 'success' && <CheckCircle2 size={20} />}
          {t.type === 'error' && <AlertCircle size={20} />}
          {t.type === 'info' && <BellRing size={20} />}
          <p className="text-sm font-bold text-slate-800 dark:text-white flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
};

// --- COMMAND PALETTE COMPONENT ---
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onNavigate: (page: string) => void;
  onThemeToggle: () => void;
  onSelectStudent: (s: Student) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, students, onNavigate, onThemeToggle, onSelectStudent }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    setQuery('');
    setActiveIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const pages = [
    { label: 'Go to Dashboard', icon: LayoutGrid, action: () => onNavigate('dashboard') },
    { label: 'Go to Students', icon: Users, action: () => onNavigate('students') },
    { label: 'Go to Attendance', icon: Calendar, action: () => onNavigate('attendance') },
    { label: 'Go to Holidays', icon: CalendarDays, action: () => onNavigate('holidays') },
    { label: 'Toggle Dark Mode', icon: Moon, action: onThemeToggle },
  ];

  const studentMatches = students
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.admin_no.includes(query))
    .slice(0, 5)
    .map(s => ({
      label: s.name,
      sub: `Class ${s.std}-${s.sec}`,
      icon: UserCheck,
      action: () => onSelectStudent(s)
    }));

  const filteredPages = query ? pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase())) : pages;
  const allItems = [...filteredPages, ...studentMatches];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[activeIndex]) {
        allItems[activeIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-fadeIn" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-popIn flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-white/5">
          <Search className="text-slate-400" size={20} />
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-white placeholder-slate-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1">
             <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded border border-slate-200 dark:border-slate-700 font-mono">ESC</kbd>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No results found.</div>
          ) : (
            allItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => { item.action(); onClose(); }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-colors ${
                  idx === activeIndex 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={idx === activeIndex ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} />
                  <div>
                    <span className="font-medium block">{item.label}</span>
                    {(item as any).sub && <span className="text-xs opacity-70 block">{(item as any).sub}</span>}
                  </div>
                </div>
                {idx === activeIndex && <ArrowRight size={16} className="opacity-50" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- ERROR HELPER ---
const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return JSON.stringify(err);
};

// --- Login Component ---
const LoginScreen = ({ onLogin, isDarkMode, toggleTheme }: { onLogin: (ctx: UserContext) => void, isDarkMode: boolean, toggleTheme: () => void }) => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbErrorMsg, setDbErrorMsg] = useState<string>('');
  
  // Parent Selection Logic
  const [loginView, setLoginView] = useState<'home' | 'parent'>('home');
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Fetch all students for the selection list
        const { data: students, error } = await supabase
          .from('students')
          .select('id, name, admin_no, std, sec')
          .order('name');
          
        if (error) throw error;
        
        if (students) setAllStudents(students);
        setDbStatus('connected');
      } catch (err) {
        const msg = getErrorMessage(err);
        console.error("DB Check Failed:", msg);
        setDbErrorMsg(msg);
        setDbStatus('error');
      }
    };
    checkConnection();
  }, []);

  // Filter students for parent view
  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admin_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-cyan-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-3xl"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
         <button onClick={toggleTheme} className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-lg border border-white/20 dark:border-white/10 text-slate-600 dark:text-yellow-400 hover:scale-110 active:scale-95 transition-all">
            {isDarkMode ? <Sun size={20} className="animate-spin-slow" /> : <Moon size={20} />}
         </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(6,182,212,0.15)] border border-white/50 dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-popIn">
        
        {/* Left Side */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-primary-600 to-indigo-700 dark:from-slate-900 dark:to-slate-800 p-12 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent dark:from-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse-fast"></div>
          
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10 dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-float">
               <School size={32} className="text-white dark:text-cyan-300" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-300 dark:to-purple-300">Attendly</h1>
            <p className="text-primary-100 dark:text-slate-400 font-medium text-lg">Next-Gen School Management</p>
          </div>

          <div className="relative space-y-6">
            <div className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                dbStatus === 'connected' ? 'bg-emerald-500/20 border-emerald-400/30 scale-100' : 
                dbStatus === 'error' ? 'bg-rose-500/20 border-rose-400/30 scale-100' : 'bg-white/10 border-white/10 scale-95 opacity-80'
              }`}>
              <div className={`p-2 rounded-lg ${dbStatus === 'connected' ? 'bg-emerald-400/20' : dbStatus === 'error' ? 'bg-rose-400/20' : 'bg-white/10'}`}>
                {dbStatus === 'checking' && <RefreshCw size={20} className="text-white animate-spin" />}
                {dbStatus === 'connected' && <CheckCircle2 size={20} className="text-emerald-300 animate-scaleIn" />}
                {dbStatus === 'error' && <AlertCircle size={20} className="text-rose-300 animate-pulse" />}
              </div>
              <div>
                <p className="text-sm font-bold">
                  {dbStatus === 'checking' && 'Connecting to Cloud...'}
                  {dbStatus === 'connected' && 'Database Online'}
                  {dbStatus === 'error' && 'Connection Failed'}
                </p>
                <p className="text-xs text-primary-100 opacity-80">
                  {dbStatus === 'connected' ? 'Supabase Ready' : dbStatus === 'error' ? (dbErrorMsg || 'Check API Keys') : 'Pinging Server...'}
                </p>
              </div>
            </div>
            <p className="text-xs text-primary-200/60 dark:text-slate-500 font-mono">v3.1.0 • Cloud Edition</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          {loginView === 'home' ? (
            <div className="max-w-2xl mx-auto w-full animate-slideUpFade delay-100">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Select your access portal to continue.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => onLogin({ role: UserRole.SUPER_ADMIN, name: 'Rakesh Kumar Mishra' })} className="group relative flex items-center p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-primary-500 dark:hover:border-cyan-500 hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 text-left overflow-hidden col-span-2 active:scale-[0.98]">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center text-white dark:text-cyan-300 shadow-md z-10 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="ml-4 z-10 flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-cyan-300 transition-colors">Super Admin</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Full System Control & Logs</p>
                  </div>
                </button>
                
                <button onClick={() => onLogin({ role: UserRole.ADMIN, name: 'Principal' })} className="group relative flex items-center p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 text-left overflow-hidden active:scale-[0.98]">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm z-10 group-hover:scale-110 transition-transform duration-300">
                    <UserCheck size={20} />
                  </div>
                  <div className="ml-4 z-10">
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Admin</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">School Management</p>
                  </div>
                </button>

                <button onClick={() => onLogin({ role: UserRole.TEACHER, name: 'Class Teacher', assignedClass: { std: '11', sec: 'B' } })} className="group relative flex items-center p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 text-left overflow-hidden active:scale-[0.98]">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm z-10 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap size={20} />
                  </div>
                  <div className="ml-4 z-10">
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Teacher</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Class 11-B View</p>
                  </div>
                </button>

                <button 
                  onClick={() => setLoginView('parent')} 
                  className="group relative flex items-center p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 text-left overflow-hidden col-span-2 md:col-span-1 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm z-10 group-hover:scale-110 transition-transform duration-300">
                    <Baby size={20} />
                  </div>
                  <div className="ml-4 z-10">
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Parent</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select Student View</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-slideUpFade">
              <button 
                onClick={() => setLoginView('home')} 
                className="self-start flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors font-medium text-sm"
              >
                <ArrowLeft size={18} /> Back to Roles
              </button>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Your Ward</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Choose the student account you wish to view.</p>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name or admin no..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => onLogin({ role: UserRole.PARENT, name: 'Parent', linkedStudentId: s.id })}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                           {s.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.admin_no} • Class {s.std}-{s.sec}</p>
                         </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <Search size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No students found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
function App() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats>(MOCK_STATS);
  const [students, setStudents] = useState<Student[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [holidays, setHolidays] = useState<SchoolEvent[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [parentStats, setParentStats] = useState({ present: 0, late: 0, absent: 0 });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newVal;
    });
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, [isDarkMode]);

  useEffect(() => {
    // CMD+K Shortcut
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Restore Session
  useEffect(() => {
    const saved = localStorage.getItem('attendly_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const addToast = (msg: string, type: 'success'|'error'|'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- DATA FETCHING ---
  const fetchInitialData = async (isBackground = false) => {
    if (!user) return;
    if (!isBackground) setLoading(true);
    
    try {
      // 1. Fetch Students
      let studentQuery = supabase.from('students').select('*').order('name');
      if (user.role === UserRole.TEACHER && user.assignedClass) {
        studentQuery = studentQuery.eq('std', user.assignedClass.std).eq('sec', user.assignedClass.sec);
      } else if (user.role === UserRole.PARENT && user.linkedStudentId) {
        studentQuery = studentQuery.eq('id', user.linkedStudentId);
      }

      const { data: studentsData, error: sErr } = await studentQuery;
      if (sErr) throw sErr;
      
      const sData = studentsData as Student[];
      setStudents(sData);

      // 2. Fetch Attendance (Today)
      const today = new Date().toISOString().split('T')[0];
      const studentIds = sData.map(s => s.id);

      if (studentIds.length > 0) {
        // Recent Activity
        const { data: attData, error: aErr } = await supabase
          .from('attendance')
          .select('*, students(name, admin_no)')
          .in('student_id', studentIds)
          .order('recorded_at', { ascending: false })
          .limit(1000); // Higher limit for charts

        if (aErr) throw aErr;

        const records: AttendanceRecord[] = (attData || []).map((r: any) => ({
          id: r.id,
          student_name: r.students?.name || 'Unknown',
          admin_no: r.students?.admin_no || '---',
          date: r.date,
          recorded_at: r.recorded_at,
          time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: (r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()) as any,
          device_id: r.device_id
        }));

        setRecentActivity(records);

        // Stats Calculation
        const todayRecords = records.filter(r => r.date === today);
        const presentCount = todayRecords.filter(r => r.status === 'Present').length;
        const lateCount = todayRecords.filter(r => r.status === 'Late').length;
        
        // Parent Stats (All Time from fetched records)
        if (user.role === UserRole.PARENT) {
            const allPresent = records.filter(r => r.status === 'Present').length;
            const allLate = records.filter(r => r.status === 'Late').length;
            const allAbsent = records.filter(r => r.status === 'Absent').length;
            setParentStats({ present: allPresent, late: allLate, absent: allAbsent });
        }

        setStats({
          totalStudents: sData.length,
          presentToday: presentCount,
          lateToday: lateCount,
          absentToday: sData.length - (presentCount + lateCount)
        });
        
        // 7-Day History Logic
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const history = last7Days.map(d => {
            const dayRecords = records.filter(r => r.date === d);
            const p = dayRecords.filter(r => r.status === 'Present').length;
            const l = dayRecords.filter(r => r.status === 'Late').length;
            return {
                name: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }),
                present: p,
                late: l,
                absent: sData.length - (p + l)
            };
        });
        setWeeklyData(history);
      } else {
        // No students (e.g. empty class)
        setStats(MOCK_STATS);
        setWeeklyData([]);
        setRecentActivity([]);
      }

      // 3. Holidays
      const { data: holData } = await supabase.from('school_events').select('*').order('date', { ascending: true });
      if (holData) {
          // Merge DB events with static list
          const dbEvents: SchoolEvent[] = holData.map((e: any) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              date: e.date,
              type: e.type,
              target_class: e.target_class
          }));
          setHolidays([...dbEvents, ...HOLIDAY_LIST, ...VACATION_LIST].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }

    } catch (err) {
      console.error(err);
      if (!isBackground) addToast(getErrorMessage(err), 'error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // --- REALTIME ---
  useEffect(() => {
    if (!user) return;
    
    // Initial Load
    fetchInitialData();

    // Subscribe to ALL tables
    const channel = supabase.channel('global-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_events' }, () => fetchInitialData(true))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // --- HANDLERS ---
  const handleLogin = (ctx: UserContext) => {
    setUser(ctx);
    localStorage.setItem('attendly_user', JSON.stringify(ctx));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('attendly_user');
    setRecentActivity([]);
    setStudents([]);
  };

  const handleExportData = async () => {
    try {
        addToast('Generating CSV report...', 'info');
        const { data, error } = await supabase
            .from('attendance')
            .select('date, status, recorded_at, students(name, admin_no, std, sec)')
            .order('date', { ascending: false })
            .limit(2000);
        
        if (error) throw error;

        if (!data || data.length === 0) {
            addToast('No attendance data found to export.', 'info');
            return;
        }
        
        const csvRows = [
            ['Date', 'Time', 'Student Name', 'Admin No', 'Class', 'Status']
        ];
        
        data.forEach((r: any) => {
            csvRows.push([
                r.date,
                new Date(r.recorded_at).toLocaleTimeString(),
                r.students?.name || 'Unknown',
                r.students?.admin_no || '-',
                `${r.students?.std}-${r.students?.sec}`,
                r.status
            ]);
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addToast('Report downloaded successfully', 'success');
    } catch (err) {
        addToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeclareEvent = async (e: any) => {
      e.preventDefault();
      const form = e.target;
      const title = form.title.value;
      const date = form.date.value;
      const type = form.type.value;
      
      try {
          const { error } = await supabase.from('school_events').insert({ title, date, type, target_class: 'All', description: 'Declared via Dashboard' });
          if (error) throw error;
          addToast('Event declared successfully', 'success');
          form.reset();
          // Trigger refresh immediately
          fetchInitialData(true);
      } catch (err) {
          addToast(getErrorMessage(err), 'error');
      }
  };

  // --- RENDER ---
  if (!user) return <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;

  // Filter holidays and vacations
  const vacations = holidays.filter(h => h.type === 'Vacation Break');
  const regularHolidays = holidays.filter(h => h.type !== 'Vacation Break');

  return (
    <ToastContext.Provider value={{ addToast }}>
      <Layout 
        role={user.role} 
        onLogout={handleLogout} 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      >
        <div key={currentPage} className="space-y-6 animate-fadeIn">
          {/* DASHBOARD VIEW */}
          {currentPage === 'dashboard' && (
            loading ? <DashboardSkeleton /> : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutGrid size={24} className="text-primary-600" />
                {user.role === UserRole.PARENT ? 'Student Overview' : 'Dashboard Overview'}
              </h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user.role === UserRole.PARENT ? (
                  <>
                    <StatsCard label="Attendance Rate" value={`${Math.round(((parentStats.present + parentStats.late) / (parentStats.present + parentStats.late + parentStats.absent || 1)) * 100)}%`} icon={TrendingUp} color="blue" trend="+2%" trendUp delay={100} />
                    <StatsCard label="Current Status" value={recentActivity[0]?.status || 'Unknown'} icon={Activity} color="green" delay={200} />
                    <StatsCard label="Days Present" value={parentStats.present} icon={CheckCircle2} color="green" delay={300} />
                    <StatsCard label="Days Late" value={parentStats.late} icon={Clock} color="orange" delay={400} />
                  </>
                ) : (
                  <>
                    <StatsCard label="Total Students" value={stats.totalStudents} icon={Users} color="blue" delay={100} />
                    <StatsCard label="Present Today" value={stats.presentToday} icon={UserCheck} color="green" trend="+5%" trendUp delay={200} />
                    <StatsCard label="Late Today" value={stats.lateToday} icon={Clock} color="orange" trend="-2%" trendUp delay={300} />
                    <StatsCard label="Absent Today" value={stats.absentToday} icon={AlertCircle} color="red" trend="+1%" delay={400} />
                  </>
                )}
              </div>

              {/* Charts Section */}
              {user.role !== UserRole.PARENT && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Weekly Trends - Area Chart */}
                   <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm lg:col-span-2 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <TrendingUp size={20} className="text-primary-500" /> Weekly Trends
                        </h3>
                        <select className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 outline-none text-slate-600 dark:text-slate-400">
                          <option>Last 7 Days</option>
                        </select>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <AreaChart data={weeklyData}>
                            <defs>
                              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                              itemStyle={{ color: isDarkMode ? '#fff' : '#1e293b' }}
                            />
                            <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" animationDuration={1500} />
                            <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorLate)" animationDuration={1500} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   {/* Daily Distribution - Pie Chart */}
                   <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                        <PieChartIcon size={20} className="text-purple-500" /> Today's Status
                      </h3>
                      <div className="h-[250px] w-full relative">
                        {stats.totalStudents > 0 ? (
                           <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                             <PieChart>
                               <Pie
                                 data={[
                                   { name: 'Present', value: stats.presentToday, color: '#10b981' },
                                   { name: 'Late', value: stats.lateToday, color: '#f59e0b' },
                                   { name: 'Absent', value: stats.absentToday, color: '#ef4444' }
                                 ]}
                                 cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                                 dataKey="value" stroke="none"
                                 animationDuration={1500}
                               >
                                 {[0,1,2].map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444'][index]} />
                                 ))}
                               </Pie>
                               <Tooltip 
                                 contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }}
                               />
                               <Legend verticalAlign="bottom" height={36} iconType="circle" />
                             </PieChart>
                           </ResponsiveContainer>
                        ) : (
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                              <PieChartIcon size={48} className="mb-2 opacity-50" />
                              <p>No Data Available</p>
                           </div>
                        )}
                      </div>
                   </div>
                </div>
              )}

              {/* Class Performance Bar Chart */}
              {user.role !== UserRole.PARENT && (
                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300">
                   <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                      <BarChart3 size={20} className="text-blue-500" /> Class Performance
                   </h3>
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                            <Tooltip 
                              cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9'}}
                              contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }}
                            />
                            <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}

              {/* Recent Activity List */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock size={20} className="text-indigo-500" /> Recent Activity
                  </h3>
                  <button onClick={() => setCurrentPage('attendance')} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View All</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {recentActivity.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No activity recorded today.</div>
                  ) : (
                    recentActivity.slice(0, 10).map((r, i) => (
                      <div 
                        key={r.id} 
                        style={{ animationDelay: `${i * 100}ms` }}
                        className="p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between animate-slideUpFade"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm transition-transform hover:scale-110 ${
                            r.status === 'Present' ? 'bg-emerald-500' : r.status === 'Late' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}>
                            {r.student_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{r.student_name}</p>
                            <p className="text-xs text-slate-500">{r.admin_no}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.status === 'Present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                            r.status === 'Late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                            'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {r.status}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">{r.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            )
          )}

          {/* ATTENDANCE VIEW */}
          {currentPage === 'attendance' && (
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden animate-slideUpFade">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <CalendarCheck size={24} className="text-primary-600" /> Daily Logs
                </h2>
                <button onClick={handleExportData} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
                  <Download size={16} /> Export Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-3">Time</th>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Admin No</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [1,2,3,4,5].map(i => (
                        <tr key={i}><td colSpan={5} className="px-6 py-4"><SkeletonRow /></td></tr>
                    )) : recentActivity.map((r, i) => (
                      <tr 
                        key={r.id} 
                        style={{ animationDelay: `${i * 50}ms` }}
                        className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-slideUpFade"
                      >
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{r.date} {r.time}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{r.student_name}</td>
                        <td className="px-6 py-4 text-slate-500">{r.admin_no}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                             r.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                             r.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                             'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{r.device_id || 'N/A'}</td>
                      </tr>
                    ))}
                    {!loading && recentActivity.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HOLIDAYS VIEW - WINDOWED & TABLED */}
          {currentPage === 'holidays' && (
            <div className="space-y-8 animate-slideUpFade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays size={24} className="text-primary-600" /> Holiday Calendar
                 </h2>
              </div>

              {/* 1. Long Breaks (Windowed) */}
              {vacations.length > 0 && (
                <div className="space-y-4">
                   <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Palmtree size={20} className="text-teal-500" /> Long Breaks & Vacations
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {vacations.map((v, i) => (
                         <div key={v.id || i} style={{ animationDelay: `${i * 100}ms` }} className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1 animate-popIn">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                               <Palmtree size={64} className="text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="relative z-10">
                               <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-950 text-xs font-bold text-teal-600 dark:text-teal-400 shadow-sm mb-3 inline-block">
                                  {v.type}
                               </span>
                               <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{v.title}</h4>
                               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{new Date(v.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                               {v.description && (
                                  <div className="p-3 bg-white/60 dark:bg-slate-950/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 backdrop-blur-sm border border-white/50 dark:border-white/5">
                                     <Clock size={14} className="inline mr-2 text-teal-500" />
                                     {v.description}
                                  </div>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {/* 2. Regular Holidays (Tabled) */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <Coffee size={20} className="text-orange-500" /> Public Holidays
                </h3>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                         <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Day</th>
                            <th className="px-6 py-4">Occasion</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                         {regularHolidays.map((h, i) => {
                            const dateObj = new Date(h.date);
                            return (
                               <tr key={h.id || i} style={{ animationDelay: `${i * 50}ms` }} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-slideUpFade">
                                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                     {dateObj.toLocaleDateString('en-GB')}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                     {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                                     {h.title}
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
              </div>

              {/* Declare Event Form (Admins Only) */}
              {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                 <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mt-8 animate-fadeIn">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <Megaphone size={18} /> Declare New Event
                    </h3>
                    <form onSubmit={handleDeclareEvent} className="flex flex-col md:flex-row gap-4">
                       <input name="title" required placeholder="Event Title" className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" />
                       <input name="date" type="date" required className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" />
                       <select name="type" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow">
                          <option value="Event">Event</option>
                          <option value="Holiday">Holiday</option>
                          <option value="Vacation Break">Vacation Break</option>
                       </select>
                       <button type="submit" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-95 hover:shadow-primary-500/50">
                          Declare
                       </button>
                    </form>
                 </div>
              )}
            </div>
          )}

          {/* STUDENTS VIEW */}
          {currentPage === 'students' && (
             <div className="space-y-6 animate-slideUpFade">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users size={24} className="text-primary-600" /> Student Directory
                   </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {loading ? [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />) : 
                     students.map((s, i) => (
                      <div key={s.id} style={{ animationDelay: `${i * 50}ms` }} className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scaleIn group cursor-default">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                               {s.name.charAt(0)}
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{s.name}</h3>
                               <p className="text-xs text-slate-500 uppercase tracking-wider">{s.admin_no}</p>
                            </div>
                         </div>
                         <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-white/5">
                               <span>Class</span>
                               <span className="font-mono text-slate-900 dark:text-white">{s.std}-{s.sec}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-white/5">
                               <span>Parent</span>
                               <span className="text-slate-900 dark:text-white">{s.parent_phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                               <span>Fingerprint ID</span>
                               <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 rounded text-xs py-0.5">{s.fingerprint_id}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                   {!loading && students.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-500">
                         No students found for your query.
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* SETTINGS VIEW */}
          {currentPage === 'settings' && (
             <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings & Preferences</h2>
                   
                   <div className="space-y-6">
                      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                         <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Dark Mode</h3>
                            <p className="text-sm text-slate-500">Toggle system-wide dark theme</p>
                         </div>
                         <button onClick={toggleTheme} className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-primary-600' : 'bg-slate-200'}`}>
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                         </button>
                      </div>

                      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                         <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Export Data</h3>
                            <p className="text-sm text-slate-500">Download attendance report as CSV</p>
                         </div>
                         <button onClick={handleExportData} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors hover:scale-105 active:scale-95">
                            Download CSV
                         </button>
                      </div>

                      <div className="pt-4">
                         <h3 className="font-bold text-slate-800 dark:text-white mb-4">Account</h3>
                         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xl">
                               {user.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                               <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* SYSTEM DOCS VIEW */}
          {currentPage === 'docs' && user.role === UserRole.SUPER_ADMIN && <DocumentationView />}

        </div>
      </Layout>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <CommandPalette 
         isOpen={cmdOpen} 
         onClose={() => setCmdOpen(false)} 
         students={students}
         onNavigate={setCurrentPage}
         onThemeToggle={toggleTheme}
         onSelectStudent={(s) => { addToast(`Selected ${s.name}`, 'info'); setCmdOpen(false); }}
      />
    </ToastContext.Provider>
  );
}

export default App;