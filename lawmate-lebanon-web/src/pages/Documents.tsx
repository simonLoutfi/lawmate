import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Edit, Download, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { documentsAPI } from '@/services/api'; 
import { useMediaQuery } from 'react-responsive';


const Documents = () => {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });


  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const res = await documentsAPI.getDocuments();
        setDocuments(res.data);
      } catch (error) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'حدث خطأ أثناء تحميل الوثائق' : 'An error occurred while loading documents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
    // eslint-disable-next-line
  }, [language]);

  const handleEdit = (docName: string) => {
    toast({
      title: language === 'ar' ? 'تحرير الوثيقة' : 'Edit Document',
      description: `${language === 'ar' ? 'فتح محرر' : 'Opening editor for'} ${docName}`,
    });
  };

  const handleDownload = (doc: any) => {
    const element = document.createElement('a');
    const file = new Blob([doc.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: language === 'ar' ? 'تحميل الوثيقة' : 'Download Document',
      description: `${language === 'ar' ? 'تم تحميل' : 'Downloaded'} ${doc.title}`,
    });
  };

  const handleReview = (docName: string) => {
    toast({
      title: language === 'ar' ? 'مراجعة الوثيقة' : 'Review Document',
      description: `${language === 'ar' ? 'فتح مراجع' : 'Opening reviewer for'} ${docName}`,
    });
  };

  const getStatusColor = (doc: any) => {
    // Example: you can use doc.status or completion if available
    return 'bg-green-100 text-green-700';
  };

  const getProgressColor = (doc: any) => {
    return 'bg-green-500';
  };

  if (isMobile) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-[#1F2A44]">
            {language === 'ar' ? 'وثائقي' : 'My Documents'}
          </h1>
          <div className="w-8" /> {/* Spacer to balance layout */}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        <Link to="/services/document">
          <Button className="w-full bg-[#26A69A] hover:bg-[#26A69A]/90 text-white">
            <FileText className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إنشاء وثيقة جديدة' : 'Create New Document'}
          </Button>
        </Link>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc.id} className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#26A69A]" />
                  <div>
                    <p className="font-semibold text-[#1F2A44] text-sm">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(doc)}`}>
                  {language === 'ar' ? 'محفوظ' : 'Saved'}
                </span>
              </div>

              <Progress value={100} className="h-2" />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReview(doc.title)}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                </Button>
                <Link to={`/documents/${doc.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <Edit className="h-3 w-3 mr-1" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc)}
                  className="flex-1 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center p-6">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-600">
              {language === 'ar' ? 'لا توجد وثائق بعد' : 'No documents yet'}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {language === 'ar' ? 'ابدأ بإنشاء وثيقتك القانونية الأولى' : 'Start by creating your first legal document'}
            </p>
            <Link to="/services/document">
              <Button className="w-full bg-[#26A69A] hover:bg-[#26A69A]/90 text-white text-sm">
                <FileText className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إنشاء وثيقة' : 'Create Document'}
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-50 p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'العودة' : 'Back'}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#1F2A44]">
                {language === 'ar' ? 'وثائقي' : 'My Documents'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'ar' ? 'إدارة ومراجعة جميع وثائقك القانونية' : 'Manage and review all your legal documents'}
              </p>
            </div>
          </div>
          <Link to="/services/document">
            <Button className="bg-[#26A69A] hover:bg-[#26A69A]/90">
              <FileText className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إنشاء وثيقة جديدة' : 'Create New Document'}
            </Button>
          </Link>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <span className="text-gray-500">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : documents.length > 0 ? (
            documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="h-8 w-8 text-[#26A69A] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold text-[#1F2A44] line-clamp-2">
                          {doc.title}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status and Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc)}`}>
                        {language === 'ar' ? 'محفوظ' : 'Saved'}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {/* You can add completion or status here if available */}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(doc)}`}
                        style={{ width: `100%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReview(doc.title)}
                      className="flex-1 min-w-0"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      <span className="text-xs">{language === 'ar' ? 'مراجعة' : 'Review'}</span>
                    </Button>
                    
                    <Link to={`/documents/${doc.id}`} className="flex-1 min-w-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="text-xs">{language === 'ar' ? 'تحرير' : 'Edit'}</span>
                      </Button>
                    </Link>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 min-w-0"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      <span className="text-xs">{language === 'ar' ? 'تحميل' : 'Download'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {language === 'ar' ? 'لا توجد وثائق بعد' : 'No documents yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {language === 'ar' ? 'ابدأ بإنشاء وثيقتك القانونية الأولى' : 'Start by creating your first legal document'}
                </p>
                <Link to="/services/document">
                  <Button className="bg-[#26A69A] hover:bg-[#26A69A]/90">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'إنشاء وثيقة' : 'Create Document'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;