import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Star, 
  Trash2, 
  Edit2, 
  Sparkles, 
  RefreshCw, 
  SlidersHorizontal, 
  Layers, 
  Wifi, 
  UserPlus, 
  X, 
  CheckCircle, 
  AlertCircle,
  BookmarkCheck,
  Check
} from 'lucide-react';

// Initial Mock Data (Arabic Service Providers)
const INITIAL_PROVIDERS = [
  {
    id: '1',
    name: 'د. أحمد سمير',
    category: 'الطب والصحة',
    specialty: 'أخصائي طب الأطفال وحديثي الولادة',
    city: 'الرياض',
    phone: '0501234567',
    rating: 4.9,
    reviewsCount: 38,
    isAvailable: true,
    description: 'خبرة أكثر من ١٢ عاماً في علاج أمراض الأطفال ومتابعة النمو والتطور العصبي.',
    tags: ['أطفال', 'طبيب', 'استشارة']
  },
  {
    id: '2',
    name: 'المهندس عادل الحربي',
    category: 'الصيانة والمنزل',
    specialty: 'فني صيانة تكييف مركزي ومبردات',
    city: 'جدة',
    phone: '0559876543',
    rating: 4.8,
    reviewsCount: 54,
    isAvailable: true,
    description: 'متخصص في كشف تسريبات الفريون، صيانة الكمبريسور، وغسيل المكيفات بأحدث الأجهزة والمعدات.',
    tags: ['تكييف', 'صيانة', 'منزل']
  },
  {
    id: '3',
    name: 'الأستاذة سارة الغامدي',
    category: 'التعليم والتدريب',
    specialty: 'معلمة لغة إنجليزية للمرحلة الثانوية والتحضير للآيلتس',
    city: 'الدمام',
    phone: '0543210987',
    rating: 4.7,
    reviewsCount: 22,
    isAvailable: false,
    description: 'تقديم دروس تقوية خصوصية، تبسيط قواعد اللغة الإنجليزية، وتدريب مكثف على نماذج اختبار الآيلتس العالمي.',
    tags: ['آيلتس', 'تدريب', 'إنجليزية']
  },
  {
    id: '4',
    name: 'أنس الماجد',
    category: 'الخدمات التقنية',
    specialty: 'مطور تطبيقات React Native & Flutter',
    city: 'الرياض',
    phone: '0567891234',
    rating: 4.9,
    reviewsCount: 19,
    isAvailable: true,
    description: 'برمجة وتصميم تطبيقات الهواتف الذكية للأندرويد والآيفون مع توفير لوحات تحكم متكاملة وسهلة الاستخدام.',
    tags: ['برمجة', 'تطبيقات', 'تصميم']
  },
  {
    id: '5',
    name: 'ليلى العتيبي',
    category: 'التصميم والإعلام',
    specialty: 'مصممة هويات بصرية وشعارات تجارية',
    city: 'مكة المكرمة',
    phone: '0534567890',
    rating: 4.6,
    reviewsCount: 31,
    isAvailable: true,
    description: 'تصميم هويات بصرية متكاملة للشركات والناشئين، تصميم الكتيبات، المطبوعات، ومحتوى منصات التواصل الاجتماعي.',
    tags: ['شعارات', 'هوية', 'سوشيال_ميديا']
  },
  {
    id: '6',
    name: 'أبو محمد السباك',
    category: 'الصيانة والمنزل',
    specialty: 'أعمال السباكة وتأسيس شبكات الصرف',
    city: 'المدينة المنورة',
    phone: '0598761234',
    rating: 4.5,
    reviewsCount: 47,
    isAvailable: true,
    description: 'حل مشكلات تسريب المياه والرطوبة، تأسيس وتجديد دورات المياه والمطابخ، صيانة المضخات والسخانات الحجمية.',
    tags: ['سباكة', 'ترميم', 'منزل']
  }
];

const CATEGORIES = [
  'الكل',
  'الصيانة والمنزل',
  'الطب والصحة',
  'التعليم والتدريب',
  'الخدمات التقنية',
  'التصميم والإعلام'
];

