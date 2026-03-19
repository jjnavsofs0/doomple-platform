import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Doomple Technologies',
  description: 'Terms and conditions governing the use of our website and services.',
  openGraph: {
    title: 'Terms of Service',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: March 17, 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using the doomple.com website and services, you agree to be bound by these Terms of Service. If you do not agree to abide by these terms, please do not use this service. Doomple Technologies reserves the right to modify these terms at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on doomple.com for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to reverse engineer, disassemble, or decompile any software</li>
              <li>Removing any copyright or other proprietary notations</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Using the materials for any unlawful purpose or in violation of any laws</li>
              <li>Harassing, defaming, or causing harm to any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Disclaimer</h2>
            <p>
              The materials on Doomple's website are provided on an 'as is' basis. Doomple makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Limitations</h2>
            <p>
              In no event shall Doomple Technologies or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on doomple.com, even if Doomple or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on doomple.com could include technical, typographical, or photographic errors. Doomple does not warrant that any of the materials on its website are accurate, complete, or current. Doomple may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Links</h2>
            <p>
              Doomple has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Doomple of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Modifications</h2>
            <p>
              Doomple may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Service Agreement Terms</h2>
            <p>
              When engaging Doomple Technologies for services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Scope:</strong> Services are limited to those defined in the executed project proposal or statement of work</li>
              <li><strong>Payment:</strong> Invoices are payable within 30 days of issue unless otherwise agreed</li>
              <li><strong>Intellectual Property:</strong> Upon full payment, client owns deliverables. Doomple retains rights to methodologies and pre-existing components</li>
              <li><strong>Confidentiality:</strong> Both parties agree to maintain confidentiality of proprietary information</li>
              <li><strong>Limitation of Liability:</strong> Liability limited to total fees paid in the preceding 12 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Termination</h2>
            <p>
              Either party may terminate a service engagement with 30 days written notice. Upon termination, client remains responsible for all work completed and expenses incurred. We will provide reasonable assistance with knowledge transfer upon termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Support and Maintenance</h2>
            <p>
              Support and maintenance services, if provided, are available only to clients with active service agreements. Support hours and response times are defined in the service agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Acceptable Use Policy</h2>
            <p>
              You agree not to use our services for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal purposes or activities</li>
              <li>Violating any laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Sending spam, malware, or harmful content</li>
              <li>Disrupting service availability or security</li>
              <li>Harassment or defamation of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts located in Gurgaon, Haryana.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
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
