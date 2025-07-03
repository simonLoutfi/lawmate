
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: '📝',
      title: 'AI Contract Generator',
      description: 'Create professional contracts in Arabic or English, tailored to Lebanese law',
      details: [
        'Employment contracts',
        'Service agreements', 
        'Non-disclosure agreements',
        'Partnership agreements',
        'Lease contracts'
      ]
    },
    {
      icon: '💬',
      title: 'Legal Chatbot (24/7)',
      description: 'Get instant answers to your legal questions anytime, anywhere',
      details: [
        'Lebanese business law guidance',
        'Contract interpretation',
        'Compliance requirements',
        'Legal terminology explained',
        'Step-by-step procedures'
      ]
    },
    {
      icon: '🔍',
      title: 'Document Review',
      description: 'AI-powered analysis to identify risks and suggest improvements',
      details: [
        'Risk assessment',
        'Legal compliance check',
        'Missing clause detection',
        'Language optimization',
        'Protection recommendations'
      ]
    },
    {
      icon: '⚠️',
      title: 'Compliance Alerts',
      description: 'Stay updated with changing Lebanese regulations and deadlines',
      details: [
        'Tax law updates',
        'Labor law changes',
        'Business registration renewals',
        'Custom alert settings',
        'Deadline reminders'
      ]
    },
    {
      icon: '📋',
      title: 'Customizable Templates',
      description: 'Pre-built templates that you can customize for your specific needs',
      details: [
        'Industry-specific contracts',
        'Your company branding',
        'Reusable templates',
        'Version control',
        'Team collaboration'
      ]
    },
    {
      icon: '🔒',
      title: 'Secure & Confidential',
      description: 'Bank-level security to protect your sensitive legal documents',
      details: [
        'End-to-end encryption',
        'Secure cloud storage',
        'Access controls',
        'Audit trails',
        'GDPR compliant'
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-lawmate-light to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-lawmate-blue mb-6">
              Powerful AI Legal Tools
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Everything you need to handle legal matters for your Lebanese business, 
              powered by artificial intelligence and designed for simplicity.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-lawmate-blue hover:bg-lawmate-blue/90">
                Try All Features Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-lawmate-blue">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-500 flex items-center">
                        <span className="text-lawmate-gold mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-4 bg-lawmate-blue hover:bg-lawmate-blue/90"
                    onClick={() => window.open('/signup', '_blank')}
                  >
                    Try This Feature
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-lawmate-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-lawmate-blue mb-4">
              See LawMate in Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how easy it is to generate your first contract
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-lawmate-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-lawmate-blue">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lawmate-blue mb-2">Choose Your Contract Type</h3>
                  <p className="text-gray-600">Select from employment, service, partnership, or other contract types</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-lawmate-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-lawmate-blue">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lawmate-blue mb-2">Fill Simple Form</h3>
                  <p className="text-gray-600">Answer a few questions about your specific needs and requirements</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-lawmate-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-lawmate-blue">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lawmate-blue mb-2">Get Professional Contract</h3>
                  <p className="text-gray-600">Download your legally compliant contract in Arabic or English</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/signup">
                <Button size="lg" className="bg-lawmate-blue hover:bg-lawmate-blue/90">
                  Generate Your First Contract
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lawmate-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join hundreds of Lebanese businesses using LawMate for their legal needs
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-lawmate-gold text-lawmate-blue hover:bg-lawmate-gold/90">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;