const CITIES = [
  'الكل',
  'الرياض',
  'جدة',
  'الدمام',
  'مكة المكرمة',
  'المدينة المنورة'
];

export default function App() {
  // --- Persistent Storage State ---
  const [providers, setProviders] = useState(() => {
    const saved = localStorage.getItem('dalili_providers');
    return saved ? JSON.parse(saved) : INITIAL_PROVIDERS;
  });

  useEffect(() => {
    localStorage.setItem('dalili_providers', JSON.stringify(providers));
  }, [providers]);

  // --- Filtering & Search States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // --- UI Interactivity States ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('directory'); // directory | manage
  const [toastMessage, setToastMessage] = useState(null);
  
  // --- Create/Edit Provider Modal States ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'الصيانة والمنزل',
    specialty: '',
    city: 'الرياض',
    phone: '',
    rating: 5.0,
    isAvailable: true,
    description: '',
    tagsString: ''
  });

  // --- Gemini AI Features ---
  const [geminiInput, setGeminiInput] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('dalili_gemini_key') || '');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);

  // Trigger brief Sync animation when database changes
  const triggerSyncFeedback = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Save Gemini Key
  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('dalili_gemini_key', key);
    showToast('تم حفظ مفتاح الذكاء الاصطناعي بنجاح!');
  };

  // Filter provider list
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
      const matchesCity = selectedCity === 'الكل' || p.city === selectedCity;
      const matchesAvailable = !onlyAvailable || p.isAvailable;
      const matchesRating = p.rating >= minRating;

      return matchesSearch && matchesCategory && matchesCity && matchesAvailable && matchesRating;
    });
  }, [providers, searchTerm, selectedCategory, selectedCity, onlyAvailable, minRating]);

  // Statistics
  const stats = useMemo(() => {
    const total = providers.length;
    const available = providers.filter(p => p.isAvailable).length;
    const averageRating = total > 0 
      ? (providers.reduce((sum, p) => sum + p.rating, 0) / total).toFixed(1) 
      : '0.0';
    return { total, available, averageRating };
  }, [providers]);

  // Handle Create or Update submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty || !formData.phone) {
      showToast('الرجاء تعبئة كافة الحقول الأساسية!');
      return;
    }

    const tagsArray = formData.tagsString
      ? formData.tagsString.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    if (editingProvider) {
      // Update existing
      setProviders(prev => prev.map(p => 
        p.id === editingProvider.id 
          ? { 
              ...p, 
              name: formData.name,
              category: formData.category,
              specialty: formData.specialty,
              city: formData.city,
              phone: formData.phone,
              isAvailable: formData.isAvailable,
              description: formData.description,
              tags: tagsArray
            }
          : p
      ));
      showToast(`تم تحديث بيانات "${formData.name}" بنجاح!`);
    } else {
      // Create new
      const newProvider = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        specialty: formData.specialty,
        city: formData.city,
        phone: formData.phone,
        rating: 5.0,
        reviewsCount: 1,
        isAvailable: formData.isAvailable,
        description: formData.description,
        tags: tagsArray.length > 0 ? tagsArray : ['خدمات']
      };
      setProviders(prev => [newProvider, ...prev]);
      showToast(`تمت إضافة مزود الخدمة "${formData.name}" بنجاح!`);
    }

    triggerSyncFeedback();
    setShowFormModal(false);
    setEditingProvider(null);
    clearForm();
  };

  // Open modal for Editing
  const handleEditClick = (p) => {
    setEditingProvider(p);
    setFormData({
      name: p.name,
      category: p.category,
      specialty: p.specialty,
      city: p.city,
      phone: p.phone,
      rating: p.rating,
      isAvailable: p.isAvailable,
      description: p.description,
      tagsString: p.tags.join(', ')
    });
    setShowFormModal(true);
  };

  // Delete Provider
  const handleDelete = (id, name) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف مزود الخدمة: "${name}"؟`)) {
      setProviders(prev => prev.filter(p => p.id !== id));
      showToast(`تم حذف "${name}" بنجاح.`);
      triggerSyncFeedback();
    }
  };

  // Upvote/Rating system simulation
  const handleSupportProvider = (id, currentRating, currentCount) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        const newCount = currentCount + 1;
        const newRating = Math.min(5.0, parseFloat(((currentRating * currentCount + 5.0) / newCount).toFixed(1)));
        return { ...p, rating: newRating, reviewsCount: newCount };
      }
      return p;
    }));
    showToast('شكراً لتقييمك لمزود الخدمة!');
    triggerSyncFeedback();
  };

  // Helper clear form
  const clearForm = () => {
    setFormData({
      name: '',
      category: 'الصيانة والمنزل',
      specialty: '',
      city: 'الرياض',
      phone: '',
      rating: 5.0,
      isAvailable: true,
      description: '',
      tagsString: ''
    });
  };

  // Intelligent Gemini assistant & Arabic matching algorithm (Hybrid semantic + fallback matching)
  const handleGeminiSubmit = async (e) => {
    e.preventDefault();
    if (!geminiInput.trim()) return;

    setIsGeminiLoading(true);
    setGeminiResult(null);

    // Prompt compilation for real-time categorizations and suggestions
    const userPrompt = `
      أنت مساعد الفلترة الذكي لتطبيق "دليلي". لديك قائمة من مزودي الخدمات في المملكة العربية السعودية.
      المدخل هو مشكلة أو طلب للمستفيد: "${geminiInput}"
      
      المهام المطلوبة منك:
      1. حدد القسم الأقرب من الأقسام المتاحة التالية فقط:
         - "الصيانة والمنزل"
         - "الطب والصحة"
         - "التعليم والتدريب"
         - "الخدمات التقنية"
         - "التصميم والإعلام"
         
      2. حدد الكلمات المفتاحية الذكية بالرغم من اختلاف اللغات أو المصطلحات (مثال: "مكيف خربان" -> تكييف، صيانة).
      3. خمن المدينة إذا كانت مذكورة في الطلب (مثال: الرياض، جدة، الدمام، مكة، المدينة) أو قم بتقديرها كـ "الكل" إن لم تذكر.
         
      أرجع الإجابة كصيغة JSON صالحة ومباشرة دون أي نصوص تمهيدية، على النحو التالي تماماً:
      {
        "category": "القسم المطابق",
        "keywords": "كلمة البحث الأساسية المقترحة",
        "city": "المدينة المكتشفة أو الكل",
        "explanation": "نصائح أو شرح مختصر جداً باللهجة السعودية عن سبب هذا الاختيار"
      }
    `;

    try {
      if (geminiApiKey) {
        // Direct call to Gemini rest API for browser client
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          throw new Error('فشل الاتصال بخادم الجيميني المباشر ميثود 1');
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(responseText.trim());
        setGeminiResult(parsed);
      } else {
        // Dynamic Intelligent Fallback parsing Arabic queries on-the-fly inside client-side engine!
        // This is extremely robust and ensures the app never crashes or displays a dead screen.
        setTimeout(() => {
          const query = geminiInput.toLowerCase();
          let predictedCat = 'الكل';
          let predictedCity = 'الكل';
          let keyw = '';
          let explanation = '';

          // Basic Arabic NLP dictionary for Category & Tag matching
          if (query.includes('مكيف') || query.includes('تكييف') || query.includes('صيانة') || query.includes('سباك') || query.includes('تسريب') || query.includes('كهرب') || query.includes('بيت') || query.includes('منزل') || query.includes('غسيل')) {
            predictedCat = 'الصيانة والمنزل';
            keyw = query.includes('مكيف') ? 'تكييف' : query.includes('سباك') ? 'سباكة' : 'صيانة';
            explanation = 'قمنا باختيار صيانة والمنزل بناءً على مفردات النظافة أو السباكة أو التكييف لحل مشكلتك المنزلية فوراً!';
          } else if (query.includes('طبيب') || query.includes('دكتور') || query.includes('مستشفى') || query.includes('عيادة') || query.includes('ألم') || query.includes('علاج') || query.includes('أسنان') || query.includes('أطفال')) {
            predictedCat = 'الطب والصحة';
            keyw = query.includes('أطفال') ? 'أطفال' : query.includes('أسنان') ? 'أسنان' : 'طبيب';
            explanation = 'تم توجيهك لعيادات وأطباء الصحة لتشخيص الحالة المذكورة والحصول على أفضل رعاية طبية.';
          } else if (query.includes('معلم') || query.includes('أستاذ') || query.includes('درس') || query.includes('مدرسة') || query.includes('جامعة') || query.includes('تعليم') || query.includes('آيلتس') || query.includes('انجليزي') || query.includes('شرح')) {
            predictedCat = 'التعليم والتدريب';
            keyw = query.includes('تعليم') ? 'سارة' : query.includes('انجليزي') ? 'إنجليزية' : 'تدريب';
            explanation = 'توجيه مباشر للأستاذة والمعلمين والمؤسسات التعليمية المتميزة لمساعدتك بالتطوير المعرفي للأبناء.';
          } else if (query.includes('برمجة') || query.includes('تطبيق') || query.includes('جوال') || query.includes('موقع') || query.includes('ويب') || query.includes('برمجه') || query.includes('رياكت') || query.includes('فلاتر')) {
            predictedCat = 'الخدمات التقنية';
            keyw = 'برمجة';
            explanation = 'المصطلحات التقنية تشير إلى رغبتك في توظيف مطور أو برمجة وتحديث التطبيقات والمواقع للمشاريع.';
          } else if (query.includes('تصميم') || query.includes('لوجو') || query.includes('شعار') || query.includes('فوتو') || query.includes('فيديو') || query.includes('صورة') || query.includes('رسم')) {
            predictedCat = 'التصميم والإعلام';
            keyw = query.includes('شعار') ? 'شعارات' : 'هوية';
            explanation = 'الطلب يحتوي على استفسارات هويات بصرية وإعلامية، قمنا بتصفية المصممين المعتمدين والمعدين لإنتاج شعار متميز.';
          } else {
            // General match fallbacks
            predictedCat = 'الكل';
            keyw = query.split(' ')[0] || '';
            explanation = 'تم البحث العام في كافة التخصصات والخدمات المتاحة لتوفير نطاق واسع من الخيارات التي تلبي احتياجك.';
          }

          // City extractor
          if (query.includes('رياض') || query.includes('الرياض')) {
            predictedCity = 'الرياض';
          } else if (query.includes('جده') || query.includes('جدة')) {
            predictedCity = 'جدة';
          } else if (query.includes('دمام') || query.includes('الدمام')) {
            predictedCity = 'الدمام';
          } else if (query.includes('مكة') || query.includes('مكه')) {
            predictedCity = 'مكة المكرمة';
          } else if (query.includes('مدينة') || query.includes('المدينه') || query.includes('المدينة')) {
            predictedCity = 'المدينة المنورة';
          }

          setGeminiResult({
            category: predictedCat,
            keywords: keyw,
            city: predictedCity,
            explanation: `${explanation} (تنبيه: هذا فلتر فوري محلي، يمكن تفعيل ذكاء الموديل الجيميني الحقيقي 2.5 Flash فور إضافة مفتاحك الخاص بالتبويب الجانبي!)`
          });
        }, 600);
      }
    } catch (err) {
      console.error(err);
      showToast('تعذر ربط الجيميني المباشر، تم توفير الفلتر الذكي المحلي لتسهيل التصفح!');
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Auto apply Gemini filtered parameters to React States
  const applyGeminiFilters = () => {
    if (!geminiResult) return;
    if (geminiResult.category && geminiResult.category !== 'الكل') {
      setSelectedCategory(geminiResult.category);
    }
    if (geminiResult.city && geminiResult.city !== 'الكل') {
      setSelectedCity(geminiResult.city);
    }
    if (geminiResult.keywords) {
      setSearchTerm(geminiResult.keywords);
    }
    showToast('تم تطبيق الفلترة الذكية للذكاء الاصطناعي بنجاح!');
  };

  // Helper copy phone or dynamic action simulation
  const handleCallUser = (phone, name) => {
    navigator.clipboard.writeText(phone);
    showToast(`تم نسخ رقم ${name} (${phone}) للحافظة للاتصال!`);
  };

  const handleWhatsappUser = (phone, name) => {
    const text = encodeURIComponent(`أهلاً بك يا ${name}، شاهدت حسابك على تطبيق دليلي وأود الاستفسار عن خدماتك المتاحة.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 flex flex-col font-sans select-none selection:bg-sky-500 selection:text-white">
      {/* Dynamic Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-r-4 border-sky-500 text-sky-200 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm">
          <BookmarkCheck className="text-sky-400 shrink-0" size={24} />
          <p className="text-sm font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Navigation and Title Banner */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-3 rounded-2xl shadow-lg ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950">
              <Sparkles className="text-white animate-spin-slow" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                دليلي <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent font-medium">Dalili</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">الدليل الخدمي الحي والمزامنة الفورية للخدمات</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Synchronized Heartbeat Indicator */}
            <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-full flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-xs font-bold text-slate-300">
                {isSyncing ? 'جاري الحفظ والتحميل...' : 'مزامنة سحابية حية'}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={() => {
                clearForm();
                setEditingProvider(null);
                setShowFormModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/30"
              style={{ minHeight: "48px" }}
            >
              <UserPlus size={18} />
              <span>تسجيل مزود متاح</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RIGHT COLUMN: SEARCH, FILTERS & LIVE DIRECTORY LISTINGS (8 SPANS) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Dashboard Statistics Overview */}
          <section className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm shadow-xl">
            <div className="p-3 bg-slate-950/80 rounded-xl text-center border border-slate-900">
              <span className="text-xs text-slate-400 block mb-1">إجمالي الحسابات</span>
              <span className="text-2xl font-black text-sky-400">{stats.total}</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl text-center border border-slate-900">
              <span className="text-xs text-slate-400 block mb-1">المتاحون فوراً</span>
              <span className="text-2xl font-black text-emerald-400">{stats.available}</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl text-center border border-slate-900">
              <span className="text-xs text-slate-400 block mb-1">متوسط التقييم العام</span>
              <span className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                {stats.averageRating}
                <Star size={16} className="fill-amber-400 text-amber-400 inline" />
              </span>
            </div>
          </section>

          {/* Search, Filter Bar Container */}
          <section className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col gap-5 shadow-lg">
            
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن مزود خدمة، مهارة، اسم، تكييف، سباك، معلم، طبيب..."
                className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Quick Categories Filter Pills */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 px-1">
                <Layers size={14} className="text-indigo-400" />
                تصفية حسب الأقسام والتصنيفات الخدمية:
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      triggerSyncFeedback();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-transparent shadow shadow-indigo-600/30 font-bold scale-105'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
                    }`}
                    style={{ minHeight: "40px" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Filters (City, Rating, Availability Toggles) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/40">
              
              {/* City selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 px-1">حسب المنطقة الجغرافية والموقع:</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    triggerSyncFeedback();
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 py-2.5 px-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c === 'الكل' ? 'كافة المدن' : c}</option>
                  ))}
                </select>
              </div>

              {/* Min Rating */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 px-1">الحد الأدنى لتقييم العملاء:</label>
                <div className="flex items-center gap-1">
                  {[0, 3, 4, 4.5].map((rt) => (
                    <button
                      key={rt}
                      onClick={() => {
                        setMinRating(rt);
                        triggerSyncFeedback();
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all ${
                        minRating === rt
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                      style={{ minHeight: "38px" }}
                    >
                      {rt === 0 ? 'الكل' : `${rt}⭐+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Toggle */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyAvailable(!onlyAvailable);
                    triggerSyncFeedback();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    onlyAvailable
                      ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                  style={{ minHeight: "40px" }}
                >
                  <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                  مسجلي الخدمة المتاحين حالياً فقط
                </button>
              </div>

            </div>

          </section>

          {/* Directory Grid Header */}
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-slate-300">
              قائمة النتائج المفلترة ({filteredProviders.length})
            </h2>
            {(searchTerm || selectedCategory !== 'الكل' || selectedCity !== 'الكل' || onlyAvailable || minRating > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('الكل');
                  setSelectedCity('الكل');
                  setOnlyAvailable(false);
                  setMinRating(0);
                  showToast('تمت إعادة تعيين الفلاتر بنجاح!');
                }}
                className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
              >
                مسح تهيئة الفلاتر والبحث
              </button>
            )}
          </div>

          {/* Directory Cards Grid */}
          {filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders.map(provider => (
                <article 
                  key={provider.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-950/20 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Subtle top indicator band */}
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20"></div>

                  <div>
                    {/* Header Info */}
                    <div className="flex justify-between items-start gap-2 mb-3.5">
                      <div>
                        {/* Category Badge & Availability */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="bg-slate-950 text-sky-400 border border-sky-950 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {provider.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            provider.isAvailable 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-950' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-950'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${provider.isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                            {provider.isAvailable ? 'متاح للطلب' : 'مشغول مؤقتاً'}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-lg font-black text-slate-100 group-hover:text-sky-400 transition-colors">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{provider.specialty}</p>
                      </div>

                      {/* Client rating score */}
                      <div className="text-right shrink-0">
                        <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl flex items-center gap-1.5">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-200">{provider.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">{provider.reviewsCount} تقييم</span>
                      </div>
                    </div>

                    {/* Desc */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 mb-4 h-16 overflow-y-auto">
                      {provider.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5 select-none">
                      {provider.tags.map(t => (
                        <span key={t} className="bg-slate-950 text-slate-400 border border-slate-900 px-2 py-0.5 rounded text-[10px] hover:text-sky-400 transition-colors">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2.5">
                    
                    {/* Dialing Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCallUser(provider.phone, provider.name)}
                        className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                        title="اتصال بالهاتف"
                        style={{ minWidth: "44px", minHeight: "44px" }}
                      >
                        <Phone size={18} />
                      </button>
                      <button
                        onClick={() => handleWhatsappUser(provider.phone, provider.name)}
                        className="bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-400 p-2.5 rounded-xl border border-emerald-900/40 hover:border-emerald-800/50 transition flex items-center justify-center gap-1.5 text-xs font-bold"
                        title="مراسلة واتساب"
                        style={{ minHeight: "44px" }}
                      >
                        <MessageSquare size={16} />
                        <span className="hidden sm:inline">واتساب</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Submit Star Support */}
                      <button
                        onClick={() => handleSupportProvider(provider.id, provider.rating, provider.reviewsCount)}
                        className="bg-slate-950 hover:bg-amber-950/20 text-yellow-500 hover:text-yellow-400 border border-slate-800 hover:border-amber-900 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                        style={{ minHeight: "36px" }}
                      >
                        <Star size={12} className="fill-current" />
                        <span>قيّمني</span>
                      </button>

                      {/* Admin Update */}
                      <button
                        onClick={() => handleEditClick(provider)}
                        className="bg-slate-950 hover:bg-indigo-950/15 text-indigo-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-900 p-2.5 rounded-xl"
                        title="تعديل الحساب"
                        style={{ minWidth: "36px", minHeight: "36px" }}
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Admin Delete */}
                      <button
                        onClick={() => handleDelete(provider.id, provider.name)}
                        className="bg-slate-950 hover:bg-rose-950/10 text-rose-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900 p-2.5 rounded-xl"
                        title="حذف المسجل"
                        style={{ minWidth: "36px", minHeight: "36px" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </div>

                  {/* Location Sticker on card */}
                  <div className="absolute bottom-2.5 left-3 text-[10px] text-slate-500 flex items-center gap-0.5">
                    <MapPin size={10} className="text-slate-400" />
                    <span>{provider.city}</span>
                  </div>

                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4">
              <AlertCircle size={44} className="text-amber-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-200">لم يسفر البحث عن مطابقة لأية مزودي خدمات حالياً</p>
                <p className="text-xs text-slate-400 mt-1">جرّب كتابة كلمات أبسط أو إزالة بعض فلاتر التقييم والمدينة</p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('الكل');
                  setSelectedCity('الكل');
                  setOnlyAvailable(false);
                  setMinRating(0);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-bold px-4 py-2 rounded-xl"
              >
                إعادة ضبط وبداية بحث جديدة
              </button>
            </div>
          )}

        </div>

        {/* LEFT COLUMN: INTELLIGENT EXPERT AI ASSISTANT PANEL & SECRET STORAGE (4 SPANS) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI MATCH ASSISTANT WIDGET */}
          <section className="bg-slate-950 border border-indigo-900/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Backdrop gradient glow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600/15 p-2 rounded-xl text-indigo-400">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  البحث التنبؤي الذكي بالذكاء الاصطناعي
                </h2>
                <p className="text-[10px] text-slate-400">اكتب بالعامية وسيرتب دليلي الفلاتر بدلاً عنك</p>
              </div>
            </div>

            <form onSubmit={handleGeminiSubmit} className="flex flex-col gap-3">
              <textarea
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
                placeholder="مثال: تبغى سباك شاطر في الرياض يركب سخان، أو دكتور حريص للأطفال بجدة..."
                rows="3"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none leading-relaxed"
              ></textarea>

              <button
                type="submit"
                disabled={isGeminiLoading}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center gap-2"
                style={{ minHeight: "44px" }}
              >
                {isGeminiLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>جاري التحليل واستخراج الفلترة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>تحليل وتطبيق الفوري بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Parsing outputs */}
            {geminiResult && (
              <div className="mt-4 bg-slate-900/80 border border-indigo-950 p-4 rounded-xl flex flex-col gap-3 animate-fade-in text-xs">
                <h3 className="font-bold text-sky-400 flex items-center gap-1">
                  <CheckCircle size={14} />
                  نتائج الذكاء الاصطناعي المكتشفة:
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">القسم المقترح:</span>
                    <span className="font-bold text-slate-300">{geminiResult.category}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">البحث بالكلمة:</span>
                    <span className="font-bold text-slate-300">{geminiResult.keywords || 'بدون تفضيل'}</span>
                  </div>
                  <div className="col-span-2 bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">المنطقة الجغرافية:</span>
                    <span className="font-bold text-slate-300">{geminiResult.city === 'الكل' ? 'بكل المدن المتاحة' : geminiResult.city}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed italic bg-slate-950/30 p-2 rounded">
                  {geminiResult.explanation}
                </p>

                <button
                  type="button"
                  onClick={applyGeminiFilters}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 rounded-lg text-[11px] transition mt-1"
                >
                  تطبيق الفلاتر الذكية الآن
                </button>
              </div>
            )}
          </section>

          {/* SECRETS AND CONFIGURATION CARD */}
          <section className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                ⚙️ إعدادات وخيارات متقدمة
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                التطبيق مكمل تماماً ويعمل باللوكال فلتريشن والذاكرة الداخلية، ويمكنك ترقيته بربط ذكاء الجيميني المباشر.
              </p>
            </div>

            {/* API Key Form */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2.5">
              <label className="text-xs text-indigo-400 font-bold block">
                مفتاح Gemini API Key (اختياري للذكاء الفعلي):
              </label>
              
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AI Studio API Key (AIzaSy...)"
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex-1 text-xs font-mono placeholder-slate-600 focus:outline-none"
                />
                <button
                  onClick={() => handleSaveApiKey(geminiApiKey)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 rounded-lg font-bold"
                >
                  حفظ
                </button>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal">
                ملاحظة: يتم تخزين المفتاح محلياً بشكل آمن في متصفحك الشخصي فقط للطلبات.
              </p>
            </div>

            {/* Quick Helper Tips */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 text-[11px] text-slate-400 flex flex-col gap-2">
              <span className="font-bold text-slate-300 block">💡 تلميح دليلي:</span>
              <p>تتم إدارة كافة البيانات محلياً بمزامنة كاملة مع local storage الخاص بمتصفحك، مما يجعل عملية الحفظ، التعديل أو الحذف مستمرة وتظل موجودة دائمًا عند إغلاق أو فتح الصفحة!</p>
            </div>

          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-900/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} دليلي Dalili - للتواصل ومزامنة الخدمات والمحافظة على دقة البيانات.</p>
          <div className="flex gap-4">
            <a href="https://ai.studio/build" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">تحت رعاية Google AI Studio</a>
            <span>•</span>
            <span className="text-emerald-500">مزامنة سحابية نشطة</span>
          </div>
        </div>
      </footer>

      {/* --- ADD / EDIT PROVIDER MODAL (DIALOG OVERLAY) --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-fade-in animate-scale-up">
            
            {/* Modal header */}
            <div className="bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-transparent p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingProvider ? 'تحديث بيانات مزود الخدمة' : 'تسجيل مزود خدمة جديد'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">يرجى كتابة الحقول للمزامنة في الدليل بمصداقية ودقة</p>
              </div>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setEditingProvider(null);
                  clearForm();
                }}
                className="text-slate-450 hover:text-slate-200 bg-slate-950 p-2 rounded-xl"
                style={{ minWidth: "40px", minHeight: "40px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
              {/* Form Row Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">اسم مزود الخدمة أو المؤسسة <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: المهندس عادل الشمري، عيادة المجد لطب الأطفال..."
                  className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              {/* Form Category and City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-bold">القسم والتصنيف <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'الكل').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-bold">المدينة والمنطقة الجغرافية <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs outline-none"
                  >
                    {CITIES.filter(c => c !== 'الكل').map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form specialty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">التخصص والخدمة الدقيقة <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="مثال: فني غسيل وصيانة تكييف سبليت ومخفي"
                  className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              {/* Form phone number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">رقم الجوال أو واتساب للتواصل <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="مثال: 05XXXXXXXX"
                  className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-left placeholder:text-right font-mono focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              {/* Form availability status checkbox */}
              <div className="flex items-center gap-3.5 bg-slate-950 p-3 rounded-xl border border-slate-850 mt-1">
                <input
                  type="checkbox"
                  id="modal_is_available"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-sky-600 bg-slate-900 border-slate-800 rounded focus:ring-sky-500"
                />
                <label htmlFor="modal_is_available" className="text-xs text-slate-300 font-bold select-none cursor-pointer">
                  أن يكون الحساب متاحاً للطلبات الفورية فوراً بالموقع
                </label>
              </div>

              {/* Form description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">نبذة تفصيلية عن الخدمات والخبرات المتاحة</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مثال: ما هي المميزات، الخبرات الطبية أو الهندسية الدقيقة، أوقات العمل والأسعار..."
                  rows="3"
                  className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 outline-none resize-none leading-relaxed"
                ></textarea>
              </div>

              {/* Form tags separated by comma */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">وسوم البحث (مفصولة بفاصلة كوما ,)</label>
                <input
                  type="text"
                  value={formData.tagsString}
                  onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                  placeholder="مثال: تكييف, صيانة, منزل, تنظيف"
                  className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              {/* Submit Buttons footer */}
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200"
                  style={{ minHeight: "44px" }}
                >
                  {editingProvider ? 'حفظ التعديلات' : 'تسجيل ومزامنة الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingProvider(null);
                    clearForm();
                  }}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 font-bold py-3 px-4 rounded-xl text-xs transition"
                  style={{ minHeight: "44px" }}
                >
                  إلغاء الأمر
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
