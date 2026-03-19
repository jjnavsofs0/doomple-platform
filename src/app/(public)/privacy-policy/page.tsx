import { Metadata } from 'next';
import { COOKIE_POLICY_VERSION } from '@/lib/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Doomple Technologies',
  description: 'Our privacy policy explaining how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: March 17, 2026</p>
        <div className="mb-8 rounded-2xl border border-[#D9E8F6] bg-[#F8FBFF] px-5 py-4 text-sm leading-6 text-[#52637A]">
          <p className="font-semibold text-[#042042]">GDPR cookie consent version</p>
          <p className="mt-1">
            Cookie consent on Doomple is currently recorded against policy version{" "}
            <span className="font-semibold text-[#042042]">{COOKIE_POLICY_VERSION}</span>.
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Doomple Technologies ("we", "our", or "us") operates the doomple.com website and related services. This Privacy Policy explains our practices regarding the collection, use, and protection of your personal information in accordance with applicable laws, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <p>We collect information you provide directly to us:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, company name</li>
              <li><strong>Project Information:</strong> Details about your project, requirements, and business needs</li>
              <li><strong>Technical Information:</strong> IP address, browser type, pages visited, referring URL</li>
              <li><strong>Service Information:</strong> Information provided when using our platforms or services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use collected information for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responding to your inquiries and providing requested services</li>
              <li>Improving our website and services</li>
              <li>Sending relevant updates and communications (with your consent)</li>
              <li>Analyzing usage patterns and troubleshooting issues</li>
              <li>Complying with legal obligations</li>
              <li>Protecting against fraud and security issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors assisting in our operations (hosting, analytics, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Partners:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
            <p>
              Our security measures include encryption, secure servers, firewalls, and access controls. We train our employees on data protection and maintain administrative policies addressing data security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Data Rights</h2>
            <p>
              Under applicable data protection laws, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability in structured format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance user experience. You can control cookie preferences through your browser settings. We use cookies for session management, user preferences, and analytics.
            </p>
            <p>
              Third-party analytics services may place cookies on your device to track usage patterns. You can opt-out of third-party tracking through industry tools.
            </p>
            <p>
              When you respond to our cookie banner, we record the choice you made, the policy version in force at that time, and limited technical metadata needed to evidence consent and honour your preference.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Retention of Information</h2>
            <p>
              We retain personal information for as long as necessary to provide services and fulfill the purposes outlined in this policy. For contact inquiries, we retain information for 3 years. You may request deletion subject to legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover such information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party sites. We are not responsible for their privacy practices. We encourage you to review their privacy policies before providing information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. International Data Transfer</h2>
            <p>
              Your information may be transferred, processed, and stored in countries other than India. By using our services, you consent to such transfers. We ensure appropriate safeguards for international transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Policy Updates</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by posting the updated policy on our website with a new "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Us</h2>
            <p>
              For privacy concerns or to exercise your data rights, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4 border border-gray-200">
              <p><strong>Doomple Technologies</strong></p>
              <p>H. No.113 Gali No.1, VIKAS NAGAR<br />Gurgaon-122001, Haryana, India</p>
              <p><strong>Email:</strong> <a href="mailto:sneha@doomple.com" className="text-purple-600 hover:text-purple-700">sneha@doomple.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:+919211698507" className="text-purple-600 hover:text-purple-700">+91-9211698507</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
