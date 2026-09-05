import React, { useState } from 'react';
import { UserProfile, Doctor, Visit, Product, Objection, AppFontSize, AppTheme } from '../types';
import {
  User,
  Download,
  Upload,
  CheckCircle2,
  Sun,
  Moon,
  Type,
  Palette,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface SettingsScreenViewProps {
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  doctors: Doctor[];
  visits: Visit[];
  products: Product[];
  objections: Objection[];
  fontSize: AppFontSize;
  onChangeFontSize: (size: AppFontSize) => void;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  requestConfirmDelete: (title: string, message: string, onConfirm: () => void) => void;
  onImportData: (data: {
    doctors: Doctor[];
    visits: Visit[];
    products: Product[];
    objections: Objection[];
  }) => void;
  onResetData: () => void;
  showToast: (message: string) => void;
}

export const SettingsScreenView: React.FC<SettingsScreenViewProps> = ({
  userProfile,
  onUpdateUserProfile,
  doctors,
  visits,
  products,
  objections,
  fontSize,
  onChangeFontSize,
  theme,
  onChangeTheme,
  onImportData,
  showToast,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Collapsible Dropdown State for all setting boxes (closed by default)
  const [openSections, setOpenSections] = useState<{
    profile: boolean;
    appearance: boolean;
    backup: boolean;
  }>({
    profile: false,
    appearance: false,
    backup: false,
  });

  const toggleSection = (section: 'profile' | 'appearance' | 'backup') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(profile);
    setSavedSuccess(true);
    showToast('تم حفظ بيانات المندوب بنجاح! ✅');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const fullBackup = {
      userProfile,
      doctors,
      visits,
      products,
      objections,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(fullBackup, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `DoctorMemory_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تنزيل النسخة الاحتياطية بنجاح 📥');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.doctors && parsed.visits) {
            onImportData({
              doctors: parsed.doctors || [],
              visits: parsed.visits || [],
              products: parsed.products || products,
              objections: parsed.objections || objections,
            });
            showToast('تمت استعادة البيانات بنجاح من النسخة الاحتياطية! 🔄');
          } else {
            alert('صيغة ملف النسخة الاحتياطية غير صالحة.');
          }
        } catch (error) {
          alert('تعذر قراءة الملف. يرجى التأكد من اختيار ملف JSON صحيح.');
        }
      };
    }
  };

  return (
    <div id="settings-screen-container" className="space-y-3.5 pb-24 max-w-4xl mx-auto px-1">
      {/* Box 1: Rep Profile Form (Collapsible Dropdown) */}
      <div className="bg-white dark:bg-[#132235] rounded-2xl border border-[#e5e5e5] dark:border-slate-800 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('profile')}
          className="w-full p-4 flex items-center justify-between text-right cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e6f2f2] dark:bg-teal-950/50 border border-[#008080]/30 dark:border-teal-800/50 flex items-center justify-center text-[#008080] dark:text-teal-400 shrink-0">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1a1a1a] dark:text-slate-100">
                الملف المهني للمندوب
              </h3>
              <p className="text-[11px] text-[#666666] dark:text-slate-400">
                تظهر هذه البيانات تلقائياً في تقارير الزيارات وخط السير
              </p>
            </div>
          </div>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[#666666] dark:text-slate-500 transition-transform duration-200 ${
              openSections.profile ? 'rotate-180 text-[#008080] dark:text-teal-400' : ''
            }`}
          >
            <ChevronDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>

        {openSections.profile && (
          <div className="p-4 pt-1 border-t border-[#e5e5e5] dark:border-slate-800/80">
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 mb-1">
                    اسم المندوب:
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.repName}
                    onChange={(e) => setProfile({ ...profile, repName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-700 text-xs font-bold text-[#000000] dark:text-slate-100 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 mb-1">
                    شركة الأدوية:
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-700 text-xs font-bold text-[#000000] dark:text-slate-100 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 mb-1">
                    المنطقة الجغرافية (Territory):
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.territory}
                    onChange={(e) => setProfile({ ...profile, territory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-700 text-xs font-bold text-[#000000] dark:text-slate-100 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 mb-1">
                    الخط الدوائي (Line):
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.line}
                    onChange={(e) => setProfile({ ...profile, line: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-700 text-xs font-bold text-[#000000] dark:text-slate-100 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 mb-1">
                    الهدف اليومي لعدد الزيارات (Target):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={profile.dailyTargetVisits}
                    onChange={(e) =>
                      setProfile({ ...profile, dailyTargetVisits: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-700 text-xs font-bold text-[#000000] dark:text-slate-100 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savedSuccess ? '✓ تم الحفظ بنجاح' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Box 2: Appearance, Font Size and Theme (Collapsible Dropdown) */}
      <div className="bg-white dark:bg-[#132235] rounded-2xl border border-[#e5e5e5] dark:border-slate-800 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('appearance')}
          className="w-full p-4 flex items-center justify-between text-right cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e6f2f2] dark:bg-teal-950/50 border border-[#008080]/30 dark:border-teal-800/50 flex items-center justify-center text-[#008080] dark:text-teal-400 shrink-0">
              <Palette className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1a1a1a] dark:text-slate-100">
                المظهر وحجم الخط والسمة
              </h3>
              <p className="text-[11px] text-[#666666] dark:text-slate-400">
                تخصيص حجم الخط لسهولة القراءة الميدانية، والتبديل بين الوضع الليلي والنهاري
              </p>
            </div>
          </div>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[#666666] dark:text-slate-500 transition-transform duration-200 ${
              openSections.appearance ? 'rotate-180 text-[#008080] dark:text-teal-400' : ''
            }`}
          >
            <ChevronDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>

        {openSections.appearance && (
          <div className="p-4 pt-1 border-t border-[#e5e5e5] dark:border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* 1. حجم الخط (عادي - وسط - كبير) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#008080] dark:text-teal-400" />
                  <span>حجم الخط في التطبيق:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeFontSize('normal');
                      showToast('تم ضبط حجم الخط: عادي');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      fontSize === 'normal'
                        ? 'bg-[#008080] text-white border-[#008080] shadow-xs font-extrabold'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1a1a1a] dark:text-slate-300 border-[#cccccc] dark:border-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-xs">عادي</div>
                    <div className="text-[10px] opacity-75 mt-0.5">افتراضي</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeFontSize('medium');
                      showToast('تم ضبط حجم الخط: وسط');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      fontSize === 'medium'
                        ? 'bg-[#008080] text-white border-[#008080] shadow-xs font-extrabold'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1a1a1a] dark:text-slate-300 border-[#cccccc] dark:border-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-sm">وسط</div>
                    <div className="text-[10px] opacity-75 mt-0.5">مريح للعين</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeFontSize('large');
                      showToast('تم ضبط حجم الخط: كبير');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      fontSize === 'large'
                        ? 'bg-[#008080] text-white border-[#008080] shadow-xs font-extrabold'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1a1a1a] dark:text-slate-300 border-[#cccccc] dark:border-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-base font-bold">كبير</div>
                    <div className="text-[10px] opacity-75 mt-0.5">للحركة</div>
                  </button>
                </div>
              </div>

              {/* 2. السمة (فاتح - داكن) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1a1a1a] dark:text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#008080] dark:text-teal-400" />
                  <span>السمة والثيم (Theme):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeTheme('light');
                      showToast('تم تفعيل الثيم الفاتح ☀️');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[#008080] text-white border-[#008080] shadow-xs font-extrabold'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1a1a1a] dark:text-slate-300 border-[#cccccc] dark:border-slate-700 font-bold'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="text-xs">فاتح (Light)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeTheme('dark');
                      showToast('تم تفعيل الثيم الداكن 🌙');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#008080] text-white border-[#008080] shadow-xs font-extrabold'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1a1a1a] dark:text-slate-300 border-[#cccccc] dark:border-slate-700 font-bold'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs">الداكن (Dark)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Box 3: Backup and Data Safety (Collapsible Dropdown) */}
      <div className="bg-white dark:bg-[#132235] rounded-2xl border border-[#e5e5e5] dark:border-slate-800 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('backup')}
          className="w-full p-4 flex items-center justify-between text-right cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e6f2f2] dark:bg-teal-950/50 border border-[#008080]/30 dark:border-teal-800/50 flex items-center justify-center text-[#008080] dark:text-teal-400 shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1a1a1a] dark:text-slate-100">
                أمان البيانات والنسخ الاحتياطي
              </h3>
              <p className="text-[11px] text-[#666666] dark:text-slate-400">
                احفظ أطباءك وسجل زياراتك في ملف آمن على جهازك واستعادتها بأي وقت
              </p>
            </div>
          </div>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[#666666] dark:text-slate-500 transition-transform duration-200 ${
              openSections.backup ? 'rotate-180 text-[#008080] dark:text-teal-400' : ''
            }`}
          >
            <ChevronDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>

        {openSections.backup && (
          <div className="p-4 pt-1 border-t border-[#e5e5e5] dark:border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* 1. Download Backup */}
              <button
                type="button"
                onClick={handleExportData}
                className="p-3.5 rounded-xl border border-[#cccccc] dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:bg-[#e6f2f2]/60 dark:hover:bg-teal-950/40 hover:border-[#008080] dark:hover:border-teal-700 text-right space-y-1 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#1a1a1a] dark:text-slate-100">
                  <Download className="w-4 h-4 text-[#008080] dark:text-teal-400" />
                  <span>تنزيل نسخة احتياطية (Backup)</span>
                </div>
                <p className="text-[11px] text-[#666666] dark:text-slate-400">
                  تنزيل ملف JSON به كل الأطباء والزيارات والأدوية
                </p>
              </button>

              {/* 2. Upload Restore */}
              <label className="p-3.5 rounded-xl border border-[#cccccc] dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:bg-[#e6f2f2]/60 dark:hover:bg-teal-950/40 hover:border-[#008080] dark:hover:border-teal-700 text-right space-y-1 transition-all cursor-pointer block">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1a1a1a] dark:text-slate-100">
                  <Upload className="w-4 h-4 text-[#008080] dark:text-teal-400" />
                  <span>استعادة نسخة سابقة (Restore)</span>
                </div>
                <p className="text-[11px] text-[#666666] dark:text-slate-400">
                  رفع ملف JSON محفوظ سابقاً لإعادة البيانات
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

