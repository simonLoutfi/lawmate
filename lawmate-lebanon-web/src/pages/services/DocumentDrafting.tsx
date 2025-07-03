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
import { documentsAPI } from '@/services/api'; // <-- Add this import
import { useMediaQuery } from 'react-responsive';


interface DocumentForm {
  type: string;
  partyA: string;
  partyB: string;
  subject: string;
  amount: string;
  duration: string;
  specificTerms: string;
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
    subject: '',
    amount: '',
    duration: '',
    specificTerms: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });


  const documentTypes = language === 'ar' ? [
    { id: 'will', name: 'وصية', description: 'وصية قانونية وفقاً للقانون اللبناني' },
    { id: 'power', name: 'توكيل', description: 'توكيل قانوني عام أو خاص' },
    { id: 'affidavit', name: 'إفادة خطية', description: 'إفادة خطية مُوثقة' },
    { id: 'birth_certificate', name: 'إخراج قيد', description: 'طلب إخراج قيد ولادة أو وفاة' },
    { id: 'family_record', name: 'إخراج قيد عائلي', description: 'طلب إخراج قيد عائلي' },
    { id: 'nationality_certificate', name: 'شهادة جنسية', description: 'طلب شهادة جنسية لبنانية' },
    { id: 'residency_certificate', name: 'شهادة إقامة', description: 'شهادة إقامة للأجانب' },
    { id: 'criminal_record', name: 'صحيفة السوابق', description: 'طلب صحيفة السوابق العدلية' }
  ] : [
    { id: 'will', name: 'Will (Testament)', description: 'Legal will according to Lebanese law' },
    { id: 'power', name: 'Power of Attorney', description: 'General or specific power of attorney' },
    { id: 'affidavit', name: 'Affidavit', description: 'Notarized written statement' },
    { id: 'birth_certificate', name: 'Civil Registry Extract', description: 'Birth or death certificate request' },
    { id: 'family_record', name: 'Family Record Extract', description: 'Family record certificate request' },
    { id: 'nationality_certificate', name: 'Nationality Certificate', description: 'Lebanese nationality certificate request' },
    { id: 'residency_certificate', name: 'Residency Certificate', description: 'Residency certificate for foreigners' },
    { id: 'criminal_record', name: 'Criminal Record', description: 'Criminal background check request' }
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

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

    // Simulate document generation
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Mock generated document
      const mockDocument = language === 'ar' ? 
        generateArabicDocument(formData) : 
        generateEnglishDocument(formData);
      
      setGeneratedDocument(mockDocument);
      setIsGenerating(false);
      
      toast({
        title: language === 'ar' ? 'تم إنشاء الوثيقة' : 'Document Generated',
        description: language === 'ar' ? 'تم إنشاء الوثيقة بنجاح' : 'Document has been successfully generated',
      });
    }, 4000);
  };

  const generateArabicDocument = (data: DocumentForm): string => {
    const documentTemplates = {
      will: `وصية شرعية

أنا الموقع أدناه ${data.partyA}
المولود في تاريخ: _______
ابن/ابنة: _______

أُوصي بما يلي:
${data.specificTerms}

وأعين ${data.partyB} وصياً على تنفيذ هذه الوصية.

التوقيع: _______
التاريخ: ${new Date().toLocaleDateString('ar')}`,
      
      power: `توكيل عام/خاص

أنا الموقع أدناه ${data.partyA}
أوكل السيد/السيدة ${data.partyB}

للقيام بالأعمال التالية:
${data.subject}

صلاحيات إضافية:
${data.specificTerms}

مدة التوكيل: ${data.duration}

التوقيع: _______
التاريخ: ${new Date().toLocaleDateString('ar')}`,

      affidavit: `إفادة خطية

أنا الموقع أدناه ${data.partyA}
أُفيد بأن:

${data.subject}

تفاصيل إضافية:
${data.specificTerms}

وأتحمل المسؤولية القانونية عن صحة هذه الإفادة.

التوقيع: _______
التاريخ: ${new Date().toLocaleDateString('ar')}`,

      birth_certificate: `طلب إخراج قيد ولادة/وفاة

اسم مقدم الطلب: ${data.partyA}
صلة القرابة: ${data.partyB}

المطلوب قيد: ${data.subject}

سبب الطلب: ${data.specificTerms}

التوقيع: _______
التاريخ: ${new Date().toLocaleDateString('ar')}`
    };

    return documentTemplates[data.type as keyof typeof documentTemplates] || 'وثيقة قانونية لبنانية';
  };

  const generateEnglishDocument = (data: DocumentForm): string => {
    const documentTemplates = {
      will: `LAST WILL AND TESTAMENT

I, ${data.partyA}
Born on: _______
Child of: _______

I hereby bequeath:
${data.specificTerms}

I appoint ${data.partyB} as executor of this will.

Signature: _______
Date: ${new Date().toLocaleDateString()}`,
      
      power: `POWER OF ATTORNEY

I, the undersigned ${data.partyA}
hereby authorize Mr./Mrs. ${data.partyB}

To perform the following acts:
${data.subject}

Additional powers:
${data.specificTerms}

Duration: ${data.duration}

Signature: _______
Date: ${new Date().toLocaleDateString()}`,

      affidavit: `AFFIDAVIT

I, the undersigned ${data.partyA}
hereby declare that:

${data.subject}

Additional details:
${data.specificTerms}

I take full legal responsibility for the accuracy of this statement.

Signature: _______
Date: ${new Date().toLocaleDateString()}`,

      birth_certificate: `CIVIL REGISTRY EXTRACT REQUEST

Applicant Name: ${data.partyA}
Relationship: ${data.partyB}

Requested Record: ${data.subject}

Reason for Request: ${data.specificTerms}

Signature: _______
Date: ${new Date().toLocaleDateString()}`
    };

    return documentTemplates[data.type as keyof typeof documentTemplates] || 'Lebanese Legal Document';
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDocument], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedType}_contract.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: language === 'ar' ? 'تم التحميل' : 'Downloaded',
      description: language === 'ar' ? 'تم تحميل الوثيقة بنجاح' : 'Document downloaded successfully',
    });
  };

  const handleSendToMokhtar = () => {
    toast({
      title: language === 'ar' ? 'تم الإرسال للمختار' : 'Sent to Mokhtar',
      description: language === 'ar' ? 'تم إرسال الوثيقة للمراجعة القانونية' : 'Document sent for legal review',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
{/* Header */}
<div className="bg-white shadow-sm border-b">
  <div className="px-4 py-4 flex items-center justify-between md:max-w-4xl md:mx-auto">
    {isMobile ? (
      <>
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-[#1F2A44]">
          {language === 'ar' ? 'صياغة الوثائق' : 'Document Drafting'}
        </h1>
        <div className="w-8" /> {/* Spacer */}
      </>
    ) : (
      <div className="flex items-center space-x-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[#1F2A44]">
            {language === 'ar' ? 'صياغة الوثائق' : 'Document Drafting'}
          </h1>
          <p className="text-sm text-gray-500">
            {language === 'ar' ? 'إنشاء وثائق قانونية مخصصة' : 'Create custom legal documents'}
          </p>
        </div>
      </div>
    )}
  </div>
</div>


      <div className={`p-4 space-y-6 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>

        {/* Document Type Selection */}
        {!selectedType && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'اختر نوع الوثيقة' : 'Select Document Type'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTypes.map((type) => (
                  <Card 
                    key={type.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-[#26A69A]" />
                        <div>
                          <h3 className="font-semibold text-[#1F2A44]">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Form */}
        {selectedType && !generatedDocument && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {documentTypes.find(t => t.id === selectedType)?.name}
                </span>
<Button 
  variant="outline" 
  size="sm"
  onClick={() => setSelectedType('')}
  className="px-2 py-1 text-xs" // or style={{ padding: '2px 4px', fontSize: '12px' }}
>
  {language === 'ar' ? 'تغيير النوع' : 'Change Type'}
</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partyA">
                    {language === 'ar' ? 'الطرف الأول' : 'Party A'}
                  </Label>
                  <Input
                    id="partyA"
                    value={formData.partyA}
                    onChange={(e) => setFormData({...formData, partyA: e.target.value})}
                    placeholder={language === 'ar' ? 'اسم الطرف الأول' : 'Name of Party A'}
                  />
                </div>
                <div>
                  <Label htmlFor="partyB">
                    {language === 'ar' ? 'الطرف الثاني' : 'Party B'}
                  </Label>
                  <Input
                    id="partyB"
                    value={formData.partyB}
                    onChange={(e) => setFormData({...formData, partyB: e.target.value})}
                    placeholder={language === 'ar' ? 'اسم الطرف الثاني' : 'Name of Party B'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">
                  {language === 'ar' ? 'موضوع العقد' : 'Subject Matter'}
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder={language === 'ar' ? 'وصف موضوع العقد' : 'Describe the subject matter'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">
                    {language === 'ar' ? 'المبلغ/الراتب' : 'Amount/Salary'}
                  </Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder={language === 'ar' ? 'المبلغ بالليرة اللبنانية' : 'Amount in Lebanese Pounds'}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">
                    {language === 'ar' ? 'المدة' : 'Duration'}
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder={language === 'ar' ? 'مدة العقد' : 'Contract duration'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="terms">
                  {language === 'ar' ? 'شروط إضافية' : 'Additional Terms'}
                </Label>
                <Textarea
                  id="terms"
                  value={formData.specificTerms}
                  onChange={(e) => setFormData({...formData, specificTerms: e.target.value})}
                  placeholder={language === 'ar' ? 'أي شروط إضافية تريد تضمينها' : 'Any additional terms you want to include'}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!formData.partyA || !formData.partyB || isGenerating}
                className="w-full bg-[#26A69A] hover:bg-[#26A69A]/90"
              >
                {language === 'ar' ? 'إنشاء الوثيقة' : 'Generate Document'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-[#1F2A44] mb-2">
                  {language === 'ar' ? 'جاري إنشاء الوثيقة...' : 'Generating Document...'}
                </h3>
                <Progress value={generationProgress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  {generationProgress}% {language === 'ar' ? 'مكتمل' : 'Complete'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

          {/* Generated Document */}
  {generatedDocument && (
    <div className="space-y-6">
      <Card>
        <CardHeader>
         <CardTitle className="flex flex-col gap-2">
  <span>{language === 'ar' ? 'الوثيقة المُنشأة' : 'Generated Document'}</span>
  <div className="flex flex-wrap gap-2">
    <Button 
      onClick={handleDownload}
      className="bg-[#1F2A44] hover:bg-[#1F2A44]/90 px-2 py-1 text-xs h-8"
    >
      <Download className="h-3 w-3 mr-1" />
      {language === 'ar' ? 'تحميل' : 'Download'}
    </Button>
    
    <Button 
      onClick={handleSendToMokhtar}
      variant="outline"
      className="px-2 py-1 text-xs h-8"
    >
      <Send className="h-3 w-3 mr-1" />
      {language === 'ar' ? 'إرسال للمختار' : 'Send to Mokhtar'}
    </Button>
    
    <Button
      onClick={handleSaveDocument}
      disabled={isSaving}
      className="bg-[#26A69A] hover:bg-[#26A69A]/90 px-2 py-1 text-xs h-8"
    >
      {isSaving
        ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
        : (language === 'ar' ? 'حفظ في حسابي' : 'Save to My Account')}
    </Button>
  </div>
</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedDocument}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={() => {
            setSelectedType('');
            setGeneratedDocument('');
            setFormData({
              type: '',
              partyA: '',
              partyB: '',
              subject: '',
              amount: '',
              duration: '',
              specificTerms: ''
            });
          }}
          variant="outline"
        >
          {language === 'ar' ? 'إنشاء وثيقة جديدة' : 'Create New Document'}
        </Button>
      </div>
    </div>
  )}
      </div>
    </div>
  );
};

export default DocumentDrafting;
