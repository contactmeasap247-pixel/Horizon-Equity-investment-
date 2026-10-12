"use client";

import Link from "next/link";
import { ShieldCheck, Lock, Zap, Headphones, Award, ArrowRight } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const SECURITY_PILLARS = [
  {
    title: "Air-Gapped Cold Vault Custody",
    description:
      "Over 98% of all digital reserves are kept in offline multi-signature cold vaults distributed across Swiss and Icelandic underground data facilities.",
    icon: Lock,
    badge: "Vault Protocol",
  },
  {
    title: "Instant Automated Clearings",
    description:
      "Every withdrawal is verified cryptographically and disbursed via dedicated private node endpoints with zero manual bottlenecks.",
    icon: Zap,
    badge: "Real-Time Settlement",
  },
  {
    title: "Military-Grade AES-256 Encryption",
    description:
      "End-to-end encryption secures all account communications, API interactions, session credentials, and database records.",
    icon: ShieldCheck,
    badge: "Cryptographic Standard",
  },
  {
    title: "24/7 Dedicated Concierge Support",
    description:
      "Round-the-clock priority resolution team offering direct ticket access, live chat, and dedicated portfolio strategists.",
    icon: Headphones,
    badge: "Institutional Support",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-16 border-b border-white/5 bg-[#0E141B]">
        <div className="container-page max-w-4xl text-center">
          <span className="t-eyebrow mb-2 block">Institutional Governance</span>
          <h1 className="t-page mb-4 font-semibold">Regulated, Compliant, Trusted.</h1>
          <p className="t-lead mx-auto">
            Multi-layer cryptography, rigorous cold-custody audits, and redundant institutional safeguards engineered to preserve principal capital.
          </p>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="section">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {SECURITY_PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="panel p-7 sm:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="icon-tile text-[#4388F5]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="badge badge-accent font-semibold text-xs">
                      {item.badge}
                    </span>
                  </div>
                  <h2 className="t-title mb-2 font-semibold text-white">{item.title}</h2>
                  <p className="t-body text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>

          {/* Guarantee Banner */}
          <div className="panel p-8 sm:p-12 bg-[#0E141B] text-center max-w-3xl mx-auto">
            <Award className="w-10 h-10 text-[#4388F5] mx-auto mb-4" />
            <h3 className="t-title mb-2 font-semibold text-white">
              Multi-Tier Cold Custody &amp; Insurance Guarantee
            </h3>
            <p className="t-small text-[#A6B0BE] max-w-xl mx-auto mb-8 leading-relaxed">
              All customer balances are strictly segregated from platform operational reserves. Fully backed by institutional liquidity partners and regular smart contract audits.
            </p>
            <Link
              href="/register"
              className="btn btn-primary font-semibold shadow-md inline-flex items-center"
            >
              <span>Open Protected Account</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
