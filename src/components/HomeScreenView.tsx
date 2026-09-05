import React, { useState } from 'react';
import { Doctor, Visit, Product, UserProfile, ActiveTab, DailyTask } from '../types';
import { DailyTasksSection } from './DailyTasksSection';
import {
  Sparkles,
  MapPin,
  Stethoscope,
  Plus,
  CheckCircle2,
  CalendarCheck,
  ClipboardCopy,
  MoreVertical,
  Edit2,
  Trash2,
  UserMinus,
  Gift,
  Search,
  X,
  ExternalLink,
  Clock,
  Check,
  UserPlus,
} from 'lucide-react';
import {
  getCurrentArabicWorkDay,
  getCurrentMonthWeek,
  generateChatGptPrompt,
} from '../utils/planHelper';

interface HomeScreenViewProps {
  doctors: Doctor[];
  visits: Visit[];
  products: Product[];
  userProfile: UserProfile;
  todayDoctorIds: string[];
  onAddDoctorToToday: (doctorId: string | string[]) => void;
  onRemoveDoctorFromToday: (doctorId: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onOpenAddVisitForDoctor: (doctor: Doctor) => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctorId: string) => void;
  requestConfirmDelete?: (title: string, message: string, onConfirm: () => void) => void;
  setActiveTab: (tab: ActiveTab) => void;
  showToast: (message: string) => void;
  dailyTasks: DailyTask[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompletedTasks: () => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  doctors,
  visits,
  products,
  userProfile,
  todayDoctorIds,
  onAddDoctorToToday,
  onRemoveDoctorFromToday,
  onSelectDoctor,
  onOpenAddVisitForDoctor,
  onEditDoctor,
  onDeleteDoctor,
  requestConfirmDelete,
  setActiveTab,
  showToast,
  dailyTasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompletedTasks,
}) => {
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [selectedDoctorIdsToAdd, setSelectedDoctorIdsToAdd] = useState<string[]>([]);
  const [searchDoctorQuery, setSearchDoctorQuery] = useState('');
  const [activeMenuDoctorId, setActiveMenuDoctorId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  const currentWorkDay = getCurrentArabicWorkDay();
  const currentWeek = getCurrentMonthWeek();
  const todayStr = new Date().toISOString().split('T')[0];

  // Determine list of doctors scheduled for today:
  // 1. Doctors whose planDay and planWeeks match today
  // 2. Doctors explicitly added to todayDoctorIds
  const scheduledDoctors = doctors.filter((doc) => {
    // If explicitly added for today
    if ((todayDoctorIds || []).includes(doc.id)) return true;

    // Or planned according to planDay & planWeeks
    if (currentWorkDay && doc.planDay === currentWorkDay) {
      if (!doc.planWeeks || doc.planWeeks.length === 0) return true;
      return (doc.planWeeks || []).includes(currentWeek);
    }

    return false;
  });

  // Calculate visits done today
  const todayVisits = visits.filter((v) => v.date === todayStr);
  const visitedDoctorIdsToday = new Set(todayVisits.map((v) => v.doctorId));

  const totalCount = scheduledDoctors.length;
  const completedCount = scheduledDoctors.filter((doc) => visitedDoctorIdsToday.has(doc.id)).length;
  const pendingCount = Math.max(0, totalCount - completedCount);
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  // Filtered and sorted doctors based on active filterMode:
  // When 'all', unvisited doctors stay at the top, and visited doctors automatically move down to the bottom
  const displayedDoctors = [...scheduledDoctors]
    .filter((doc) => {
      const isVisited = visitedDoctorIdsToday.has(doc.id);
      if (filterMode === 'pending') return !isVisited;
      if (filterMode === 'completed') return isVisited;
      return true;
    })
    .sort((a, b) => {
      const aVisited = visitedDoctorIdsToday.has(a.id);
      const bVisited = visitedDoctorIdsToday.has(b.id);
      if (aVisited === bVisited) return 0;
      return aVisited ? 1 : -1; // Unvisited first at top, visited dropped to bottom
    });

  // Handle ChatGPT prompt copy
  const handleCopyPrompt = async (doctor: Doctor, e: React.MouseEvent) => {
    e.stopPropagation();
    const docVisits = visits.filter((v) => v.doctorId === doctor.id);
    const promptText = generateChatGptPrompt(doctor, userProfile, products, docVisits);

    try {
      await navigator.clipboard.writeText(promptText);
      showToast(`تم نسخ برومبت ChatGPT للطبيب: ${doctor.name} بنجاح! جاهز للصق 🚀`);
    } catch (err) {
      // Fallback
      showToast('تم تجهيز البرومبت للنسخ.');
    }
  };

  // Doctors available to add to today (not yet in scheduled list)
  const query = (searchDoctorQuery || '').toLowerCase();
  const availableToAdd = doctors.filter(
    (d) =>
      !scheduledDoctors.some((sd) => sd.id === d.id) &&
      ((d.name || '').toLowerCase().includes(query) ||
        (d.territory || '').toLowerCase().includes(query) ||
        (d.specialty || '').toLowerCase().includes(query))
  );

  return (
    <div id="home-screen-container" className="space-y-4 pb-24 max-w-4xl mx-auto px-1">
      {/* 1. Daily Tasks Section (مهام ومتابعات اليوم) */}
      <DailyTasksSection
        tasks={dailyTasks}
        onAddTask={onAddTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onClearCompletedTasks={onClearCompletedTasks}
      />

      {/* 2. Top Status & Daily Summary Card with Progress Bar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Title, Counts, Add Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              زيارات اليوم ({totalCount} أطباء)
            </h2>
            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 shrink-0">
              {completedCount} من {totalCount} منجزة
            </span>
          </div>

          <button
            id="btn-add-doctor-today-inline"
            onClick={() => setShowAddDoctorModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0a3d62] hover:bg-[#083150] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            title="إضافة طبيب لزيارات اليوم"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>إضافة</span>
          </button>
        </div>

        {/* Row 2: Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500">نسبة إنجاز الخطة اليومية</span>
            <span className="text-emerald-700 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-[#0a3d62] to-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Row 3: Filter Buttons (الكل - المتبقي للزيارة - تمت الزيارة) */}
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterMode === 'all'
                  ? 'bg-[#0a3d62] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              الكل ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                filterMode === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
              }`}
            >
              <span>المتبقي للزيارة</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                filterMode === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-200/80 text-amber-950'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                filterMode === 'completed'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200/70 hover:bg-emerald-100'
              }`}
            >
              <span>تمت الزيارة</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                filterMode === 'completed' ? 'bg-emerald-800 text-white' : 'bg-emerald-200/80 text-emerald-950'
              }`}>
                {completedCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Today's Doctors List */}
      {scheduledDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#0a3d62]/10 border border-[#0a3d62]/20 text-[#0a3d62] flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">لا توجد زيارات مجدولة لليوم حتى الآن</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {currentWorkDay
              ? `لم يتم إضافة أطباء لمنطقة هذا اليوم (${currentWorkDay}) بعد، أو يمكنك اختيار أطباء لزيارتهم اليوم فوراً.`
              : 'اليوم عطلة رسمية (الخميس أو الجمعة). يمكنك إضافة أطباء يدوياً لزيارتهم اليوم.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a3d62] hover:bg-[#083150] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة دكتور لقائمة اليوم</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
            >
              <span>فتح شاشة الأطباء وتخطيط المناطق</span>
            </button>
          </div>
        </div>
      ) : displayedDoctors.length === 0 ? (
        /* Empty State for Filter */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center shadow-xs space-y-2">
          {filterMode === 'pending' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">أحسنت صنعاً! 🎉</h3>
              <p className="text-xs text-slate-600">
                تم إكمال جميع زيارات اليوم بنجاح والتغطية 100%! لا يوجد أطباء متبقين.
              </p>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                عرض كل أطباء اليوم
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-1">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">لم تبدأ الزيارات بعد</h3>
              <p className="text-xs text-slate-600">
                لم يتم توثيق أي زيارة اليوم حتى الآن. ابدأ بزيارة أحد الأطباء من قائمة المتبقي!
              </p>
              <button
                type="button"
                onClick={() => setFilterMode('pending')}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0a3d62] text-white text-xs font-bold cursor-pointer"
              >
                عرض الأطباء المتبقين
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedDoctors.map((doctor, index) => {
            const hasVisitedToday = visitedDoctorIdsToday.has(doctor.id);
            const isMenuOpen = activeMenuDoctorId === doctor.id;
            const prevDoctor = index > 0 ? displayedDoctors[index - 1] : null;
            const isFirstCompleted =
              hasVisitedToday && prevDoctor && !visitedDoctorIdsToday.has(prevDoctor.id);

            // Class Badge Color
            const classColor =
              doctor.classification === 'A+'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : doctor.classification === 'A'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : doctor.classification === 'B'
                ? 'bg-sky-50 text-sky-900 border-sky-300'
                : 'bg-slate-100 text-slate-800 border-slate-300';

            return (
              <React.Fragment key={doctor.id}>
                {/* فاصل مرئي ذكي ينتقل للزيارات المنجزة في أسفل القائمة */}
                {isFirstCompleted && filterMode === 'all' && (
                  <div className="pt-3 pb-1 flex items-center gap-2">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-xs font-black text-[#0a3d62] bg-[#0a3d62]/10 px-3 py-1 rounded-full border border-[#0a3d62]/20 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0a3d62]" />
                      <span>الزيارات المنجزة اليوم ({completedCount})</span>
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                )}

                <div
                  id={`today-doctor-card-${doctor.id}`}
                  className={`bg-white rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
                    hasVisitedToday
                      ? 'border-slate-200/90 bg-slate-50/70'
                      : 'border-slate-200/90 hover:border-[#0a3d62]/40 shadow-xs'
                  }`}
                >
                  {/* Status Bar Accent */}
                  {hasVisitedToday && (
                    <div className="bg-[#0a3d62] text-white px-3 py-0.5 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم توثيق الزيارة بنجاح اليوم</span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Top Row: Name, Badges & Actions Menu */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onSelectDoctor(doctor)}
                            className="text-base font-extrabold text-slate-900 hover:text-[#0a3d62] cursor-pointer tracking-tight"
                          >
                            {doctor.name}
                          </h3>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${classColor}`}
                          >
                            فئة {doctor.classification}
                          </span>
                          {doctor.lovesSamples && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                              <Gift className="w-3 h-3 text-rose-600" />
                              <span>محب للعينات 🎁</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[#0a3d62] font-bold">{doctor.specialty}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {doctor.territory}
                          </span>
                          {doctor.hospitalOrClinic && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500 truncate max-w-[200px]">
                                {doctor.hospitalOrClinic}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Context Menu Button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuDoctorId(isMenuOpen ? null : doctor.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="خيارات إضافية"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 text-xs font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuDoctorId(null);
                                onEditDoctor(doctor);
                              }}
                              className="w-full text-right px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>تعديل بيانات الطبيب</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuDoctorId(null);
                                onRemoveDoctorFromToday(doctor.id);
                                showToast(`تمت إزالة ${doctor.name} من زيارات اليوم.`);
                              }}
                              className="w-full text-right px-3 py-2 text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5 text-amber-600" />
                              <span>إزالة من زيارات اليوم</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuDoctorId(null);
                                if (requestConfirmDelete) {
                                  requestConfirmDelete(
                                    'حذف الطبيب نهائياً',
                                    `هل أنت متأكد من حذف الطبيب "${doctor.name}" نهائياً من قاعدة البيانات؟`,
                                    () => {
                                      onDeleteDoctor(doctor.id);
                                      showToast(`تم حذف الطبيب بنجاح.`);
                                    }
                                  );
                                } else {
                                  onDeleteDoctor(doctor.id);
                                  showToast(`تم حذف الطبيب بنجاح.`);
                                }
                              }}
                              className="w-full text-right px-3 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>حذف الطبيب نهائياً</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Previous Visit Note / Summary (if available) */}
                    {(doctor.lastVisitNote || doctor.notes) && (
                      <div className="mt-3 bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 text-xs text-slate-700">
                        <span className="font-bold text-slate-900 ml-1">آخر متابعة:</span>
                        <span>{doctor.lastVisitNote || doctor.notes}</span>
                      </div>
                    )}

                    {/* The Two Power Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Button 1: Copy ChatGPT Prompt */}
                      <button
                        id={`btn-copy-prompt-${doctor.id}`}
                        onClick={(e) => handleCopyPrompt(doctor, e)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200/80 transition-all cursor-pointer active:scale-98"
                        title="نسخ برومبت تجهيز الزيارة والمتابعة لـ ChatGPT"
                      >
                        <ClipboardCopy className="w-4 h-4 text-[#0a3d62]" />
                        <span>📋 نسخ برومبت ChatGPT</span>
                      </button>

                      {/* Button 2: Log Visit & Follow-up */}
                      <button
                        id={`btn-log-visit-${doctor.id}`}
                        onClick={() => onOpenAddVisitForDoctor(doctor)}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98 ${
                          hasVisitedToday
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                            : 'bg-[#0a3d62] hover:bg-[#083150] text-white'
                        }`}
                        title="توثيق ما تم في الزيارة والملاحظات"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>{hasVisitedToday ? 'تعديل توثيق الزيارة' : '✍️ تسجيل الزيارة والمتابعة'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Modal: Add Doctor(s) to Today's Schedule */}
      {showAddDoctorModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => {
            setShowAddDoctorModal(false);
            setSelectedDoctorIdsToAdd([]);
          }}
        >
          <div
            className="bg-white dark:bg-[#152238] rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 dark:border-slate-700/80 max-h-[88vh] flex flex-col transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                  إضافة أطباء لجدول اليوم
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  حدد طبيباً واحداً أو مجموعة أطباء لإضافتهم دفعة واحدة لزياراتك
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddDoctorModal(false);
                  setSelectedDoctorIdsToAdd([]);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input & Selection Bar */}
            <div className="py-3 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، المنطقة، أو التخصص..."
                  value={searchDoctorQuery}
                  onChange={(e) => setSearchDoctorQuery(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0a3d62] dark:focus:ring-sky-500"
                />
              </div>

              {availableToAdd.length > 0 && (
                <div className="flex items-center justify-between px-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        selectedDoctorIdsToAdd.length === availableToAdd.length &&
                        availableToAdd.length > 0
                      ) {
                        setSelectedDoctorIdsToAdd([]);
                      } else {
                        setSelectedDoctorIdsToAdd(availableToAdd.map((d) => d.id));
                      }
                    }}
                    className="inline-flex items-center gap-1.5 font-bold text-[#0a3d62] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    <span>
                      {selectedDoctorIdsToAdd.length === availableToAdd.length &&
                      availableToAdd.length > 0
                        ? 'إلغاء تحديد الكل'
                        : `تحديد الكل (${availableToAdd.length})`}
                    </span>
                  </button>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    تم تحديد {selectedDoctorIdsToAdd.length} من {availableToAdd.length}
                  </span>
                </div>
              )}
            </div>

            {/* List of Available Doctors */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-0.5 max-h-[50vh]">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  {searchDoctorQuery
                    ? 'لم يتم العثور على أطباء يطابقون البحث.'
                    : 'جميع أطبائك المسجلين مضافون بالفعل لجدول اليوم!'}
                </div>
              ) : (
                availableToAdd.map((doc) => {
                  const isSelected = selectedDoctorIdsToAdd.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctorIdsToAdd((prev) =>
                          prev.includes(doc.id)
                            ? prev.filter((id) => id !== doc.id)
                            : [...prev, doc.id]
                        );
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#0a3d62] dark:border-sky-500 bg-[#0a3d62]/5 dark:bg-sky-500/10 ring-1 ring-[#0a3d62]/30 dark:ring-sky-500/30'
                          : 'border-slate-200/80 dark:border-slate-700/80 hover:border-[#0a3d62]/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#0a3d62] dark:bg-sky-600 border-[#0a3d62] dark:border-sky-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {doc.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {doc.classification}
                            </span>
                            {doc.lovesSamples && (
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                                🎁 عينات
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {doc.specialty} • {doc.territory}
                          </p>
                        </div>
                      </div>

                      {/* Quick Single Add Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddDoctorToToday(doc.id);
                          showToast(`تمت إضافة ${doc.name} إلى زيارات اليوم!`);
                          setSelectedDoctorIdsToAdd((prev) =>
                            prev.filter((id) => id !== doc.id)
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0a3d62] hover:text-white dark:bg-slate-800 dark:hover:bg-sky-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold shrink-0 transition-all cursor-pointer"
                        title="إضافة فورية لهذا الطبيب وحده"
                      >
                        + إضافة
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddDoctorModal(false);
                  setSelectedDoctorIdsToAdd([]);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                إغلاق
              </button>

              <button
                type="button"
                disabled={selectedDoctorIdsToAdd.length === 0}
                onClick={() => {
                  if (selectedDoctorIdsToAdd.length > 0) {
                    onAddDoctorToToday(selectedDoctorIdsToAdd);
                    setSelectedDoctorIdsToAdd([]);
                    setShowAddDoctorModal(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  selectedDoctorIdsToAdd.length > 0
                    ? 'bg-[#0a3d62] hover:bg-[#083150] text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {selectedDoctorIdsToAdd.length > 0
                    ? `إضافة الأطباء المحددين (${selectedDoctorIdsToAdd.length})`
                    : 'حدد أطباء للإضافة'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
