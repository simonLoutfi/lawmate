
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, MessageCircle, Users, Scale, ChevronDown } from 'lucide-react';

const Navigation = () => {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();

  const services = [
    {
      title: language === 'ar' ? 'مراجعة العقود' : 'Contract Review',
      href: '/services/contract',
      description: language === 'ar' ? 'مراجعة وتحليل العقود بالذكاء الاصطناعي' : 'AI-powered contract review and analysis',
      icon: FileText
    },
    {
      title: language === 'ar' ? 'صياغة الوثائق' : 'Document Drafting',
      href: '/services/document',
      description: language === 'ar' ? 'صياغة الوثائق القانونية المخصصة' : 'Custom legal document drafting',
      icon: Scale
    },
    {
      title: language === 'ar' ? 'الدليل العام' : 'General Guide',
      href: '/services/general-guide',
      description: language === 'ar' ? 'دليل شامل للقوانين اللبنانية' : 'Comprehensive guide to Lebanese law',
      icon: FileText
    }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 shadow-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container-spacing">
        <div className="flex justify-between items-center h-18 py-2">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group touch-target"
            aria-label={language === 'ar' ? 'الصفحة الرئيسية لـ LawMate' : 'LawMate homepage'}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#26A69A] to-[#26A69A]/80 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">LM</span>
            </div>
            <span className="text-2xl font-bold text-[#1F2A44] hidden sm:block group-hover:text-[#26A69A] transition-colors">LawMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-[#26A69A] font-medium text-base py-3 px-4 touch-target transition-colors">
                    {language === 'ar' ? 'الخدمات' : 'Services'}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white shadow-xl rounded-xl border">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-br from-[#26A69A]/10 to-[#26A69A]/20 p-6 no-underline outline-none focus:shadow-md focus:ring-2 focus:ring-[#26A69A] hover:bg-gradient-to-br hover:from-[#26A69A]/15 hover:to-[#26A69A]/25 transition-all"
                            to="/services"
                          >
                            <Scale className="h-8 w-8 text-[#26A69A] mb-2" />
                            <div className="mb-2 mt-4 text-lg font-semibold text-[#1F2A44]">
                              {language === 'ar' ? 'الخدمات القانونية' : 'Legal Services'}
                            </div>
                            <p className="text-sm leading-tight text-gray-600">
                              {language === 'ar' ? 'خدمات قانونية شاملة بتقنية الذكاء الاصطناعي' : 'Comprehensive legal services powered by AI'}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      {services.map((service) => (
                        <NavigationMenuLink key={service.href} asChild>
                          <Link
                            to={service.href}
                            className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-[#26A69A] touch-target"
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <service.icon className="h-5 w-5 text-[#26A69A]" />
                              <div className="text-sm font-semibold leading-none text-[#1F2A44]">{service.title}</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              {service.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    to="/ask" 
                    className="text-gray-700 hover:text-[#26A69A] transition-colors font-medium text-base py-3 px-4 rounded-lg hover:bg-gray-50 touch-target"
                  >
                    {language === 'ar' ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    to="/network/mokhtars" 
                    className="text-gray-700 hover:text-[#26A69A] transition-colors font-medium text-base py-3 px-4 rounded-lg hover:bg-gray-50 touch-target"
                  >
                    {language === 'ar' ? 'شبكة المختارين' : 'Mokhtar Network'}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    to="/pricing" 
                    className="text-gray-700 hover:text-[#26A69A] transition-colors font-medium text-base py-3 px-4 rounded-lg hover:bg-gray-50 touch-target"
                  >
                    {language === 'ar' ? 'الأسعار' : 'Pricing'}
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="hidden sm:flex text-gray-700 hover:text-[#26A69A] hover:bg-gray-50 font-medium px-4 py-2 touch-target transition-colors"
              aria-label={language === 'ar' ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-700 hover:text-[#26A69A] hover:bg-gray-50 font-medium px-6 py-2 touch-target transition-colors"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  size="sm" 
                  className="btn-primary text-sm px-6 py-2 touch-target"
                >
                  {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
