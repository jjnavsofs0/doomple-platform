import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Doomple',
  description: 'Our refund and cancellation policy for projects and services.',
  openGraph: {
    title: 'Refund & Cancellation Policy',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: March 17, 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Overview</h2>
            <p>
              Doomple Technologies is committed to customer satisfaction. This policy outlines our approach to refunds and cancellations for various service and product engagements. Our approach varies based on the type of engagement and stage of work completion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Project-Based Services</h2>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.1 Pre-Commencement Cancellation</h3>
            <p>
              If a project is cancelled before work begins (before the project start date):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full refund of advance/deposit paid</li>
              <li>Only administration and documentation fees may apply (not to exceed 5% of total contract value)</li>
              <li>Request must be made in writing</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.2 During Project Execution</h3>
            <p>
              If a project is cancelled during active development:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Client is responsible for:</strong> All work completed, resources utilized, and documented progress</li>
              <li><strong>Refund eligibility:</strong> May be available for remaining milestones not yet started, proportional to cancellation timing</li>
              <li><strong>Knowledge transfer:</strong> We provide reasonable assistance to transition work to another vendor</li>
              <li><strong>Deliverables:</strong> Completed work and documentation will be provided to client</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.3 Project Completion</h3>
            <p>
              Once a project is completed and delivered, no refund is available. The client owns all deliverables and accepts them as satisfying the defined scope.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Retainer Services</h2>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.1 Monthly Retainers</h3>
            <p>
              For ongoing retainer agreements:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cancellation Notice:</strong> 30 days written notice required</li>
              <li><strong>Current Month:</strong> Full payment due for current month even if cancelled mid-month</li>
              <li><strong>Advance Payments:</strong> Any advance payments for future months will be refunded proportionally</li>
              <li><strong>Unused Services:</strong> Unused retainer hours do not roll over and are forfeited</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.2 Underutilization</h3>
            <p>
              If client underutilizes retainer services for two consecutive months without written request to pause or adjust:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doomple may request a discussion about engagement value and requirements</li>
              <li>If unused capacity continues, services may be adjusted or retainer fees reduced by mutual agreement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. SaaS & Platform Services</h2>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.1 Annual Subscriptions</h3>
            <p>
              For annual SaaS platform subscriptions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>30-Day Trial Period:</strong> Full refund available within 30 days if service doesn't meet expectations</li>
              <li><strong>After Trial Period:</strong> No refunds on annual subscriptions, but clients can cancel for future renewal</li>
              <li><strong>Cancellation Notice:</strong> 30 days advance notice to avoid next renewal charge</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.2 Implementation Fees</h3>
            <p>
              One-time implementation and setup fees are non-refundable once customization work begins. Refunds are available if implementation hasn't commenced.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Training & Support Services</h2>
            <p>
              Training sessions and consulting hours are consumed upon delivery. No refunds are available once services are rendered. Cancellations must be made at least 5 business days before scheduled sessions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Refund Process</h2>
            <p>
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Submit written request to <a href="mailto:sneha@doomple.com" className="text-purple-600 hover:text-purple-700">sneha@doomple.com</a> with details</li>
              <li>Provide project/service reference and cancellation reason</li>
              <li>Doomple will review and respond within 5-7 business days</li>
              <li>Approved refunds are processed within 10-15 business days to original payment method</li>
              <li>Bank processing time may vary by financial institution</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Non-Refundable Items</h2>
            <p>
              The following are non-refundable:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Third-party service fees and licenses (paid on client's behalf)</li>
              <li>Domain registrations and SSL certificates</li>
              <li>Infrastructure costs and hosting fees</li>
              <li>Penalties or fines imposed due to client actions</li>
              <li>Rush fees or expedited service charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Partial Refunds</h2>
            <p>
              Partial refunds may be considered for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Early termination of multi-year contracts (proportional to unused period)</li>
              <li>Scope reduction on active projects (refund for unstarted milestones)</li>
              <li>Service defects or failures (partial refund of affected period)</li>
              <li>Force majeure or circumstances beyond either party's control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Dispute Resolution</h2>
            <p>
              If you disagree with a refund decision:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact us within 15 days of decision with additional information</li>
              <li>Provide documentation supporting your claim</li>
              <li>We will conduct a full review and provide a response within 10 business days</li>
              <li>If still unresolved, either party may pursue legal remedies under applicable law</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Service Credit Alternative</h2>
            <p>
              In some cases, instead of refunds, we may offer service credits for future projects. This option is mutually agreed upon and can provide more value than refunds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Policy Changes</h2>
            <p>
              Doomple reserves the right to modify this policy. Changes apply to new agreements and services. Existing contracts are governed by the terms in effect at the time of engagement unless both parties agree otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p>
              For refund requests or clarifications about this policy:
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
