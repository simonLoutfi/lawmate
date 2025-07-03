
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.features': 'الخدمات',
    'nav.pricing': 'الأسعار',
    'nav.about': 'عن المنصة',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.tryFree': 'جرب مجاناً',
    
    // Hero Section
    'hero.title': 'مساعدك القانوني الذكي الأول في لبنان',
    'hero.subtitle': 'إنشاء العقود، الاستشارات القانونية، ومراجعة الوثائق - كل ذلك بالذكاء الاصطناعي وباللغة العربية',
    'hero.startFree': 'ابدأ مجاناً',
    'hero.howItWorks': 'كيف يعمل',
    'hero.talkToLawyer': 'تحدث مع محامي',
    
    // Services
    'services.contract': 'مراجعة العقود',
    'services.document': 'صياغة الوثائق',
    'services.dispute': 'حل النزاعات',
    'services.ai': 'مناقشة قانونية',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بك',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.myDocuments': 'وثائقي',
    'dashboard.draftContract': 'صياغة عقد',
    'dashboard.askAI': 'مناقشة قانونية',
    'dashboard.mokhtar': 'شبكة المختار',
    'dashboard.settings': 'الإعدادات',
    
    // Lebanese Legal Documents
    'documents.ikrar': 'إقرار عدلي',
    'documents.marriage': 'عقد زواج شرعي',
    'documents.taxAppeal': 'طعن ضريبي',
    'documents.rental': 'عقد إيجار',
    'documents.employment': 'عقد عمل',
    'documents.will': 'وصية',
    'documents.powerOfAttorney': 'توكيل',
    
    // Legal Terms
    'legal.article722': 'المادة ٧٢٢ (الإيجار)',
    'legal.article84': 'المادة ٨٤ من قانون المحاماة اللبناني',
    'legal.forceMajeure': 'القوة القاهرة',
    'legal.barStamp': 'ختم النقابة',
    'legal.idCard': 'بطاقة هوية',
    'legal.addressProof': 'إثبات عنوان',
    'legal.beirutCourt': 'بيروت الابتدائية',
    'legal.tripoliCourt': 'طرابلس الابتدائية',
    
    // Errors & Validation
    'errors.fileTooBig': 'الملف كبير جداً (>5MB)',
    'errors.invalidFormat': 'نوع الملف غير مدعوم',
    'errors.required': 'هذا الحقل مطلوب',
    'errors.networkError': 'خطأ في الاتصال',
    
    // Common
    'common.upload': 'رفع ملف',
    'common.download': 'تحميل',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.continue': 'متابعة',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.submit': 'إرسال',
    'common.loading': 'جاري التحميل...',
    'common.confirmed': 'مؤكد',
    'common.pending': 'قيد المراجعة',
    
    // SMS/Notifications
    'sms.mokhtarBooking': 'حجز مؤكد مع المحضر',
    'sms.documentReady': 'وثيقتك جاهزة للتحميل',
    'legal.watermark': 'بموجب المادة ٨٤ من قانون المحاماة اللبناني',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.tryFree': 'Try Free',
    
    'hero.title': "Lebanon's First AI Legal Assistant",
    'hero.subtitle': 'Generate contracts, get legal advice, and review documents - all powered by AI in Arabic',
    'hero.startFree': 'Start Free',
    'hero.howItWorks': 'How It Works',
    'hero.talkToLawyer': 'Talk to a Lawyer',
    
    'services.contract': 'Contract Review',
    'services.document': 'Document Drafting',
    'services.dispute': 'Dispute Resolution',
    'services.ai': 'Legal Discussion',
    
    'dashboard.welcome': 'Welcome',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.myDocuments': 'My Documents',
    'dashboard.draftContract': 'Draft Contract',
    'dashboard.askAI': 'Legal Discussion',
    'dashboard.mokhtar': 'Mokhtar Network',
    'dashboard.settings': 'Settings',
    
    'documents.ikrar': 'Notarized Affidavit',
    'documents.marriage': 'Islamic Marriage Contract',
    'documents.taxAppeal': 'Tax Appeal',
    'documents.rental': 'Rental Agreement',
    'documents.employment': 'Employment Contract',
    'documents.will': 'Will',
    'documents.powerOfAttorney': 'Power of Attorney',
    
    'legal.article722': 'Article 722 (Rental Law)',
    'legal.article84': 'Article 84 of Lebanese Bar Law',
    'legal.forceMajeure': 'Force Majeure',
    'legal.barStamp': 'Bar Association Stamp',
    'legal.idCard': 'ID Card',
    'legal.addressProof': 'Address Proof',
    'legal.beirutCourt': 'Beirut Primary Court',
    'legal.tripoliCourt': 'Tripoli Primary Court',
    
    'errors.fileTooBig': 'File too large (>5MB)',
    'errors.invalidFormat': 'Unsupported file type',
    'errors.required': 'This field is required',
    'errors.networkError': 'Connection error',
    
    'common.upload': 'Upload',
    'common.download': 'Download',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
    'common.confirmed': 'Confirmed',
    'common.pending': 'Under Review',
    
    'sms.mokhtarBooking': 'Appointment confirmed with Mokhtar',
    'sms.documentReady': 'Your document is ready for download',
    'legal.watermark': 'Under Article 84 of Lebanese Bar Law',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.features': 'Services',
    'nav.pricing': 'Tarifs',
    'nav.about': 'À propos',
    'nav.login': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.tryFree': 'Essai gratuit',
    
    'hero.title': 'Premier Assistant Juridique IA du Liban',
    'hero.subtitle': 'Générez des contrats, obtenez des conseils juridiques et révisez des documents - tout alimenté par IA',
    'hero.startFree': 'Commencer gratuitement',
    'hero.howItWorks': 'Comment ça marche',
    'hero.talkToLawyer': 'Parler à un avocat',
    
    'services.contract': 'Révision de contrats',
    'services.document': 'Rédaction de documents',
    'services.dispute': 'Résolution de conflits',
    'services.ai': 'Discussion juridique',
    
    'dashboard.welcome': 'Bienvenue',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.myDocuments': 'Mes documents',
    'dashboard.draftContract': 'Rédiger un contrat',
    'dashboard.askAI': 'Discussion juridique',
    'dashboard.mokhtar': 'Réseau Mokhtar',
    'dashboard.settings': 'Paramètres',
    
    'documents.ikrar': 'Déclaration notariée',
    'documents.marriage': 'Contrat de mariage islamique',
    'documents.taxAppeal': 'Appel fiscal',
    'documents.rental': 'Contrat de location',
    'documents.employment': 'Contrat de travail',
    'documents.will': 'Testament',
    'documents.powerOfAttorney': 'Procuration',
    
    'common.upload': 'Télécharger',
    'common.download': 'Télécharger',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.continue': 'Continuer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.submit': 'Soumettre',
    'common.loading': 'Chargement...',
    'common.confirmed': 'Confirmé',
    'common.pending': 'En révision',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
