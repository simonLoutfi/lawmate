import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, Download, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { documentsAPI } from '@/services/api';
import { useMediaQuery } from 'react-responsive';


interface DocumentForm {
  type: string;
  // Common fields
  partyA: string;
  partyAId?: string;
  partyAResidence?: string;
  partyAPhone?: string;
  partyB: string;
  partyBId?: string;
  partyBResidence?: string;
  partyBPhone?: string;
  date?: string;
  location?: string;
  notaryName?: string;
  
  // Judicial Power of Attorney
  attorneyPowers?: string;
  
  // Property Sale Contract
  propertyDetails?: {
    type: string;
    location: string;
    area: string;
    share: string;
    registryNumber: string;
  };
  price?: string;
  priceInWords?: string;
  paymentMethod?: string;
  specialConditions?: string;
  
  // Domestic Worker Contract
  workerDetails?: {
    nationality: string;
    passportNumber: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    workType?: string;
  };
  salary?: string;
  workHours?: string;
  vacationDays?: string;
  terminationConditions?: string;
  ticketProvision?: string;
  
  // Car Sale Proxy
  vehicleDetails?: {
    make: string;
    model: string;
    year: string;
    plateNumber: string;
    chassisNumber: string;
    engineNumber: string;
  };
  agentNames?: string[];
  saleConditions?: string;
  
  // Liability Release
  liabilityStatement?: string;
  liabilityScope?: string;
  
  // Security Pledge
  securityCommitments?: string;
  approvalNumber?: string;
  approvalDate?: string;
  workerName?: string;
}

