import React, { useState, useMemo } from 'react';
import { Visit, Doctor, UserProfile, DoctorReaction } from '../types';
import {
  CalendarCheck,
  Search,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Filter,
  FileText,
  Share2,
  Copy,
  Check,
  Edit2,
  ClipboardCopy,
  Gift,
  X,
  Stethoscope,
} from 'lucide-react';
import { generateDailyCallReport } from '../utils/planHelper';

interface VisitsScreenViewProps {
  visits: Visit[];
  doctors: Doctor[];
  userProfile: UserProfile;
  onOpenAddVisit: () => void;
  onEditVisit: (visit: Visit) => void;
  onDeleteVisit: (visitId: string) => void;
  requestConfirmDelete?: (title: string, message: string, onConfirm: () => void) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  showToast: (message: string) => void;
}

export const VisitsScreenView: React.FC<VisitsScreenViewProps> = ({
  visits,
  doctors,
  userProfile,
  onOpenAddVisit,
  onEditVisit,
  onDeleteVisit,
  requestConfirmDelete,
  onSelectDoctor,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedReaction, setSelectedReaction] = useState<string>('الكل');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered visits
  const filteredVisits = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return visits.filter((v) => {
      // Search
      const matchesSearch =
        (v.doctorName || '').toLowerCase().includes(q) ||
        (v.productsDiscussed || []).some((p) => (p || '').toLowerCase().includes(q)) ||
        (v.notes ? v.notes.toLowerCase().includes(q) : false);

      // Reaction
      const matchesReaction =
        selectedReaction === 'الكل' || v.doctorReaction === selectedReaction;

      // Period
      let matchesPeriod = true;
      if (selectedPeriod === 'today') {
        matchesPeriod = v.date === todayStr;
      } else if (selectedPeriod === 'week') {
        const visitTime = new Date(v.date).getTime();
        const now = new Date().getTime();
        const diffDays = (now - visitTime) / (1000 * 3600 * 24);
        matchesPeriod = diffDays <= 7 && diffDays >= 0;
      } else if (selectedPeriod === 'month') {
        const visitTime = new Date(v.date).getTime();
        const now = new Date().getTime();
        const diffDays = (now - visitTime) / (1000 * 3600 * 24);
        matchesPeriod = diffDays <= 30 && diffDays >= 0;
      }

      return matchesSearch && matchesReaction && matchesPeriod;
    });
  }, [visits, searchQuery, selectedReaction, selectedPeriod, todayStr]);

  // Handle single visit ChatGPT prompt
  const handleCopyVisitForChatGpt = async (visit: Visit) => {
    const doc = (doctors || []).find((d) => d.id === visit.doctorId);
    const prods = (visit.productsDiscussed || []).join(' ، ');
    const text = `أنا مندوب دعاية طبية لشركة "${userProfile?.companyName || ''}".
أريد منك تحليلاً سريعاً لزيارة طبية تمت مع الطبيب واقتراح خطة المتابعة القادمة:
• الطبيب: ${visit.doctorName || ''} (${doc?.specialty || 'تخصص طبي'} - ${doc?.territory || ''})
• الأدوية التي تمت مناقشتها: ${prods || 'مراجعة عامة'}
• رد فعل الطبيب في الزيارة: ${visit.doctorReaction || 'إيجابي'}
• العينات المسلمة: ${
      Array.isArray(visit.samplesGiven) && visit.samplesGiven.length > 0
        ? visit.samplesGiven.map((s) => `${s.productName} (${s.quantity})`).join(' ، ')
        : 'لم يتم تسليم عينات'
    }
• الملاحظات والاتفاق: ${visit.notes || 'لا توجد ملاحظات إضافية'}

المطلوب:
1. ما هي الرسالة أو النقطة السريرية الأنسب للبدء بها في الزيارة القادمة لمتابعة التزامه؟
2. كيف أتأكد من أن المريض بدأ بالفعل في استخدام الدواء الذي وعد به الطبيب؟`;

    try {
      await navigator.clipboard.writeText(text);
      showToast(`تم نسخ ملخص الزيارة لـ ChatGPT بنجاح! 🚀`);
    } catch {
      showToast('تم نسخ الملخص.');
    }
  };

  // Report Text
  const dailyReportText = useMemo(() => {
    return generateDailyCallReport(visits, doctors, userProfile, reportDate);
  }, [visits, doctors, userProfile, reportDate]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(dailyReportText);
      showToast('تم نسخ تقرير الزيارات اليومي بنجاح! جاهز للإرسال على واتساب أو للمدير 📋');
    } catch {
      showToast('تم نسخ التقرير.');
    }
  };

  return (
    <div id="visits-screen-container" className="space-y-4 pb-24 max-w-4xl mx-auto px-1">
      {/* Top Header and Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              سجل الزيارات والتقارير الميدانية ({visits.length} زيارة)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة تاريخ ما دار في العيادات، وتصدير تقرير الـ Daily Call Report
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Daily Call Report */}
            <button
              id="btn-export-daily-report"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
              title="تصدير تقرير الزيارات اليومي"
            >
              <FileText className="w-4 h-4 text-teal-800" />
              <span>📤 تصدير تقرير Daily Report</span>
            </button>

            {/* Add Visit */}
            <button
              id="btn-add-visit-screen"
              onClick={onOpenAddVisit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0a3d62] hover:bg-[#083150] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ تسجيل زيارة</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="ابحث باسم الطبيب، الدواء المعروض، أو الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500">الفترة:</span>
            {[
              { key: 'all', label: 'الكل' },
              { key: 'today', label: 'اليوم' },
              { key: 'week', label: 'آخر 7 أيام' },
              { key: 'month', label: 'هذا الشهر' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === p.key
                    ? 'bg-[#0a3d62] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Reaction Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">رد الفعل:</span>
            <select
              value={selectedReaction}
              onChange={(e) => setSelectedReaction(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-700"
            >
              <option value="الكل">كل الردود</option>
              <option value="ممتاز / إيجابي جداً">ممتاز / إيجابي جداً</option>
              <option value="إيجابي">إيجابي</option>
              <option value="محايد">محايد</option>
              <option value="متردد">متردد</option>
              <option value="معترض">معترض</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits Cards List */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">لا توجد زيارات مسجلة تطابق بحثك</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            قم بتسجيل زياراتك الميدانية لتوثيق أداء كل دواء والاتفاق مع الأطباء
          </p>
          <button
            onClick={onOpenAddVisit}
            className="px-4 py-2 rounded-xl bg-[#0a3d62] hover:bg-[#083150] text-white text-xs font-bold cursor-pointer"
          >
            تسجيل زيارة الآن
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVisits.map((visit) => {
            const doc = doctors.find((d) => d.id === visit.doctorId);

            // Reaction Badge Colors
            const reaction = visit.doctorReaction || '';
            const reactionColor =
              reaction.includes('ممتاز') || reaction === 'إيجابي'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : reaction === 'محايد'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200';

            return (
              <div
                key={visit.id}
                id={`visit-card-${visit.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 p-4 shadow-xs transition-all"
              >
                {/* Header of Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      onClick={() => doc && onSelectDoctor(doc)}
                      className="text-base font-extrabold text-slate-900 hover:text-teal-800 cursor-pointer"
                    >
                      {visit.doctorName}
                    </h3>
                    {doc && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        ({doc.specialty} • {doc.territory} • فئة {doc.classification})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">
                      {visit.date} {visit.time ? `• ${visit.time}` : ''}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${reactionColor}`}>
                      {visit.doctorReaction}
                    </span>
                  </div>
                </div>

                {/* Body of Card */}
                <div className="py-2.5 space-y-2">
                  {/* Products Discussed */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-600">الأدوية المعروضة:</span>
                    {(visit.productsDiscussed || []).length > 0 ? (
                      (visit.productsDiscussed || []).map((prod, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                        >
                          {prod}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">مراجعة عامة</span>
                    )}
                  </div>

                  {/* Samples Left */}
                  {Array.isArray(visit.samplesGiven) && visit.samplesGiven.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-800 font-semibold bg-rose-50/70 p-2 rounded-xl border border-rose-200/60">
                      <Gift className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        العينات المتروكة:{' '}
                        {visit.samplesGiven.map((s) => `${s.productName} (${s.quantity})`).join(' ، ')}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {visit.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 ml-1">الملاحظات والاتفاق:</span>
                      <span>{visit.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer / Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Copy to ChatGPT */}
                  <button
                    onClick={() => handleCopyVisitForChatGpt(visit)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer"
                    title="نسخ تقرير الزيارة لـ ChatGPT لاقتراح استراتيجية المتابعة"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5 text-teal-800" />
                    <span>📋 نسخ لـ ChatGPT</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditVisit(visit)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => {
                        if (requestConfirmDelete) {
                          requestConfirmDelete(
                            'حذف الزيارة',
                            `هل أنت متأكد من حذف زيارة د. ${visit.doctorName} بتاريخ ${visit.date} نهائياً من السجل؟`,
                            () => {
                              onDeleteVisit(visit.id);
                              showToast('تم حذف الزيارة بنجاح.');
                            }
                          );
                        } else {
                          onDeleteVisit(visit.id);
                          showToast('تم حذف الزيارة بنجاح.');
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                      title="حذف الزيارة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Daily Call Report (Approved Feature) */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    تقرير الزيارات اليومي (Daily Call Report)
                  </h3>
                  <p className="text-xs text-slate-500">
                    جاهز للإرسال بنقرة واحدة عبر الواتساب أو البريد الإلكتروني للمدير
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date Picker */}
            <div className="py-3 flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-700">تاريخ التقرير:</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Report Content Box */}
            <div className="overflow-y-auto flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed select-all">
              {dailyReportText}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a3d62] hover:bg-[#083150] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ التقرير بالكامل 📋</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
