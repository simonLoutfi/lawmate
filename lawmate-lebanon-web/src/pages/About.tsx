
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-lawmate-light to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-lawmate-blue mb-6">
              Making Legal Services Accessible to Every Lebanese Business
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Our mission is to democratize legal services in Lebanon by providing AI-powered tools 
              that make professional legal assistance affordable and accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-lawmate-blue mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  In Lebanon, small businesses and freelancers often struggle with legal compliance 
                  due to high costs and complexity of traditional legal services. Many operate without 
                  proper contracts or legal protection simply because they can't afford it.
                </p>
                <p>
                  LawMate was created to bridge this gap by leveraging artificial intelligence to 
                  provide professional-grade legal assistance at a fraction of traditional costs. 
                  Our platform makes Lebanese law accessible to everyone, regardless of their 
                  legal knowledge or budget.
                </p>
                <p>
                  We believe that every business owner deserves legal protection and compliance 
                  support to help them succeed and grow with confidence.
                </p>
              </div>
            </div>
            <div className="bg-lawmate-light rounded-lg p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-lawmate-blue mb-4">
                  Legal Access for All
                </h3>
                <p className="text-gray-600">
                  Empowering Lebanese entrepreneurs with AI-powered legal tools that are 
                  affordable, accurate, and always available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lebanese Context */}
      <section className="py-16 bg-lawmate-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-lawmate-blue mb-4">
              Built for Lebanon
            </h2>
            <p className="text-xl text-gray-600">
              Understanding local laws, culture, and business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🇱🇧</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Lebanese Law Expertise</h3>
                <p className="text-gray-600 text-sm">
                  Our AI is trained on Lebanese legal frameworks, ensuring all documents 
                  comply with local regulations and requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🗣️</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Arabic & English</h3>
                <p className="text-gray-600 text-sm">
                  Generate contracts and get legal advice in both Arabic and English, 
                  reflecting Lebanon's bilingual business environment.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Local Business Focus</h3>
                <p className="text-gray-600 text-sm">
                  Designed specifically for Lebanese SMEs, startups, and freelancers 
                  with industry-specific templates and guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-lawmate-blue mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Legal experts and technology innovators working together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-lawmate-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">AS</span>
                </div>
                <h3 className="font-semibold text-lawmate-blue mb-1">Ahmad Saab</h3>
                <p className="text-sm text-gray-500 mb-2">Co-founder & CEO</p>
                <p className="text-sm text-gray-600">
                  Lebanese lawyer with 10+ years experience helping small businesses navigate legal challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-lawmate-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">LK</span>
                </div>
                <h3 className="font-semibold text-lawmate-blue mb-1">Layla Khoury</h3>
                <p className="text-sm text-gray-500 mb-2">Co-founder & CTO</p>
                <p className="text-sm text-gray-600">
                  AI engineer with expertise in natural language processing and legal technology.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-lawmate-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">MF</span>
                </div>
                <h3 className="font-semibold text-lawmate-blue mb-1">Michel Fares</h3>
                <p className="text-sm text-gray-500 mb-2">Legal Advisor</p>
                <p className="text-sm text-gray-600">
                  Senior partner at leading Beirut law firm, specializing in business law and compliance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-lawmate-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-lawmate-blue mb-4">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Accessibility</h3>
                <p className="text-sm text-gray-600">
                  Making legal services available to everyone, regardless of background or budget.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Trust</h3>
                <p className="text-sm text-gray-600">
                  Building confidence through accurate, reliable, and secure legal solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Innovation</h3>
                <p className="text-sm text-gray-600">
                  Leveraging cutting-edge AI to solve traditional legal challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-semibold text-lawmate-blue mb-2">Empowerment</h3>
                <p className="text-sm text-gray-600">
                  Giving entrepreneurs the tools they need to succeed and grow confidently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lawmate-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Be part of the legal technology revolution in Lebanon
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-lawmate-gold text-lawmate-blue hover:bg-lawmate-gold/90">
                Start Using LawMate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-lawmate-blue">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
