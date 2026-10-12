import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <Loader2 className="w-8 h-8 text-[#4388F5] animate-spin" />
        <div className="absolute inset-0 rounded-full bg-[#4388F5]/20 blur-sm animate-pulse" />
      </div>
      <p className="text-xs text-[#7D8998] font-mono tracking-wider">
        Loading Portfolio Telemetry...
      </p>
    </div>
  );
}
