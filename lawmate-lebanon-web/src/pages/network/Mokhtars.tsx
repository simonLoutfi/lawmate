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

interface Mokhtar {
  id: string;
  name: string;
  specialty: string[];
  location: string;
  municipality: string;
  rating: number;
  reviewCount: number;
  pricePerSession: number;
  phone: string;
  availability: string;
  languages: string[];
  experience: number;
  description: string;
}

const Mokhtars = () => {
   const { language } = useLanguage();
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedMokhtar, setSelectedMokhtar] = useState<Mokhtar | null>(null);
  const [mokhtars, setMokhtars] = useState<Mokhtar[]>([]);

  useEffect(() => {
    const fetchMokhtars = async () => {
      try {
        const res = await networkAPI.getMokhtars();
        setMokhtars(
          res.data.map((mokhtar: any) => ({
            id: mokhtar.id,
            name: `${mokhtar.firstName} ${mokhtar.lastName}`,
            specialty: [], // Add if you have in DB
            location: mokhtar.businessName || '',
            municipality: mokhtar.mokhtarOffice || '',
            rating: 0,
            reviewCount: 0,
            pricePerSession: 0,
            phone: '',
            availability: '',
            languages: [],
            experience: 0,
            description: '',
          }))
        );
      } catch (err) {
        // handle error
      }
    };
    fetchMokhtars();
  }, [language]);

  const municipalities = language === 'ar' ? [
    'الكل',
    'بيروت',
    'طرابلس',
    'صيدا',
    'زحلة',
    'جونيه',
    'بعلبك',
    'صور',
    'النبطية',
    'بشري',
    'جبيل',
    'عاليه'
  ] : [
    'All',
    'Beirut',
    'Tripoli',
    'Sidon',
    'Zahle',
    'Jounieh',
    'Baalbek',
    'Tyre',
    'Nabatieh',
    'Bcharre',
    'Byblos',
    'Aley'
  ];

  const filteredMokhtars = mokhtars.filter(mokhtar => {
    const matchesLocation = searchLocation === '' || mokhtar.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesMunicipality = selectedMunicipality === '' || selectedMunicipality === municipalities[0] || 
      mokhtar.municipality.toLowerCase().includes(selectedMunicipality.toLowerCase());
    return matchesLocation && matchesMunicipality;
  });

  const handleBookConsultation = (mokhtar: Mokhtar) => {
    setSelectedMokhtar(mokhtar);
    toast({
      title: language === 'ar' ? 'طلب استشارة' : 'Consultation Request',
      description: language === 'ar' ? `تم إرسال طلب استشارة إلى ${mokhtar.name}` : `Consultation request sent to ${mokhtar.name}`,
    });
  };

  const handleConfirmBooking = () => {
    toast({
      title: language === 'ar' ? 'تم تأكيد الموعد' : 'Appointment Confirmed',
      description: language === 'ar' ? 'سيتم إرسال تفاصيل الموعد عبر الرسائل القصيرة' : 'Appointment details will be sent via SMS',
    });
    setSelectedMokhtar(null);
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
                {language === 'ar' ? 'شبكة المختارين' : 'Mokhtars Network'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ar' ? 'تواصل مع المختارين المعتمدين في لبنان' : 'Connect with certified Mokhtars in Lebanon'}
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
                {municipalities.map((municipality) => (
                  <Button
                    key={municipality}
                    variant={selectedMunicipality === municipality ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMunicipality(municipality)}
                    className={selectedMunicipality === municipality ? "bg-[#26A69A] hover:bg-[#26A69A]/90" : ""}
                  >
                    {municipality}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMokhtars.map((mokhtar) => (
            <Card key={mokhtar.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2A44]">{mokhtar.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mokhtar.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4" />
                      <span>{mokhtar.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{mokhtar.rating}</span>
                      <span className="text-sm text-gray-500">({mokhtar.reviewCount})</span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {mokhtar.experience} {language === 'ar' ? 'سنة خبرة' : 'years exp.'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'البلدية:' : 'Municipality:'}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {mokhtar.municipality}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'اللغات:' : 'Languages:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {mokhtar.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{mokhtar.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="text-lg font-bold text-[#26A69A]">${mokhtar.pricePerSession}</span>
                      <span className="text-sm text-gray-500">/{language === 'ar' ? '30 دقيقة' : '30min'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600 font-medium">{mokhtar.availability}</p>
                      <Button 
                        onClick={() => handleBookConsultation(mokhtar)}
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

        {filteredMokhtars.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                {language === 'ar' ? 'لم يتم العثور على مختارين يطابقون معايير البحث' : 'No Mokhtars found matching your search criteria'}
              </p>
              <Button 
                onClick={() => {
                  setSearchLocation('');
                  setSelectedMunicipality('');
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
      {selectedMokhtar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'تأكيد الموعد' : 'Confirm Appointment'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-[#1F2A44]">{selectedMokhtar.name}</h3>
                <p className="text-sm text-gray-600">{selectedMokhtar.location}</p>
                <p className="text-lg font-bold text-[#26A69A] mt-2">
                  ${selectedMokhtar.pricePerSession}/{language === 'ar' ? '30 دقيقة' : '30min'}
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
                  onClick={() => setSelectedMokhtar(null)}
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

export default Mokhtars;
