
interface LegalViolation {
  article: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  court: string;
}

interface LegalCheckResponse {
  violations: LegalViolation[];
  court: string;
  stampDuty: {
    lbp: number;
    usd: number;
  };
  requiredDocuments: string[];
  procedureType: 'beirut' | 'tripoli' | 'standard';
}

export const checkLebaneseCompliance = async (documentType: string, content: string): Promise<LegalCheckResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const violations: LegalViolation[] = [];
  let court = 'بيروت الابتدائية';
  let procedureType: 'beirut' | 'tripoli' | 'standard' = 'beirut';

  // Simulate different violations based on document type
  if (documentType === 'rental') {
    violations.push({
      article: 'المادة ٧٢٢ (الإيجار)',
      description: 'يجب تحديد مدة الإيجار بوضوح وفقاً للقانون اللبناني',
      severity: 'critical',
      court: 'بيروت الابتدائية'
    });

    if (content.includes('طرابلس') || content.includes('tripoli')) {
      court = 'طرابلس الابتدائية';
      procedureType = 'tripoli';
      violations.push({
        article: 'المادة ١٢٣ (الإجراءات المحلية)',
        description: 'تطبق إجراءات خاصة في محافظة الشمال',
        severity: 'info',
        court: 'طرابلس الابتدائية'
      });
    }
  }

  if (documentType === 'employment') {
    violations.push({
      article: 'المادة ٤٥ من قانون العمل',
      description: 'يجب تحديد فترة التجربة وشروط الإنهاء',
      severity: 'warning',
      court: court
    });
  }

  if (documentType === 'marriage') {
    violations.push({
      article: 'المادة ١٤ من قانون الأحوال الشخصية',
      description: 'يتطلب شهود وموافقة ولي الأمر حسب الطائفة',
      severity: 'critical',
      court: 'المحكمة الشرعية'
    });
  }

  // Simulate escalation triggers
  if (content.includes('رفع دعوى') || content.includes('فسخ عقد')) {
    violations.push({
      article: 'تحذير: يتطلب استشارة محامي',
      description: 'هذا الموضوع يتطلب مساعدة قانونية مباشرة',
      severity: 'critical',
      court: court
    });
  }

  return {
    violations,
    court,
    stampDuty: {
      lbp: procedureType === 'beirut' ? 150000 : 100000,
      usd: procedureType === 'beirut' ? 10 : 7
    },
    requiredDocuments: [
      'بطاقة هوية',
      'إثبات عنوان',
      'ختم النقابة',
      'رسم طابع مالي'
    ],
    procedureType
  };
};

export const translateLegalTerm = (term: string, targetLang: 'ar' | 'en' | 'fr'): string => {
  const translations = {
    'Force majeure': {
      ar: 'القوة القاهرة',
      en: 'Force majeure',
      fr: 'Force majeure'
    },
    'Jurisdiction': {
      ar: 'الاختصاص القضائي',
      en: 'Jurisdiction',
      fr: 'Juridiction'
    },
    'Breach of contract': {
      ar: 'إخلال بالعقد',
      en: 'Breach of contract',
      fr: 'Rupture de contrat'
    },
    'Notarization': {
      ar: 'التوثيق العدلي',
      en: 'Notarization',
      fr: 'Notarisation'
    }
  };

  return translations[term as keyof typeof translations]?.[targetLang] || term;
};

export const generateSMSConfirmation = (type: 'mokhtar' | 'document', details: any): string => {
  if (type === 'mokhtar') {
    return `حجز مؤكد مع المحضر ${details.name} في ${details.date} - رقم الحجز: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  if (type === 'document') {
    return `وثيقتك جاهزة للتحميل. نوع الوثيقة: ${details.type} - كود التحميل: ${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  return 'تم تأكيد العملية بنجاح';
};
