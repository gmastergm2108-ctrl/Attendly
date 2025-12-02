import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  Code,
  ShieldCheck,
  GraduationCap,
  Baby,
  CalendarDays,
  Sun,
  Moon,
  Cpu
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, currentPage, onNavigate, isDarkMode, onToggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = () => {
    // Base items for everyone
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'holidays', label: 'Holidays', icon: CalendarDays },
    ];

    // Student Directory Access
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.TEACHER) {
      common.push({ id: 'students', label: 'Students', icon: Users });
    }

    // High Level Admin Only
    if (role === UserRole.SUPER_ADMIN) {
      // Hardware tab removed as per request
      common.push({ id: 'settings', label: 'Settings', icon: Settings });
      common.push({ id: 'docs', label: 'System Docs', icon: Code });
    }

    return common;
  };

  const menuItems = getMenuItems();

  const getRoleIcon = () => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return <ShieldCheck size={18} className="text-rose-400" />;
      case UserRole.ADMIN: return <ShieldCheck size={18} className="text-orange-400" />;
      case UserRole.TEACHER: return <GraduationCap size={18} className="text-blue-400" />;
      case UserRole.PARENT: return <Baby size={18} className="text-green-400" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] dark:bg-slate-900/80 dark:backdrop-blur-xl dark:border-r dark:border-white/5 text-slate-300 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r border-slate-800/50
      `}>
        {/* Sidebar Header */}
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center gap-3.5 relative z-10 animate-slideUpFade">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center shadow-lg shadow-primary-900/50 dark:shadow-cyan-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight dark:text-cyan-50 dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">Attendly</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse dark:bg-green-400 dark:shadow-[0_0_8px_#4ade80]"></span>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 dark:text-slate-400 animate-fadeIn delay-100">Main Menu</p>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            // Staggered animation delay for menu items
            const delayClass = idx === 0 ? 'delay-100' : idx === 1 ? 'delay-200' : idx === 2 ? 'delay-300' : 'delay-400';
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden animate-slideUpFade ${delayClass} ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50 dark:bg-cyan-600/20 dark:text-cyan-400 dark:border dark:border-cyan-500/50 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] translate-x-2' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white dark:hover:text-cyan-200 hover:translate-x-1'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent dark:from-cyan-400/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                )}
                <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50 dark:bg-cyan-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 dark:bg-slate-950/30 animate-fadeIn delay-500">
          <div className="bg-slate-800/50 dark:bg-slate-900 rounded-xl p-4 mb-3 border border-slate-700/50 dark:border-white/5 group hover:border-slate-600 dark:hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-slate-600 dark:border-slate-700 text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                {role[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate dark:text-cyan-50 group-hover:text-primary-300 dark:group-hover:text-cyan-300 transition-colors">User Account</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  {getRoleIcon()}
                  <span className="capitalize truncate">{role.replace('_', ' ').toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all duration-200 font-medium text-sm group active:scale-95 hover:shadow-lg"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950 relative transition-colors duration-500">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50/80 to-transparent dark:from-cyan-900/10 dark:to-transparent pointer-events-none z-0 animate-fadeIn duration-1000" />
        
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between relative z-10 animate-slideUpFade delay-100 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-950/80 sticky top-0 border-b border-transparent dark:border-white/5 transition-all">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-white hover:text-primary-600 rounded-lg transition-all shadow-sm bg-white/50 border border-slate-200/50 dark:text-cyan-400 dark:bg-slate-900/50 dark:border-cyan-900/50 active:scale-90 hover:scale-105"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize tracking-tight flex items-center gap-2 transition-colors duration-300">
                {menuItems.find(i => i.id === currentPage)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button
                onClick={onToggleTheme}
                className="p-2 rounded-full bg-white/60 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-yellow-400 shadow-sm hover:shadow-md"
             >
                {isDarkMode ? <Sun size={20} className="animate-spin-slow" /> : <Moon size={20} />}
             </button>

             {/* Status Badge */}
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/60 dark:border-emerald-500/30 rounded-full shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-md transition-all hover:scale-105">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-emerald-400">System Operational</span>
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 lg:px-8 relative z-10 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto py-6">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;