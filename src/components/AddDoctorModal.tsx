import React, { useState, useEffect } from 'react';
import { Doctor, Product, DoctorSpecialty, DoctorClass, WorkDay, MonthWeek } from '../types';
import { X, Check, Stethoscope, Gift, Calendar } from 'lucide-react';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctor: Doctor) => void;
  initialDoctor?: Doctor | null;
  products: Product[];
  currentTerritory: string;
}

const SPECIALTIES: DoctorSpecialty[] = [
  'أمراض قلب وأوعية',
  'باطنة عامة',
  'طب أطفال وحديثي ولادة',
  'جراحة عظام ومفاصل',
  'جهاز هضمي وكبد',
  'نساء وتوليد',
  'أمراض صدرية وحساسية',
  'مخ وأعصاب',
  'جلدية وتناسلية',
  'مسالك بولية',
];

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDoctor,
  products,
  currentTerritory,
}) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState<string>('باطنة عامة');
  const [classification, setClassification] = useState<DoctorClass>('A');
  const [territory, setTerritory] = useState(currentTerritory);
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bestVisitTime, setBestVisitTime] = useState('');
  const [lovesSamples, setLovesSamples] = useState(false);
  const [planDay, setPlanDay] = useState<WorkDay | ''>('');
  const [planWeeks, setPlanWeeks] = useState<MonthWeek[]>([1, 2, 3, 4]);
  const [targetedProductIds, setTargetedProductIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialDoctor) {
      setName(initialDoctor.name);
      setSpecialty(initialDoctor.specialty);
      setClassification(initialDoctor.classification);
      setTerritory(initialDoctor.territory);
      setHospitalOrClinic(initialDoctor.hospitalOrClinic || '');
      setAddress(initialDoctor.address || '');
      setPhone(initialDoctor.phone || '');
      setBestVisitTime(initialDoctor.bestVisitTime || '');
      setLovesSamples(Boolean(initialDoctor.lovesSamples));
      setPlanDay(initialDoctor.planDay || '');
      setPlanWeeks(initialDoctor.planWeeks || [1, 2, 3, 4]);
      setTargetedProductIds(initialDoctor.targetedProductIds || []);
      setNotes(initialDoctor.notes || '');
    } else {
      setName('');
      setSpecialty('باطنة عامة');
      setClassification('A');
      setTerritory(currentTerritory || 'مصر الجديدة');
      setHospitalOrClinic('');
      setAddress('');
      setPhone('');
      setBestVisitTime('');
      setLovesSamples(false);
      setPlanDay('');
      setPlanWeeks([1, 2, 3, 4]);
      setTargetedProductIds(products.slice(0, 2).map((p) => p.id));
      setNotes('');
    }
  }, [initialDoctor, isOpen, currentTerritory, products]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedDoctor: Doctor = {
      id: initialDoctor ? initialDoctor.id : `doc-${Date.now()}`,
      name: name.trim(),
      specialty,
      classification,
      territory: territory.trim() || 'المنطقة الرئيسية',
      hospitalOrClinic: hospitalOrClinic.trim(),
      address: address.trim(),
      phone: phone.trim(),
      bestVisitTime: bestVisitTime.trim(),
      lovesSamples,
      planDay: planDay ? (planDay as WorkDay) : undefined,
      planWeeks: planDay ? planWeeks : undefined,
      targetedProductIds,
      totalVisitsCount: initialDoctor ? initialDoctor.totalVisitsCount : 0,
      notes: notes.trim(),
    };

    onSave(savedDoctor);
    onClose();
  };

  const toggleWeek = (week: MonthWeek) => {
    setPlanWeeks((prev) =>
      (prev || []).includes(week)
        ? (prev || []).filter((w) => w !== week)
        : [...(prev || []), week].sort()
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {initialDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
              </h3>
              <p className="text-xs text-slate-500">البيانات الأساسية وتفضيل العينات وخطة الزيارات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-3 space-y-3.5 pr-1">
          {/* 1. Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">اسم الطبيب *:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أ.د. هاني نبيل عبد العزيز"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* 2. Class & Specialty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">الكلاس / الفئة *:</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as DoctorClass)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-700"
              >
                <option value="A+">A+ (أعلى أولوية ووصفات)</option>
                <option value="A">A (عالي الأولوية)</option>
                <option value="B">B (متوسط)</option>
                <option value="C">C (عادي)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">التخصص الطبي *:</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700"
              >
                {SPECIALTIES.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Area / Territory */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              المنطقة الجغرافية (Territory) *:
            </label>
            <input
              type="text"
              required
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
              placeholder="مثال: مصر الجديدة ، مدينة نصر ، المعادي..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* 4. Loves Samples Checkbox (Approved Feature) */}
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lovesSamples}
                onChange={(e) => setLovesSamples(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded"
              />
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-rose-600" />
                <span>طبيب يفضل العينات ويستخدمها للمرضى (Sample Lover 🎁)</span>
              </span>
            </label>
            <p className="text-[11px] text-rose-700 mr-6 mt-0.5">
              سيتم تمييزه بشارة عينات في الرئيسية لتجهيز العينات قبيل الدخول للعيادة
            </p>
          </div>

          {/* 5. Plan Assignment (Optional directly in Doctor Modal) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span>جدولة الطبيب في الخطة (اختياري):</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">يوم الزيارة:</label>
                <select
                  value={planDay}
                  onChange={(e) => setPlanDay(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                >
                  <option value="">غير محدد بالخطة بعد</option>
                  <option value="السبت">السبت</option>
                  <option value="الأحد">الأحد</option>
                  <option value="الإثنين">الإثنين</option>
                  <option value="الثلاثاء">الثلاثاء</option>
                  <option value="الأربعاء">الأربعاء</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">أسابيع الشهر:</label>
                <div className="flex items-center gap-1">
                  {([1, 2, 3, 4] as MonthWeek[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleWeek(w)}
                      className={`flex-1 py-1 rounded text-[11px] font-bold border cursor-pointer ${
                        (planWeeks || []).includes(w)
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Clinic / Hospital & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">العيادة / المستشفى:</label>
              <input
                type="text"
                value={hospitalOrClinic}
                onChange={(e) => setHospitalOrClinic(e.target.value)}
                placeholder="برج الأطباء / عيادة خاصة"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">رقم الهاتف:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* 7. Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ملاحظات هامة حول شخصية الطبيب وتفضيلاته:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: طبيب أكاديمي يفضل الاطلاع على الدراسات الإكلينيكية المختصرة"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              حفظ الطبيب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
