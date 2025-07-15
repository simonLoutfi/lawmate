import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, FileText, MessageCircle, Upload, Users, Home, Settings, LogOut, ChevronDown, Users2, Scale, Search, Edit, Download, Loader2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { authAPI, documentsAPI } from '@/services/api';
import { format } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import { useMediaQuery } from 'react-responsive';

interface Document {
  id: number;
  title: string;
  type: string;
  status: 'draft' | 'generated' | 'signed' | 'archived';
  createdAt: string;
  updatedAt: string;
  content?: string;
}

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  createdAt: string;
}

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [question, setQuestion] = useState('');
  const [networkOpen, setNetworkOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const RECENT_DOCUMENTS_LIMIT = 3;
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [previousTab, setPreviousTab] = useState('home');


  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profileResponse = await authAPI.getProfile();
        setUser(profileResponse.data);
        setProfileForm({
          firstName: profileResponse.data.firstName || '',
          lastName: profileResponse.data.lastName || '',
          businessName: profileResponse.data.businessName || '',
          email: profileResponse.data.email || '',
        });

        const documentsResponse = await documentsAPI.getDocuments();
        setDocuments(documentsResponse.data);
      } catch (error) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' 
            ? 'حدث خطأ أثناء تحميل بيانات لوحة التحكم' 
            : 'An error occurred while loading dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [language, toast]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      await authAPI.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        businessName: profileForm.businessName,
      });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully',
      });
      setUser((prev) => prev ? { ...prev, ...profileForm } : null);
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحديث الملف الشخصي' : 'An error occurred while updating profile',
        variant: 'destructive',
      });
    }
  };

  const filteredDocuments = documents
    .filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const quickActions = [
    {
      title: language === 'ar' ? 'الوثائق' : 'Documents',
      description: language === 'ar' ? 'إنشاء ومراجعة الوثائق القانونية' : 'Create  legal documents',
      icon: FileText,
      color: 'bg-blue-500',
      actions: [
        { label: language === 'ar' ? 'إنشاء' : 'Create', route: '/services/document' }
      ]
    },
    {
      title: language === 'ar' ? 'العقود' : 'Contracts',
      description: language === 'ar' ? 'إنشاء ومراجعة العقود المهنية' : 'Create professional contracts',
      icon: Scale,
      color: 'bg-green-500',
      actions: [
        { label: language === 'ar' ? 'إنشاء' : 'Create', route: '/services/document' }
      ]
    }
  ];

  const sidebarItems = [
    { id: 'home', icon: Home, label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { id: 'documents', icon: FileText, label: language === 'ar' ? 'وثائقي' : 'My Documents' },
    { id: 'settings', icon: Settings, label: language === 'ar' ? 'الإعدادات' : 'Settings' },
  ];

  const networkItems = [
    { 
      id: 'lawyers', 
      icon: Scale, 
      label: language === 'ar' ? 'المحامين' : 'Lawyers',
      route: '/network/lawyers'
    },
    { 
      id: 'mokhtars', 
      icon: Users2, 
      label: language === 'ar' ? 'المختارين' : 'Mokhtars',
      route: '/network/mokhtars'
    },
  ];

  const handleQuestionSubmit = () => {
    if (!question.trim()) return;
    
    console.log('Question submitted:', question);
    toast({
      title: language === 'ar' ? 'تم إرسال السؤال' : 'Question Submitted',
      description: language === 'ar' ? 'LawMate يحلل سؤالك...' : 'LawMate is analyzing your question...',
    });
    setQuestion('');
    setShowSearchBar(false);
    navigate('/ask');
  };

  const handleDocumentClick = (docId: number) => {
    navigate(`/documents/${docId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PP', {
      locale: language === 'ar' ? ar : enUS,
    });
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      draft: language === 'ar' ? 'مسودة' : 'Draft',
      generated: language === 'ar' ? 'مُنشأ' : 'Generated',
      signed: language === 'ar' ? 'موقّع' : 'Signed',
      archived: language === 'ar' ? 'مؤرشف' : 'Archived',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const handleAskLegalQuestion = () => {
    navigate('/ask');
  };

  const handleEditDocument = (docId: number) => {
    navigate(`/documents/${docId}`);
  };

  const handleDownloadDocument = async (docId: number, docTitle: string) => {
    try {
      const response = await documentsAPI.getDocument(docId);
      const content = response.data.content;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${docTitle}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: language === 'ar' ? 'تحميل الوثيقة' : 'Download Document',
        description: `${language === 'ar' ? 'تم تحميل' : 'Downloaded'} ${docTitle}`,
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar'
          ? 'حدث خطأ أثناء تحميل الوثيقة'
          : 'An error occurred while downloading the document',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: language === 'ar' ? 'تم تسجيل الخروج' : 'Logged Out',
      description: language === 'ar' ? 'تم تسجيل خروجك بنجاح' : 'You have been successfully logged out',
    });
    navigate('/login');
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16" dir={language === 'ar' ? 'rtl' : 'ltr'}>
  {/* App Header */}
  <header className="sticky top-0 z-10 bg-white border-b p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#1F2A44] rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-xs">LM</span>
        </div>
        <span className="text-base font-semibold text-[#1F2A44]">LawMate</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setActiveTab(activeTab === 'network' ? previousTab : 'network')}
          className={`p-2 rounded-full ${activeTab === 'network' ? 'bg-[#26A69A]/10 text-[#26A69A]' : 'text-gray-600'}`}
        >
          <Users className="h-4 w-4" />
        </button>
        
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>

  {/* App Content */}
  <main className="p-3">
    {/* Floating Action Button */}
    <button
      onClick={handleAskLegalQuestion}
      className="fixed bottom-20 right-4 z-20 bg-[#26A69A] text-white p-3 rounded-full shadow-lg"
    >
      <Search className="h-5 w-5" />
    </button>

    {activeTab === 'home' && (
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="pt-1">
          <h1 className="text-xl font-bold text-[#1F2A44]">
            {language === 'ar' ? `مرحباً ${user?.firstName} 👋` : `Hi ${user?.firstName} 👋`}
          </h1>
          <p className="text-gray-600 text-xs mt-1">
            {language === 'ar' ? 'ماذا تريد أن تفعل اليوم؟' : 'What would you like to do today?'}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Link 
              key={index} 
              to={action.actions[0].route}
              className="p-3 bg-white rounded-lg border border-gray-100"
            >
              <div className={`w-8 h-8 ${action.color} rounded-md flex items-center justify-center mb-2`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-[#1F2A44]">{action.title}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity List */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#1F2A44]">
              {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
            <Link to="/documents" className="text-xs text-[#26A69A]">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </div>
          
          <div className="space-y-2">
            {filteredDocuments.slice(0, 3).map((doc) => (
              <div key={doc.id} className="p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#26A69A]" />
                    <span className="text-sm font-medium">{doc.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'generated' || doc.status === 'signed'
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getStatusText(doc.status || 'generated')}
                  </span>
                </div>
                <div className="flex justify-end gap-1 mt-2">
                  <button 
                    onClick={() => handleEditDocument(doc.id)}
                    className="p-1 text-gray-500 hover:text-[#26A69A]"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => handleDownloadDocument(doc.id, doc.title)}
                    className="p-1 text-gray-500 hover:text-[#26A69A]"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {activeTab === 'documents' && (
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-[#1F2A44]">
          {language === 'ar' ? 'وثائقي' : 'My Documents'}
        </h1>
        
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#26A69A]" />
                  <div>
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleDownloadDocument(doc.id, doc.title)}
                    className="p-1 text-gray-500 hover:text-[#26A69A]"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => handleEditDocument(doc.id)}
                    className="p-1 text-gray-500 hover:text-[#26A69A]"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === 'settings' && (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-[#1F2A44]">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </h1>
        
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <h2 className="text-sm font-semibold text-[#1F2A44] mb-3">
            {language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </label>
              <input
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="w-full p-2 text-sm border border-gray-200 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                name="email"
                value={profileForm.email}
                disabled
                className="w-full p-2 text-sm border border-gray-200 rounded-md bg-gray-50"
              />
            </div>
            
            <button
              className="w-full bg-[#26A69A] text-white py-2 rounded-md text-sm font-medium mt-2"
              onClick={handleProfileSave}
            >
              {language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'network' && (
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#1F2A44]">
          {language === 'ar' ? 'الشبكة' : 'Network'}
        </h1>
        
        {networkItems.map((item) => (
          <Link 
            key={item.id} 
            to={item.route}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100"
          >
            <item.icon className="h-5 w-5 text-[#26A69A]" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    )}
  </main>

  {/* App Bottom Navigation */}
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div className="flex">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex-1 flex flex-col items-center justify-center py-2 ${
            activeTab === item.id ? 'text-[#26A69A]' : 'text-gray-600'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  </nav>
</div>
    );
  }

  // Original Desktop View
  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r flex flex-col" style={{ minHeight: '100vh' }}>
          <div className="flex-1 p-6">
            <Link to="/" className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-[#1F2A44] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LM</span>
              </div>
              <span className="text-xl font-semibold text-[#1F2A44]">LawMate</span>
            </Link>

            <nav className="space-y-2 flex-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    activeTab === item.id 
                      ? 'bg-[#1F2A44] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Networks Collapsible Section */}
              <Collapsible open={networkOpen} onOpenChange={setNetworkOpen}>
                <CollapsibleTrigger asChild>
                  <button className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    networkOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
                  } text-gray-700`}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{language === 'ar' ? 'الشبكات' : 'Networks'}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${networkOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 pb-2">
                  <div className="ml-6 space-y-1">
                    {networkItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.route}
                        className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 block border-l-2 border-gray-200 hover:border-[#26A69A]"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </nav>
          </div>

          <div className="p-6 border-t bg-white">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-[#1F2A44] mb-1">
                {language === 'ar' ? 'الخطة المجانية' : 'Free Plan'}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                {language === 'ar' ? '2 من 3 عقود مستخدمة' : '2 of 3 contracts used'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-[#26A69A] h-2 rounded-full" style={{width: '67%'}}></div>
              </div>
              <Link to="/pricing">
                <Button size="sm" className="w-full bg-[#26A69A] hover:bg-[#26A69A]/90">
                  {language === 'ar' ? 'ترقية الخطة' : 'Upgrade Plan'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Top Search Bar for Legal Questions */}
          <div className="mb-6">
            <div className="relative">
              <Button
                onClick={handleAskLegalQuestion}
                className="w-full bg-[#26A69A] hover:bg-[#26A69A]/90 text-white flex items-center justify-center space-x-2 py-3"
              >
                <Search className="h-5 w-5" />
                <span>{language === 'ar' ? 'اسأل سؤالاً قانونياً' : 'Ask a Legal Question'}</span>
              </Button>
            </div>
          </div>

          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div>
                <h1 className="text-3xl font-bold text-[#1F2A44] mb-2">
                  {language === 'ar'
                    ? `مرحباً بك، ${user ? user.firstName : ''}! 👋`
                    : `Welcome back, ${user ? user.firstName : ''}! 👋`}
                </h1>
                <p className="text-gray-600">
                  {language === 'ar' ? 'جاهز لإنشاء العقود أو الحصول على استشارة قانونية؟' : 'Ready to generate contracts or get legal advice?'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-[#1F2A44] text-lg">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">
                        {action.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {action.actions.map((actionBtn, btnIndex) => (
                          <Link key={btnIndex} to={actionBtn.route}>
                            <Button className="bg-[#26A69A] hover:bg-[#26A69A]/90 text-sm px-4 py-2">
                              {actionBtn.label}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1F2A44]">
                    {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDocuments.slice(0, RECENT_DOCUMENTS_LIMIT).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-[#26A69A]" />
                          <div>
                            <p className="font-semibold text-[#1F2A44]">{doc.title}</p>

                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            doc.status === 'generated' || doc.status === 'signed'
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {getStatusText(doc.status || 'generated')}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditDocument(doc.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'قراءة' : 'View'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc.id, doc.title)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'تحميل' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/documents">
                    <Button variant="ghost" className="w-full mt-4 text-[#26A69A] hover:text-[#26A69A]/80">
                      {language === 'ar' ? 'عرض جميع الوثائق' : 'View All Documents'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-[#1F2A44]">
                {language === 'ar' ? 'وثائقي' : 'My Documents'}
              </h1>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1F2A44]">
                    {language === 'ar' ? 'العقود المُنشأة' : 'Generated Contracts'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">📄</div>
                          <div>
                            <p className="font-semibold text-[#1F2A44]">{doc.title}</p>
                            <p className="text-sm text-gray-600">
                              {language === 'ar' ? 'تم إنشاؤه في' : 'Created on'} {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc.id, doc.title)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'تحميل' : 'Download'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditDocument(doc.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-[#1F2A44]">
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#1F2A44]">
                      {language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                      </label>
                      <Input
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                      </label>
                      <Input
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <Input
                        name="email"
                        value={profileForm.email}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'اسم الشركة' : 'Business Name'}
                      </label>
                      <Input
                        name="businessName"
                        value={profileForm.businessName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <Button
                      className="w-full bg-[#26A69A] hover:bg-[#26A69A]/90"
                      onClick={handleProfileSave}
                    >
                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;