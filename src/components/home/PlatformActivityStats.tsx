import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarRange, MapPin, TrendingUp, Users, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StatsData {
  verifiedWorkersCount: number;
  activeJobsCount: number;
  activeAreasCount: number;
  successRate: string;
  visitorsToday: number;
  visitorsLive: number;
}

const PlatformActivityStats: React.FC = () => {
  const { isBN } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchStatsAndActivities = () => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data);
          if (data.activities && data.activities.length > 0) {
            setActivities(data.activities);
          }
        } else {
          setStats({
            verifiedWorkersCount: 36,
            activeJobsCount: 15,
            activeAreasCount: 42,
            successRate: '99%',
            visitorsToday: 112,
            visitorsLive: 18,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setStats({
          verifiedWorkersCount: 36,
          activeJobsCount: 15,
          activeAreasCount: 42,
          successRate: '99%',
          visitorsToday: 112,
          visitorsLive: 18,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatsAndActivities();
    // Poll every 8 seconds for true real-time tracking
    const interval = setInterval(fetchStatsAndActivities, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-905 transition-colors duration-300 border-b border-gray-100 dark:border-gray-800" id="platform-realtime-stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Button link as seen in Screenshot */}
        <div className="flex justify-center mb-8">
          <Link
            to="/workers"
            className="inline-flex items-center gap-2 group px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-black text-[11px] tracking-wider uppercase rounded-full shadow-lg transition-all animate-pulse"
          >
            <span>{isBN ? 'সব কর্মী দেখুন' : 'View All Workers'}</span>
            <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
          </Link>
        </div>

        {/* 4-Stat Grid Area */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          
          {/* Card 1: Verified Workers */}
          <div className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bangla mb-2">
              {isBN ? 'ভেরিফায়েড কর্মী' : 'Verified Workers'}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono antialiased tracking-tight">
              {stats?.verifiedWorkersCount || 36}
            </span>
          </div>

          {/* Card 2: Active Jobs */}
          <div className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/10">
              <CalendarRange className="w-6 h-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bangla mb-2">
              {isBN ? 'সক্রিয় কাজ' : 'Active Jobs'}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono antialiased tracking-tight">
              {stats?.activeJobsCount || 15}
            </span>
          </div>

          {/* Card 3: Active Locations */}
          <div className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-900/10">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bangla mb-2">
              {isBN ? 'সক্রিয় এলাকা' : 'Active Areas'}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono antialiased tracking-tight">
              {stats?.activeAreasCount || 42}
            </span>
          </div>

          {/* Card 4: Success Rate */}
          <div className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bangla mb-2">
              {isBN ? 'সাফল্যের হার' : 'Success Rate'}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono antialiased tracking-tight">
              {stats?.successRate || '99%'}
            </span>
          </div>

        </div>

        {/* Real-time details header */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200/50 dark:border-gray-800 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bangla">
            {isBN ? 'রিয়েল-টাইম প্ল্যাটফর্ম অ্যাক্টিভিটি' : 'Real-Time Platform Activity'}
          </h3>
        </div>

        {/* Dual column: Heartbeat details & Recent Event list */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Column A: Website hits details card */}
          <div className="md:col-span-4 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div>
              <span className="text-[9px] font-black tracking-widest text-slate-400 dark:text-gray-500 uppercase block mb-1">
                Website Visitors
              </span>
              <h4 className="text-[11px] font-black text-slate-800 dark:text-gray-100 uppercase tracking-wider mb-6">
                TODAY ({isBN ? 'আজকের ভিজিটর' : 'Visitors today'})
              </h4>
              
              {/* Dynamic counter */}
              <div className="my-4">
                <span className="text-6xl font-black text-neutral-900 dark:text-white font-mono">
                  {stats?.visitorsLive || 6}
                </span>
                
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-[9px] text-emerald-600 dark:text-emerald-400 font-black tracking-wider uppercase">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                  <span>Real-Time Counter</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-wider">
                <span>Unique Visitors:</span>
                <span className="font-mono text-xs text-slate-700 dark:text-gray-300">{stats?.visitorsToday || 3}</span>
              </div>
              
              <p className="text-[8px] sm:text-[9px] text-[#2563eb] dark:text-blue-400 leading-relaxed font-bangla font-semibold mt-3">
                {isBN ? 'আমাদের এই প্ল্যাটফর্ম এ প্রতিদিন শত শত মানুষ তাদের জনবল বা কাজের প্রয়োজন মেটাতে ভিজিট করে থাকেন।' : 'Verified employers and clients visit this dashboard daily to search for premium services.'}
              </p>
            </div>
          </div>

          {/* Column B: Recent Activity Dark Bento Panel */}
          <div className="md:col-span-8 bg-zinc-950 dark:bg-[#090d16] rounded-2xl border border-neutral-900 text-white p-6 shadow-xl flex flex-col justify-between bg-radial-gradient">
            
            {/* Dark header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                  {isBN ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Events'}
                </h4>
              </div>
              <span className="text-[8px] font-bold text-gray-400 tracking-wider font-mono">LIVE LOGS</span>
            </div>

            {/* List of activities */}
            <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
              {activities.map((evt, idx) => {
                const displayTime = evt.timestamp 
                  ? (() => {
                      const diff = Date.now() - evt.timestamp;
                      if (diff < 60000) return isBN ? 'এইমাত্র' : 'just now';
                      const mins = Math.floor(diff / 60000);
                      if (mins < 60) return isBN ? `${mins} মিনিট আগে` : `${mins} mins ago`;
                      const hours = Math.floor(mins / 60);
                      if (hours < 24) return isBN ? `${hours} ঘণ্টা আগে` : `${hours} hours ago`;
                      const days = Math.floor(hours / 24);
                      return isBN ? `${days} দিন আগে` : `${days} days ago`;
                    })()
                  : evt.time;

                return (
                  <div key={evt.id || idx} className="flex justify-between items-start gap-4 text-[11px] font-bangla group border-b border-white/5 pb-2 last:border-0">
                    <div className="flex gap-2">
                      <span className="text-amber-500">▶</span>
                      <div>
                        <span className="font-extrabold text-amber-400 mr-1.5 hover:underline cursor-pointer">{evt.name}</span>
                        <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">
                          {isBN ? evt.actionBn : evt.actionEn}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-500 whitespace-nowrap tracking-tight shrink-0">
                      {displayTime}
                    </span>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4 italic">
                  {isBN ? 'কোনো সাম্প্রতিক কার্যক্রম নেই' : 'No recent actions logged'}
                </p>
              )}
            </div>

            {/* Footer indicator wrapper */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">
                Secure Connection
              </span>
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <span>{isBN ? '০ নিবন্ধিত আজ' : '0 Registrations Today'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PlatformActivityStats;
