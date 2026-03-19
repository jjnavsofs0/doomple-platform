import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Get Started | Doomple Technologies',
  description: 'Start your digital transformation journey with Doomple. Tell us about your project and we\'ll get back to you within 24 hours.',
};

export default function GetStartedPage() {
  const steps = [
    {
      step: '01',
      title: 'Tell Us About Your Project',
      description: 'Share your requirements, goals, and timeline through our contact form.',
    },
    {
      step: '02',
      title: 'Discovery Call',
      description: 'We schedule a call within 24 hours to understand your needs in detail.',
    },
    {
      step: '03',
      title: 'Custom Proposal',
      description: 'Receive a tailored proposal with solution design, timeline, and pricing.',
    },
    {
      step: '04',
      title: 'Kick Off',
      description: 'Once aligned, we onboard your team and start building immediately.',
    },
  ];

  const highlights = [
    '24-hour initial response guarantee',
    'No obligation consultation',
    'Fixed-price or flexible engagement models',
    'Experienced team across all technology domains',
    'Transparent process from day one',
    'Post-launch support included',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-teal-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">Get Started</h1>
          <p className="text-2xl text-blue-100 max-w-2xl mx-auto mb-8">
            Let&apos;s Build Something Great Together
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Whether you have a fully defined project or just an idea, we&apos;re ready to help you turn it into reality.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* What to Expect */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What to Expect</h2>
            <ul className="space-y-4">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-blue-600 to-teal-500 text-white rounded-2xl p-10 shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Ready to Talk?</h3>
            <p className="text-blue-100 mb-8 leading-relaxed">
              Reach out via our contact form and a member of our team will respond within 24 hours to schedule a discovery call.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contact Us Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="text-center text-blue-200 text-sm mt-6">
              Or explore our{' '}
              <Link href="/services" className="underline hover:text-white">
                services
              </Link>{' '}
              and{' '}
              <Link href="/solutions" className="underline hover:text-white">
                solutions
              </Link>{' '}
              first.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
