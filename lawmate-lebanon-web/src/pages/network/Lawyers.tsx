
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star, Phone, Calendar, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { networkAPI } from '@/services/api';

interface Lawyer {
  id: string;
  name: string;
  specialty: string[];
  location: string;
  rating: number;
  reviewCount: number;
  pricePerSession: number;
  phone: string;
  availability: string;
  languages: string[];
  experience: number;
  description: string;
}

const Lawyers = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const res = await networkAPI.getLawyers();
setLawyers(
  res.data.map((lawyer: any) => ({
    id: lawyer.id,
    name: `${lawyer.firstName} ${lawyer.lastName}`,
    specialty: lawyer.specialties
      ? lawyer.specialties.split(',').map((s: string) => s.trim())
      : [],
    location: lawyer.businessName || '',
    rating: lawyer.rating || 0,
    reviewCount: lawyer.reviewCount || 0,
    pricePerSession: lawyer.pricePerSession || 0,
    phone: lawyer.phone || '',
    availability: lawyer.availability || '',
    languages: lawyer.languages
      ? lawyer.languages.split(',').map((l: string) => l.trim())
      : [],
    experience: lawyer.experience || 0,
    description: lawyer.description || '',
  }))
);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, [language]);

  const specialties = language === 'ar' ? [
    'الكل',
    'القانون التجاري',
    'قانون الأسرة',
    'القانون الجنائي',
    'قانون الشركات',
    'العقود',
    'الأحوال الشخصية'
  ] : [
    'All',
    'Commercial Law',
    'Family Law',
    'Criminal Law',
    'Corporate Law',
    'Contracts',
    'Personal Status'
  ];

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesLocation = searchLocation === '' || lawyer.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === specialties[0] || 
      lawyer.specialty.some(spec => spec.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    return matchesLocation && matchesSpecialty;
  });

  const handleBookConsultation = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    toast({
      title: language === 'ar' ? 'طلب استشارة' : 'Consultation Request',
      description: language === 'ar' ? `تم إرسال طلب استشارة إلى ${lawyer.name}` : `Consultation request sent to ${lawyer.name}`,
    });
  };

  const handleConfirmBooking = () => {
    toast({
      title: language === 'ar' ? 'تم تأكيد الموعد' : 'Appointment Confirmed',
      description: language === 'ar' ? 'سيتم إرسال تفاصيل الموعد عبر الرسائل القصيرة' : 'Appointment details will be sent via SMS',
    });
    setSelectedLawyer(null);
  };

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
                {language === 'ar' ? 'شبكة المحامين' : 'Lawyers Network'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ar' ? 'تواصل مع المحامين المعتمدين في لبنان' : 'Connect with certified lawyers in Lebanon'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>{language === 'ar' ? 'البحث والتصفية' : 'Search & Filters'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={language === 'ar' ? 'ابحث بالموقع (بيروت، طرابلس، إلخ)' : 'Search by location (Beirut, Tripoli, etc.)'}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={selectedSpecialty === specialty ? "bg-[#26A69A] hover:bg-[#26A69A]/90" : ""}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLawyers.map((lawyer) => (
            <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2A44]">{lawyer.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4" />
                      <span>{lawyer.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{lawyer.rating}</span>
                      <span className="text-sm text-gray-500">({lawyer.reviewCount})</span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {lawyer.experience} {language === 'ar' ? 'سنة خبرة' : 'years exp.'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'التخصصات:' : 'Specialties:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.specialty.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'اللغات:' : 'Languages:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{lawyer.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="text-lg font-bold text-[#26A69A]">${lawyer.pricePerSession}</span>
                      <span className="text-sm text-gray-500">/{language === 'ar' ? '30 دقيقة' : '30min'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600 font-medium">{lawyer.availability}</p>
                      <Button 
                        onClick={() => handleBookConsultation(lawyer)}
                        className="mt-1 bg-[#1F2A44] hover:bg-[#1F2A44]/90"
                        size="sm"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLawyers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                {language === 'ar' ? 'لم يتم العثور على محامين يطابقون معايير البحث' : 'No lawyers found matching your search criteria'}
              </p>
              <Button 
                onClick={() => {
                  setSearchLocation('');
                  setSelectedSpecialty('');
                }}
                variant="outline"
                className="mt-4"
              >
                {language === 'ar' ? 'مسح التصفية' : 'Clear Filters'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'تأكيد الموعد' : 'Confirm Appointment'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-[#1F2A44]">{selectedLawyer.name}</h3>
                <p className="text-sm text-gray-600">{selectedLawyer.location}</p>
                <p className="text-lg font-bold text-[#26A69A] mt-2">
                  ${selectedLawyer.pricePerSession}/{language === 'ar' ? '30 دقيقة' : '30min'}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">
                  {language === 'ar' ? 'تفاصيل الاستشارة:' : 'Consultation Details:'}
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>{language === 'ar' ? 'النوع: استشارة قانونية عامة' : 'Type: General legal consultation'}</p>
                  <p>{language === 'ar' ? 'المدة: 30 دقيقة' : 'Duration: 30 minutes'}</p>
                  <p>{language === 'ar' ? 'الطريقة: مكتب أو اتصال مرئي' : 'Method: Office or video call'}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => setSelectedLawyer(null)}
                  variant="outline"
                  className="flex-1"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button 
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-[#26A69A] hover:bg-[#26A69A]/90"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Lawyers;
