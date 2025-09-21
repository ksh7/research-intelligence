import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Database,
  PieChart,
  Target,
  Award,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';

export function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Powered by Tableau and modern BI tools for deep insights into your research data'
    },
    {
      icon: Users,
      title: 'Easy Data Collection',
      description: 'Create beautiful surveys and forms that participants love to complete'
    },
    {
      icon: Shield,
      title: 'Research Ethics Compliant',
      description: 'Built-in consent management and data privacy controls for ethical research'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Share your research globally with secure, accessible public forms'
    },
    {
      icon: Zap,
      title: 'Real-time Insights',
      description: 'Watch your data come alive with real-time dashboards and visualizations'
    },
    {
      icon: Database,
      title: 'Secure Data Storage',
      description: 'Enterprise-grade security with automatic backups and compliance'
    }
  ];

  const stats = [
    { number: '10+', label: 'Universities' },
    { number: '50+', label: 'Researchers' },
    { number: '1M+', label: 'Research Responses' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const pricingPlans = [
    {
      name: 'University',
      price: '$999',
      period: 'per month',
      description: 'Ideal for university departments and research teams',
      features: [
        'Unlimited research projects',
        'Advanced Tableau integration',
        'Custom branding',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'API access',
        'Custom domains'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large institutions with complex research needs',
      features: [
        'Everything in Department',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'On-premise deployment',
        'Training & onboarding',
        'SLA guarantee',
        'White-label solution'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Durkheim Intelligence</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/signin" className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </Link>
                  <Link to="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your
              <span className="text-blue-600 block">Social Research</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empower universities and researchers with cutting-edge tools for data collection, 
              analysis, and insights. Powered by Tableau and modern Business Intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Start Free Research
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Research Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From data collection to advanced analytics, we provide the complete toolkit 
              for modern social research.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Intelligence Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Powered by Industry-Leading 
                <span className="text-blue-600 block">Business Intelligence</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform integrates seamlessly with Tableau, Power BI, and other leading 
                analytics tools to transform your research data into actionable insights.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Native Tableau integration for advanced visualizations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Real-time dashboards and automated reporting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Statistical analysis and predictive modeling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Custom KPIs and research metrics</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Tableau</h3>
                <p className="text-sm text-gray-600">Advanced Analytics</p>
              </Card>
              <Card className="p-6 text-center">
                <PieChart className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Power BI</h3>
                <p className="text-sm text-gray-600">Business Intelligence</p>
              </Card>
              <Card className="p-6 text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">R & Python</h3>
                <p className="text-sm text-gray-600">Statistical Computing</p>
              </Card>
              <Card className="p-6 text-center">
                <Database className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">SQL Analytics</h3>
                <p className="text-sm text-gray-600">Data Processing</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Research Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From individual researchers to large institutions, we have the perfect plan 
              to accelerate your research impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative p-8 ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period !== 'pricing' && (
                        <span className="text-gray-600 ml-1">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'primary' : 'secondary'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Universities
            </h2>
            <p className="text-xl text-gray-600">
              See how researchers worldwide are transforming their work with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Dr. Sarah Johnson</h4>
                    <p className="text-sm text-gray-600">ABC University</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "The Tableau integration has revolutionized how we analyze social behavior data. 
                  What used to take weeks now takes hours."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Prof. Michael Chen</h4>
                    <p className="text-sm text-gray-600">ABC University</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "Our research productivity has increased 300% since adopting this platform. 
                  The analytics capabilities are unmatched."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Lightbulb className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Dr. Emily Rodriguez</h4>
                    <p className="text-sm text-gray-600">ABC University</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "The ease of creating surveys and the powerful analytics have made our 
                  longitudinal studies more efficient than ever."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of researchers who are already using our platform to 
            accelerate their social research and generate impactful insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
            <Button size="lg" variant="ghost" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Durkheim Intelligence</span>
              </div>
              <p className="text-gray-400">
                Empowering universities and researchers with cutting-edge tools for social research.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Research Papers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Durkheim Intelligence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}