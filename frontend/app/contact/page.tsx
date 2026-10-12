"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Globe,
} from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const GLOBAL_DESKS = [
  {
    city: "London",
    country: "United Kingdom",
    role: "Global Headquarters & Treasury",
    address: "25 Bank Street, Canary Wharf, London E14 5JP",
    hours: "07:00 – 19:00 GMT",
    email: "london.desk@horizonequity.com",
    active: true,
  },
  {
    city: "Frankfurt",
    country: "Germany",
    role: "European Union Execution Hub",
    address: "Taunusanlage 8, 60329 Frankfurt am Main",
    hours: "08:00 – 18:00 CET",
    email: "frankfurt.desk@horizonequity.com",
    active: true,
  },
  {
    city: "Singapore",
    country: "Singapore",
    role: "Asia-Pacific Liquidity Routing",
    address: "10 Marina Boulevard, Tower 2, Singapore 018983",
    hours: "08:00 – 20:00 SGT",
    email: "apac.desk@horizonequity.com",
    active: true,
  },
  {
    city: "New York",
    country: "United States",
    role: "Institutional Private Client Liaison",
    address: "200 West Street, New York, NY 10282",
    hours: "08:00 – 18:00 EST",
    email: "ny.desk@horizonequity.com",
    active: true,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Institutional Inquiries",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Header Banner */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111A26] border border-[#263345] text-xs font-mono text-[#A0AEC0] mb-4">
            <Globe className="w-3.5 h-3.5 text-[#4C8DFF]" />
            <span>GLOBAL COVERAGE · 24/7/365</span>
          </div>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 font-mono">
            Contact &amp; Global Trading Desks
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto font-sans leading-relaxed">
            Connect directly with our institutional trading desks, compliance officers, and round-the-clock client support liaisons.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="section py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            {/* Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="panel p-6 sm:p-8 md:p-10 bg-[#111A26] border border-[#263345]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white font-mono mb-2">
                    Submit Priority Inquiry
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A0AEC0]">
                    Direct dispatch to the appropriate jurisdictional desk. Average response time under 15 minutes.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 rounded-lg bg-[#172333] border border-[#31C48D]/40 text-center space-y-3 animate-fade">
                    <CheckCircle2 className="w-10 h-10 text-[#31C48D] mx-auto" />
                    <h3 className="text-base font-bold text-white font-mono">
                      Inquiry Dispatched Successfully
                    </h3>
                    <p className="text-xs text-[#A0AEC0] max-w-md mx-auto">
                      Your ticket reference has been logged. An institutional liaison has received your details and will follow up shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", subject: "Institutional Inquiries", message: "" });
                      }}
                      className="btn btn-secondary btn-sm mt-3 font-mono"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#A0AEC0] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Lorde Sterling"
                          className="input w-full font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#A0AEC0] mb-1.5">
                          Corporate / Personal Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@firm.com"
                          className="input w-full font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#A0AEC0] mb-1.5">
                        Inquiry Division *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="input w-full font-mono text-sm"
                      >
                        <option value="Institutional Inquiries">Institutional &amp; High Net Worth Allocations</option>
                        <option value="Fixed-Yield Plan Consultation">Structured Investment Plan Consultation</option>
                        <option value="Compliance & KYC">Compliance, KYC &amp; Verification</option>
                        <option value="OTC & Liquidity Routing">OTC Trading &amp; Custom Settlement</option>
                        <option value="Technical Support">Technical &amp; Wallet Assistance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#A0AEC0] mb-1.5">
                        Transmission Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Detail your requirements, desired allocation capital, or inquiry parameters..."
                        className="input w-full font-mono text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-block font-mono font-semibold"
                    >
                      {loading ? (
                        <span>Encrypting &amp; Dispatching...</span>
                      ) : (
                        <>
                          <span>Transmit Message</span>
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="panel p-6 sm:p-7 bg-[#111A26] border border-[#263345] space-y-5">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#4C8DFF]" />
                  Direct Channels
                </h3>

                <div className="space-y-4 text-xs text-[#A0AEC0]">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#4C8DFF] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">General &amp; Support Inquiries</div>
                      <a href="mailto:support@horizonequity.com" className="text-[#4C8DFF] hover:underline font-mono">
                        support@horizonequity.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#31C48D] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Compliance &amp; Legal Desk</div>
                      <a href="mailto:compliance@horizonequity.com" className="text-[#4C8DFF] hover:underline font-mono">
                        compliance@horizonequity.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#F4BD50] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Trading Desk Hours</div>
                      <div className="font-mono text-[11px]">24 Hours / Day · 7 Days / Week (Continuous Routing)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="panel p-6 bg-[#0D131C] border border-[#263345] text-xs text-[#A0AEC0] space-y-2">
                <div className="font-semibold text-white font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#31C48D]" />
                  Anti-Phishing Security Notice
                </div>
                <p className="leading-relaxed">
                  Horizon Equity personnel will never ask for your account password, seed phrase, or private cryptographic keys. All communications originate strictly from authenticated @horizonequity.com domains.
                </p>
              </div>
            </div>
          </div>

          {/* Global Desks Strip */}
          <div>
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-wider text-[#4C8DFF] block mb-1">
                Presence
              </span>
              <h2 className="text-2xl font-bold text-white font-mono">
                International Desks &amp; Physical Offices
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {GLOBAL_DESKS.map((desk, idx) => (
                <div
                  key={idx}
                  className="panel p-6 bg-[#111A26] border border-[#263345] hover:border-[#4C8DFF]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white font-mono">
                        {desk.city}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#172333] text-[#31C48D] border border-[#31C48D]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#31C48D] animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                    <div className="text-xs text-[#4C8DFF] font-medium mb-3">
                      {desk.role}
                    </div>

                    <div className="space-y-2 text-xs text-[#A0AEC0] mb-5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#718096] shrink-0 mt-0.5" />
                        <span>{desk.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                        <span className="font-mono text-[11px]">{desk.hours}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`mailto:${desk.email}`}
                    className="inline-flex items-center gap-1 text-xs text-[#4C8DFF] hover:text-[#6AA3FF] font-mono pt-3 border-t border-[#263345]"
                  >
                    <span>Email Desk</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
