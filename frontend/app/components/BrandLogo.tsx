"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  withSubtitle?: boolean;
  href?: string | null;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  withSubtitle = true,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const iconSize = size === "sm" ? 24 : size === "lg" ? 36 : 28;
  const titleClass =
    size === "sm"
      ? "text-sm font-semibold tracking-tight"
      : size === "lg"
      ? "text-xl font-bold tracking-tight"
      : "text-base font-bold tracking-tight";
  const subClass =
    size === "sm"
      ? "text-[9px] tracking-widest text-[#7D8998] uppercase font-medium"
      : size === "lg"
      ? "text-[11px] tracking-widest text-[#7D8998] uppercase font-medium"
      : "text-[10px] tracking-widest text-[#7D8998] uppercase font-medium";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-md bg-[#151F2B] border border-white/10"
        style={{ width: iconSize + 10, height: iconSize + 10 }}
        aria-hidden="true"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Geometric H + Horizon Growth Arc */}
          <path
            d="M7 6V26M13 13V26M19 18V26M25 6V26"
            stroke="#4388F5"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Main Upward Horizon Beam */}
          <path
            d="M6 23C12 21 18 16 26 8"
            stroke="#4388F5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M20 7H26V13"
            stroke="#4388F5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pillar Bars */}
          <rect x="7" y="16" width="3.5" height="10" rx="1" fill="#4388F5" fillOpacity="0.85" />
          <rect x="13.5" y="12" width="3.5" height="14" rx="1" fill="#4388F5" />
          <rect x="20" y="8" width="3.5" height="18" rx="1" fill="#5A9AFF" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`${titleClass} text-[#F5F7FA]`}>
          HORIZON <span className="text-[#4388F5]">EQUITY</span>
        </span>
        {withSubtitle && (
          <span className={`${subClass} mt-1`}>
            FINANCIAL PLATFORM
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4388F5] rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
