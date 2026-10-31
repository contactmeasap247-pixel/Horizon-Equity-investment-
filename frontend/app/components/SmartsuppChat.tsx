"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAuthStore } from "@/lib/auth-store";

declare global {
  interface Window {
    _smartsupp?: {
      key?: string;
      [key: string]: unknown;
    };
    smartsupp?: {
      (...args: unknown[]): void;
      _: unknown[];
    };
  }
}

const DEFAULT_SMARTSUPP_KEY = "b7abf01b987c7f81662dcb7827e213ae72a6133d";

export default function SmartsuppChat() {
  const envKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;
  const smartsuppKey =
    envKey && envKey !== "your_smartsupp_key_here" ? envKey : DEFAULT_SMARTSUPP_KEY;
  const user = useAuthStore((state) => state.user);

  // Sync authenticated user identity with Smartsupp
  useEffect(() => {
    if (typeof window === "undefined" || !window.smartsupp) return;

    if (user) {
      window.smartsupp("name", user.full_name);
      window.smartsupp("email", user.email);
      window.smartsupp("variables", {
        accountId: user.id,
        kycStatus: user.kyc_status || "pending",
        emailVerified: user.email_verified ? "Yes" : "No",
      });
    }
  }, [user]);

  if (!smartsuppKey) {
    return null;
  }

  return (
    <>
      <Script
        id="smartsupp-chat-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = '${smartsuppKey}';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `,
        }}
      />
      <noscript>
        Powered by{" "}
        <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
          Smartsupp
        </a>
      </noscript>
    </>
  );
}
