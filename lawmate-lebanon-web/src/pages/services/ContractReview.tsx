import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, FileText, AlertTriangle, CheckCircle, Download, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { documentsAPI } from '@/services/api'; // <-- Add this import

interface ReviewResult {
  score: number;
  issues: Array<{
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    suggestion: string;
  }>;
  suggestions: string[];
}

const ContractReview = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeOption, setActiveOption] = useState<'upload' | 'existing' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReviewResult(null);
      setActiveOption('upload');
    }
  }, []);

    const handleSaveContract = async () => {
    setIsSaving(true);
    try {
      await documentsAPI.createDocument({
        title: file?.name || (language === 'ar' ? 'عقد' : 'Contract'),
        content: reviewResult ? JSON.stringify(reviewResult) : '',
        type: 'contract_review',
        tags: [],
      });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ تقرير مراجعة العقد في حسابك' : 'Contract review report saved to your account',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء حفظ التقرير' : 'An error occurred while saving the report',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setReviewResult(null);
      setActiveOption('upload');
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file && activeOption !== 'existing') return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate AI analysis
    setTimeout(() => {
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Mock analysis result
      const mockResult: ReviewResult = {
        score: 78,
        issues: [
          {
            type: 'critical',
            title: language === 'ar' ? 'شرط جزائي مفقود' : 'Missing Penalty Clause',
            description: language === 'ar' ? 'العقد لا يحتوي على شرط جزائي في حالة الإخلال' : 'Contract lacks penalty clause for breach',
            suggestion: language === 'ar' ? 'إضافة شرط جزائي بنسبة 10% من قيمة العقد' : 'Add penalty clause of 10% of contract value'
          },
          {
            type: 'warning',
            title: language === 'ar' ? 'تاريخ انتهاء غير واضح' : 'Unclear Termination Date',
            description: language === 'ar' ? 'تاريخ انتهاء العقد غير محدد بوضوح' : 'Contract termination date is not clearly specified',
            suggestion: language === 'ar' ? 'تحديد تاريخ انتهاء محدد أو مدة العقد' : 'Specify exact termination date or contract duration'
          },
          {
            type: 'info',
            title: language === 'ar' ? 'تحسين الصياغة' : 'Language Improvement',
            description: language === 'ar' ? 'بعض البنود تحتاج لصياغة أوضح' : 'Some clauses need clearer language',
            suggestion: language === 'ar' ? 'استخدام مصطلحات قانونية أكثر دقة' : 'Use more precise legal terminology'
          }
        ],
        suggestions: language === 'ar' ? [
          'إضافة شرط تحكيم للنزاعات',
          'تحديد القانون الواجب التطبيق',
          'إضافة شرط القوة القاهرة',
          'تحديد إجراءات التعديل'
        ] : [
          'Add arbitration clause for disputes',
          'Specify governing law',
          'Add force majeure clause',
          'Define amendment procedures'
        ]
      };

      setReviewResult(mockResult);
      setIsAnalyzing(false);
      
      toast({
        title: language === 'ar' ? 'تم تحليل العقد' : 'Contract Analyzed',
        description: language === 'ar' ? 'تم تحليل العقد بنجاح' : 'Contract has been successfully analyzed',
      });
    }, 3000);
  };

  const handleDownloadReport = () => {
    toast({
      title: language === 'ar' ? 'تحميل التقرير' : 'Download Report',
      description: language === 'ar' ? 'سيتم تحميل التقرير قريباً' : 'Report will be downloaded shortly',
    });
  };

  const handleEditExisting = () => {
    setActiveOption('existing');
    toast({
      title: language === 'ar' ? 'تحرير وثيقة موجودة' : 'Edit Existing Document',
      description: language === 'ar' ? 'اختر وثيقة من ملفاتك المحفوظة' : 'Select a document from your saved files',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#1F2A44]">
                {language === 'ar' ? 'مراجعة العقود والوثائق' : 'Contract & Document Review'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ar' ? 'تحليل ذكي للعقود والوثائق القانونية' : 'AI-powered contract and legal document analysis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Review Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{language === 'ar' ? 'خيارات المراجعة' : 'Review Options'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload New Document */}
              <Card className={`cursor-pointer transition-colors ${activeOption === 'upload' ? 'ring-2 ring-[#26A69A]' : 'hover:bg-gray-50'}`}>
                <CardContent className="p-4 text-center">
                  <Upload className="h-8 w-8 text-[#26A69A] mx-auto mb-2" />
                  <h3 className="font-semibold text-[#1F2A44] mb-1">
                    {language === 'ar' ? 'رفع وثيقة جديدة' : 'Upload New Document'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'ارفع ملف PDF أو DOC' : 'Upload PDF or DOC file'}
                  </p>
                </CardContent>
              </Card>

              {/* Drag & Drop Area */}
              <Card className={`cursor-pointer transition-colors ${dragActive ? 'ring-2 ring-[#26A69A] bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardContent 
                  className="p-4 text-center"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileText className="h-8 w-8 text-[#26A69A] mx-auto mb-2" />
                  <h3 className="font-semibold text-[#1F2A44] mb-1">
                    {language === 'ar' ? 'اسحب وأفلت' : 'Drag & Drop'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'اسحب الملف هنا' : 'Drop your file here'}
                  </p>
                </CardContent>
              </Card>

              {/* Edit Existing */}
              <Card 
                className={`cursor-pointer transition-colors ${activeOption === 'existing' ? 'ring-2 ring-[#26A69A]' : 'hover:bg-gray-50'}`}
                onClick={handleEditExisting}
              >
                <CardContent className="p-4 text-center">
                  <Edit className="h-8 w-8 text-[#26A69A] mx-auto mb-2" />
                  <h3 className="font-semibold text-[#1F2A44] mb-1">
                    {language === 'ar' ? 'تحرير وثيقة موجودة' : 'Edit Existing Document'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'من ملفاتك المحفوظة' : 'From your saved files'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section - Show only when upload option is active */}
        {(activeOption === 'upload' || !activeOption) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>{language === 'ar' ? 'رفع العقد أو الوثيقة' : 'Upload Contract or Document'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-[#26A69A] bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {language === 'ar' 
                    ? 'اسحب وأفلت ملف العقد أو الوثيقة هنا أو انقر للاختيار'
                    : 'Drag and drop your contract or document file here or click to select'
                  }
                </p>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    {language === 'ar' ? 'اختر ملف' : 'Choose File'}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ar' ? 'PDF, DOC, DOCX حتى 10MB' : 'PDF, DOC, DOCX up to 10MB'}
                </p>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-[#26A69A] hover:bg-[#26A69A]/90"
                  >
                    {language === 'ar' ? 'تحليل الوثيقة' : 'Analyze Document'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Existing Documents Section - Show when existing option is active */}
        {activeOption === 'existing' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الوثائق المحفوظة' : 'Saved Documents'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Sample existing documents */}
                {[
                  { name: language === 'ar' ? 'عقد عمل - أحمد خليل' : 'Employment Contract - Ahmad Khalil', date: '2025-01-15' },
                  { name: language === 'ar' ? 'اتفاقية خدمات - الحلول التقنية' : 'Service Agreement - Tech Solutions', date: '2025-01-14' },
                  { name: language === 'ar' ? 'اتفاقية سرية - مشروع الشراكة' : 'NDA - Partnership Project', date: '2025-01-13' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-[#26A69A]" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.date}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAnalyze}
                      size="sm"
                      className="bg-[#26A69A] hover:bg-[#26A69A]/90"
                    >
                      {language === 'ar' ? 'تحليل' : 'Analyze'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-[#1F2A44] mb-2">
                  {language === 'ar' ? 'جاري تحليل العقد...' : 'Analyzing Contract...'}
                </h3>
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  {analysisProgress}% {language === 'ar' ? 'مكتمل' : 'Complete'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Results */}
        {reviewResult && (
          <div className="space-y-6">
            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{language === 'ar' ? 'نتيجة التحليل' : 'Analysis Score'}</span>
                  <div className={`text-2xl font-bold ${
                    reviewResult.score >= 80 ? 'text-green-600' :
                    reviewResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {reviewResult.score}/100
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={reviewResult.score} className="w-full mb-4" />
                <p className="text-gray-600">
                  {language === 'ar' 
                    ? 'العقد يحتاج لبعض التحسينات لضمان الحماية القانونية الكاملة'
                    : 'Contract needs some improvements to ensure full legal protection'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Issues */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'المشاكل المكتشفة' : 'Identified Issues'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewResult.issues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {issue.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
                      {issue.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                      {issue.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1F2A44]">{issue.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{issue.description}</p>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">{language === 'ar' ? 'الاقتراح:' : 'Suggestion:'} </span>
                          {issue.suggestion}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'اقتراحات للتحسين' : 'Improvement Suggestions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reviewResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

  {/* Actions */}
  {reviewResult && (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleDownloadReport}
            className="bg-[#1F2A44] hover:bg-[#1F2A44]/90 flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تحميل التقرير الكامل' : 'Download Full Report'}
          </Button>
          <Button
            onClick={handleSaveContract}
            disabled={isSaving}
            className="bg-[#26A69A] hover:bg-[#26A69A]/90 flex-1"
          >
            {isSaving
              ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
              : (language === 'ar' ? 'حفظ في حسابي' : 'Save to My Account')}
          </Button>
          <Link to="/services/document" className="flex-1">
            <Button variant="outline" className="w-full">
              {language === 'ar' ? 'إنشاء عقد محسن' : 'Generate Improved Contract'}
            </Button>
          </Link>
          <Link to="/mokhtar" className="flex-1">
            <Button variant="outline" className="w-full">
              {language === 'ar' ? 'استشر محامي' : 'Consult Lawyer'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractReview;
