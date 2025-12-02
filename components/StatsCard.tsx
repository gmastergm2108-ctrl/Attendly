import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'red' | 'orange';
  delay?: number; // Added delay prop for staggered animation
}

const colorStyles = {
  blue: { 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    text: 'text-blue-600 dark:text-blue-400', 
    border: 'border-blue-100 dark:border-blue-500/30', 
    iconBg: 'bg-blue-100 dark:bg-blue-500/20' 
  },
  green: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    text: 'text-emerald-600 dark:text-emerald-400', 
    border: 'border-emerald-100 dark:border-emerald-500/30', 
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20' 
  },
  red: { 
    bg: 'bg-rose-50 dark:bg-rose-900/20', 
    text: 'text-rose-600 dark:text-rose-400', 
    border: 'border-rose-100 dark:border-rose-500/30', 
    iconBg: 'bg-rose-100 dark:bg-rose-500/20' 
  },
  orange: { 
    bg: 'bg-amber-50 dark:bg-amber-900/20', 
    text: 'text-amber-600 dark:text-amber-400', 
    border: 'border-amber-100 dark:border-amber-500/30', 
    iconBg: 'bg-amber-100 dark:bg-amber-500/20' 
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, trend, trendUp, color, delay = 0 }) => {
  const styles = colorStyles[color];

  // Calculate delay class or style
  const animationStyle = { animationDelay: `${delay}ms` };

  return (
    <div 
      style={animationStyle}
      className={`group bg-white dark:bg-slate-900/60 p-6 rounded-2xl border ${styles.border} dark:border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden backdrop-blur-md animate-popIn opacity-0`}
    >
      {/* Background Decor */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${styles.bg} opacity-50 group-hover:scale-[1.75] transition-transform duration-700 ease-in-out blur-2xl group-hover:animate-pulse`} />
      
      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">{label}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight drop-shadow-sm transition-all duration-300 group-hover:tracking-normal">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-xl ${styles.bg} ${styles.text} shadow-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 border border-transparent dark:border-white/5`}>
          <Icon size={24} />
        </div>
      </div>
      
      {trend && (
        <div className="relative mt-4 flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'} flex items-center gap-1 group-hover:scale-105 transition-transform duration-300`}>
             {trendUp ? '↑' : '↓'} {trend}
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform duration-300">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;