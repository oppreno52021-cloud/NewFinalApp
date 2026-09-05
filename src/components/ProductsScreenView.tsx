import React, { useState } from 'react';
import { Product, Objection, Doctor } from '../types';
import {
  Package,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Sparkles,
  Edit2,
  Trash2,
  ClipboardCopy,
  Gift,
  HelpCircle,
  X,
  BookOpen,
} from 'lucide-react';

interface ProductsScreenViewProps {
  products: Product[];
  objections: Objection[];
  doctors: Doctor[];
  onUpdateSampleStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddObjection: (objection: Omit<Objection, 'id'>) => void;
  onEditObjection: (objection: Objection) => void;
  onDeleteObjection: (objectionId: string) => void;
  requestConfirmDelete?: (title: string, message: string, onConfirm: () => void) => void;
  showToast: (message: string) => void;
}

export const ProductsScreenView: React.FC<ProductsScreenViewProps> = ({
  products,
  objections,
  doctors,
  onUpdateSampleStock,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddObjection,
  onEditObjection,
  onDeleteObjection,
  requestConfirmDelete,
  showToast,
}) => {
  const [subTab, setSubTab] = useState<'products' | 'objections'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddObjectionModal, setShowAddObjectionModal] = useState(false);
  const [editingObjection, setEditingObjection] = useState<Objection | null>(null);

  // Form states for Product
  const [pName, setPName] = useState('');
  const [pGeneric, setPGeneric] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pDosage, setPDosage] = useState('');
  const [pPrice, setPPrice] = useState(100);
  const [pStock, setPStock] = useState(20);
  const [pIndications, setPIndications] = useState('');
  const [pSellingPoints, setPSellingPoints] = useState('');

  // Form states for Objection
  const [objProduct, setObjProduct] = useState('');
  const [objText, setObjText] = useState('');
  const [objCategory, setObjCategory] = useState<Objection['category']>('سعر وتكلفة');
  const [objRebuttal, setObjRebuttal] = useState('');
  const [objEvidence, setObjEvidence] = useState('');

  // Product categories
  const categories = ['الكل', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products
  const q = (searchQuery || '').toLowerCase();
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(q) ||
      (prod.genericName || '').toLowerCase().includes(q) ||
      (prod.indications || []).some((ind) => (ind || '').toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'الكل' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered objections
  const filteredObjections = objections.filter((obj) => {
    return (
      (obj.objectionText || '').toLowerCase().includes(q) ||
      (obj.scientificRebuttal || '').toLowerCase().includes(q) ||
      (obj.productName || '').toLowerCase().includes(q)
    );
  });

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPGeneric(prod.genericName);
    setPCategory(prod.category);
    setPDosage(prod.dosage);
    setPPrice(prod.price);
    setPStock(prod.sampleStock);
    setPIndications(prod.indications.join(' ، '));
    setPSellingPoints(prod.keySellingPoints.join('\n'));
    setShowAddProductModal(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const indArray = pIndications
      .split(/[،,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const spArray = pSellingPoints
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        name: pName,
        genericName: pGeneric,
        category: pCategory || 'أدوية عامة',
        dosage: pDosage,
        price: Number(pPrice),
        sampleStock: Number(pStock),
        indications: indArray,
        keySellingPoints: spArray,
      });
      showToast('تم تحديث بيانات الدواء بنجاح.');
    } else {
      onAddProduct({
        name: pName,
        genericName: pGeneric,
        category: pCategory || 'أدوية عامة',
        dosage: pDosage,
        currency: 'ج.م',
        price: Number(pPrice),
        sampleStock: Number(pStock),
        indications: indArray,
        keySellingPoints: spArray,
      });
      showToast('تمت إضافة المستحضر بنجاح إلى حقيبتك الطبية.');
    }

    setShowAddProductModal(false);
    setEditingProduct(null);
  };

  // Open Edit Objection
  const handleOpenEditObjection = (obj: Objection) => {
    setEditingObjection(obj);
    setObjProduct(obj.productName);
    setObjText(obj.objectionText);
    setObjCategory(obj.category);
    setObjRebuttal(obj.scientificRebuttal);
    setObjEvidence(obj.clinicalEvidence || '');
    setShowAddObjectionModal(true);
  };

  // Save Objection
  const handleSaveObjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objText.trim() || !objRebuttal.trim()) return;

    const matchedProd = products.find(
      (p) =>
        p?.name &&
        objProduct &&
        (p.name.includes(objProduct) || objProduct.includes(p.name))
    );

    if (editingObjection) {
      onEditObjection({
        ...editingObjection,
        productName: objProduct || 'عام',
        productId: matchedProd?.id || editingObjection.productId,
        objectionText: objText,
        category: objCategory,
        scientificRebuttal: objRebuttal,
        clinicalEvidence: objEvidence,
      });
      showToast('تم تحديث الرد العلمي بنجاح.');
    } else {
      onAddObjection({
        productName: objProduct || 'مستحضر عام',
        productId: matchedProd?.id || 'prod-gen',
        objectionText: objText,
        category: objCategory,
        scientificRebuttal: objRebuttal,
        clinicalEvidence: objEvidence,
      });
      showToast('تم حفظ الاعتراض والرد العلمي بنجاح.');
    }

    setShowAddObjectionModal(false);
    setEditingObjection(null);
  };

  // Copy Product Pitch to ChatGPT
  const handleCopyProductPitch = async (product: Product) => {
    const text = `أنا مندوب دعاية طبية. أريد سيناريو بيعي ذكي وإقناعي (Sales Pitch) لتقديمه للأطباء للدواء التالي:
• اسم الدواء: ${product.name}
• المادة الفعالة والتركيز: ${product.genericName}
• السعر: ${product.price} ${product.currency}
• الجرعة: ${product.dosage}
• أهم نقاط القوة الترويجية:
${product.keySellingPoints.map((pt, i) => `  ${i + 1}. ${pt}`).join('\n')}

المطلوب:
1. صياغة جملة افتتاحية تلفت انتباه الطبيب للميزة التنافسية.
2. كيف أربط بين سعر الدواء وجودته مقارنة بالبدائل؟
3. جملة ختامية لطلب وصف الدواء للمرضى هذا الأسبوع.`;

    try {
      await navigator.clipboard.writeText(text);
      showToast(`تم نسخ بيانات المستحضر لـ ChatGPT بنجاح! 🚀`);
    } catch {
      showToast('تم النسخ.');
    }
  };

  return (
    <div id="products-screen-container" className="space-y-4 pb-24 max-w-4xl mx-auto px-1">
      {/* Top Header & Sub-Tabs Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              الحقيبة الدوائية وبنك الردود العلمية
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة الأدوية، مخزون عينات العيادات، وأقوى الردود التكتيكية
            </p>
          </div>

          <div className="flex items-center gap-2">
            {subTab === 'products' ? (
              <button
                id="btn-add-product"
                onClick={() => {
                  setEditingProduct(null);
                  setPName('');
                  setPGeneric('');
                  setPCategory('');
                  setPDosage('');
                  setPPrice(100);
                  setPStock(20);
                  setPIndications('');
                  setPSellingPoints('');
                  setShowAddProductModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ إضافة منتج جديد</span>
              </button>
            ) : (
              <button
                id="btn-add-objection"
                onClick={() => {
                  setEditingObjection(null);
                  setObjProduct(products[0]?.name || '');
                  setObjText('');
                  setObjCategory('سعر وتكلفة');
                  setObjRebuttal('');
                  setObjEvidence('');
                  setShowAddObjectionModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ إضافة اعتراض جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* 2 Clean SubTabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <button
            id="tab-products-list"
            onClick={() => setSubTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'products'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>💊 الأدوية والعينات ({products.length})</span>
          </button>

          <button
            id="tab-objections-list"
            onClick={() => setSubTab('objections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'objections'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛡️ بنك الاعتراضات ({objections.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder={
              subTab === 'products'
                ? 'ابحث باسم الدواء، المادة الفعالة، أو الاستخدام...'
                : 'ابحث بنص الاعتراض، الرد العلمي، أو الدواء...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        {/* Category Chips (Products Only) */}
        {subTab === 'products' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: PRODUCTS LIST */}
      {subTab === 'products' && (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            // Find doctors who love samples for this product's indications or specialty
            const sampleLovingDoctors = doctors.filter((doc) => doc.lovesSamples);

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 p-4 shadow-xs transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{product.name}</h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {product.genericName} •{' '}
                      <span className="text-teal-800 font-bold">
                        {product.price} {product.currency}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">الجرعة: {product.dosage}</p>
                  </div>

                  {/* Sample Stock Stepper */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-600 px-1">مخزون العينات:</span>
                    <button
                      onClick={() =>
                        onUpdateSampleStock(product.id, Math.max(0, product.sampleStock - 1))
                      }
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-900 w-8 text-center">
                      {product.sampleStock}
                    </span>
                    <button
                      onClick={() => onUpdateSampleStock(product.id, product.sampleStock + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Selling Points */}
                {product.keySellingPoints && product.keySellingPoints.length > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block mb-1">نقاط القوة التنافسية:</span>
                    {product.keySellingPoints.map((sp, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{sp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Approved Feature: Doctors who love samples section */}
                {sampleLovingDoctors.length > 0 && (
                  <div className="bg-rose-50/70 border border-rose-200/70 p-2.5 rounded-xl text-xs text-rose-900">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Gift className="w-3.5 h-3.5 text-rose-600" />
                      <span>أطباء يفضلون العينات ويستخدمونها للمرضى 🎁:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sampleLovingDoctors.slice(0, 5).map((doc) => (
                        <span
                          key={doc.id}
                          className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-[11px] font-semibold text-rose-800"
                        >
                          {doc.name} ({doc.specialty})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => handleCopyProductPitch(product)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer"
                    title="نسخ بيانات الدواء لـ ChatGPT لتجهيز العرض البيعي"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5 text-teal-800" />
                    <span>📋 نسخ لـ ChatGPT</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => {
                        if (requestConfirmDelete) {
                          requestConfirmDelete(
                            'حذف المنتج',
                            `هل تريد حذف الدواء "${product.name}" نهائياً من الحقيبة وقائمة المنتجات؟`,
                            () => {
                              onDeleteProduct(product.id);
                              showToast('تم حذف المنتج بنجاح.');
                            }
                          );
                        } else {
                          onDeleteProduct(product.id);
                          showToast('تم حذف المنتج بنجاح.');
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                      title="حذف المنتج"
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

      {/* VIEW 2: OBJECTIONS BANK */}
      {subTab === 'objections' && (
        <div className="space-y-3">
          {filteredObjections.map((objection) => (
            <div
              key={objection.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 p-4 shadow-xs transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {objection.category}
                  </span>
                  <span className="text-xs font-bold text-teal-800 mr-2">
                    مرتبط بـ: {objection.productName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditObjection(objection)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title="تعديل الاعتراض"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (requestConfirmDelete) {
                        requestConfirmDelete(
                          'حذف الاعتراض الطبي',
                          `هل تريد حذف هذا الاعتراض الطبي من بنك الاعتراضات؟`,
                          () => {
                            onDeleteObjection(objection.id);
                            showToast('تم حذف الاعتراض.');
                          }
                        );
                      } else {
                        onDeleteObjection(objection.id);
                        showToast('تم حذف الاعتراض.');
                      }
                    }}
                    className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                    title="حذف الاعتراض"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Objection Question */}
              <div className="text-xs font-extrabold text-slate-900 flex items-start gap-2">
                <span className="text-rose-600 shrink-0">اعتراض الطبيب:</span>
                <span>"{objection.objectionText}"</span>
              </div>

              {/* Scientific Rebuttal */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5">
                <span className="font-bold text-teal-800 block">الرد العلمي والتكتيكي الموصى به:</span>
                <p className="leading-relaxed">{objection.scientificRebuttal}</p>
                {objection.clinicalEvidence && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="font-bold">الدراسة المرجعية:</span> {objection.clinicalEvidence}
                  </p>
                )}
              </div>

              {/* Copy Button */}
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `الرد على الاعتراض ("${objection.objectionText}"):\n${objection.scientificRebuttal}`
                    );
                    showToast('تم نسخ الرد العلمي بنجاح!');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  <ClipboardCopy className="w-3.5 h-3.5 text-teal-800" />
                  <span>نسخ نص الرد</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Product */}
      {showAddProductModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddProductModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة دواء جديد إلى الحقيبة'}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto flex-1 py-3 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم التجاري للدواء *:
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="مثال: كارديكس بلس 5/20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة الفعالة:</label>
                  <input
                    type="text"
                    value={pGeneric}
                    onChange={(e) => setPGeneric(e.target.value)}
                    placeholder="Amlodipine + Olmesartan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف الطبي:</label>
                  <input
                    type="text"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    placeholder="أمراض القلب وضغط الدم"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجرعة:</label>
                  <input
                    type="text"
                    value={pDosage}
                    onChange={(e) => setPDosage(e.target.value)}
                    placeholder="قرص يومياً"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر (ج.م):</label>
                  <input
                    type="number"
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رصيد العينات:</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  دواعي الاستعمال (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={pIndications}
                  onChange={(e) => setPIndications(e.target.value)}
                  placeholder="ضغط الدم الأساسي ، حماية الشرايين التاجية"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نقاط القوة الترويجية والتنافسية (كل نقطة في سطر):
                </label>
                <textarea
                  rows={3}
                  value={pSellingPoints}
                  onChange={(e) => setPSellingPoints(e.target.value)}
                  placeholder="انخفاض تورم الكاحل بنسبة 75%&#10;حماية قلبية كلوية ممتدة المفعول"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Objection */}
      {showAddObjectionModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddObjectionModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingObjection ? 'تعديل الاعتراض والرد' : 'إضافة اعتراض ورد علمي جديد'}
              </h3>
              <button
                onClick={() => setShowAddObjectionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveObjection} className="overflow-y-auto flex-1 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الدواء المرتبط:
                  </label>
                  <select
                    value={objProduct}
                    onChange={(e) => setObjProduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تصنيف الاعتراض:
                  </label>
                  <select
                    value={objCategory}
                    onChange={(e) => setObjCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  >
                    <option value="سعر وتكلفة">سعر وتكلفة</option>
                    <option value="فاعلية وسرعة">فاعلية وسرعة</option>
                    <option value="أمان وآثار جانبية">أمان وآثار جانبية</option>
                    <option value="اعتياد على بديل">اعتياد على بديل</option>
                    <option value="توفر بالصيدليات">توفر بالصيدليات</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اعتراض الطبيب الشائع *:
                </label>
                <input
                  type="text"
                  required
                  value={objText}
                  onChange={(e) => setObjText(e.target.value)}
                  placeholder="مثال: الدواء ممتاز ولكن سعره مرتفع مقارنة بالبديل المحلي"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرد العلمي والتكتيكي الموصى به *:
                </label>
                <textarea
                  required
                  rows={3}
                  value={objRebuttal}
                  onChange={(e) => setObjRebuttal(e.target.value)}
                  placeholder="اشرح الميزة التنافسية أو التوفير الإجمالي للمريض في تكلفة المضاعفات"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدراسة المرجعية أو السريرية (اختياري):
                </label>
                <input
                  type="text"
                  value={objEvidence}
                  onChange={(e) => setObjEvidence(e.target.value)}
                  placeholder="مثال: دراسة EULAR 2021 أو مجلة القلب المصرية"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddObjectionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ في البنك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
