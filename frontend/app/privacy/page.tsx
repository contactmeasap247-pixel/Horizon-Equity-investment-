import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Eye, Database, ShieldCheck, ArrowRight } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Horizon Equity",
  description:
    "Learn how Horizon Equity collects, encrypts, and protects your personal identification and transactional data under international data protection standards.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Header Banner */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111A26] border border-[#263345] text-xs font-mono text-[#A0AEC0] mb-4">
            <Lock className="w-3.5 h-3.5 text-[#4C8DFF]" />
            <span>GLOBAL DATA PROTECTION STANDARDS</span>
          </div>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 font-mono">
            Privacy &amp; Data Security Policy
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto font-sans leading-relaxed">
            Horizon Equity implements zero-knowledge operational principles, AES-256 ledger encryption, and strict GDPR/CCPA alignment to protect client privacy.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <main className="section py-16">
        <div className="container-page max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Navigation Sticky Sidebar */}
            <aside className="md:col-span-1">
              <div className="sticky top-24 panel p-5 border border-[#263345] bg-[#111A26] space-y-3">
                <div className="text-xs font-mono font-semibold text-[#4C8DFF] uppercase tracking-wider">
                  Privacy Sections
                </div>
                <nav className="flex flex-col gap-2 text-xs text-[#A0AEC0]">
                  <a href="#collection" className="hover:text-white transition-colors">1. Data We Collect</a>
                  <a href="#usage" className="hover:text-white transition-colors">2. How We Use Data</a>
                  <a href="#storage" className="hover:text-white transition-colors">3. Storage &amp; Encryption</a>
                  <a href="#sharing" className="hover:text-white transition-colors">4. Third-Party Disclosures</a>
                  <a href="#rights" className="hover:text-white transition-colors">5. Your Legal Rights</a>
                  <a href="#retention" className="hover:text-white transition-colors">6. Data Retention Limits</a>
                </nav>

                <div className="pt-4 border-t border-[#263345]">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs text-[#4C8DFF] hover:text-[#6AA3FF] font-mono"
                  >
                    <span>Data Protection Officer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Policy Body */}
            <div className="md:col-span-2 space-y-10 text-sm text-[#A0AEC0] leading-relaxed">
              <section id="collection" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#4C8DFF]" />
                  1. Information We Collect
                </h2>
                <p className="mb-3">
                  When you create an account or interact with the Horizon Equity platform, we may collect the following categories of information:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mb-3">
                  <li><strong className="text-white">Account Identification:</strong> Email address, encrypted authentication hashes, contact telephone number.</li>
                  <li><strong className="text-white">Identity Verification (KYC):</strong> Government-issued ID, proof of residence, source of wealth declarations (for institutional tiers).</li>
                  <li><strong className="text-white">Transactional Telemetry:</strong> Public blockchain wallet addresses, transaction hashes, internal allocation timestamps.</li>
                  <li><strong className="text-white">Technical Metrics:</strong> Device fingerprints, browser headers, IP addresses for security anomaly detection.</li>
                </ul>
              </section>

              <section id="usage" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#4C8DFF]" />
                  2. How We Utilize Your Data
                </h2>
                <p className="mb-3">
                  Collected telemetry and identity information is utilized strictly for lawful business purposes:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Executing and settling multi-asset algorithmic contracts.</li>
                  <li>Preventing unauthorized withdrawals, account takeovers, and fraudulent operations.</li>
                  <li>Complying with international Anti-Money Laundering (AML) reporting obligations.</li>
                  <li>Delivering transactional statements, maturity notices, and security advisories.</li>
                </ul>
              </section>

              <section id="storage" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4C8DFF]" />
                  3. Storage, Encryption &amp; Vault Security
                </h2>
                <p className="mb-3">
                  All databases containing personal or transactional information are encrypted at rest using AES-256 encryption. Transmission of data across public networks is secured using TLS 1.3 protocol suites with strict cipher suites.
                </p>
                <p>
                  Cold wallet cryptographic private keys never touch internet-connected environments and are permanently air-gapped in institutional vault hardware modules.
                </p>
              </section>

              <section id="sharing" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono">
                  4. Third-Party Disclosures
                </h2>
                <p className="mb-3">
                  Horizon Equity does not sell, rent, or trade your personal data to advertisers or commercial brokers under any circumstances.
                </p>
                <p>
                  Information is shared only with verified institutional custodians, regulatory authorities when mandated by valid court subpoena, or trusted automated identity verification providers bound by strict confidentiality terms.
                </p>
              </section>

              <section id="rights" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono">
                  5. Your Rights Under GDPR &amp; Global Frameworks
                </h2>
                <p className="mb-3">
                  Subject to jurisdictional requirements, you have the right to request access to your personal data, rectify inaccuracies, request account data deletion, or restrict automated processing.
                </p>
                <p>
                  Certain financial ledger records must be retained for minimum statutory periods mandated by financial regulatory statutes.
                </p>
              </section>

              <section id="retention" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono">
                  6. Data Retention Limits
                </h2>
                <p>
                  We retain personal identification data for as long as your account remains open and active, plus any additional period mandated by applicable banking and AML statutory obligations (typically five to seven years post-closure).
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
