"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Headphones,
  X,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export interface SupportChannel {
  id: string;
  type: string;
  name: string;
  value: string;
  country_code?: string;
  description?: string;
  prefilled_message?: string;
  icon?: string;
  enabled: boolean;
  order: number;
}

export interface SupportWidgetConfig {
  enabled: boolean;
  title: string;
  welcome_message: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  offset_x: number;
  offset_y: number;
  mobile_position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  mobile_offset_x: number;
  mobile_offset_y: number;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  draggable: boolean;
  visibility_scope: "both" | "primary" | "secondary";
  channels: SupportChannel[];
}

const DEFAULT_CONFIG: SupportWidgetConfig = {
  enabled: true,
  title: "Horizon Concierge Support",
  welcome_message: "How can our client desk assist your portfolio today?",
  position: "bottom-right",
  offset_x: 24,
  offset_y: 24,
  mobile_position: "bottom-right",
  mobile_offset_x: 16,
  mobile_offset_y: 16,
  show_on_mobile: true,
  show_on_desktop: true,
  draggable: true,
  visibility_scope: "both",
  channels: [
    {
      id: "whatsapp-1",
      type: "whatsapp",
      name: "WhatsApp VIP Desk",
      value: "+447451278960",
      country_code: "+44",
      description: "Instant 24/7 private concierge",
      prefilled_message: "Hello Horizon Equity desk, I need assistance with my portfolio account.",
      enabled: true,
      order: 1,
    },
    {
      id: "telegram-1",
      type: "telegram",
      name: "Telegram Priority Desk",
      value: "HorizonEquitySupport",
      description: "Encrypted institutional support",
      enabled: true,
      order: 2,
    },
    {
      id: "email-1",
      type: "email",
      name: "Executive Email Desk",
      value: "support@horizon-equity.net",
      description: "Formal institutional inquiries",
      prefilled_message: "Account Support Request",
      enabled: true,
      order: 3,
    },
    {
      id: "ticket-1",
      type: "custom",
      name: "Support Ticket Portal",
      value: "/dashboard/tickets",
      description: "Submit and track verified internal tickets",
      enabled: true,
      order: 4,
    },
  ],
};

// Platform Icons SVG
function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function TelegramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.784-.962 4.129-1.36 5.865-.168.734-.438.98-.698 1.004-.567.052-1-.375-1.55-.735-.86-.563-1.347-.913-2.181-1.463-.965-.635-.34-.984.21-1.554.144-.15 2.645-2.424 2.693-2.632.006-.026.012-.124-.047-.176-.059-.052-.145-.034-.208-.02-.089.02-1.503.955-4.244 2.806-.402.276-.766.411-1.092.404-.36-.008-1.053-.204-1.568-.372-.633-.206-1.137-.315-1.093-.665.023-.183.272-.37 0.748-.563 2.928-1.275 4.88-2.115 5.856-2.52 2.787-1.156 3.366-1.357 3.744-1.363.083-.001.268.02.388.118.101.082.13.193.143.27.014.077.031.252.017.391z" />
    </svg>
  );
}

function MessengerIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.093.303 2.251.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.89-3.259-6.56 6.963z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function FloatingSupportWidget() {
  const pathname = usePathname();
  const [config, setConfig] = useState<SupportWidgetConfig>(DEFAULT_CONFIG);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Dragging state
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    moved: false,
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch support configuration
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await api.get("/support/widget-config");
        if (isMounted && res.data) {
          setConfig(res.data);
        }
      } catch {
        // Retain default config gracefully
      }
    };
    fetchConfig();

    // Check saved position from session
    try {
      const saved = sessionStorage.getItem("he_support_widget_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setCustomPos(parsed);
        }
      }
    } catch {
      // ignore
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Screen resize listener for responsive positioning
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Route Visibility Filtering
  // 1. Exclude Administrative and Authentication pages
  const isExcludedRoute =
    pathname?.startsWith("/dashboard/admin") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email";

  if (isExcludedRoute) {
    return null;
  }

  // 2. Check Master Switch & Channel Count
  if (!config.enabled || !config.channels || config.channels.length === 0) {
    return null;
  }

  // 3. Check Visibility Scope
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  if (config.visibility_scope === "primary" && !isDashboardRoute) {
    // Primary only: only on investor dashboard
    return null;
  }
  if (config.visibility_scope === "secondary" && isDashboardRoute) {
    // Secondary only: only on public website
    return null;
  }

  // 4. Viewport visibility
  if (isMobile && !config.show_on_mobile) {
    return null;
  }
  if (!isMobile && !config.show_on_desktop) {
    return null;
  }

  // Determine current active anchor position and offsets
  const activePosition = isMobile ? config.mobile_position : config.position;
  const activeOffsetX = isMobile ? config.mobile_offset_x : config.offset_x;
  const activeOffsetY = isMobile ? config.mobile_offset_y : config.offset_y;

  // Build inline positioning styles for the launcher button
  const getLauncherStyle = (): React.CSSProperties => {
    if (customPos) {
      return {
        position: "fixed",
        left: `${customPos.x}px`,
        top: `${customPos.y}px`,
        zIndex: 9999,
        touchAction: isDragging ? "none" : "auto",
      };
    }

    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
      touchAction: isDragging ? "none" : "auto",
    };

    if (activePosition === "bottom-right") {
      style.bottom = `${activeOffsetY}px`;
      style.right = `${activeOffsetX}px`;
    } else if (activePosition === "bottom-left") {
      style.bottom = `${activeOffsetY}px`;
      style.left = `${activeOffsetX}px`;
    } else if (activePosition === "top-right") {
      style.top = `${activeOffsetY}px`;
      style.right = `${activeOffsetX}px`;
    } else if (activePosition === "top-left") {
      style.top = `${activeOffsetY}px`;
      style.left = `${activeOffsetX}px`;
    }

    return style;
  };

  // Build positioning style for expanded panel (docked relative to launcher)
  const getPanelStyle = (): React.CSSProperties => {
    if (customPos) {
      const panelWidth = 340;
      const panelHeight = 440;
      let left = customPos.x - panelWidth + 56;
      let top = customPos.y - panelHeight - 12;

      // Keep within viewport boundaries
      if (typeof window !== "undefined") {
        if (left < 16) left = 16;
        if (left + panelWidth > window.innerWidth - 16) left = window.innerWidth - panelWidth - 16;
        if (top < 16) top = customPos.y + 64; // flip below button if close to top
      }

      return {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 10000,
      };
    }

    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 10000,
    };

    if (activePosition === "bottom-right") {
      style.bottom = `${activeOffsetY + 64}px`;
      style.right = `${activeOffsetX}px`;
    } else if (activePosition === "bottom-left") {
      style.bottom = `${activeOffsetY + 64}px`;
      style.left = `${activeOffsetX}px`;
    } else if (activePosition === "top-right") {
      style.top = `${activeOffsetY + 64}px`;
      style.right = `${activeOffsetX}px`;
    } else if (activePosition === "top-left") {
      style.top = `${activeOffsetY + 64}px`;
      style.left = `${activeOffsetX}px`;
    }

    return style;
  };

  // --- DRAGGING CONTROLS (MOUSE & TOUCH) ---
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!config.draggable) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initX: rect.left,
      initY: rect.top,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !config.draggable) return;

    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragStartRef.current.moved = true;
    }

    const newX = dragStartRef.current.initX + deltaX;
    const newY = dragStartRef.current.initY + deltaY;

    // Constrain within viewport
    const maxX = window.innerWidth - 64;
    const maxY = window.innerHeight - 64;
    const clampedX = Math.max(12, Math.min(newX, maxX));
    const clampedY = Math.max(12, Math.min(newY, maxY));

    setCustomPos({ x: clampedX, y: clampedY });
  };

  const handleEndDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (customPos) {
      try {
        sessionStorage.setItem("he_support_widget_pos", JSON.stringify(customPos));
      } catch {
        // ignore
      }
    }
  };

  const handleResetPosition = () => {
    setCustomPos(null);
    try {
      sessionStorage.removeItem("he_support_widget_pos");
    } catch {
      // ignore
    }
  };

  // Channel Click Handler
  const handleChannelClick = (channel: SupportChannel) => {
    setIsOpen(false);

    const type = channel.type.toLowerCase().trim();
    const val = channel.value.trim();

    if (type === "whatsapp") {
      let cleanPhone = val.replace(/[^0-9]/g, "");
      if (channel.country_code && !val.startsWith("+") && !cleanPhone.startsWith(channel.country_code.replace("+", ""))) {
        cleanPhone = `${channel.country_code.replace("+", "")}${cleanPhone}`;
      }
      const msg = channel.prefilled_message ? `?text=${encodeURIComponent(channel.prefilled_message)}` : "";
      window.open(`https://wa.me/${cleanPhone}${msg}`, "_blank", "noopener,noreferrer");
    } else if (type === "telegram") {
      let tgUrl = val;
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        const cleanUser = val.replace("@", "");
        tgUrl = `https://t.me/${cleanUser}`;
      }
      window.open(tgUrl, "_blank", "noopener,noreferrer");
    } else if (type === "messenger") {
      const cleanUser = val.replace(/^https?:\/\/m\.me\//, "").replace("@", "");
      window.open(`https://m.me/${cleanUser}`, "_blank", "noopener,noreferrer");
    } else if (type === "instagram") {
      let igUrl = val;
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        const cleanUser = val.replace("@", "");
        igUrl = `https://instagram.com/${cleanUser}`;
      }
      window.open(igUrl, "_blank", "noopener,noreferrer");
    } else if (type === "email") {
      const subject = channel.prefilled_message ? `?subject=${encodeURIComponent(channel.prefilled_message)}` : "";
      window.location.href = `mailto:${val}${subject}`;
    } else if (type === "phone") {
      const cleanPhone = val.replace(/[^\d+]/g, "");
      window.location.href = `tel:${cleanPhone}`;
    } else if (type === "live_chat") {
      // Trigger Smartsupp or live chat if available
      if (typeof window !== "undefined" && (window as any).smartsupp) {
        try {
          (window as any).smartsupp("chat:open");
        } catch {
          // ignore
        }
      }
    } else {
      // Custom URL or internal path
      if (val.startsWith("/")) {
        window.location.href = val;
      } else {
        window.open(val, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Render Platform Specific Icon
  const renderChannelIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "whatsapp":
        return <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />;
      case "telegram":
        return <TelegramIcon className="h-5 w-5 text-[#229ED9]" />;
      case "messenger":
        return <MessengerIcon className="h-5 w-5 text-[#0084FF]" />;
      case "instagram":
        return <InstagramIcon className="h-5 w-5 text-[#E4405F]" />;
      case "email":
        return <Mail className="h-5 w-5 text-[#EA4335]" />;
      case "phone":
        return <Phone className="h-5 w-5 text-[#10B981]" />;
      case "live_chat":
        return <MessageCircle className="h-5 w-5 text-[#F59E0B]" />;
      default:
        return <ExternalLink className="h-5 w-5 text-[#4388F5]" />;
    }
  };

  const activeChannels = config.channels.filter((c) => c.enabled).sort((a, b) => a.order - b.order);

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        style={getLauncherStyle()}
        aria-label="Open Horizon Equity Concierge Support"
        aria-expanded={isOpen}
        onClick={() => {
          // Only trigger open if the user didn't intentionally drag the launcher
          if (!dragStartRef.current.moved) {
            setIsOpen((prev) => !prev);
          }
        }}
        onMouseDown={(e) => {
          handleStartDrag(e.clientX, e.clientY);
          const onMouseMove = (me: MouseEvent) => handleMoveDrag(me.clientX, me.clientY);
          const onMouseUp = () => {
            handleEndDrag();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleStartDrag(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleMoveDrag(touch.clientX, touch.clientY);
        }}
        onTouchEnd={() => {
          handleEndDrag();
        }}
        className={`group relative flex items-center justify-center h-14 w-14 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4388F5]/60 select-none ${
          isOpen
            ? "bg-[#1E293B] text-white border border-white/20 rotate-90 scale-95"
            : "bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-[#4388F5] text-white shadow-[#4388F5]/30 hover:scale-105 active:scale-95 border border-white/20"
        } ${isDragging ? "cursor-grabbing opacity-90 shadow-none ring-2 ring-[#4388F5]" : "cursor-pointer"}`}
      >
        {/* Pulsing ring indicator when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#4388F5]/30 animate-ping opacity-60 pointer-events-none" />
        )}

        {/* Live status badge */}
        <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-[#10B981] border-2 border-[#0B0F14] shadow-sm z-10" />

        {/* Button Icon */}
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-300 -rotate-90" />
        ) : (
          <Headphones className="h-6 w-6 drop-shadow transition-transform group-hover:scale-110" />
        )}
      </button>

      {/* 2. EXPANDED CONCIERGE SUPPORT PANEL */}
      {isOpen && (
        <div
          ref={panelRef}
          style={getPanelStyle()}
          role="dialog"
          aria-labelledby="concierge-support-title"
          className="w-[calc(100vw-32px)] sm:w-[360px] rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-b from-[#1E293B]/80 to-transparent border-b border-white/5 relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#4388F5]/15 border border-[#4388F5]/30 flex items-center justify-center shrink-0">
                  <Headphones className="h-5 w-5 text-[#4388F5]" />
                </div>
                <div>
                  <h3 id="concierge-support-title" className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    {config.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[11px] font-semibold text-[#10B981]">Desk Active • 24/7 Priority</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-[#A6B0BE] hover:text-white flex items-center justify-center transition border border-white/5"
                aria-label="Close support desk"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Welcome Greeting */}
            {config.welcome_message && (
              <p className="text-xs text-[#94A3B8] leading-relaxed mt-3 px-1">
                {config.welcome_message}
              </p>
            )}
          </div>

          {/* Channels List */}
          <div className="p-3.5 flex flex-col gap-2 max-h-[380px] overflow-y-auto">
            {activeChannels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleChannelClick(channel)}
                className="w-full text-left p-3 rounded-xl bg-[#111827]/70 hover:bg-[#1E293B] border border-white/5 hover:border-white/15 transition-all duration-200 flex items-center justify-between gap-3 group shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0 transition border border-white/5">
                    {renderChannelIcon(channel.type)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate group-hover:text-[#4388F5] transition">
                      {channel.name}
                    </span>
                    {channel.description ? (
                      <span className="text-[11px] text-[#7D8998] block truncate mt-0.5">
                        {channel.description}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#64748B] block truncate mt-0.5 font-mono">
                        {channel.value}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-7 w-7 rounded-lg bg-white/5 group-hover:bg-[#4388F5]/20 text-[#64748B] group-hover:text-[#4388F5] flex items-center justify-center shrink-0 transition">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>

          {/* Footer Security Badge & Position Reset */}
          <div className="px-4 py-2.5 bg-[#0B0F14]/90 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              Institutional 256-Bit SSL
            </span>

            {customPos && (
              <button
                type="button"
                onClick={handleResetPosition}
                className="flex items-center gap-1 text-[#4388F5] hover:text-white transition cursor-pointer"
                title="Reset launcher position to default"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Pos</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

