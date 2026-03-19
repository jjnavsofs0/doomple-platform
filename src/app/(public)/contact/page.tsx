'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Clock, Shield } from 'lucide-react';

const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm border text-[#042042] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 transition-colors bg-white";
const inputStyle = { borderColor: "#E5E7EB" };
const focusRingStyle = { "--tw-ring-color": "#1ABFAD" } as React.CSSProperties;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    serviceInterest: '', solutionInterest: '',
    budgetRange: '', timeline: '', businessType: '', message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage("Thank you for your inquiry! We'll get back to you within 24 hours.");
        setFormData({ name: '', email: '', phone: '', company: '', serviceInterest: '', solutionInterest: '', budgetRange: '', timeline: '', businessType: '', message: '' });
      } else {
        setSubmitStatus('error');
        setSubmitMessage('There was an error submitting your form. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Let&apos;s Talk</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get in Touch With Us</h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
            Let&apos;s discuss how we can help your business achieve its goals through technology. We respond within 24 hours, Monday to Friday.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact person */}
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-1">Primary Contact</p>
              <p className="text-sm font-bold text-[#042042]">Sneha Sharma</p>
              <p className="text-xs text-[#6B7280]">Business Development</p>
            </div>

            {[
              { icon: Phone, label: "Phone", value: "+91-9211698507", href: "tel:+919211698507", sub: "Mon – Fri, 9 AM – 6 PM IST" },
              { icon: Mail, label: "Email", value: "sneha@doomple.com", href: "mailto:sneha@doomple.com", sub: "Response within 24 hours" },
            ].map(({ icon: Icon, label, value, href, sub }) => (
              <a key={label} href={href} className="group flex items-start gap-4 bg-white rounded-xl p-5 transition-all duration-200 hover:shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#042042] group-hover:text-[#1ABFAD] transition-colors">{value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>
                </div>
              </a>
            ))}

            <div className="flex items-start gap-4 bg-white rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                <MapPin className="w-4 h-4" style={{ color: "#1ABFAD" }} />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-0.5">Office</p>
                <p className="text-sm font-semibold text-[#042042]">Gurgaon, Haryana</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">
                  H. No.113 Gali No.1, VIKAS NAGAR<br />
                  Basai Road, Gurgaon-122001
                </p>
              </div>
            </div>

            {/* Promises */}
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
              <p className="text-xs font-semibold text-[#042042] mb-3">What to Expect</p>
              {[
                { icon: Clock,        text: "Response within 24 hours" },
                { icon: Shield,       text: "No obligation, no pressure" },
                { icon: CheckCircle2, text: "Free initial consultation" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 mb-2.5 last:mb-0">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                  <span className="text-xs text-[#374151]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 sm:p-10" style={{ border: "1px solid #E5E7EB" }}>
              <h2 className="text-2xl font-bold text-[#042042] mb-6">Send Us a Message</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: "rgba(26,191,173,0.08)", border: "1px solid rgba(26,191,173,0.25)" }}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                  <p className="text-sm font-semibold" style={{ color: "#042042" }}>{submitMessage}</p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-sm font-semibold text-red-700">{submitMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }} placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-[#374151] mb-1.5">Email Address *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }} placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-[#374151] mb-1.5">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }} placeholder="+91-9876543210" />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-xs font-semibold text-[#374151] mb-1.5">Company Name</label>
                    <input type="text" id="company" name="company" value={formData.company} onChange={handleChange}
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }} placeholder="Your Company" />
                  </div>
                </div>
                <div>
                  <label htmlFor="businessType" className="block text-xs font-semibold text-[#374151] mb-1.5">Business Type</label>
                  <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange}
                    className={inputClass} style={{ ...inputStyle, ...focusRingStyle }}>
                    <option value="">Select...</option>
                    <option value="startup">Startup</option>
                    <option value="sme">SME / MSME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="institution">Educational Institution</option>
                    <option value="nonprofit">Non-Profit</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="serviceInterest" className="block text-xs font-semibold text-[#374151] mb-1.5">Service of Interest</label>
                    <select id="serviceInterest" name="serviceInterest" value={formData.serviceInterest} onChange={handleChange}
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }}>
                      <option value="">Select a service...</option>
                      <option value="custom-development">Custom Software Development</option>
                      <option value="mobile-app">Mobile App Development</option>
                      <option value="ai-data">AI & Data Solutions</option>
                      <option value="cloud-infrastructure">Cloud & DevOps</option>
                      <option value="ecommerce">E-Commerce Development</option>
                      <option value="consulting">Technology Consulting</option>
                      <option value="erp">ERP Development</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="solutionInterest" className="block text-xs font-semibold text-[#374151] mb-1.5">Solution of Interest</label>
                    <select id="solutionInterest" name="solutionInterest" value={formData.solutionInterest} onChange={handleChange}
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }}>
                      <option value="">Select a solution...</option>
                      <option value="uep">Unified Education Platform</option>
                      <option value="saas-toolkit">SaaS Backend Toolkit</option>
                      <option value="ecommerce-foundation">E-Commerce Foundation</option>
                      <option value="logistics">Logistics Platform</option>
                      <option value="workforce">Workforce Solutions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="budgetRange" className="block text-xs font-semibold text-[#374151] mb-1.5">Budget Range</label>
                    <select id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={handleChange}
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }}>
                      <option value="">Select...</option>
                      <option value="under-50k">Under ₹50K</option>
                      <option value="50k-150k">₹50K – ₹150K</option>
                      <option value="150k-500k">₹150K – ₹500K</option>
                      <option value="500k-1m">₹500K – ₹1M</option>
                      <option value="1m-plus">₹1M+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-xs font-semibold text-[#374151] mb-1.5">Timeline</label>
                    <select id="timeline" name="timeline" value={formData.timeline} onChange={handleChange}
                      className={inputClass} style={{ ...inputStyle, ...focusRingStyle }}>
                      <option value="">Select...</option>
                      <option value="immediate">Immediate (within 2 weeks)</option>
                      <option value="short-term">Short-term (1–3 months)</option>
                      <option value="medium-term">Medium-term (3–6 months)</option>
                      <option value="long-term">Long-term (6+ months)</option>
                      <option value="planning">Still planning</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-[#374151] mb-1.5">Tell us about your project *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5}
                    className={inputClass} style={{ ...inputStyle, ...focusRingStyle, resize: "vertical" }}
                    placeholder="Describe your project, goals, and any specific challenges you're trying to solve..." />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#1ABFAD" }}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
