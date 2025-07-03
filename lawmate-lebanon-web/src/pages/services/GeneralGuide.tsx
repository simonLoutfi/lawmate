
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Building, Users, Scale, Home as HomeIcon, Car, Heart, Briefcase, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface DocumentType {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  category: string;
}

const GeneralGuide = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const documentTypes: DocumentType[] = [
    {
      id: 'commercial-registration',
      title: language === 'ar' ? 'السجل التجاري' : 'Commercial Registration',
      description: language === 'ar' ? 'تسجيل الشركات والأنشطة التجارية' : 'Company and business activity registration',
      icon: Building,
      color: 'bg-blue-500',
      category: 'business'
    },
    {
      id: 'partnership-agreement',
      title: language === 'ar' ? 'عقد الشراكة' : 'Partnership Agreement',
      description: language === 'ar' ? 'إنشاء شراكات تجارية قانونية' : 'Legal business partnership creation',
      icon: Users,
      color: 'bg-green-500',
      category: 'business'
    },
    {
      id: 'employment-contract',
      title: language === 'ar' ? 'عقد العمل' : 'Employment Contract',
      description: language === 'ar' ? 'عقود العمل وفقاً لقانون العمل اللبناني' : 'Employment contracts under Lebanese labor law',
      icon: Briefcase,
      color: 'bg-purple-500',
      category: 'employment'
    },
    {
      id: 'rental-agreement',
      title: language === 'ar' ? 'عقد الإيجار' : 'Rental Agreement',
      description: language === 'ar' ? 'عقود إيجار العقارات السكنية والتجارية' : 'Residential and commercial property rental contracts',
      icon: HomeIcon,
      color: 'bg-orange-500',
      category: 'property'
    },
    {
      id: 'vehicle-registration',
      title: language === 'ar' ? 'تسجيل المركبات' : 'Vehicle Registration',
      description: language === 'ar' ? 'تسجيل ونقل ملكية المركبات' : 'Vehicle registration and ownership transfer',
      icon: Car,
      color: 'bg-red-500',
      category: 'personal'
    },
    {
      id: 'marriage-contract',
      title: language === 'ar' ? 'عقد الزواج' : 'Marriage Contract',
      description: language === 'ar' ? 'الزواج المدني والديني في لبنان' : 'Civil and religious marriage in Lebanon',
      icon: Heart,
      color: 'bg-pink-500',
      category: 'personal'
    },
    {
      id: 'power-attorney',
      title: language === 'ar' ? 'وكالة عامة/خاصة' : 'Power of Attorney',
      description: language === 'ar' ? 'توكيل قانوني عام أو خاص' : 'General or special legal authorization',
      icon: Scale,
      color: 'bg-indigo-500',
      category: 'legal'
    },
    {
      id: 'insurance-policy',
      title: language === 'ar' ? 'بوليصة التأمين' : 'Insurance Policy',
      description: language === 'ar' ? 'تأمين المركبات والممتلكات والصحة' : 'Vehicle, property, and health insurance',
      icon: Shield,
      color: 'bg-teal-500',
      category: 'insurance'
    }
  ];

  const categories = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { id: 'business', label: language === 'ar' ? 'الأعمال' : 'Business' },
    { id: 'employment', label: language === 'ar' ? 'العمل' : 'Employment' },
    { id: 'property', label: language === 'ar' ? 'العقارات' : 'Property' },
    { id: 'personal', label: language === 'ar' ? 'شخصي' : 'Personal' },
    { id: 'legal', label: language === 'ar' ? 'قانوني' : 'Legal' },
    { id: 'insurance', label: language === 'ar' ? 'التأمين' : 'Insurance' }
  ];

  const filteredDocuments = selectedCategory === 'all' 
    ? documentTypes 
    : documentTypes.filter(doc => doc.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#1F2A44]">
                {language === 'ar' ? 'الدليل العام للوثائق القانونية' : 'General Legal Documents Guide'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ar' ? 'إرشادات شاملة للحصول على الوثائق القانونية في لبنان' : 'Comprehensive guide for obtaining legal documents in Lebanon'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'تصفية حسب الفئة' : 'Filter by Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "bg-[#26A69A] hover:bg-[#26A69A]/90" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${doc.color} rounded-lg flex items-center justify-center mb-3`}>
                  <doc.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-[#1F2A44] text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                <Link to={`/services/guide/${doc.id}`}>
                  <Button className="w-full bg-[#1F2A44] hover:bg-[#1F2A44]/90">
                    {language === 'ar' ? 'عرض الدليل' : 'View Guide'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralGuide;
