import Link from "next/link";
import { ShieldAlert, Home, Layers } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30 flex flex-col justify-between">
      <PublicNav />

      <main className="section py-20 flex-1 flex items-center justify-center">
        <div className="container-page max-w-2xl text-center">
          <div className="panel p-8 sm:p-12 bg-[#111A26] border border-[#263345] shadow-xl relative overflow-hidden">
            {/* Terminal status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#172333] border border-[#F16B75]/40 text-xs font-mono text-[#F16B75] mb-6">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>404 · ROUTE_NOT_FOUND</span>
            </div>

            <h1 className="text-6xl sm:text-7xl font-extrabold font-mono text-[#F1F5F9] mb-4 tracking-tighter">
              404
            </h1>

            <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#4C8DFF] mb-3">
              Requested Execution Route Unresolved
            </h2>

            <p className="text-sm text-[#A0AEC0] max-w-md mx-auto mb-8 font-sans leading-relaxed">
              The contract or destination you attempted to access does not exist on the current ledger, has migrated, or requires elevated authorization.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="btn btn-primary w-full sm:w-auto font-mono text-xs font-semibold"
              >
                <Home className="w-4 h-4 mr-1.5" />
                <span>Return to Terminal</span>
              </Link>

              <Link
                href="/plans"
                className="btn btn-secondary w-full sm:w-auto font-mono text-xs font-semibold"
              >
                <Layers className="w-4 h-4 mr-1.5" />
                <span>View Investment Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