const DocumentDrafting = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DocumentForm>({
    type: '',
    partyA: '',
    partyB: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const documentTypes = language === 'ar' ? [
    {
      id: 'judicial_power',
      name: 'سند توكيل عام قضائي',
      description: 'توكيل خاص بالقضايا والمحاكم بصلاحيات واسعة'
    },
    {
      id: 'sale_contract',
      name: 'عقد بيع ممسوح',
      description: 'عقد بيع عقاري رسمي موثق'
    },
    {
      id: 'domestic_work',
      name: 'عقد عمل بالعاملات في الخدمة المنزلية',
      description: 'عقد عمل خاص بالخادمات المنزليات وفق القانون اللبناني'
    },
    {
      id: 'car_sale_proxy',
      name: 'وكالة بيع سيارة غير قابلة للعزل',
      description: 'وكالة بيع سيارات نهائية وفق قانون السير اللبناني'
    },
    {
      id: 'liability_release',
      name: 'اقرار رفع مسؤولية',
      description: 'وثيقة قانونية لرفع المسؤولية عن طرف معين'
    },
    {
      id: 'security_pledge',
      name: 'تعهد للامن العام - موافقة مسبقة',
      description: 'تعهد رسمي لجهات الأمن العام بخصوص العمالة المنزلية'
    }
  ] : [
    {
      id: 'judicial_power',
      name: 'Judicial Power of Attorney',
      description: 'Comprehensive power of attorney for judicial matters'
    },
    {
      id: 'sale_contract',
      name: 'Official Sale Contract',
      description: 'Notarized real estate sale contract'
    },
    {
      id: 'domestic_work',
      name: 'Domestic Workers Employment Contract',
      description: 'Contract for domestic workers under Lebanese law'
    },
    {
      id: 'car_sale_proxy',
      name: 'Irrevocable Car Sale Proxy',
      description: 'Final car sale authorization under traffic law'
    },
    {
      id: 'liability_release',
      name: 'Liability Release Statement',
      description: 'Legal document to release liability'
    },
    {
      id: 'security_pledge',
      name: 'General Security Pledge',
      description: 'Pledge for security authorities regarding domestic workers'
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({ ...formData, type: typeId });
    setGeneratedDocument('');
  };

  const handleSaveDocument = async () => {
    setIsSaving(true);
    try {
      await documentsAPI.createDocument({
        title: documentTypes.find(t => t.id === selectedType)?.name || 'Document',
        content: generatedDocument,
        type: selectedType,
        tags: [],
      });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ الوثيقة في حسابك' : 'Document saved to your account',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء حفظ الوثيقة' : 'An error occurred while saving the document',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateArabicDocument = (data: DocumentForm): string => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-LB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const documentTemplates = {
      judicial_power: `سند توكيل عام قضائي

بيوم ${formattedDate}

حضر أمامي أنا ${data.notaryName || 'الكاتب العدل'} الكاتب العدل في ${data.location || '...'} السيد/ة ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}
عليـها رسمـه الحائز على الأهلية القانونية وبحضوري صرح طائعـاً مختاراً بما يلي:

قد وكلـت المحامي/ة ${data.partyB}
للمرافعة والمدافعة عني لدى جميع المحاكم على إختلاف أنواعها ودرجاتها ووظائفها من نظامية وإدارية وطنية أم ناظرة بالقضايا الاجنبية أم شرعية وذلك بكل دعوى لي أو علي مع أي كان, ومن اي نوع كانت من حقوقية وادارية وتجارية وشرعية وجزائية وعقارية و روحية وعسكرية.

${data.attorneyPowers || 'كافة الصلاحيات القانونية بما في ذلك تقديم الاستدعاءات واللوائح الخطية واستلام واسترجاع كافة الاوراق والتبليغ والتحليف والتحكيم وتسمية الخبراء وطلب الحجز ورفعه والاستحصال على الاحكام والقرارات الادارية واعطاء الاحكام الصيغة التنفيذية وتنفيذها بجميع الطرق القانونية.'}

وبعد تلاوة هذا السند عليـه علنا ومصادقته على مضمونه أمضي مني ومنه وتسلم نسخة عنه بعد تسجيله وتصديقه وفقا للأصول.

الموكل/ة: ${data.partyA}`,

      sale_contract: `عقد بيع ممسوح

عـــــــــــــــــــــــدد ${today.getFullYear()}

في الساعة من يوم ${formattedDate}

في دائرتي وأمامنا نحن ${data.notaryName || 'الكاتب العدل'} الكاتب العدل في ${data.location || '...'} - وبحضور:

الفريق الأول: ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}
هاتف: ${data.partyAPhone || '...'}

الفريق الثاني: ${data.partyB}
المقيم في: ${data.partyBResidence || '...'}
هاتف: ${data.partyBPhone || '...'}

وبعد اطلاعهما على قيود السجل العقاري قررا بالاتفاق التام والرضى المتبادل أمام شهود التعريف ما يأتي:

أولا: إن الفريق الأول المذكور سابقا بعد أن ابرز سند تمليك مرفق ربطاً فأثبت بموجبه ملكيته لكامل ${data.propertyDetails?.share || '...'} سهم في العقار رقم ${data.propertyDetails?.registryNumber || '...'} من منطقة ${data.propertyDetails?.location || '...'} العقارية.

وهذا العقار هو من نوع ${data.propertyDetails?.type || '...'} الواقع في منطقة ${data.propertyDetails?.location || '...'} العقارية.

صرح بأنه باع من الفريق الثاني المذكور أعلاه، بيعا باتا قطعيا لكامل ${data.propertyDetails?.share || '...'} سهم في العقار المذكور مع كافة منافعه وحقوقه ومشتملاته.

ثانيا: صرح الفريق الثاني المذكور آنفا بقبوله شراء كامل ${data.propertyDetails?.share || '...'} سهم في العقار المذكور مع كافة منافعه وحقوقه ومشتملاته.

ثالثا: صرح الفريقان المتعاقدان بأن هذه الصفقة قد تمت لقاء مبلغ وقدره ${data.price || '...'} ليرة لبنانية (${data.priceInWords || '...'}) أقر البائع بقبضه من الشاري حال عقده نقدا وعدا.

الشروط الخصوصية:
${data.specialConditions || 'يقر الطرفان بكافة الشروط القانونية الواردة في هذا العقد ويتحملان المسؤولية الكاملة عن تنفيذها.'}

المتعاقدان:
الفريق الأول: ${data.partyA}
الفريق الثاني: ${data.partyB}`,

      domestic_work: `عقــد عمـــل بالعاملات في الخدمة المنزلية

موقع فيما بين:

الفريق الأول: ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}
هاتف: ${data.partyAPhone || '...'}

الفريق الثاني: العاملة في الخدمة المنزلية ${data.partyB}
من الجنسية ${data.workerDetails?.nationality || '...'}
حسب جواز سفرها رقم ${data.workerDetails?.passportNumber || '...'}
الصادر بتاريخ ${data.workerDetails?.passportIssueDate || '...'}

تم الاتفاق بين الفريقين بالرضا والقبول المتبادلين على ما يلي:

1. مدة العقد: سنة واحدة قابلة للتجديد
2. الراتب الشهري: ${data.salary || '...'} دولار أميركي
3. ساعات العمل: ${data.workHours || '10'} ساعات يوميا
4. أيام الراحة: يوم واحد أسبوعيا
5. الإجازة السنوية: ${data.vacationDays || '6'} أيام
6. تذكرة السفر: ${data.ticketProvision || 'يتعهد صاحب العمل بتأمين تذكرة سفر للعودة'}

شروط إنهاء العقد:
${data.terminationConditions || '1. يحق لصاحب العمل إنهاء العقد في حال مخالفة الشروط\n2. يحق للعاملة إنهاء العقد في حال عدم دفع الأجر لمدة 3 أشهر'}

المتعاقدان:
صاحب العمل: ${data.partyA}
العاملة: ${data.partyB}

تاريخ: ${formattedDate}`,

      car_sale_proxy: `وكالة بيع سـيارة غير قابلة للعزل

أنا الموقع أدناه ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}
هاتف: ${data.partyAPhone || '...'}

قد وكلت السيد/ة ${data.partyB}
لبيع وفراغ وتسجيل كامل السيارة التالية:

ماركة: ${data.vehicleDetails?.make || '...'}
صنع: ${data.vehicleDetails?.year || '...'}
رقم التسجيل: ${data.vehicleDetails?.plateNumber || '...'}
رقم الشاسي: ${data.vehicleDetails?.chassisNumber || '...'}
رقم المحرك: ${data.vehicleDetails?.engineNumber || '...'}

شروط البيع:
${data.saleConditions || '1. البيع بالثمن الذي يراه الوكيل مناسباً\n2. قبض الثمن وإعطاء الإيصالات\n3. إجراء كافة المعاملات لدى دوائر السير'}

بكافة الصلاحيات اللازمة للبيع والتسجيل وقبض الثمن وإجراء كافة المعاملات لدى دوائر السير والمراجع المختصة.

هذه الوكالة غير قابلة للعزل وتخضع لأحكام قانون السير اللبناني.

الموكل: ${data.partyA}
التاريخ: ${formattedDate}`,

      liability_release: `اقرار رفع مسؤولية

حضرة السيد/ة ${data.partyB}
المقيم في: ${data.partyBResidence || '...'}

أنا الموقع أدناه ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}

أصرح بما يلي:

${data.liabilityStatement || 'أقر وأعترف بأنني أتنازل عن أي مطالبات أو مسؤوليات تجاهكم بخصوص الأمور التالية:'}

${data.liabilityScope || 'كافة الأمور المتعلقة بالسيارة/العقار/المعاملة المذكورة'}

وأقر بأن هذا التنازل نهائي وغير قابل للنقض.

المقر: ${data.partyA}
التاريخ: ${formattedDate}`,

      security_pledge: `تعهد للامن العام - موافقة مسبقة

بتاريخ ${formattedDate}

أنا الموقع أدناه ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}
هاتف: ${data.partyAPhone || '...'}

أتعهد باستخدام العاملة في الخدمة المنزلية:
${data.workerName || data.partyB}
حسب الموافقة المسبقة رقم ${data.approvalNumber || '...'} بتاريخ ${data.approvalDate || '...'}

وأتعهد بما يلي:
${data.securityCommitments || '1. تأمين تذكرة سفر للعودة إلى بلدها\n2. تجديد الإقامة والإجازة ضمن المهلة القانونية\n3. الالتزام بكافة القوانين المنظمة لعمل العاملات المنزليات'}

كما أقر واعترف أن قيمة بطاقة السفر جوا هي أمانة في ذمتي أدفعها عند الاقتضاء إما للعامة مباشرة أو للدوائر الرسمية المختصة فور طلبها.

المتعهد: ${data.partyA}
التاريخ: ${formattedDate}`
    };

    return documentTemplates[data.type as keyof typeof documentTemplates] || 'وثيقة قانونية';
  };

  const generateEnglishDocument = (data: DocumentForm): string => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-LB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const documentTemplates = {
      judicial_power: `Judicial Power of Attorney

On ${formattedDate}

Before me, ${data.notaryName || 'the notary public'} in ${data.location || '...'}, appeared:
${data.partyA}
Residing at: ${data.partyAResidence || '...'}

Who declared voluntarily the following:

I hereby appoint the attorney ${data.partyB}
To represent me before all courts of different types and levels, whether ordinary, administrative, national, foreign or religious, in all cases for or against me, of any type whether civil, administrative, commercial, religious, criminal, real estate, spiritual or military.

${data.attorneyPowers || 'Full legal powers including submitting requests and written pleadings, receiving and retrieving documents, notifications, oaths, arbitration, appointing experts, requesting and lifting seizures, obtaining judgments and administrative decisions, giving judgments executive form and executing them by all legal means.'}

After reading this document aloud and approving its content, I signed it and received a copy after its registration and certification according to the procedures.

Principal: ${data.partyA}`,

      sale_contract: `Official Sale Contract

Number ${today.getFullYear()}

At the hour of ${formattedDate}

Before me, ${data.notaryName || 'the notary public'} in ${data.location || '...'}, appeared:

First Party: ${data.partyA}
Residing at: ${data.partyAResidence || '...'}
Phone: ${data.partyAPhone || '...'}

Second Party: ${data.partyB}
Residing at: ${data.partyBResidence || '...'}
Phone: ${data.partyBPhone || '...'}

After reviewing the real estate registry records, they agreed by mutual consent before the identifying witnesses as follows:

First: The aforementioned First Party presented a deed of ownership proving ownership of ${data.propertyDetails?.share || '...'} shares in property No. ${data.propertyDetails?.registryNumber || '...'} in the ${data.propertyDetails?.location || '...'} area.

This property is of type ${data.propertyDetails?.type || '...'} located in ${data.propertyDetails?.location || '...'} area.

Declared selling to the Second Party the aforementioned ${data.propertyDetails?.share || '...'} shares in the property with all its benefits, rights and contents.

Second: The Second Party declared accepting to purchase the aforementioned ${data.propertyDetails?.share || '...'} shares in the property with all its benefits, rights and contents.

Third: The contracting parties declared that this transaction was made for the amount of ${data.price || '...'} Lebanese Pounds (${data.priceInWords || '...'}) which the seller acknowledged receiving from the buyer upon signing.

Special Conditions:
${data.specialConditions || 'The parties acknowledge all legal conditions in this contract and bear full responsibility for their implementation.'}

Contracting Parties:
First Party: ${data.partyA}
Second Party: ${data.partyB}`,

      domestic_work: `Domestic Workers Employment Contract

Between:

First Party: ${data.partyA}
Residing at: ${data.partyAResidence || '...'}
Phone: ${data.partyAPhone || '...'}

Second Party: Domestic worker ${data.partyB}
Nationality: ${data.workerDetails?.nationality || '...'}
Passport No.: ${data.workerDetails?.passportNumber || '...'}
Issued on: ${data.workerDetails?.passportIssueDate || '...'}

The parties mutually agreed on the following:

1. Contract duration: One year renewable
2. Monthly salary: ${data.salary || '...'} US Dollars
3. Working hours: ${data.workHours || '10'} hours daily
4. Rest days: One day per week
5. Annual leave: ${data.vacationDays || '6'} days
6. Air ticket: ${data.ticketProvision || 'The employer shall provide return ticket'}

Termination Conditions:
${data.terminationConditions || '1. The employer may terminate for breach of conditions\n2. The worker may terminate if salary is unpaid for 3 months'}

Contracting Parties:
Employer: ${data.partyA}
Worker: ${data.partyB}

Date: ${formattedDate}`,

      car_sale_proxy: `Irrevocable Car Sale Proxy

I, the undersigned ${data.partyA}
Residing at: ${data.partyAResidence || '...'}
Phone: ${data.partyAPhone || '...'}

Hereby appoint Mr./Mrs. ${data.partyB}
To sell and register the following vehicle:

Make: ${data.vehicleDetails?.make || '...'}
Year: ${data.vehicleDetails?.year || '...'}
Plate No.: ${data.vehicleDetails?.plateNumber || '...'}
Chassis No.: ${data.vehicleDetails?.chassisNumber || '...'}
Engine No.: ${data.vehicleDetails?.engineNumber || '...'}

Sale Conditions:
${data.saleConditions || '1. Sale at price deemed appropriate by agent\n2. Receiving payment and issuing receipts\n3. Completing all registration procedures'}

With full powers necessary for sale, registration, receiving payment and completing all procedures with traffic departments and relevant authorities.

This proxy is irrevocable and subject to Lebanese traffic law provisions.

Principal: ${data.partyA}
Date: ${formattedDate}`,

      liability_release: `Liability Release Statement

To: Mr./Mrs. ${data.partyB}
Residing at: ${data.partyBResidence || '...'}

I, the undersigned ${data.partyA}
Residing at: ${data.partyAResidence || '...'}

Declare the following:

${data.liabilityStatement || 'I acknowledge and declare that I release you from any claims or liabilities regarding the following matters:'}

${data.liabilityScope || 'All matters related to the mentioned vehicle/property/transaction'}

I acknowledge that this release is final and irrevocable.

Declarant: ${data.partyA}
Date: ${formattedDate}`,

      security_pledge: `General Security Pledge

Date: ${formattedDate}

I, the undersigned ${data.partyA}
Residing at: ${data.partyAResidence || '...'}
Phone: ${data.partyAPhone || '...'}

Pledge regarding employment of domestic worker:
${data.workerName || data.partyB}
According to prior approval No. ${data.approvalNumber || '...'} dated ${data.approvalDate || '...'}

I pledge the following:
${data.securityCommitments || '1. Providing return air ticket to home country\n2. Renewing residence and work permit within legal timeframe\n3. Complying with all laws regulating domestic workers employment'}

I also acknowledge that the air ticket value is a debt I shall pay when required either directly to the worker or to official authorities upon request.

Pledger: ${data.partyA}
Date: ${formattedDate}`
    };

    return documentTemplates[data.type as keyof typeof documentTemplates] || 'Legal Document';
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Validate required fields
    let isValid = true;
    let errorMessage = '';
    
    if (!formData.partyA || !formData.partyB) {
      isValid = false;
      errorMessage = language === 'ar' ? 'يجب إدخال أسماء الأطراف' : 'Party names are required';
    } else if (selectedType === 'sale_contract' && (!formData.propertyDetails?.share || !formData.price)) {
      isValid = false;
      errorMessage = language === 'ar' ? 'يجب تحديد حصة العقار والسعر' : 'Property share and price are required';
    } else if (selectedType === 'domestic_work' && !formData.salary) {
      isValid = false;
      errorMessage = language === 'ar' ? 'يجب تحديد الراتب' : 'Salary is required';
    } else if (selectedType === 'car_sale_proxy' && !formData.vehicleDetails?.plateNumber) {
      isValid = false;
      errorMessage = language === 'ar' ? 'يجب إدخال رقم لوحة السيارة' : 'Vehicle plate number is required';
    }

    if (!isValid) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsGenerating(false);
      return;
    }

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    // Generate document
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      const generatedDoc = language === 'ar' ? 
        generateArabicDocument(formData) : 
        generateEnglishDocument(formData);
      
      setGeneratedDocument(generatedDoc);
      setIsGenerating(false);
      
      toast({
        title: language === 'ar' ? 'تم الإنشاء' : 'Generated',
        description: language === 'ar' ? 'تم إنشاء الوثيقة بنجاح' : 'Document has been generated successfully',
      });
    }, 3000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDocument], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedType}_${language}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: language === 'ar' ? 'تم التحميل' : 'Downloaded',
      description: language === 'ar' ? 'تم تحميل الوثيقة بنجاح' : 'Document downloaded successfully',
    });
  };



  const renderDocumentSpecificFields = () => {
    switch (selectedType) {
      case 'judicial_power':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="partyAResidence">
                {language === 'ar' ? 'عنوان الموكل' : 'Principal Address'}
              </Label>
              <Input
                id="partyAResidence"
                value={formData.partyAResidence || ''}
                onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
                placeholder={language === 'ar' ? 'عنوان الموكل' : 'Principal address'}
              />
            </div>
            <div>
              <Label htmlFor="attorneyPowers">
                {language === 'ar' ? 'الصلاحيات الممنوحة' : 'Granted Powers'}
              </Label>
              <Textarea
                id="attorneyPowers"
                value={formData.attorneyPowers || ''}
                onChange={(e) => setFormData({...formData, attorneyPowers: e.target.value})}
                placeholder={language === 'ar' ? 'وصف الصلاحيات الممنوحة للمحامي' : 'Description of powers granted to attorney'}
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="notaryName">
                {language === 'ar' ? 'اسم الكاتب العدل' : 'Notary Name'}
              </Label>
              <Input
                id="notaryName"
                value={formData.notaryName || ''}
                onChange={(e) => setFormData({...formData, notaryName: e.target.value})}
                placeholder={language === 'ar' ? 'اسم الكاتب العدل' : 'Notary public name'}
              />
            </div>
            <div>
              <Label htmlFor="location">
                {language === 'ar' ? 'مكان التوثيق' : 'Notarization Location'}
              </Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder={language === 'ar' ? 'المدينة أو المنطقة' : 'City or area'}
              />
            </div>
          </div>
        );
      
      case 'sale_contract':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyType">
                  {language === 'ar' ? 'نوع العقار' : 'Property Type'}
                </Label>
                <Input
                  id="propertyType"
                  value={formData.propertyDetails?.type || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      type: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'شقة، أرض، منزل' : 'Apartment, land, house'}
                />
              </div>
              <div>
                <Label htmlFor="propertyLocation">
                  {language === 'ar' ? 'موقع العقار' : 'Property Location'}
                </Label>
                <Input
                  id="propertyLocation"
                  value={formData.propertyDetails?.location || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      location: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'المدينة والمنطقة' : 'City and area'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyShare">
                  {language === 'ar' ? 'الحصة العقارية' : 'Property Share'}
                </Label>
                <Input
                  id="propertyShare"
                  value={formData.propertyDetails?.share || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      share: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'مثال: 2400 سهم' : 'Example: 2400 shares'}
                />
              </div>
              <div>
                <Label htmlFor="registryNumber">
                  {language === 'ar' ? 'رقم السجل العقاري' : 'Registry Number'}
                </Label>
                <Input
                  id="registryNumber"
                  value={formData.propertyDetails?.registryNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      registryNumber: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'رقم السجل' : 'Registry number'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">
                  {language === 'ar' ? 'سعر البيع' : 'Sale Price'}
                </Label>
                <Input
                  id="price"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder={language === 'ar' ? 'المبلغ بالليرة اللبنانية' : 'Amount in LBP'}
                />
              </div>
              <div>
                <Label htmlFor="priceInWords">
                  {language === 'ar' ? 'سعر البيع كتابة' : 'Price in Words'}
                </Label>
                <Input
                  id="priceInWords"
                  value={formData.priceInWords || ''}
                  onChange={(e) => setFormData({...formData, priceInWords: e.target.value})}
                  placeholder={language === 'ar' ? 'المبلغ كتابة' : 'Amount in words'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialConditions">
                {language === 'ar' ? 'شروط خاصة' : 'Special Conditions'}
              </Label>
              <Textarea
                id="specialConditions"
                value={formData.specialConditions || ''}
                onChange={(e) => setFormData({...formData, specialConditions: e.target.value})}
                placeholder={language === 'ar' ? 'أي شروط إضافية' : 'Any additional conditions'}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyAResidence">
                  {language === 'ar' ? 'عنوان البائع' : 'Seller Address'}
                </Label>
                <Input
                  id="partyAResidence"
                  value={formData.partyAResidence || ''}
                  onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان البائع' : 'Seller address'}
                />
              </div>
              <div>
                <Label htmlFor="partyBResidence">
                  {language === 'ar' ? 'عنوان المشتري' : 'Buyer Address'}
                </Label>
                <Input
                  id="partyBResidence"
                  value={formData.partyBResidence || ''}
                  onChange={(e) => setFormData({...formData, partyBResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان المشتري' : 'Buyer address'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyAPhone">
                  {language === 'ar' ? 'هاتف البائع' : 'Seller Phone'}
                </Label>
                <Input
                  id="partyAPhone"
                  value={formData.partyAPhone || ''}
                  onChange={(e) => setFormData({...formData, partyAPhone: e.target.value})}
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
              <div>
                <Label htmlFor="partyBPhone">
                  {language === 'ar' ? 'هاتف المشتري' : 'Buyer Phone'}
                </Label>
                <Input
                  id="partyBPhone"
                  value={formData.partyBPhone || ''}
                  onChange={(e) => setFormData({...formData, partyBPhone: e.target.value})}
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
            </div>
          </div>
        );
      
      case 'domestic_work':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyAResidence">
                  {language === 'ar' ? 'عنوان صاحب العمل' : 'Employer Address'}
                </Label>
                <Input
                  id="partyAResidence"
                  value={formData.partyAResidence || ''}
                  onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان صاحب العمل' : 'Employer address'}
                />
              </div>
              <div>
                <Label htmlFor="partyAPhone">
                  {language === 'ar' ? 'هاتف صاحب العمل' : 'Employ                  Phone'}
                </Label>
                <Input
                  id="partyAPhone"
                  value={formData.partyAPhone || ''}
                  onChange={(e) => setFormData({...formData, partyAPhone: e.target.value})}
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workerNationality">
                  {language === 'ar' ? 'جنسية العاملة' : 'Worker Nationality'}
                </Label>
                <Input
                  id="workerNationality"
                  value={formData.workerDetails?.nationality || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workerDetails: {
                      ...formData.workerDetails,
                      nationality: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'الجنسية' : 'Nationality'}
                />
              </div>
              <div>
                <Label htmlFor="passportNumber">
                  {language === 'ar' ? 'رقم جواز السفر' : 'Passport Number'}
                </Label>
                <Input
                  id="passportNumber"
                  value={formData.workerDetails?.passportNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workerDetails: {
                      ...formData.workerDetails,
                      passportNumber: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'رقم الجواز' : 'Passport number'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passportIssueDate">
                  {language === 'ar' ? 'تاريخ إصدار الجواز' : 'Passport Issue Date'}
                </Label>
                <Input
                  id="passportIssueDate"
                  value={formData.workerDetails?.passportIssueDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workerDetails: {
                      ...formData.workerDetails,
                      passportIssueDate: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'تاريخ الإصدار' : 'Issue date'}
                />
              </div>
              <div>
                <Label htmlFor="passportExpiryDate">
                  {language === 'ar' ? 'تاريخ انتهاء الجواز' : 'Passport Expiry Date'}
                </Label>
                <Input
                  id="passportExpiryDate"
                  value={formData.workerDetails?.passportExpiryDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    workerDetails: {
                      ...formData.workerDetails,
                      passportExpiryDate: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry date'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salary">
                {language === 'ar' ? 'الراتب الشهري' : 'Monthly Salary'}
              </Label>
              <Input
                id="salary"
                value={formData.salary || ''}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder={language === 'ar' ? 'المبلغ بالدولار' : 'Amount in USD'}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workHours">
                  {language === 'ar' ? 'ساعات العمل اليومية' : 'Daily Working Hours'}
                </Label>
                <Input
                  id="workHours"
                  value={formData.workHours || ''}
                  onChange={(e) => setFormData({...formData, workHours: e.target.value})}
                  placeholder={language === 'ar' ? 'عدد الساعات' : 'Hours per day'}
                />
              </div>
              <div>
                <Label htmlFor="vacationDays">
                  {language === 'ar' ? 'أيام الإجازة السنوية' : 'Annual Vacation Days'}
                </Label>
                <Input
                  id="vacationDays"
                  value={formData.vacationDays || ''}
                  onChange={(e) => setFormData({...formData, vacationDays: e.target.value})}
                  placeholder={language === 'ar' ? 'عدد الأيام' : 'Days per year'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ticketProvision">
                {language === 'ar' ? 'تذكرة السفر' : 'Air Ticket'}
              </Label>
              <Input
                id="ticketProvision"
                value={formData.ticketProvision || ''}
                onChange={(e) => setFormData({...formData, ticketProvision: e.target.value})}
                placeholder={language === 'ar' ? 'تفاصيل تذكرة السفر' : 'Air ticket details'}
              />
            </div>
            <div>
              <Label htmlFor="terminationConditions">
                {language === 'ar' ? 'شروط إنهاء العقد' : 'Termination Conditions'}
              </Label>
              <Textarea
                id="terminationConditions"
                value={formData.terminationConditions || ''}
                onChange={(e) => setFormData({...formData, terminationConditions: e.target.value})}
                placeholder={language === 'ar' ? 'شروط إنهاء العقد' : 'Contract termination conditions'}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'car_sale_proxy':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyAResidence">
                  {language === 'ar' ? 'عنوان المالك' : 'Owner Address'}
                </Label>
                <Input
                  id="partyAResidence"
                  value={formData.partyAResidence || ''}
                  onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان المالك' : 'Owner address'}
                />
              </div>
              <div>
                <Label htmlFor="partyAPhone">
                  {language === 'ar' ? 'هاتف المالك' : 'Owner Phone'}
                </Label>
                <Input
                  id="partyAPhone"
                  value={formData.partyAPhone || ''}
                  onChange={(e) => setFormData({...formData, partyAPhone: e.target.value})}
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleMake">
                  {language === 'ar' ? 'ماركة السيارة' : 'Vehicle Make'}
                </Label>
                <Input
                  id="vehicleMake"
                  value={formData.vehicleDetails?.make || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleDetails: {
                      ...formData.vehicleDetails,
                      make: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'مثال: تويوتا' : 'Example: Toyota'}
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">
                  {language === 'ar' ? 'موديل السيارة' : 'Vehicle Model'}
                </Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleDetails?.model || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleDetails: {
                      ...formData.vehicleDetails,
                      model: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'موديل السيارة' : 'Vehicle model'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleYear">
                  {language === 'ar' ? 'سنة الصنع' : 'Manufacture Year'}
                </Label>
                <Input
                  id="vehicleYear"
                  value={formData.vehicleDetails?.year || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleDetails: {
                      ...formData.vehicleDetails,
                      year: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'سنة الصنع' : 'Manufacture year'}
                />
              </div>
              <div>
                <Label htmlFor="plateNumber">
                  {language === 'ar' ? 'رقم اللوحة' : 'Plate Number'}
                </Label>
                <Input
                  id="plateNumber"
                  value={formData.vehicleDetails?.plateNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleDetails: {
                      ...formData.vehicleDetails,
                      plateNumber: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'رقم اللوحة' : 'Plate number'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chassisNumber">
                  {language === 'ar' ? 'رقم الشاسيه' : 'Chassis Number'}
                </Label>
                <Input
                  id="chassisNumber"
                  value={formData.vehicleDetails?.chassisNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleDetails: {
                      ...formData.vehicleDetails,
                      chassisNumber: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'رقم الشاسيه' : 'Chassis number'}
                />
              </div>
              <div>
                <Label htmlFor="engineNumber">
                  {language === 'ar' ? 'رقم المحرك' : 'Engine Number'}
                </Label>
                <Input
                  id="engineNumber"
                  value={formData.vehicleDetails?.engineNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleDetails: {
                      ...formData.vehicleDetails,
                      engineNumber: e.target.value
                    }
                  })}
                  placeholder={language === 'ar' ? 'رقم المحرك' : 'Engine number'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="saleConditions">
                {language === 'ar' ? 'شروط البيع' : 'Sale Conditions'}
              </Label>
              <Textarea
                id="saleConditions"
                value={formData.saleConditions || ''}
                onChange={(e) => setFormData({...formData, saleConditions: e.target.value})}
                placeholder={language === 'ar' ? 'شروط البيع' : 'Sale conditions'}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'liability_release':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyAResidence">
                  {language === 'ar' ? 'عنوان المقر' : 'Declarant Address'}
                </Label>
                <Input
                  id="partyAResidence"
                  value={formData.partyAResidence || ''}
                  onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان المقر' : 'Declarant address'}
                />
              </div>
              <div>
                <Label htmlFor="partyBResidence">
                  {language === 'ar' ? 'عنوان المفرج له' : 'Releasee Address'}
                </Label>
                <Input
                  id="partyBResidence"
                  value={formData.partyBResidence || ''}
                  onChange={(e) => setFormData({...formData, partyBResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان المفرج له' : 'Releasee address'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="liabilityStatement">
                {language === 'ar' ? 'بيان الإقرار' : 'Declaration Statement'}
              </Label>
              <Textarea
                id="liabilityStatement"
                value={formData.liabilityStatement || ''}
                onChange={(e) => setFormData({...formData, liabilityStatement: e.target.value})}
                placeholder={language === 'ar' ? 'نص الإقرار' : 'Declaration text'}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="liabilityScope">
                {language === 'ar' ? 'نطاق المسؤولية' : 'Liability Scope'}
              </Label>
              <Textarea
                id="liabilityScope"
                value={formData.liabilityScope || ''}
                onChange={(e) => setFormData({...formData, liabilityScope: e.target.value})}
                placeholder={language === 'ar' ? 'وصف نطاق المسؤولية' : 'Description of liability scope'}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'security_pledge':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partyAResidence">
                  {language === 'ar' ? 'عنوان المتعهد' : 'Pledger Address'}
                </Label>
                <Input
                  id="partyAResidence"
                  value={formData.partyAResidence || ''}
                  onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
                  placeholder={language === 'ar' ? 'عنوان المتعهد' : 'Pledger address'}
                />
              </div>
              <div>
                <Label htmlFor="partyAPhone">
                  {language === 'ar' ? 'هاتف المتعهد' : 'Pledger Phone'}
                </Label>
                <Input
                  id="partyAPhone"
                  value={formData.partyAPhone || ''}
                  onChange={(e) => setFormData({...formData, partyAPhone: e.target.value})}
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approvalNumber">
                  {language === 'ar' ? 'رقم الموافقة المسبقة' : 'Prior Approval Number'}
                </Label>
                <Input
                  id="approvalNumber"
                  value={formData.approvalNumber || ''}
                  onChange={(e) => setFormData({...formData, approvalNumber: e.target.value})}
                  placeholder={language === 'ar' ? 'رقم الموافقة' : 'Approval number'}
                />
              </div>
              <div>
                <Label htmlFor="approvalDate">
                  {language === 'ar' ? 'تاريخ الموافقة المسبقة' : 'Prior Approval Date'}
                </Label>
                <Input
                  id="approvalDate"
                  value={formData.approvalDate || ''}
                  onChange={(e) => setFormData({...formData, approvalDate: e.target.value})}
                  placeholder={language === 'ar' ? 'تاريخ الموافقة' : 'Approval date'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="workerName">
                {language === 'ar' ? 'اسم العاملة' : 'Worker Name'}
              </Label>
              <Input
                id="workerName"
                value={formData.workerName || formData.partyB || ''}
                onChange={(e) => setFormData({...formData, workerName: e.target.value})}
                placeholder={language === 'ar' ? 'اسم العاملة' : 'Worker name'}
              />
            </div>
            <div>
              <Label htmlFor="securityCommitments">
                {language === 'ar' ? 'بنود التعهد' : 'Pledge Terms'}
              </Label>
              <Textarea
                id="securityCommitments"
                value={formData.securityCommitments || ''}
                onChange={(e) => setFormData({...formData, securityCommitments: e.target.value})}
                placeholder={language === 'ar' ? 'بنود التعهد' : 'Pledge terms'}
                rows={6}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/documents" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {language === 'ar' ? 'إنشاء وثيقة جديدة' : 'Create New Document'}
        </h1>
      </div>

      {!selectedType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTypes.map((docType) => (
            <Card 
              key={docType.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleTypeSelect(docType.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {docType.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {docType.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {documentTypes.find(t => t.id === selectedType)?.name}
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedType('');
                setFormData({ type: '', partyA: '', partyB: '' });
                setGeneratedDocument('');
              }}
            >
              {language === 'ar' ? 'رجوع' : 'Back'}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partyA">
                      {language === 'ar' ? 'الطرف الأول' : 'First Party'}
                    </Label>
                    <Input
                      id="partyA"
                      value={formData.partyA}
                      onChange={(e) => setFormData({...formData, partyA: e.target.value})}
                      placeholder={language === 'ar' ? 'اسم الطرف الأول' : 'First party name'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="partyB">
                      {language === 'ar' ? 'الطرف الثاني' : 'Second Party'}
                    </Label>
                    <Input
                      id="partyB"
                      value={formData.partyB}
                      onChange={(e) => setFormData({...formData, partyB: e.target.value})}
                      placeholder={language === 'ar' ? 'اسم الطرف الثاني' : 'Second party name'}
                    />
                  </div>
                </div>

                {renderDocumentSpecificFields()}

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {language === 'ar' ? 'إنشاء الوثيقة' : 'Generate Document'}
                  </Button>
                  {generatedDocument && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'تحميل' : 'Download'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={handleSaveDocument}
                        disabled={isSaving}
                      >
                        {language === 'ar' ? 'حفظ الوثيقة' : 'Save Document'}
                      </Button>
                    </>
                  )}
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {language === 'ar' ? 'جاري إنشاء الوثيقة...' : 'Generating document...'}
                    </p>
                  </div>
                )}

                {generatedDocument && (
                  <div className="mt-6">
                    <Label>
                      {language === 'ar' ? 'الوثيقة المنشأة' : 'Generated Document'}
                    </Label>
                    <div className="mt-2 p-4 border rounded-md bg-muted/50">
                      <pre className="whitespace-pre-wrap font-sans">
                        {generatedDocument}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentDrafting;