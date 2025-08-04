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
import useArabicPdf from './useArabicPdf';
import { jsPDF } from 'jspdf';
import { AmiriRegular } from './Amiri_Regular.js';


interface DocumentForm {
  type: string;

  // Common fields
  partyA: string; // Employer / Declarant name
  partyAId?: string;
  partyANationality?: string;
  partyAResidence?: string; // Town / City
  partyADistrict?: string; // District
  partyAStreet?: string; // Street
  partyABuilding?: string; // Building name
  partyAFloor?: string; // Floor
  partyAPhone?: string;

  // Additional name details for legal docs
  partyAFatherName?: string; // Father's name
  partyALastName?: string; // Family name

  partyB: string; // Worker / Releasee name
  partyBId?: string;
  partyBNationality?: string;
  partyBResidence?: string;
  partyBPhone?: string;

  // Date fields
  date?: string; // Full contract date (YYYY-MM-DD or string)
  contractDay?: string; // Day number
  contractDayName?: string; // Day name in Arabic
  contractMonth?: string; // Month name in Arabic
  contractYear?: string; // Year in numbers

  // Residency details
  residencyDays?: string; // Number of days per year
  residencyDate?: string; // Residency declaration date

  // Location & Notary
  location?: string; // General location (city/village)
  notaryName?: string;
  notaryLocation?: string;

  // Judicial Power of Attorney
  attorneyPowers?: string;

  // Property Sale Contract
  propertyDetails?: {
    type: string;
    location: string;
    area: string;
    share: string;
    registryNumber: string;
    district?: string;
    zone?: string;
  };
  price?: string;
  priceInWords?: string;
  paymentMethod?: string;
  specialConditions?: string;

  // Domestic Worker Contract
  workerDetails?: {
    nationality: string;
    birthYear?: string;
    passportNumber: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    workType?: string;
  };
  salary?: string;
  workHours?: string;
  vacationDays?: string;
  ticketProvision?: string;
  terminationConditions?: string;

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

  // Additional legal contract metadata
  financialNumber?: string;
  dailyRegistryNumber?: string;
  contractProtocolNumber?: string;
  witness1?: string;
  witness2?: string;
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
const { generatePdf } = useArabicPdf();
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
    const yearNow = today.getFullYear();
    const monthNow = today.getMonth() + 1;
    const dayNow = today.getDate();
    const dayNowName = today.toLocaleDateString('ar-LB', { weekday: 'long' });

    const documentTemplates = {
judicial_power: `سـند توكيل عـــام قضائي
عــــــــــــــــــــــــدد
${yearNow}

بيوم ${dayNowName} الواقع في ${dayNow} من شهر ${monthNow} عام ألفين وخمسة وعشرين.

حضر أمامي أنا ${formData.notaryName || 'الكاتب العدل'} الكاتب العدل في ${formData.location || '...'} السيد ${formData.partyA}

المقيم في: ${formData.partyAResidence || '...'}  
عليـها رسمـه الحائز على الاهلية القانونية و بحضورى صرح طائعـاً مختاراً بما يأتي:
قد وكلـت المحامي الاستاذ ${formData.partyB}  
للمرافعة والمدافعة عني لدى جميع المحاكم على إختلاف أنواعها ودرجاتها ووظائفها من نظامية وإدارية وطنية أم ناظرة بالقضايا الاجنبية أم شرعية وذلك بكل دعوى لي أو علي مع أي كان، ومن اي نوع كانت من حقوقية وادارية وتجارية وشرعية وجزائية وعقارية وروحية وعسكرية، كالة عامة مفوضة لرأيه وفعله، مجيزاً له تقديم الاستدعاءات واللوائح الخطية واستلام واسترجاع كافة الاوراق أين وأنى كانت، والتبلغ والتبليغ والتحليف والتحكيم وتسمية الخبراء وردهم وقبول تقاريرهم والاعتراض عليها، وطلب الحجز ورفعه والاستحصال على الاحكام والقرارات الادارية واعطاء الاحكام الصيغة التنفيذية وتنفيذها بجميع الطرق القانونية، وطلب وضع الرهن الإجباري والدخول بالمزايدة بأسمـي ولحسابـي، وملاحقة جميع المعاملات في الدوائر العقارية ورفع وشطب إشارة التأمين والرهن عن الاموال المنقولة وغير المنقولة، وطلب شهر الإفلاس والتصفية القضائية وتصديق الكونكوردتو والاعتراض عليها، وتثبيت الديون والاعتراض عليها، وإقامة دعوى الشفعة والغبن والقسمة والافراز، وطلب الحبس ومراجعة دوائر التحقيق وتقديم الشكاوي خصوصاً في دعاوي إساءة الائتمان والتزوير، وسائر الدعاوي الجزائية وطلب الحقوق الشخصية والتدخل بكل دعوى، ومراجعة جميع المحاكم بجميع طرق المراجعة العادية والاستثنائية وطلب رد الحكام والشكوى منهم، وتسمية الشهود وردهم، واختيار محل إقامة وتوكيل من يشاء بكل ما وكلت به أو ببعضه وعزل من يوكل، وإجراء جميع ما يراه مناسباً وما تقتضيه مصلحتي شرعاً وقانوناً، وأجز له إرسال الانذارات والتوقيع عليها، وطلب الاستئناف والتمييز وإعادة المحاكمة، مع حق اعادة الاعتبار والاستحصال على سجل عدلي خالي من اي اشارة او دعوى من دائرة الاحوال الشخصية والنفوس وكافة الدوائر الرسمية والخاصة، والتوقيع ومتابعة وانجاز كافة المعاملات المتعلقة بما ذكر اعلاه لدى كافة المراجع الرسمية والخاصة، واجراء الايداعات وتوقيع وتوجيه العروض الفعلية والقبول بها ورفضها وردها واستردادها، وتقديم دعاوى اثباتها واسترجاعها وقبض قيمتها، مع حق الصلح والقبض نقداً أم شيكاً أم حوالة أم عروضاً فعلية، والصرف والإبراء والإقرار والإسقاط والرجوع عن الدعوى والحق وقبول الرجوع عنهما والتوقيع.

وبعد تلاوة هذا السند عليـه علناً ومصادقته على مضمونه أمضي مني ومنه وتسلم نسخة عنه بعد تسجيله وتصديقه وفقاً للأصول.

الموكل
${formData.partyA}`,

      // Update the sale_contract template in the generateArabicDocument function
sale_contract: `---
كاتب عدل
استوفي رسم الطابع المالي وسما
مبلغاً وقدره ${formData.price || '...'}
مديرية الشؤون العقارية
أمانة السجل العقاري في

                                    عــــــــــــــــدد
المكتب المعاون في                                           2025

عقد بيع ممسوح

رقم السجل اليومي ${formData.dailyRegistryNumber || '...'}
رقم محضر العقد: ${formData.contractProtocolNumber || '...'}

الرقم المالي لدى وزارة المالية
2141910

+----------------+--------+--------------+-------------+---------------+
| القسم         | العقار | المنطقة      | أصحاب الحق  | المنتفعون    | الحصة من أصل |
+----------------+--------+--------------+-------------+---------------+
|               |        |              |             |              | ${formData.propertyDetails?.share || '2400'} سهم |
+----------------+--------+--------------+-------------+---------------+

استوفى رسم نقابة المحامين نقداً مبلغاً وقدره //

محضر العقد

في الساعة     من يوم     الواقع في     من شهر     عام الفين وخمسة وعشرين.

في دائرتي وأمامنا نحن ${formData.notaryName || '...............'} الكاتب العدل في
${formData.notaryLocation || '.........'} - وبحضور:

حضر

الفريق الأول: الحائز على الأهلية القانونية والمدنية
${formData.partyA || '...........................'}

المقيم في: ${formData.partyAResidence || '...........................'} تلفون: ${formData.partyAPhone || '................'}

الفريق الثاني: عليها رسمه الحائز على الأهلية القانونية والمدنية  
${formData.partyB || '...........................'}

المقيم في: ${formData.partyBResidence || '...........................'} تلفون: ${formData.partyBPhone || '................'}

وبعد اطلاعهما على قيود السجل العقاري قررا بالاتفاق التام والرضى المتبادل أمام شهود التعريف المذكورين أعلاه، ما يأتي:

أولاً: إن الفريق الأول المذكور سابقاً بعد أن أبرز سند تمليك مرفق ربطاً فأثبت بموجبه ملكيته لكامل 
${formData.propertyDetails?.share || '2400'}/ألفان وأربعمائة سهم في العقار رقم ${formData.propertyDetails?.registryNumber || '.....'} من منطقة ${formData.propertyDetails?.zone || '......'} العقارية قضاء ${formData.propertyDetails?.district || '......'}

وهذا العقار هو من نوع ${formData.propertyDetails?.type || '// '} الواقع في منطقة ${formData.propertyDetails?.zone || '......'} العقارية قضاء ${formData.propertyDetails?.district || '......'}
محتوية على: راجع سند التمليك المرفق ربطاً

صرح بأنه باع من الفريق الثاني المذكور أعلاه، بيعاً باتاً قطعياً لكامل ${formData.propertyDetails?.share || '2400'} سهم الفين وأربعمائة سهم في العقار رقم ${formData.propertyDetails?.registryNumber || '.....'} من منطقة ${formData.propertyDetails?.zone || '......'} العقارية قضاء ${formData.propertyDetails?.district || '......'} مع كافة منافعه وحقوقه ومشتملاته

ثانياً: صرح الفريق الثاني المذكور آنفاً بقبوله شراء كامل ${formData.propertyDetails?.share || '2400'}/ألفان وأربعمائة سهم في العقار رقم ${formData.propertyDetails?.registryNumber || '.....'} الواقع في منطقة ${formData.propertyDetails?.zone || '......'} العقارية قضاء ${formData.propertyDetails?.district || '......'} مع كافة منافعه وحقوقه ومشتملاته كما هو مبين في متن هذا العقد من أصل ${formData.propertyDetails?.share || '2400'} سهم بجميع الحقوق المشار إليها

ثالثاً: صرح الفريقان المتعاقدان بأن هذه الصفقة قد تمت لقاء مبلغ وقدره ${formData.price || '.........'} ليرة لبنانية (${formData.priceInWords || '................'})
... أقر البائع بقبضه من الشاري حال عقده نقداً وعداً

شروط خصوصية:

صرح الفريقان أن الثمن المذكور أعلاه حقيقي مع علم وموافقة الفريق الثاني على كل ما هو مسجل على الصحيفة العينية للعقار المذكور لغاية تاريخه، يتحمل الطرفان المتعاقدان بالتكافل والتضامن كامل المسؤولية التي قد تترتب عن وصف العقارات والإنشاءات المقامة عليها كما هو وارد في متن العقد ولا سيما لجهة الملاحقة بكتمان بعض الثمن الناجم عن عدم صحة الوصف وكذلك تحمل المسؤولية بالنسبة للضرائب والرسوم المتوجبة. كما طلب المشتري تنفيذ هذا العقد مع علمه بعدم إبراز براءة ذمة مالية وبلدية آخذاً على عاتقه جميع الرسوم والضرائب المترتبة على هذا العقارات المتعاقد عليها. اتفق البائع والشاري الاستغناء عن إفادة التخطيط والارتفاق وتعهد كل منهما بتحمل كامل المسؤولية التي تنتج عن عدم ضم الإفادة المذكورة.

وقد صرح الفريق الثاني (المشتري) بأنه استلم سند التمليك فور التوقيع على العقد.

وقد طلب الفريقان المتعاقدان تسجيل هذا العقد في السجل العقاري بعد أن حرر عنه ثلاث نسخ وقعها المتعاقدان والشاهدان المعرفان بحضوري وبعد أن تلي علناً عليهما مضمون النسخ الثلاث وقد أُفهم الفريقان المتعاقدان بأن هذا العقد لا يكتسب الصيغة التنفيذية إلا بعد مصادقة أمين السجل العقاري عليه.

وقد أبرز المتعاقدان وصلاً من صندوق الخزينة في ${formData.location || '.....'} مؤرخاً في ..... رقم .....
مشعراً بدفعهما الرسوم المتوجبة على هذا العقد وقدرها ${formData.price || '.....'} ليرة لبنانية.

                                    المتعاقدان

الفريق الأول                                          الفريق الثاني
${formData.partyA || '......................'}                      ${formData.partyB || '......................'}


الشاهدان المعرفان                                 كاتب عدل ${formData.notaryName || '......................'}

الأول                                                    الثاني
-----------------------------                    -----------------------------


حضرة رئيس المكتب العقاري المعاون في ${formData.notaryLocation || '......'} المحترم

نودع حضرتكم هذا العقد بعد الاستماع إليه بناء للطلب وعملاً بأحكام القرار 188 والمرسوم الاشتراعي رقم 12، يرجى إجراء المقتضى.

                                                      صور في
                                              كاتب عدل ${formData.notaryName || '......................'}
`,
domestic_work: `عقــد عمـــل بالعاملات في الخدمة المنزلية

موقع فيما بين:

الفريق الأول: ${data.partyA} / من الجنسية: ${data.partyANationality || '...'}
المقيم في: ${data.partyAResidence || '...'}
هاتف: ${data.partyAPhone || '...'}

الفريق الثاني: العاملة في الخدمة المنزلية / ${data.partyB} / من الجنسية: ${data.workerDetails?.nationality || '...'} / مواليد عام ${data.workerDetails?.birthYear || '...'}
حسب جواز سفرها رقم: ${data.workerDetails?.passportNumber || '...'} / الصادر بتاريخ: ${data.workerDetails?.passportIssueDate || '...'} / الصالح لغاية تاريخ: ${data.workerDetails?.passportExpiryDate || '...'}

لما كان الفريق الأول يرغب باستخدام من تتمتع بالكفاءة والمهارة التامة والخبرة للعمل لديه في منزله بصفة عاملة في الخدمة المنزلية،  
ولما كان الفريق الثاني يتمتع بكافة الصفات الحسنة المذكورة أعلاه،  
ولما كان الفريقان قد توافقا على أن يجري تنفيذ هذا العقد وفقاً لقيم ومبادئ العائلة اللبنانية،  

لذلك وبناءً عليه، تم الاتفاق بين الفريقين بالرضا والقبول المتبادلين على ما يلي:  

أولاً – تعتبر مقدمة هذا العقد جزءاً لا يتجزأ منه.  
ثانياً – وافق الفريق الأول على أن يعمل الفريق الثاني لديه بصفة عاملة في الخدمة المنزلية في منزله وقبل الفريق الثاني بالصفة المذكورة وفقاً للشروط والأحكام الواردة في هذا العقد.  
ثالثاً – يتعهد الفريق الأول بعدم استخدام الفريق الثاني في أي عمل أو مكان آخر يختلف عن محل إقامة الفريق الأول.  
رابعاً – حُددت مدة هذا العقد بسنة واحدة من تاريخ تسجيله قابلة للتجديد.  
خامساً – يسري مفعول هذا العقد من تاريخ إبرامه لدى الكاتب العدل بما فيها فترة التجربة المحددة بثلاثة أشهر.  
سادساً – يتعهد الفريق الأول أن يدفع للفريق الثاني بنهاية كل شهر أجره الشهري البالغ /${data.salary || '...'}/ دولار أميركي، وبدون أي تأخير غير مبرر، ويكون الدفع نقداً للفريق الثاني نفسه بموجب إيصال خطي موقع من الطرفين أو تحويل مصرفي مع إيصال موقع.  
سابعاً – يتعهد الفريق الثاني بتأدية عمله بكل أمانة وجدية وإخلاص والتقيد بتوجيهات الفريق الأول بما يراعي أصول العمل وأعرافه وأخلاقياته وخصوصيات المنزل.  
ثامناً – يتعهد الفريق الأول بتأمين ظروف العمل اللائقة وتوفير المأكل والملبس والإقامة التي تحترم كرامة الفريق الثاني وحقه في الخصوصية.  
تاسعاً – يتعهد الفريق الأول بضمان استشفاء الفريق الثاني بموجب بوليصة تأمين لدى شركة ضمان معترف بها وفق الشروط والحالات المحددة من قبل وزارة العمل.  
عاشراً – يتعهد الفريق الأول بالاستحصال على إجازة عمل وبطاقة إقامة للفريق الثاني على نفقته وتجديدها ما دام الفريق الثاني يعمل لديه.  
حادي عشر – يحدد الفريق الأول ساعات العمل بمعدل ${data.workHours || '10'} ساعات يومياً وتأمين فترة راحة لا تقل عن 8 ساعات متواصلة ليلاً.  
ثاني عشر – يمنح الفريق الأول للفريق الثاني يوم راحة أسبوعي لا يقل عن 24 ساعة متواصلة، وإجازة سنوية لمدة ${data.vacationDays || '6'} أيام تحدد شروطها باتفاق الطرفين.  
ثالث عشر – يؤمن الفريق الأول تذكرة استقدام وعودة للفريق الثاني إلى بلده على نفقته إلا في الحالات المتفق عليها في البند السادس عشر.  
رابع عشر – يسمح الفريق الأول للفريق الثاني بالاتصال بأهله مرة كل شهر على نفقته، وما عدا ذلك يتحمله الفريق الثاني.  
خامس عشر – إذا أصيب الفريق الثاني بمرض غير ناتج عن الخدمة أو حوادث العمل، يحق له إجازة مرضية نصف شهر بأجر ونصف شهر بنصف أجر بناءً على تقرير طبي.  
سادس عشر – يحق للفريق الأول فسخ هذا العقد إذا:  
1- ارتكب الفريق الثاني خطأً جسيماً أو إهمالاً أضر بمصالح الفريق الأول أو أحد أفراد عائلته.  
2- ارتكب الفريق الثاني فعلاً معاقباً عليه قانوناً بموجب حكم قضائي.  
وفي هذه الحالات يغادر الفريق الثاني لبنان ويتحمل ثمن تذكرة العودة.  
سابع عشر – يحق للفريق الثاني فسخ العقد إذا:  
1- أخل الفريق الأول بدفع الأجور لمدة ثلاثة أشهر متتالية.  
2- تعرض للضرب أو الإيذاء أو التحرش الجنسي وثبت ذلك بتقارير رسمية.  
3- كلفه الفريق الأول بعمل غير المتفق عليه دون موافقته.  
وفي هذه الحالات يتعين على الفريق الأول إعادة الفريق الثاني إلى بلاده ودفع تذكرة العودة.  
ثامن عشر – في حال النزاع، يعرض على وزارة العمل للتسوية ودياً.  
تاسع عشر – عند فشل التسوية، يحق للطرف المتضرر مراجعة المحاكم اللبنانية المختصة.  
عشرون – نظم هذا العقد أمام الكاتب العدل باللغة العربية ووقع من الطرفين.  

الفريق الأول: ${data.partyA}  
الفريق الثاني: ${data.partyB}  

عــــــــــــــدد  
${data.contractYear || '2025'}  

نظر مني للمصادقة على صحة توقيع السيدة / ${data.partyA} / والعاملة ${data.partyB} / من الجنسية ${data.workerDetails?.nationality || '...'} / مواليد عام ${data.workerDetails?.birthYear || '...'} / حسب جواز سفرها رقم ${data.workerDetails?.passportNumber || '...'} / الصادر بتاريخ ${data.workerDetails?.passportIssueDate || '...'} / الصالح لغاية تاريخ ${data.workerDetails?.passportExpiryDate || '...'}، وذلك في يوم ${data.contractDayName || '...'} الواقع في ${data.contractDay || '...'} من شهر ${data.contractMonth || '...'} عام ${data.contractYear || '...'}.

كاتب عدل ${data.notaryLocation || '...'} – ${data.notaryName || '...'}`,


car_sale_proxy: `وكالة بيع سـيارة غير قابلة للعزل
تخضع للمادة 164 من قانون السير الجديد
ولا سيما لغرامة مليون ليرة لبنانية عن كل أسبوع تأخير في التسجيل بعد شهرين من تاريخه

أنا الموقع أدناه ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}
هاتف: ${data.partyAPhone || '...'}

قد وكلت السيد/ة ${data.partyB}
${data.agentNames?.length > 1 ? `و/ ${data.agentNames.slice(1).join(' و/ ')}` : ''}
متحدين أو منفردين.

لينوبا عني وباسمي ببيع وفراغ وتسجيل كامل السيارة:

ماركة: ${data.vehicleDetails?.make || '...'}
موديل: ${data.vehicleDetails?.model || '...'}
سنة الصنع: ${data.vehicleDetails?.year || '...'}
رقم التسجيل: ${data.vehicleDetails?.plateNumber || '...'}
رقم المحرك: ${data.vehicleDetails?.engineNumber || '...'}
رقم الشاسيه: ${data.vehicleDetails?.chassisNumber || '...'}

لمن يريدان ويشاءان وحتى لأقرب المقربين ولأحدهما من الآخر، وذلك بالبدل الذي يريانه مناسباً وقبضه والفراغ على إسم المشتري، مع حق إقامة الدعوى لطلب توقيف هذه السيارة والرجوع عن هذه الدعوى وإسقاطها ورفع الحجز، والإستحصال على رخصة سير بدل عن ضائع، ولهما حق بيع الأنقاض واللوحات على حدة أو مجتمعين، والإعتراف بقبض الثمن واستلام السيارة وقيادتها والتنقل بها داخل وخارج الأراضي اللبنانية، مع حق الاستحصال على دفاتر المرور من مخافر الحدود، وتأمين السيارة، والرهن وفكه، والإقرار والتوقيع والتوكيل، وتمثيلي في أي قضية تتعلق بالسيارة، والصلح، والإسقاط، والإبراء، والتنازل، والمرافعة والمدافعة، ودفع جمرك السيارة وتخليصها واستلامها من الجمرك، وتوقيع جميع المستندات والمعاملات والعقود اللازمة لما تقدم.

هذه الوكالة غير قابلة للعزل لتعلق حق الغير بها، محملاً الوكيل كامل المسؤولية المدنية والجزائية عن كافة الحوادث والمخالفات والأضرار الناتجة عن السيارة تجاه أي كان، وعن الحجوزات ومحاضر الضبط اللاحقة بها، وذلك ابتداءً من تاريخ هذا التوكيل على أساس أن الوكيل أصبح من تاريخه الحارس الوحيد للسيارة المذكورة.

عــــــــــــــدد
${data.contractYear || '2025'}

نظر مني للمصادقة على صحة توقيع السيد/ ${data.partyA} عليها رسمه الشمسي الحائز على الأهلية القانونية والموقع أمامي أنا ${data.notaryName || '...'} الكاتب العدل في ${data.notaryLocation || '...'}، بعد تلاوة هذا السند عليه علناً وموافقته على مضمونه بمحض إرادته، وذلك في يوم ${data.contractDay || '...'} الواقع في ${data.contractDayName || '...'} من شهر ${data.contractMonth || '...'} عام ألفين وخمسة وعشرين.`,


liability_release: `اقرار رفع مسؤولية

حضرة السيد/ة ${data.partyB}
المقيم في: ${data.partyBResidence || '...'}

أنا الموقع أدناه/ ${data.partyA}
المقيم في: ${data.partyAResidence || '...'}

أصرح بما يلي:

قد استلمت منكم كامل السيارة ماركة: ${data.vehicleDetails?.make || '-------'}
صنع: ${data.vehicleDetails?.model || '---'} 
ذات رقم التسجيل: ${data.vehicleDetails?.plateNumber || '----'}
رقم المحرك: ${data.vehicleDetails?.engineNumber || '----'}
رقم الشاسي: ${data.vehicleDetails?.chassisNumber || '-----'}

وذلك بموجب وكالة لدى هذه الدائرة بتاريخ اليوم غير قابلة للعزل وأصبحت الحارس الوحيد لها حقوقياً وجزائياً والمسؤول الوحيد عن المخالفات والحوادث والأعطال والأضرار التي تصيب السيارة أو سيارات أو آليات أو ممتلكات الغير مهما كانت أو التي تصيب السائق أو الركاب أو الغير أياً كانوا.

كما أتعهد بدفع كافة الرسوم المتوجبة على السيارة لمصلحة كافة المراجع الرسمية المختصة، وبتسليم لوحات السيارة إلى مصلحة تسجيل الآليات والسيارات عندما أريد إتلافها أو سحبها من السير، وتعتبر كل الدعاوى من أي نوع كانت بخصوص السيارة المذكورة ابتداءً من تاريخ الوكالة أعلاه ساقطة عنكم منذ الآن، وأحل محلكم حلولاً كاملاً في تحمل كافة المسؤوليات الحقوقية والجزائية الناجمة عن تلك الدعاوى.

وقد طلبت منكم تنظيم الوكالة باسمي واسم ${data.agentNames?.join(' / ') || '-------'} على كامل مسؤوليتي، وأنني أصرح على كامل مسؤوليتي المدنية والجزائية بأنني أقيم لأكثر من ${data.residencyDays || '/165/'} يوم في السنة في العنوان المذكور أعلاه وأن هذا العنوان هو عنواني البريدي القانوني.

عــــــــــــــدد
${data.contractYear || '2025'}

نظر مني للمصادقة على صحة توقيع السيد/ ${data.partyA} عليها رسمه الشمسي الحائز على الأهلية القانونية والموقع أمامي أنا ${data.notaryName || '...'} الكاتب العدل في ${data.notaryLocation || '...'}، بعد تلاوة هذا السند عليه علناً وموافقته على مضمونه بمحض إرادته، وذلك في يوم ${data.contractDay || '...'} الواقع في ${data.contractDayName || '...'} من شهر ${data.contractMonth || '...'} عام ألفين وخمسة وعشرين.`,

 security_pledge: `تعهد للامن العام - موافقة مسبقة

جانب المديرية العامة للأمن العام

بتاريخه ${data.date || formattedDate} أنا الموقع أدناه: ${data.partyA}
اسم الأب: ${data.partyAFatherName || '---'} 
الشهرة: ${data.partyALastName || '---'}
من الجنسية: ${data.partyANationality || '---'}
المقيم في البلدة: ${data.partyAResidence || '---'}
قضاء: ${data.partyADistrict || '---'}
الشارع: ${data.partyAStreet || '---'}
البناية: ${data.partyABuilding || '---'}
ط/${data.partyAFloor || '---'} 
هاتف: ${data.partyAPhone || '---'}

أصرح أمامكم باستخدامي / العاملة في الخدمة المنزلية / ${data.workerName || data.partyB || '---'} 
من الجنسية: ${data.workerDetails?.nationality || '---'} 
مواليد عام ${data.workerDetails?.birthYear || '---'} 
حاملة جواز سفر رقم ${data.workerDetails?.passportNumber || '---'} 
الصادر بتاريخ ${data.workerDetails?.passportIssueDate || '---'} 
والصالح لغاية ${data.workerDetails?.passportExpiryDate || '---'}

وذلك استنادا للموافقة المسبقة الصادرة عن وزارة العمل تحت رقم ${data.approvalNumber || '---'} 
بتاريخ ${data.approvalDate || '---'} والمرفقة ربطا.

وأتعهد بتأمين تذكرة سفر لإعادة العاملة في الخدمة المنزلية المذكور اسمها أعلاه إلى بلدها على نفقتي الخاصة وذلك عند انتهاء أو فسخ عقد العمل وعند طلب الجهات المختصة، وفي كل حال أقر واعترف أن قيمة بطاقة السفر جوا هي أمانة في ذمتي أدفعها عند الاقتضاء إما للعاملة في الخدمة المنزلية مباشرة أو للدوائر الرسمية المختصة فور طلبها، كما أتعهد باستحصال العاملة في الخدمة المنزلية المذكورة على إجازة عمل لدي من قبل وزارة العمل وعلى جواز إقامة في لبنان صادر عن الأمن العام اللبناني وذلك ضمن المهلة المحددة من قبل الأمن العام اللبناني وبتأمين جميع المستندات وبالقيام بكافة الإجراءات اللازمة قانوناً للحصول على إجازة عمل وجواز إقامة بما في ذلك بوليصة التأمين والفحوصات الطبية وعقد العمل وأن أستخدمها وفقاً لنوع العمل المحدد في طلب الموافقة المسبقة كل ذلك وفقاً لما نصّت عليه الأنظمة والقوانين المرعية الإجراء تعهداً أعطي مني وأنا بكامل الأوصاف المعتبرة شرعاً وقانوناً وإثباتا مني للحقيقة والواقع وقعت على هذا التعهد.
      
الاسم الكامل: ${data.partyA}
التوقيع: __________________

عــــــــــــــــــدد
${data.contractYear || new Date().getFullYear()}

نظر مني للمصادقة على صحة توقيع السيد/ ${data.partyA} عليها رسمه الشمسي الحائز على الأهلية القانونية 
والموقع أمامي أنا ${data.notaryName || '---'} الكاتب العدل في ${data.notaryLocation || '---'} 
بعد تلاوة هذا السند عليه علناً وموافقته على مضمونه بمحض إرادته وذلك في يوم ${data.contractDayName || '---'} 
الواقع في ${data.contractDay || '---'} من شهر ${data.contractMonth || '---'} 
عام ${data.contractYear || new Date().getFullYear()}.
`


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
    
    // if (!formData.partyA || !formData.partyB) {
    //   isValid = false;
    //   errorMessage = language === 'ar' ? 'يجب إدخال أسماء الأطراف' : 'Party names are required';
    // } else if (selectedType === 'sale_contract' && (!formData.propertyDetails?.share || !formData.price)) {
    //   isValid = false;
    //   errorMessage = language === 'ar' ? 'يجب تحديد حصة العقار والسعر' : 'Property share and price are required';
    // } else if (selectedType === 'domestic_work' && !formData.salary) {
    //   isValid = false;
    //   errorMessage = language === 'ar' ? 'يجب تحديد الراتب' : 'Salary is required';
    // } else if (selectedType === 'car_sale_proxy' && !formData.vehicleDetails?.plateNumber) {
    //   isValid = false;
    //   errorMessage = language === 'ar' ? 'يجب إدخال رقم لوحة السيارة' : 'Vehicle plate number is required';
    // }

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


async function handleDownload() {
 "use strict";
  try {
    // If you have access to PDFKit or similar libraries that handle Arabic better
    // This is a placeholder for a more robust solution
    
    // For now, create a simple HTML version that can be printed to PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Amiri', 'Traditional Arabic', 'Arial Unicode MS', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            text-align: right;
            direction: rtl;
            padding: 20mm;
            background: white;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        </style>
      </head>
      <body>
        <pre style="white-space: pre-wrap; font-family: inherit;">${generatedDocument.replace(/þ/g, '').normalize('NFC')}</pre>
      </body>
      </html>
    `;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
    
  } catch (error) {
    console.error('Alternative PDF generation error:', error);
  }
}

  const renderDocumentSpecificFields = () => {
    switch (selectedType) {
case 'judicial_power':
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partyA">
            {language === 'ar' ? 'اسم الموكل' : 'Principal Name'}
          </Label>
          <Input
            id="partyA"
            value={formData.partyA}
            onChange={(e) => setFormData({...formData, partyA: e.target.value})}
            placeholder={language === 'ar' ? 'اسم الموكل الكامل' : 'Full name of principal'}
          />
        </div>
        <div>
          <Label htmlFor="partyB">
            {language === 'ar' ? 'اسم المحامي' : 'Attorney Name'}
          </Label>
          <Input
            id="partyB"
            value={formData.partyB}
            onChange={(e) => setFormData({...formData, partyB: e.target.value})}
            placeholder={language === 'ar' ? 'اسم المحامي الكامل' : 'Full name of attorney'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partyAResidence">
            {language === 'ar' ? 'عنوان الموكل' : 'Principal Address'}
          </Label>
          <Input
            id="partyAResidence"
            value={formData.partyAResidence || ''}
            onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
            placeholder={language === 'ar' ? 'العنوان التفصيلي' : 'Full address'}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notaryName">
          {language === 'ar' ? 'اسم الكاتب العدل' : 'Notary Public Name'}
        </Label>
        <Input
          id="notaryName"
          value={formData.notaryName || ''}
          onChange={(e) => setFormData({...formData, notaryName: e.target.value})}
          placeholder={language === 'ar' ? 'اسم الكاتب العدل' : 'Notary public name'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">
            {language === 'ar' ? 'مكان التوثيق' : 'Notarization Location'}
          </Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder={language === 'ar' ? 'المدينة والمنطقة' : 'City and area'}
          />
        </div>
        <div>
          <Label htmlFor="date">
            {language === 'ar' ? 'تاريخ التوثيق' : 'Notarization Date'}
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
      
      case 'sale_contract':
        return (
              <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partyA">
            {language === 'ar' ? 'اسم البائع (الفريق الأول)' : 'Seller Name (First Party)'}
          </Label>
          <Input
            id="partyA"
            value={formData.partyA}
            onChange={(e) => setFormData({...formData, partyA: e.target.value})}
            placeholder={language === 'ar' ? 'اسم البائع الكامل' : 'Full seller name'}
          />
        </div>
        <div>
          <Label htmlFor="partyB">
            {language === 'ar' ? 'اسم المشتري (الفريق الثاني)' : 'Buyer Name (Second Party)'}
          </Label>
          <Input
            id="partyB"
            value={formData.partyB}
            onChange={(e) => setFormData({...formData, partyB: e.target.value})}
            placeholder={language === 'ar' ? 'اسم المشتري الكامل' : 'Full buyer name'}
          />
        </div>
      </div>
      {/* Notary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="notaryLocation">
            {language === 'ar' ? 'موقع الكاتب العدل' : 'Notary Location'}
          </Label>
          <Input
            id="notaryLocation"
            value={formData.notaryLocation || ''}
            onChange={(e) => setFormData({...formData, notaryLocation: e.target.value})}
            placeholder={language === 'ar' ? 'موقع الكاتب العدل' : 'Notary office location'}
          />
        </div>
      </div>

      {/* Administrative Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="financialNumber">
            {language === 'ar' ? 'الرقم المالي' : 'Financial Number'}
          </Label>
          <Input
            id="financialNumber"
            value={formData.financialNumber || '2141910'}
            onChange={(e) => setFormData({...formData, financialNumber: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="dailyRegistryNumber">
            {language === 'ar' ? 'رقم السجل اليومي' : 'Daily Registry Number'}
          </Label>
          <Input
            id="dailyRegistryNumber"
            value={formData.dailyRegistryNumber || ''}
            onChange={(e) => setFormData({...formData, dailyRegistryNumber: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="contractProtocolNumber">
            {language === 'ar' ? 'رقم محضر العقد' : 'Contract Protocol Number'}
          </Label>
          <Input
            id="contractProtocolNumber"
            value={formData.contractProtocolNumber || ''}
            onChange={(e) => setFormData({...formData, contractProtocolNumber: e.target.value})}
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="propertyDistrict">
            {language === 'ar' ? 'قضاء العقار' : 'Property District'}
          </Label>
          <Input
            id="propertyDistrict"
            value={formData.propertyDetails?.district || ''}
            onChange={(e) => setFormData({
              ...formData,
              propertyDetails: {
                ...formData.propertyDetails,
                district: e.target.value
              }
            })}
            placeholder={language === 'ar' ? 'القضاء' : 'District'}
          />
        </div>
        <div>
          <Label htmlFor="propertyZone">
            {language === 'ar' ? 'منطقة العقار' : 'Property Zone'}
          </Label>
          <Input
            id="propertyZone"
            value={formData.propertyDetails?.zone || ''}
            onChange={(e) => setFormData({
              ...formData,
              propertyDetails: {
                ...formData.propertyDetails,
                zone: e.target.value
              }
            })}
            placeholder={language === 'ar' ? 'المنطقة العقارية' : 'Property zone'}
          />
        </div>
      </div>
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
          <Label htmlFor="witness1">
            {language === 'ar' ? 'الشاهد الأول' : 'First Witness'}
          </Label>
          <Input
            id="witness1"
            value={formData.witness1 || ''}
            onChange={(e) => setFormData({...formData, witness1: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="witness2">
            {language === 'ar' ? 'الشاهد الثاني' : 'Second Witness'}
          </Label>
          <Input
            id="witness2"
            value={formData.witness2 || ''}
            onChange={(e) => setFormData({...formData, witness2: e.target.value})}
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
      {/* Employer details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>اسم صاحب العمل</Label>
          <Input value={formData.partyA || ''} onChange={e => setFormData({...formData, partyA: e.target.value})} />
        </div>
        <div>
          <Label>جنسية صاحب العمل</Label>
          <Input value={formData.partyANationality || ''} onChange={e => setFormData({...formData, partyANationality: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>عنوان صاحب العمل</Label>
          <Input value={formData.partyAResidence || ''} onChange={e => setFormData({...formData, partyAResidence: e.target.value})} />
        </div>
        <div>
          <Label>هاتف صاحب العمل</Label>
          <Input value={formData.partyAPhone || ''} onChange={e => setFormData({...formData, partyAPhone: e.target.value})} />
        </div>
      </div>

      {/* Worker details */}
      <div>
        <Label>اسم العاملة</Label>
        <Input value={formData.partyB || ''} onChange={e => setFormData({...formData, partyB: e.target.value})} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>جنسية العاملة</Label>
          <Input value={formData.workerDetails?.nationality || ''} onChange={e => setFormData({...formData, workerDetails: {...formData.workerDetails, nationality: e.target.value}})} />
        </div>
        <div>
          <Label>سنة الميلاد</Label>
          <Input value={formData.workerDetails?.birthYear || ''} onChange={e => setFormData({...formData, workerDetails: {...formData.workerDetails, birthYear: e.target.value}})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>رقم جواز السفر</Label>
          <Input value={formData.workerDetails?.passportNumber || ''} onChange={e => setFormData({...formData, workerDetails: {...formData.workerDetails, passportNumber: e.target.value}})} />
        </div>
        <div>
          <Label>تاريخ إصدار الجواز</Label>
          <Input value={formData.workerDetails?.passportIssueDate || ''} onChange={e => setFormData({...formData, workerDetails: {...formData.workerDetails, passportIssueDate: e.target.value}})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>تاريخ انتهاء الجواز</Label>
          <Input value={formData.workerDetails?.passportExpiryDate || ''} onChange={e => setFormData({...formData, workerDetails: {...formData.workerDetails, passportExpiryDate: e.target.value}})} />
        </div>
        <div>
          <Label>الراتب الشهري بالدولار</Label>
          <Input value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>ساعات العمل اليومية</Label>
          <Input value={formData.workHours || ''} onChange={e => setFormData({...formData, workHours: e.target.value})} />
        </div>
        <div>
          <Label>أيام الإجازة السنوية</Label>
          <Input value={formData.vacationDays || ''} onChange={e => setFormData({...formData, vacationDays: e.target.value})} />
        </div>
      </div>

      {/* Notary details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>اسم كاتب العدل</Label>
          <Input value={formData.notaryName || ''} onChange={e => setFormData({...formData, notaryName: e.target.value})} />
        </div>
        <div>
          <Label>مكان كاتب العدل</Label>
          <Input value={formData.notaryLocation || ''} onChange={e => setFormData({...formData, notaryLocation: e.target.value})} />
        </div>
      </div>

      {/* Contract date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>اليوم</Label>
          <Input value={formData.contractDay || ''} onChange={e => setFormData({...formData, contractDay: e.target.value})} />
        </div>
        <div>
          <Label>اسم اليوم</Label>
          <Input value={formData.contractDayName || ''} onChange={e => setFormData({...formData, contractDayName: e.target.value})} />
        </div>
        <div>
          <Label>الشهر</Label>
          <Input value={formData.contractMonth || ''} onChange={e => setFormData({...formData, contractMonth: e.target.value})} />
        </div>
      </div>
      <div>
        <Label>السنة</Label>
        <Input value={formData.contractYear || ''} onChange={e => setFormData({...formData, contractYear: e.target.value})} />
      </div>
    </div>
  );

      
 case 'car_sale_proxy':
  return (
    <div className="space-y-4">
      {/* Owner details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>اسم المالك</Label>
          <Input value={formData.partyA || ''} onChange={e => setFormData({...formData, partyA: e.target.value})} />
        </div>
        <div>
          <Label>عنوان المالك</Label>
          <Input value={formData.partyAResidence || ''} onChange={e => setFormData({...formData, partyAResidence: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>هاتف المالك</Label>
          <Input value={formData.partyAPhone || ''} onChange={e => setFormData({...formData, partyAPhone: e.target.value})} />
        </div>
        <div>
          <Label>اسم الوكيل</Label>
          <Input value={formData.partyB || ''} onChange={e => setFormData({...formData, partyB: e.target.value})} />
        </div>
      </div>

      {/* Additional agents */}
      <div>
        <Label>أسماء وكلاء إضافيين</Label>
        <Input value={formData.agentNames?.join(', ') || ''} onChange={e => setFormData({...formData, agentNames: e.target.value.split(',').map(v => v.trim())})} placeholder="افصل بين الأسماء بفاصلة" />
      </div>

      {/* Vehicle details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>ماركة السيارة</Label>
          <Input value={formData.vehicleDetails?.make || ''} onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, make: e.target.value}})} />
        </div>
        <div>
          <Label>موديل السيارة</Label>
          <Input value={formData.vehicleDetails?.model || ''} onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, model: e.target.value}})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>سنة الصنع</Label>
          <Input value={formData.vehicleDetails?.year || ''} onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, year: e.target.value}})} />
        </div>
        <div>
          <Label>رقم اللوحة</Label>
          <Input value={formData.vehicleDetails?.plateNumber || ''} onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, plateNumber: e.target.value}})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>رقم المحرك</Label>
          <Input value={formData.vehicleDetails?.engineNumber || ''} onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, engineNumber: e.target.value}})} />
        </div>
        <div>
          <Label>رقم الشاسيه</Label>
          <Input value={formData.vehicleDetails?.chassisNumber || ''} onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, chassisNumber: e.target.value}})} />
        </div>
      </div>

      {/* Notary & date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>اسم كاتب العدل</Label>
          <Input value={formData.notaryName || ''} onChange={e => setFormData({...formData, notaryName: e.target.value})} />
        </div>
        <div>
          <Label>مكان كاتب العدل</Label>
          <Input value={formData.notaryLocation || ''} onChange={e => setFormData({...formData, notaryLocation: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>اليوم</Label>
          <Input value={formData.contractDay || ''} onChange={e => setFormData({...formData, contractDay: e.target.value})} />
        </div>
        <div>
          <Label>اسم اليوم</Label>
          <Input value={formData.contractDayName || ''} onChange={e => setFormData({...formData, contractDayName: e.target.value})} />
        </div>
        <div>
          <Label>الشهر</Label>
          <Input value={formData.contractMonth || ''} onChange={e => setFormData({...formData, contractMonth: e.target.value})} />
        </div>
        <div>
          <Label>السنة</Label>
          <Input value={formData.contractYear || ''} onChange={e => setFormData({...formData, contractYear: e.target.value})} />
        </div>
      </div>
    </div>
  );

      
case 'liability_release':
  return (
    <div className="space-y-4">
      {/* Party Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partyAResidence">{language === 'ar' ? 'عنوان المقر' : 'Declarant Address'}</Label>
          <Input
            id="partyAResidence"
            value={formData.partyAResidence || ''}
            onChange={(e) => setFormData({ ...formData, partyAResidence: e.target.value })}
            placeholder={language === 'ar' ? 'عنوان المقر' : 'Declarant address'}
          />
        </div>
        <div>
          <Label htmlFor="partyBResidence">{language === 'ar' ? 'عنوان المفرج له' : 'Releasee Address'}</Label>
          <Input
            id="partyBResidence"
            value={formData.partyBResidence || ''}
            onChange={(e) => setFormData({ ...formData, partyBResidence: e.target.value })}
            placeholder={language === 'ar' ? 'عنوان المفرج له' : 'Releasee address'}
          />
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vehicleMake">{language === 'ar' ? 'ماركة السيارة' : 'Car Make'}</Label>
          <Input
            id="vehicleMake"
            value={formData.vehicleDetails?.make || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleDetails: { ...formData.vehicleDetails, make: e.target.value },
              })
            }
            placeholder={language === 'ar' ? 'ماركة السيارة' : 'Car make'}
          />
        </div>
        <div>
          <Label htmlFor="vehicleModel">{language === 'ar' ? 'طراز السيارة' : 'Car Model'}</Label>
          <Input
            id="vehicleModel"
            value={formData.vehicleDetails?.model || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleDetails: { ...formData.vehicleDetails, model: e.target.value },
              })
            }
            placeholder={language === 'ar' ? 'طراز السيارة' : 'Car model'}
          />
        </div>
        <div>
          <Label htmlFor="vehiclePlate">{language === 'ar' ? 'رقم التسجيل' : 'Registration Number'}</Label>
          <Input
            id="vehiclePlate"
            value={formData.vehicleDetails?.plateNumber || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleDetails: { ...formData.vehicleDetails, plateNumber: e.target.value },
              })
            }
            placeholder={language === 'ar' ? 'رقم التسجيل' : 'Registration number'}
          />
        </div>
      </div>

      {/* Engine & Chassis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="engineNumber">{language === 'ar' ? 'رقم المحرك' : 'Engine Number'}</Label>
          <Input
            id="engineNumber"
            value={formData.vehicleDetails?.engineNumber || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleDetails: { ...formData.vehicleDetails, engineNumber: e.target.value },
              })
            }
            placeholder={language === 'ar' ? 'رقم المحرك' : 'Engine number'}
          />
        </div>
        <div>
          <Label htmlFor="chassisNumber">{language === 'ar' ? 'رقم الشاسي' : 'Chassis Number'}</Label>
          <Input
            id="chassisNumber"
            value={formData.vehicleDetails?.chassisNumber || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleDetails: { ...formData.vehicleDetails, chassisNumber: e.target.value },
              })
            }
            placeholder={language === 'ar' ? 'رقم الشاسي' : 'Chassis number'}
          />
        </div>
      </div>

      {/* Co-Owner */}
      <div>
        <Label htmlFor="agentNames">{language === 'ar' ? 'اسم المالك المشترك (إن وجد)' : 'Co-owner Name (if any)'}</Label>
        <Input
          id="agentNames"
          value={formData.agentNames?.join(', ') || ''}
          onChange={(e) => setFormData({ ...formData, agentNames: e.target.value.split(',').map((s) => s.trim()) })}
          placeholder={language === 'ar' ? 'اسم المالك المشترك' : 'Co-owner name'}
        />
      </div>

      {/* Residency Days */}
      <div>
        <Label htmlFor="residencyDays">{language === 'ar' ? 'عدد أيام الإقامة السنوية' : 'Annual Residency Days'}</Label>
        <Input
          id="residencyDays"
          value={formData.residencyDays || ''}
          onChange={(e) => setFormData({ ...formData, residencyDays: e.target.value })}
          placeholder={language === 'ar' ? 'عدد الأيام' : 'Number of days'}
        />
      </div>

      {/* Notary Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notaryName">{language === 'ar' ? 'اسم الكاتب العدل' : 'Notary Name'}</Label>
          <Input
            id="notaryName"
            value={formData.notaryName || ''}
            onChange={(e) => setFormData({ ...formData, notaryName: e.target.value })}
            placeholder={language === 'ar' ? 'اسم الكاتب العدل' : 'Notary name'}
          />
        </div>
        <div>
          <Label htmlFor="notaryLocation">{language === 'ar' ? 'موقع الكاتب العدل' : 'Notary Location'}</Label>
          <Input
            id="notaryLocation"
            value={formData.notaryLocation || ''}
            onChange={(e) => setFormData({ ...formData, notaryLocation: e.target.value })}
            placeholder={language === 'ar' ? 'موقع الكاتب العدل' : 'Notary location'}
          />
        </div>
      </div>
    </div>
  );

      
case 'security_pledge':
  return (
    <div className="space-y-4">

      {/* Full Name */}
      <div>
        <Label htmlFor="partyA">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
        <Input
          id="partyA"
          value={formData.partyA || ''}
          onChange={(e) => setFormData({...formData, partyA: e.target.value})}
        />
      </div>

      {/* Name Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="partyAFatherName">{language === 'ar' ? 'اسم الأب' : 'Father Name'}</Label>
          <Input
            id="partyAFatherName"
            value={formData.partyAFatherName || ''}
            onChange={(e) => setFormData({...formData, partyAFatherName: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="partyALastName">{language === 'ar' ? 'الشهرة' : 'Last Name'}</Label>
          <Input
            id="partyALastName"
            value={formData.partyALastName || ''}
            onChange={(e) => setFormData({...formData, partyALastName: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="partyANationality">{language === 'ar' ? 'الجنسية' : 'Nationality'}</Label>
          <Input
            id="partyANationality"
            value={formData.partyANationality || ''}
            onChange={(e) => setFormData({...formData, partyANationality: e.target.value})}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partyAResidence">{language === 'ar' ? 'عنوان البلدة' : 'Town'}</Label>
          <Input
            id="partyAResidence"
            value={formData.partyAResidence || ''}
            onChange={(e) => setFormData({...formData, partyAResidence: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="partyAPhone">{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
          <Input
            id="partyAPhone"
            value={formData.partyAPhone || ''}
            onChange={(e) => setFormData({...formData, partyAPhone: e.target.value})}
          />
        </div>
      </div>

      {/* Address Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="partyADistrict">{language === 'ar' ? 'القضاء' : 'District'}</Label>
          <Input
            id="partyADistrict"
            value={formData.partyADistrict || ''}
            onChange={(e) => setFormData({...formData, partyADistrict: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="partyAStreet">{language === 'ar' ? 'الشارع' : 'Street'}</Label>
          <Input
            id="partyAStreet"
            value={formData.partyAStreet || ''}
            onChange={(e) => setFormData({...formData, partyAStreet: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="partyABuilding">{language === 'ar' ? 'البناية' : 'Building'}</Label>
          <Input
            id="partyABuilding"
            value={formData.partyABuilding || ''}
            onChange={(e) => setFormData({...formData, partyABuilding: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="partyAFloor">{language === 'ar' ? 'الطابق' : 'Floor'}</Label>
          <Input
            id="partyAFloor"
            value={formData.partyAFloor || ''}
            onChange={(e) => setFormData({...formData, partyAFloor: e.target.value})}
          />
        </div>
      </div>

      {/* Worker Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workerName">{language === 'ar' ? 'اسم العاملة' : 'Worker Name'}</Label>
          <Input
            id="workerName"
            value={formData.workerName || formData.partyB || ''}
            onChange={(e) => setFormData({...formData, workerName: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="workerNationality">{language === 'ar' ? 'جنسية العاملة' : 'Worker Nationality'}</Label>
          <Input
            id="workerNationality"
            value={formData.workerDetails?.nationality || ''}
            onChange={(e) =>
              setFormData({...formData, workerDetails: {...formData.workerDetails, nationality: e.target.value}})
            }
          />
        </div>
      </div>

      {/* Passport Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="birthYear">{language === 'ar' ? 'سنة الميلاد' : 'Birth Year'}</Label>
          <Input
            id="birthYear"
            value={formData.workerDetails?.birthYear || ''}
            onChange={(e) =>
              setFormData({...formData, workerDetails: {...formData.workerDetails, birthYear: e.target.value}})
            }
          />
        </div>
        <div>
          <Label htmlFor="passportNumber">{language === 'ar' ? 'رقم جواز السفر' : 'Passport Number'}</Label>
          <Input
            id="passportNumber"
            value={formData.workerDetails?.passportNumber || ''}
            onChange={(e) =>
              setFormData({...formData, workerDetails: {...formData.workerDetails, passportNumber: e.target.value}})
            }
          />
        </div>
        <div>
          <Label htmlFor="passportIssueDate">{language === 'ar' ? 'تاريخ إصدار الجواز' : 'Passport Issue Date'}</Label>
          <Input
            id="passportIssueDate"
            value={formData.workerDetails?.passportIssueDate || ''}
            onChange={(e) =>
              setFormData({...formData, workerDetails: {...formData.workerDetails, passportIssueDate: e.target.value}})
            }
          />
        </div>
      </div>

      {/* Passport Expiry & Approval */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="passportExpiryDate">{language === 'ar' ? 'تاريخ انتهاء الجواز' : 'Passport Expiry Date'}</Label>
          <Input
            id="passportExpiryDate"
            value={formData.workerDetails?.passportExpiryDate || ''}
            onChange={(e) =>
              setFormData({...formData, workerDetails: {...formData.workerDetails, passportExpiryDate: e.target.value}})
            }
          />
        </div>
        <div>
          <Label htmlFor="approvalNumber">{language === 'ar' ? 'رقم الموافقة المسبقة' : 'Prior Approval Number'}</Label>
          <Input
            id="approvalNumber"
            value={formData.approvalNumber || ''}
            onChange={(e) => setFormData({...formData, approvalNumber: e.target.value})}
          />
        </div>
      </div>

      {/* Approval Date */}
      <div>
        <Label htmlFor="approvalDate">{language === 'ar' ? 'تاريخ الموافقة المسبقة' : 'Prior Approval Date'}</Label>
        <Input
          id="approvalDate"
          value={formData.approvalDate || ''}
          onChange={(e) => setFormData({...formData, approvalDate: e.target.value})}
        />
      </div>

      {/* Notary Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notaryName">{language === 'ar' ? 'اسم الكاتب العدل' : 'Notary Name'}</Label>
          <Input
            id="notaryName"
            value={formData.notaryName || ''}
            onChange={(e) => setFormData({...formData, notaryName: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="notaryLocation">{language === 'ar' ? 'موقع الكاتب العدل' : 'Notary Location'}</Label>
          <Input
            id="notaryLocation"
            value={formData.notaryLocation || ''}
            onChange={(e) => setFormData({...formData, notaryLocation: e.target.value})}
          />
        </div>
      </div>

      {/* Date Details for Notary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="contractDayName">{language === 'ar' ? 'اسم اليوم' : 'Day Name'}</Label>
          <Input
            id="contractDayName"
            value={formData.contractDayName || ''}
            onChange={(e) => setFormData({...formData, contractDayName: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="contractDay">{language === 'ar' ? 'اليوم' : 'Day'}</Label>
          <Input
            id="contractDay"
            value={formData.contractDay || ''}
            onChange={(e) => setFormData({...formData, contractDay: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="contractMonth">{language === 'ar' ? 'الشهر' : 'Month'}</Label>
          <Input
            id="contractMonth"
            value={formData.contractMonth || ''}
            onChange={(e) => setFormData({...formData, contractMonth: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="contractYear">{language === 'ar' ? 'السنة' : 'Year'}</Label>
          <Input
            id="contractYear"
            value={formData.contractYear || ''}
            onChange={(e) => setFormData({...formData, contractYear: e.target.value})}
          />
        </div>
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
  <div className="mt-6" dir="rtl">
    <Label className="text-right">
      {language === 'ar' ? 'الوثيقة المنشأة' : 'Generated Document'}
    </Label>
    <div className="mt-2 p-4 border rounded-md bg-muted/50 whitespace-pre-wrap font-arabic text-right">
      {generatedDocument}
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