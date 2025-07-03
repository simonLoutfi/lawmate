
import { useLanguage } from '@/contexts/LanguageContext';

interface DocumentTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  category: 'civil' | 'commercial' | 'personal' | 'tax';
  template: string;
  requiredFields: string[];
}

export const lebanesesDocumentTemplates: DocumentTemplate[] = [
  {
    id: 'ikrar',
    nameAr: 'إقرار عدلي',
    nameEn: 'Notarized Affidavit',
    nameFr: 'Déclaration notariée',
    category: 'civil',
    template: `إقرار عدلي

أنا الموقع أدناه {{partyName}}، حامل/ة بطاقة هوية رقم {{idNumber}}
أقر وأتعهد بالآتي:

{{statementContent}}

وأتحمل كامل المسؤولية القانونية عن صحة هذا الإقرار.

الموقع: {{signature}}
التاريخ: {{date}}
المكان: {{location}}

بحضور:
الشاهد الأول: {{witness1}}
الشاهد الثاني: {{witness2}}

ختم النقابة: ___________
توقيع المحضر: ___________`,
    requiredFields: ['partyName', 'idNumber', 'statementContent', 'location', 'witness1', 'witness2']
  },
  {
    id: 'marriage',
    nameAr: 'عقد زواج شرعي',
    nameEn: 'Islamic Marriage Contract',
    nameFr: 'Contrat de mariage islamique',
    category: 'personal',
    template: `عقد زواج شرعي

بسم الله الرحمن الرحيم

تم عقد القران بين:
الزوج: {{groomName}}، ابن {{groomFather}}، مواليد {{groomBirthDate}}
الزوجة: {{brideName}}، ابنة {{brideFather}}، مواليد {{brideBirthDate}}

المهر المتفق عليه: {{dowry}} ليرة لبنانية
المهر المعجل: {{advancedDowry}} ليرة لبنانية
المهر المؤجل: {{deferredDowry}} ليرة لبنانية

الشروط الخاصة:
{{specialConditions}}

بحضور الشهود:
١. {{witness1}}، بطاقة هوية: {{witness1Id}}
٢. {{witness2}}، بطاقة هوية: {{witness2Id}}

ولي أمر الزوجة: {{guardian}}

تاريخ العقد: {{contractDate}}
مكان العقد: {{contractLocation}}

توقيع الزوج: ___________
توقيع الزوجة: ___________
توقيع ولي الأمر: ___________
خاتم المأذون الشرعي: ___________`,
    requiredFields: ['groomName', 'groomFather', 'brideName', 'brideFather', 'dowry', 'witness1', 'witness2', 'guardian']
  },
  {
    id: 'taxAppeal',
    nameAr: 'طعن ضريبي',
    nameEn: 'Tax Appeal',
    nameFr: 'Appel fiscal',
    category: 'tax',
    template: `طعن ضريبي

إلى: رئيس لجنة الطعون الضريبية
الموضوع: طعن في التكليف الضريبي رقم {{taxAssessmentNumber}}

أتشرف أن أتقدم إليكم بطعن في التكليف الضريبي المذكور أعلاه للأسباب التالية:

معلومات الطاعن:
الاسم: {{taxpayerName}}
رقم التسجيل الضريبي: {{taxId}}
العنوان: {{address}}
الهاتف: {{phone}}

تفاصيل الطعن:
رقم التكليف: {{taxAssessmentNumber}}
تاريخ التكليف: {{assessmentDate}}
المبلغ المطعون فيه: {{disputedAmount}} ليرة لبنانية

أسباب الطعن:
{{appealReasons}}

المستندات المرفقة:
{{attachedDocuments}}

أرجو النظر في هذا الطعن وإلغاء التكليف المذكور أو تعديله.

مع الاحترام،
التوقيع: ___________
التاريخ: {{submissionDate}}`,
    requiredFields: ['taxpayerName', 'taxId', 'taxAssessmentNumber', 'disputedAmount', 'appealReasons']
  }
];

export const generateLebaneseDocument = (templateId: string, data: Record<string, string>): string => {
  const template = lebanesesDocumentTemplates.find(t => t.id === templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  let document = template.template;
  
  // Replace all template variables
  Object.entries(data).forEach(([key, value]) => {
    document = document.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Add current date if not provided
  document = document.replace(/{{date}}/g, new Date().toLocaleDateString('ar'));
  
  // Add legal watermark
  document += '\n\n' + 'بموجب المادة ٨٤ من قانون المحاماة اللبناني';
  
  return document;
};

export const getRequiredDocuments = (templateId: string): string[] => {
  const template = lebanesesDocumentTemplates.find(t => t.id === templateId);
  return template?.requiredFields || [];
};
