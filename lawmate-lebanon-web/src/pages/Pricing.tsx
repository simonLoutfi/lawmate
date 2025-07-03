
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started',
      features: [
        '3 contract generations per month',
        'Basic chatbot access',
        'Standard templates',
        'Community support',
        'Basic document review'
      ],
      limitations: [
        'Limited contract types',
        'No compliance alerts',
        'No custom branding'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Starter',
      monthlyPrice: 29,
      yearlyPrice: 290,
      description: 'For growing small businesses',
      features: [
        'Unlimited contract generations',
        'Advanced AI chatbot (24/7)',
        'All contract templates',
        'Document review with suggestions',
        'Email support',
        'Basic compliance alerts',
        'Arabic & English support'
      ],
      limitations: [
        'No custom templates',
        'No priority support'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Pro',
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: 'For established businesses',
      features: [
        'Everything in Starter',
        'Advanced compliance monitoring',
        'Custom template creation',
        'Priority support (2-hour response)',
        'Team collaboration (up to 5 users)',
        'API access',
        'Custom branding',
        'Advanced analytics',
        'Legal consultation credits (2 hours/month)'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      popular: false
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-lawmate-light to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-lawmate-blue mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. All plans include our core AI features with no hidden fees.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`${!isYearly ? 'text-lawmate-blue font-semibold' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-lawmate-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`${isYearly ? 'text-lawmate-blue font-semibold' : 'text-gray-500'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="bg-lawmate-gold text-lawmate-blue px-2 py-1 rounded-full text-sm font-semibold">
                  Save 17%
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative h-full ${
                  plan.popular ? 'border-2 border-lawmate-gold shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-lawmate-gold text-lawmate-blue px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-lawmate-blue">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-lawmate-blue">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="font-semibold text-lawmate-blue mb-2">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2 flex-shrink-0 mt-1">✓</span>
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-400 mb-2">Not included:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-gray-300 mr-2 flex-shrink-0 mt-1">✗</span>
                              <span className="text-sm text-gray-400">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link to="/signup" className="block">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-lawmate-blue hover:bg-lawmate-blue/90' 
                          : 'bg-white border border-lawmate-blue text-lawmate-blue hover:bg-lawmate-blue hover:text-white'
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-lawmate-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-lawmate-blue mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lawmate-blue mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged prorated amounts.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lawmate-blue mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lawmate-blue mb-2">
                Are the contracts legally binding in Lebanon?
              </h3>
              <p className="text-gray-600">
                Yes, our AI generates contracts that comply with Lebanese law. However, for complex legal matters, we recommend consulting with a qualified lawyer.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lawmate-blue mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              <strong>Legal Disclaimer:</strong> LawMate provides AI-generated legal documents and information for general guidance only. 
              This does not constitute legal advice and should not replace consultation with qualified legal professionals for complex matters.
            </p>
            <p>
              All contracts and documents generated comply with Lebanese law as of the last update, but laws may change. 
              Users are responsible for ensuring current legal compliance.
            </p>
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
            Join hundreds of Lebanese businesses saving time and money with LawMate
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-lawmate-gold text-lawmate-blue hover:bg-lawmate-gold/90">
              Start Your Free Trial Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
