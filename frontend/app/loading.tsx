import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <Loader2 className="w-9 h-9 text-[#4388F5] animate-spin" />
        <div className="absolute inset-0 rounded-full bg-[#4388F5]/20 blur-md animate-pulse" />
      </div>
      <p className="text-xs text-[#7D8998] font-mono tracking-wider">
        Loading Horizon Equity Portal...
      </p>
    </div>
  );
}
