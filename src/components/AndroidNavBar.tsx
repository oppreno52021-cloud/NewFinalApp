import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import {
  Home,
  Users,
  CalendarCheck,
  Package,
  Settings,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getFormattedTodayArabic, getCurrentMonthWeek, getCurrentArabicWorkDay } from '../utils/planHelper';

interface AndroidNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userProfile: UserProfile;
  todayVisitsCount: number;
  todayScheduledCount?: number;
  todayCompletedCount?: number;
  todayAreaLabel?: string;
  totalDoctorsCount: number;
  onOpenAddDoctorToToday: () => void;
  showTopHeader?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  todayVisitsCount,
  todayScheduledCount,
  todayCompletedCount,
  todayAreaLabel,
  showTopHeader = true,
}) => {
  const currentWeek = getCurrentMonthWeek();
  const weekLabel = `الأسبوع ${
    currentWeek === 1 ? 'الأول' : currentWeek === 2 ? 'الثاني' : currentWeek === 3 ? 'الثالث' : 'الرابع'
  }`;

  const arabicDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
  const arabicDayAndMonth = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });

  // Total scheduled visits today (fallback to 0 or todayVisitsCount)
  const totalVisitsToday = todayScheduledCount ?? todayVisitsCount ?? 0;
  const completedVisitsToday = todayCompletedCount ?? 0;
  const completionPercentage =
    totalVisitsToday > 0 ? Math.min(100, Math.round((completedVisitsToday / totalVisitsToday) * 100)) : 0;

  const displayArea = todayAreaLabel && todayAreaLabel.trim().length > 0 ? todayAreaLabel : userProfile.territory;

  return (
    <>
      {/* Top Application Bar - Shows only on Home screen (Slim single-row matching footer height ~56px) */}
      {showTopHeader && activeTab === 'home' && (
        <header
          id="app-header"
          className="sticky top-0 z-30 h-14 bg-white dark:bg-[#0b1320] border-b border-[#e5e5e5] dark:border-slate-800 shadow-xs transition-colors flex items-center"
        >
          <div className="max-w-md sm:max-w-xl w-full mx-auto px-3.5 sm:px-4 flex items-center justify-between gap-2.5">
            {/* الجانب الأيمن: الأسبوع واليوم والمنطقة بتنسيق مدمج ومتناسق */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#e6f2f2] dark:bg-teal-950/60 text-[#008080] dark:text-teal-300 flex items-center justify-center shrink-0 border border-[#008080]/20 dark:border-teal-800/50">
                <Calendar className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="flex flex-col text-right leading-tight min-w-0">
                <span className="text-xs font-black text-[#1a1a1a] dark:text-teal-200 truncate">
                  {weekLabel} • {arabicDayName}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#666666] dark:text-slate-400 truncate">
                  <MapPin className="w-3 h-3 text-[#008080] dark:text-teal-400 shrink-0" />
                  <span className="truncate">{displayArea}</span>
                </div>
              </div>
            </div>

            {/* الجانب الأيسر: كبسولة إنجاز الزيارات الميدانية المشرقة والواضحة */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#e6f2f2] dark:bg-teal-950/70 text-[#008080] dark:text-teal-100 border border-[#008080]/30 dark:border-teal-700/60 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#008080] dark:text-teal-400 shrink-0" />
                <span className="text-[11px] font-bold text-[#008080]/90 dark:text-teal-300/90">المنجز:</span>
                <span className="text-xs font-black tracking-tight text-[#1a1a1a] dark:text-teal-100">{completedVisitsToday}/{totalVisitsToday}</span>
                {totalVisitsToday > 0 && (
                  <span className="mr-0.5 px-1.5 py-0.5 rounded-md bg-[#008080] text-[10px] font-black text-white shadow-2xs">
                    {completionPercentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Bottom Android Navigation Bar (5 Approved Tabs - Matching Height ~56px) */}
      <nav
        id="bottom-navigation-bar"
        className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-white dark:bg-[#0b1320] border-t border-[#e5e5e5] dark:border-slate-800 shadow-lg flex items-center"
      >
        <div className="max-w-md w-full mx-auto grid grid-cols-5 px-1">
          {/* 1. الرئيسية */}
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#008080] dark:text-teal-300 font-extrabold bg-[#e6f2f2] dark:bg-teal-950/60 border border-[#008080]/20 dark:border-teal-800/50 shadow-xs'
                : 'text-[#666666] dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-slate-100 font-bold'
            }`}
          >
            <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[11px]">الرئيسية</span>
          </button>

          {/* 2. الأطباء */}
          <button
            id="nav-tab-doctors"
            onClick={() => setActiveTab('doctors')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'doctors'
                ? 'text-[#008080] dark:text-teal-300 font-extrabold bg-[#e6f2f2] dark:bg-teal-950/60 border border-[#008080]/20 dark:border-teal-800/50 shadow-xs'
                : 'text-[#666666] dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-slate-100 font-bold'
            }`}
          >
            <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'doctors' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[11px]">الأطباء</span>
          </button>

          {/* 3. الزيارات */}
          <button
            id="nav-tab-visits"
            onClick={() => setActiveTab('visits')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'visits'
                ? 'text-[#008080] dark:text-teal-300 font-extrabold bg-[#e6f2f2] dark:bg-teal-950/60 border border-[#008080]/20 dark:border-teal-800/50 shadow-xs'
                : 'text-[#666666] dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-slate-100 font-bold'
            }`}
          >
            <CalendarCheck className={`w-5 h-5 mb-0.5 ${activeTab === 'visits' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[11px]">الزيارات</span>
          </button>

          {/* 4. المنتجات */}
          <button
            id="nav-tab-products"
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'text-[#008080] dark:text-teal-300 font-extrabold bg-[#e6f2f2] dark:bg-teal-950/60 border border-[#008080]/20 dark:border-teal-800/50 shadow-xs'
                : 'text-[#666666] dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-slate-100 font-bold'
            }`}
          >
            <Package className={`w-5 h-5 mb-0.5 ${activeTab === 'products' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[11px]">المنتجات</span>
          </button>

          {/* 5. الإعدادات */}
          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-[#008080] dark:text-teal-300 font-extrabold bg-[#e6f2f2] dark:bg-teal-950/60 border border-[#008080]/20 dark:border-teal-800/50 shadow-xs'
                : 'text-[#666666] dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-slate-100 font-bold'
            }`}
          >
            <Settings className={`w-5 h-5 mb-0.5 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[11px]">الإعدادات</span>
          </button>
        </div>
      </nav>
    </>
  );
};
