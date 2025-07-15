import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle, FileText, Users, Scale, CheckCircle, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMediaQuery } from 'react-responsive';

const Index = () => {
  const { t, language } = useLanguage();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const services = [
    {
      title: t('services.contract'),
      description: language === 'ar' ? 'مراجعة وتحليل العقود بالذكاء الاصطناعي' : 'AI-powered contract review and analysis',
      icon: FileText,
      route: '/services/contract',
      color: 'bg-blue-500'
    },
    {
      title: t('services.document'),
      description: language === 'ar' ? 'صياغة الوثائق القانونية المخصصة' : 'Custom legal document drafting',
      icon: Scale,
      route: '/services/document',
      color: 'bg-green-500'
    },
    {
      title: t('services.dispute'),
      description: language === 'ar' ? 'أدوات حل النزاعات والمطالبات' : 'Dispute resolution and claims tools',
      icon: Users,
      route: '/services/dispute',
      color: 'bg-purple-500'
    },
    {
      title: t('services.ai'),
      description: language === 'ar' ? 'مساعد ذكي متوفر 24/7' : '24/7 AI legal assistant',
      icon: MessageCircle,
      route: '/ask',
      color: 'bg-[#26A69A]'
    }
  ];

  const features = [
    language === 'ar' ? 'توليد العقود بالذكاء الاصطناعي' : 'AI contract generation',
    language === 'ar' ? 'استشارات قانونية فورية' : 'Instant legal consultations',
    language === 'ar' ? 'شبكة المختارين المحليين' : 'Local Mokhtar network',
    language === 'ar' ? 'مراجعة الوثائق القانونية' : 'Legal document review'
  ];

  if (isMobile) {
    return (
      <div className="bg-white min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Mobile Hero Section */}
  <div className="pb-16">
  {/* Hero Section - App-like Header */}
  <section className="px-4 pt-6 pb-8 bg-gradient-to-br from-white via-gray-50/50 to-[#26A69A]/5">
    <div className="mx-auto">
      <h1 className="font-bold text-xl text-[#1F2A44] mb-3 text-center">
        {t('hero.title')}
      </h1>
      
      <p className="text-sm text-gray-600 mb-5 text-center px-2">
        {t('hero.subtitle')}
      </p>

      {/* App-like feature chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-5 px-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* App-like buttons */}
      <div className="flex flex-col gap-2 mb-5 px-2">
        <Link to="/signup">
          <button className="w-full bg-[#26A69A] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center">
            {t('hero.startFree')}
            <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
          </button>
        </Link>
        <button 
          className="w-full border border-gray-300 py-3 rounded-lg font-semibold text-sm"
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t('hero.howItWorks')}
        </button>
      </div>

      {/* App-like rating */}
      <div className="flex flex-col items-center gap-1 text-gray-500 text-xs">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
          ))}
          <span className="ml-1">{language === 'ar' ? '٤.٩' : '4.9'}</span>
        </div>
        <span>{language === 'ar' ? '١٠٠٠+ مستخدم' : '1000+ users'}</span>
      </div>
    </div>
  </section>

  {/* Services - App-like Card Grid */}
  <section className="px-3 py-5 bg-white">
    <h2 className="font-bold text-lg text-[#1F2A44] mb-4 px-2">
      {language === 'ar' ? 'الخدمات القانونية' : 'Legal Services'}
    </h2>
    
    <div className="grid grid-cols-2 gap-2">
      {services.map((service, index) => (
        <Link 
          key={index} 
          to={service.route}
          className="p-3 bg-white rounded-lg border border-gray-100 shadow-xs"
        >
          <div className={`w-8 h-8 ${service.color} rounded-lg flex items-center justify-center mb-2`}>
            <service.icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-[#1F2A44] text-sm mb-1">{service.title}</h3>
          <p className="text-gray-500 text-xs line-clamp-2">{service.description}</p>
        </Link>
      ))}
    </div>
  </section>

  {/* How It Works - App-like Steps */}
  <section id="how-it-works" className="px-4 py-6 bg-gray-50">
    <h2 className="font-bold text-lg text-[#1F2A44] mb-5 text-center">
      {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
    </h2>
    
    <div className="space-y-4">
      {[
        {
          step: '1',
          title: language === 'ar' ? 'اطرح سؤالك' : 'Ask your question',
          description: language === 'ar' ? 'صف مشكلتك بكلمات بسيطة' : 'Describe your issue simply'
        },
        {
          step: '2', 
          title: language === 'ar' ? 'معالجة الذكاء الاصطناعي' : 'AI Processing',
          description: language === 'ar' ? 'تحليل طلبك وإعداد الحل' : 'We analyze and prepare solution'
        },
        {
          step: '3',
          title: language === 'ar' ? 'احصل على النتيجة' : 'Get Results', 
          description: language === 'ar' ? 'وثيقتك جاهزة للتحميل' : 'Download your document'
        }
      ].map((item, index) => (
        <div key={index} className="flex items-start">
          <div className="w-8 h-8 bg-[#26A69A] rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
            <span className="text-sm font-bold text-white">{item.step}</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1F2A44] text-sm">{item.title}</h3>
            <p className="text-gray-500 text-xs">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>

  {/* Final CTA - App-like Bottom Banner */}
  <section className="fixed bottom-0 left-0 right-0 bg-[#1F2A44] text-white px-4 py-3 shadow-up">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium">
          {language === 'ar' ? 'ابدأ مجاناً الآن' : 'Start free now'}
        </p>
        <p className="text-[10px] text-gray-300">
          {language === 'ar' ? 'لا تتطلب بطاقة ائتمان' : 'No credit card required'}
        </p>
      </div>
      <Link to="/signup">
        <button className="bg-[#26A69A] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
          {language === 'ar' ? 'تسجيل' : 'Sign Up'}
          <ArrowRight className={`h-3 w-3 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
        </button>
      </Link>
    </div>
  </section>
</div>
      </div>
    );
  }

  // Original desktop view
  return (
    <div className="bg-white min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-gray-50/50 to-[#26A69A]/5 section-padding">
        <div className="container-spacing">
          <div className="text-center max-w-5xl mx-auto animate-fade-in">
            {/* Main Headline */}
            <h1 className="font-bold text-[#1F2A44] mb-8 leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              {t('hero.subtitle')}
            </p>

            {/* Feature List */}
            <div className="flex flex-wrap justify-center gap-3 mb-16 animate-slide-up">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center bg-green-50 text-green-700 px-5 py-3 rounded-full text-sm font-medium border border-green-100 hover:bg-green-100 transition-colors">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-scale-in">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="btn-primary text-lg px-12 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto min-h-[60px] touch-target">
                  {t('hero.startFree')}
                  <ArrowRight className={`h-6 w-6 ${language === 'ar' ? 'mr-3 rotate-180' : 'ml-3'} transition-transform group-hover:translate-x-1`} />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary text-lg px-12 py-6 rounded-xl font-semibold w-full sm:w-auto min-h-[60px] touch-target"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.howItWorks')}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500 text-sm font-medium">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2" role="img" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>{language === 'ar' ? '٤.٩ من ٥ نجوم' : '4.9/5 stars'}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span>{language === 'ar' ? 'أكثر من ١٠٠٠ مستخدم' : '1000+ users'}</span>
              <span className="hidden sm:inline">•</span>
              <span>{language === 'ar' ? 'متوافق مع القانون اللبناني' : 'Lebanese law compliant'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-spacing">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-bold text-[#1F2A44] mb-8 tracking-tight">
              {language === 'ar' ? 'كل ما تحتاجه قانونياً' : 'Everything you need legally'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {language === 'ar' ? 'أدوات قانونية ذكية مصممة خصيصاً للسوق اللبناني' : 'Smart legal tools designed specifically for the Lebanese market'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {services.map((service, index) => (
              <Link key={index} to={service.route} className="group">
                <Card className="card-hover card-interactive p-8 h-full border-0 shadow-lg bg-white rounded-2xl group-focus:ring-2 group-focus:ring-[#26A69A] group-focus:ring-offset-2">
                  <CardContent className="pt-0 h-full flex flex-col">
                    <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1F2A44] mb-6 group-hover:text-[#26A69A] transition-colors">{service.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8 flex-grow">{service.description}</p>
                    <div className="flex items-center text-[#26A69A] font-semibold text-lg group-hover:translate-x-2 transition-transform">
                      <span>{language === 'ar' ? 'ابدأ الآن' : 'Get started'}</span>
                      <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="container-spacing">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-bold text-[#1F2A44] mb-8 tracking-tight">
              {language === 'ar' ? 'بساطة في ٣ خطوات' : 'Simple in 3 steps'}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {language === 'ar' ? 'من السؤال إلى الحل في دقائق' : 'From question to solution in minutes'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                step: '1',
                title: language === 'ar' ? 'اطرح سؤالك' : 'Ask your question',
                description: language === 'ar' ? 'اوصف مشكلتك القانونية بكلمات بسيطة' : 'Describe your legal issue in simple words'
              },
              {
                step: '2', 
                title: language === 'ar' ? 'دع الذكاء الاصطناعي يعمل' : 'Let AI work',
                description: language === 'ar' ? 'نحلل طلبك ونولد الحل المناسب' : 'We analyze your request and generate the right solution'
              },
              {
                step: '3',
                title: language === 'ar' ? 'احصل على النتيجة' : 'Get your result', 
                description: language === 'ar' ? 'حمل وثيقتك أو تواصل مع محامي' : 'Download your document or connect with a lawyer'
              }
            ].map((item, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-24 h-24 bg-gradient-to-br from-[#26A69A] to-[#26A69A]/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg hover:scale-110 transition-transform">
                  <span className="text-4xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#1F2A44] mb-6">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gray-50">
        <div className="container-spacing">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-bold text-[#1F2A44] mb-8 tracking-tight">
              {language === 'ar' ? 'محبوب من المستخدمين' : 'Loved by users'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                name: 'أحمد خليل',
                role: language === 'ar' ? 'مؤسس شركة تقنية، بيروت' : 'Tech Startup Founder, Beirut',
                quote: language === 'ar' ? 
                  '"وفر علي آلاف الدولارات في الرسوم القانونية. الوثائق مهنية ومتوافقة مع القانون اللبناني."' :
                  '"Saved me thousands in legal fees. Documents are professional and Lebanese law compliant."'
              },
              {
                name: 'لارا منصور', 
                role: language === 'ar' ? 'مصممة مستقلة' : 'Freelance Designer',
                quote: language === 'ar' ? 
                  '"المساعد الذكي متوفر ٢٤/٧ ويجيب على كل استفساراتي القانونية بسرعة."' :
                  '"The AI assistant is available 24/7 and answers all my legal questions quickly."'
              },
              {
                name: 'نادية خوري',
                role: language === 'ar' ? 'صاحبة مطعم، طرابلس' : 'Restaurant Owner, Tripoli', 
                quote: language === 'ar' ? 
                  '"تنبيهات الامتثال تساعدني في متابعة اللوائح المتغيرة. أنصح به بشدة!"' :
                  '"Compliance alerts help me stay updated with changing regulations. Highly recommended!"'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="card-hover p-8 border-0 shadow-lg bg-white rounded-2xl animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-0">
                  <div className="text-yellow-400 text-2xl mb-6" role="img" aria-label="5 star rating">★★★★★</div>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed font-medium">{testimonial.quote}</p>
                  <div className="font-bold text-[#1F2A44] text-lg mb-2">{testimonial.name}</div>
                  <div className="text-gray-500 font-medium">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-br from-[#1F2A44] to-[#1F2A44]/90 text-white">
        <div className="container-spacing text-center animate-fade-in">
          <h2 className="font-bold mb-8 tracking-tight">
            {language === 'ar' ? 'ابدأ رحلتك القانونية اليوم' : 'Start your legal journey today'}
          </h2>
          <p className="text-xl mb-16 text-gray-200 leading-relaxed max-w-3xl mx-auto">
            {language === 'ar' ? 
              'انضم لمئات رواد الأعمال اللبنانيين الذين يثقون بـ LawMate' :
              'Join hundreds of Lebanese entrepreneurs who trust LawMate'
            }
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-[#26A69A] text-white hover:bg-[#26A69A]/90 text-xl px-16 py-8 rounded-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all min-h-[72px] touch-target">
              {language === 'ar' ? 'ابدأ مجاناً الآن' : 'Start free now'}
              <ArrowRight className={`h-6 w-6 ${language === 'ar' ? 'mr-3 rotate-180' : 'ml-3'}`} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;