import Link from "next/link";
import {
  Mail, Phone, MapPin, ArrowRight, Calendar,
  CheckCircle2, Clock, Shield, MessageSquare,
} from "lucide-react";

export function ContactPreview() {
  const contactInfo = {
    name: "Sneha Sharma",
    phone: "+91-9211698507",
    email: "sneha@doomple.com",
    address: "H. No.113 Gali No.1, VIKAS NAGAR, Gurgaon",
    city: "Basai Road, Gurgaon-122001, Haryana",
    country: "India",
  };

  const promisePoints = [
    { icon: Clock,          label: "Response within 24 hours" },
    { icon: Shield,         label: "No obligation, no pressure" },
    { icon: MessageSquare,  label: "Free initial consultation" },
    { icon: CheckCircle2,   label: "Personalised solution recommendations" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white" style={{ borderTop: "1px solid #E5E7EB" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — Contact Information */}
          <div>
            <p className="eyebrow mb-3">Say Hello</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] mb-3 leading-tight">
              Get in Touch With Us
            </h2>
            <p className="text-[#6B7280] leading-relaxed mb-8 max-w-md">
              Have questions? Ready to start a project? Our team responds within 24 hours, Monday to Friday.
            </p>

            <div className="space-y-3 mb-8">
              {/* Contact Person */}
              <div className="bg-[#F9FAFB] rounded-xl p-4" style={{ border: "1px solid #E5E7EB" }}>
                <p className="text-xs font-semibold text-[#6B7280] mb-0.5 uppercase tracking-widest">Primary Contact</p>
                <p className="text-sm font-semibold text-[#042042]">{contactInfo.name} — Business Development</p>
              </div>

              {/* Phone */}
              <a
                href={`tel:${contactInfo.phone}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl transition-all duration-200 hover:shadow-sm group"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                  <Phone className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] mb-0.5">Phone</p>
                  <p className="text-sm font-semibold text-[#042042] group-hover:text-[#1ABFAD] transition-colors">
                    {contactInfo.phone}
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl transition-all duration-200 hover:shadow-sm group"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                  <Mail className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-[#042042] group-hover:text-[#1ABFAD] transition-colors">
                    {contactInfo.email}
                  </p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl"
                style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                  <MapPin className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] mb-0.5">Office Address</p>
                  <p className="text-sm text-[#374151] leading-relaxed">
                    {contactInfo.address}<br />
                    {contactInfo.city}<br />
                    {contactInfo.country}
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Send a Message <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact?type=consultation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{ border: "1.5px solid #042042", color: "#042042" }}
              >
                <Calendar className="w-4 h-4" />
                Schedule Consultation
              </Link>
            </div>
          </div>

          {/* Right — Value Panel */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#042042" }}>
            <div className="h-1" style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }} />
            <div className="p-8 sm:p-10">
              <h3 className="text-xl font-bold text-white mb-2">We're Here to Help</h3>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
                Have questions? Want to discuss your project? Our team is ready to help you achieve your digital transformation goals — no commitment required.
              </p>

              <div className="space-y-4 mb-8">
                {promisePoints.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(26,191,173,0.15)" }}>
                      <Icon className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                    </div>
                    <span className="text-sm font-medium text-white/75">{label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs text-white/40 mb-1">Mon – Fri, 9 AM – 6 PM IST</p>
                <p className="text-sm text-white/70">
                  Whether you're just exploring options or ready to move forward, we're here to guide you through every step of your digital journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
