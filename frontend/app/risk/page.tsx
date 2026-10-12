import type { Metadata } from "next";
import Link from "next/link";
import { AlertOctagon, TrendingDown, ShieldAlert, Cpu, Globe, ArrowRight } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

export const metadata: Metadata = {
  title: "Risk Disclosure | Horizon Equity",
  description:
    "Comprehensive statement of market volatility, counterparty, technological, and liquidity risks associated with multi-asset trading and fixed-yield allocations.",
};

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Header Banner */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#172333] border border-[#F16B75]/40 text-xs font-mono text-[#F16B75] mb-4">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>MANDATORY STATUTORY DISCLOSURE</span>
          </div>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 font-mono">
            Comprehensive Risk Disclosure
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto font-sans leading-relaxed">
            Investing across precious metals, cryptocurrency, forex, energy, and real estate derivatives involves market risk. You should carefully evaluate your financial position prior to allocating capital.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="section py-16">
        <div className="container-page max-w-4xl space-y-10">
          {/* Prominent Warning Callout */}
          <div className="panel p-6 sm:p-8 bg-[#172333]/60 border border-[#F16B75]/40 flex flex-col sm:flex-row items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-[#F16B75] shrink-0" />
            <div>
              <h2 className="text-base font-bold text-white mb-2 font-mono">
                Capital Risk Warning
              </h2>
              <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
                Trading spot, derivative, or structured products carries a high degree of risk and may not be suitable for all investors. Never allocate funds that you cannot afford to lose or money that is required for critical living obligations.
              </p>
            </div>
          </div>

          {/* Detailed Risk Vectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Volatility */}
            <div className="panel p-6 sm:p-7 bg-[#111A26] border border-[#263345] flex flex-col justify-between">
              <div>
                <div className="icon-tile mb-4 text-[#F16B75] bg-[#172333]">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">
                  1. High Asset Volatility
                </h3>
                <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
                  Digital currencies and commodity derivatives frequently experience rapid, unpredictable price swings driven by macro announcements, regulatory developments, and market sentiment shifts.
                </p>
              </div>
            </div>

            {/* 2. Liquidity & Execution */}
            <div className="panel p-6 sm:p-7 bg-[#111A26] border border-[#263345] flex flex-col justify-between">
              <div>
                <div className="icon-tile mb-4 text-[#4C8DFF] bg-[#172333]">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">
                  2. Liquidity &amp; Execution Slippage
                </h3>
                <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
                  During extreme macroeconomic conditions or sudden market gaps, order fill prices may deviate from requested rates. Horizon Equity utilizes smart routing to mitigate slippage, but market spreads can widen.
                </p>
              </div>
            </div>

            {/* 3. Smart Contract & Tech */}
            <div className="panel p-6 sm:p-7 bg-[#111A26] border border-[#263345] flex flex-col justify-between">
              <div>
                <div className="icon-tile mb-4 text-[#F4BD50] bg-[#172333]">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">
                  3. Technological &amp; Network Risks
                </h3>
                <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
                  Blockchain networks may experience consensus forks, protocol reorgs, latency spikes, or elevated transaction gas fees that could momentarily impact transaction propagation or settlement speed.
                </p>
              </div>
            </div>

            {/* 4. Regulatory & Sovereign */}
            <div className="panel p-6 sm:p-7 bg-[#111A26] border border-[#263345] flex flex-col justify-between">
              <div>
                <div className="icon-tile mb-4 text-[#31C48D] bg-[#172333]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">
                  4. Regulatory Shifts
                </h3>
                <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
                  Statutory frameworks governing synthetic assets, cryptocurrencies, and commodity tokens are continually evolving. Regulatory actions in certain sovereign states may impact specific product offerings.
                </p>
              </div>
            </div>
          </div>

          {/* Structured Yield Risk Particulars */}
          <section className="panel p-6 sm:p-8 bg-[#111A26] border border-[#263345] space-y-4">
            <h3 className="text-base font-bold text-white font-mono">
              Fixed-Yield Maturity Contract Particulars
            </h3>
            <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
              Horizon Equity&apos;s structured investment plans (Silver, Gold, Platinum, and Diamond) operate on designated fixed-term commitment schedules (ranging from 14 to 90 days). Principal allocations remain committed to automated hedging algorithms for the entire cycle duration.
            </p>
            <p className="text-xs sm:text-sm text-[#A0AEC0] leading-relaxed">
              While our protocol employs delta-neutral algorithmic hedges and cold vault custodial collateral, no algorithmic strategy is immune to catastrophic systemic systemic solvency risks of underlying global settlement networks.
            </p>
          </section>

          {/* Bottom Action */}
          <div className="panel p-6 sm:p-8 bg-[#0D131C] border border-[#263345] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white font-mono">Have questions about our risk safeguards?</div>
              <p className="text-xs text-[#A0AEC0]">Our risk desk is available to explain institutional hedging models.</p>
            </div>
            <Link
              href="/contact"
              className="btn btn-primary btn-sm font-mono shrink-0"
            >
              <span>Contact Risk Desk</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
