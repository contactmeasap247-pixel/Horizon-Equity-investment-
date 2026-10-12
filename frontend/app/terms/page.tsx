import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Scale, AlertTriangle, ArrowRight } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

export const metadata: Metadata = {
  title: "Terms and Conditions | Horizon Equity",
  description:
    "Review the institutional terms of service, governance framework, and contractual obligations governing Horizon Equity accounts and transactions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Header Banner */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111A26] border border-[#263345] text-xs font-mono text-[#A0AEC0] mb-4">
            <Scale className="w-3.5 h-3.5 text-[#4C8DFF]" />
            <span>LEGAL &amp; REGULATORY FRAMEWORK</span>
          </div>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 font-mono">
            Terms of Service &amp; User Agreement
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto font-sans leading-relaxed">
            Effective Date: October 1, 2026. Please read these terms carefully before accessing Horizon Equity accounts, liquidity pools, and algorithmic yield contracts.
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
                  Table of Contents
                </div>
                <nav className="flex flex-col gap-2 text-xs text-[#A0AEC0]">
                  <a href="#acceptance" className="hover:text-white transition-colors">1. Acceptance of Terms</a>
                  <a href="#eligibility" className="hover:text-white transition-colors">2. User Eligibility &amp; KYC</a>
                  <a href="#custody" className="hover:text-white transition-colors">3. Custodial Operations</a>
                  <a href="#plans" className="hover:text-white transition-colors">4. Investment Tiers &amp; Yield</a>
                  <a href="#risk-acknowledgment" className="hover:text-white transition-colors">5. Risk Acknowledgment</a>
                  <a href="#termination" className="hover:text-white transition-colors">6. Suspension &amp; Termination</a>
                  <a href="#governing-law" className="hover:text-white transition-colors">7. Governing Law</a>
                </nav>

                <div className="pt-4 border-t border-[#263345]">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs text-[#4C8DFF] hover:text-[#6AA3FF] font-mono"
                  >
                    <span>Contact Legal Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Terms Body */}
            <div className="md:col-span-2 space-y-10 text-sm text-[#A0AEC0] leading-relaxed">
              <section id="acceptance" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4C8DFF]" />
                  1. Acceptance of Terms
                </h2>
                <p className="mb-3">
                  By accessing, creating an account, or transacting on the Horizon Equity platform (&ldquo;Platform&rdquo;), you signify your agreement to comply with and be legally bound by these Terms and Conditions (&ldquo;Terms&rdquo;), our Privacy Policy, and Risk Disclosures.
                </p>
                <p>
                  If you do not agree to all terms herein, you must immediately discontinue using our services, close open positions, and withdraw available balances.
                </p>
              </section>

              <section id="eligibility" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#4C8DFF]" />
                  2. User Eligibility &amp; KYC Verification
                </h2>
                <p className="mb-3">
                  You must be at least 18 years of age (or the age of legal majority in your jurisdiction) and possess full legal capacity to enter into binding agreements.
                </p>
                <p className="mb-3">
                  Horizon Equity complies strictly with Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) protocols. Users must provide accurate identification documents upon request to unlock high-tier funding limits or execute large settlements.
                </p>
                <p>
                  Residents of sanctioned jurisdictions or individuals listed on OFAC/UN sanctions lists are strictly prohibited from utilizing the Platform.
                </p>
              </section>

              <section id="custody" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#4C8DFF]" />
                  3. Custodial Operations &amp; Segregation
                </h2>
                <p className="mb-3">
                  All digital asset reserves deposited into Horizon Equity accounts are maintained in multi-signature cold storage vaults and institutional custody networks.
                </p>
                <p>
                  Client funds are segregated from the operating treasury of Horizon Equity Inc. and cannot be pledged for third-party obligations or operational debt.
                </p>
              </section>

              <section id="plans" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4C8DFF]" />
                  4. Investment Tiers &amp; Yield Schedules
                </h2>
                <p className="mb-3">
                  Horizon Equity offers four structured investment allocations: Silver ($100&ndash;$499), Gold ($500&ndash;$999), Platinum ($1,000&ndash;$4,999), and Diamond ($5,000+ Unlimited).
                </p>
                <p className="mb-3">
                  Contract yields accrue in accordance with each tier&apos;s specified fixed maturity window. Upon completion of the maturity term, the principal allocation is unlocked and returned to the client&apos;s liquid wallet balance.
                </p>
                <p>
                  Early liquidation of active contracts prior to maturity may be subject to algorithmic liquidity penalties as specified in your contract confirmation schedule.
                </p>
              </section>

              <section id="risk-acknowledgment" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F4BD50]" />
                  5. Risk Acknowledgment
                </h2>
                <p className="mb-3">
                  Trading and investing across precious metals, cryptocurrency, forex, energy, and real estate derivatives involves substantial risk of financial loss.
                </p>
                <p>
                  Market liquidity can fluctuate rapidly. You agree that Horizon Equity is not liable for losses resulting from sovereign network forks, systemic blockchain congestion, or force majeure events.
                </p>
              </section>

              <section id="termination" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono">
                  6. Suspension and Termination
                </h2>
                <p className="mb-3">
                  Horizon Equity reserves the right to suspend or freeze accounts exhibiting fraudulent activities, unauthorized automated exploitation, market manipulation, or suspicious transaction volumes pending investigation.
                </p>
              </section>

              <section id="governing-law" className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345]">
                <h2 className="text-lg font-bold text-[#F1F5F9] mb-3 font-mono">
                  7. Governing Law and Dispute Resolution
                </h2>
                <p>
                  These Terms are governed by and construed in accordance with international commercial arbitration standards. Any unresolved dispute arising out of or in connection with these Terms shall be settled by confidential binding arbitration.
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
