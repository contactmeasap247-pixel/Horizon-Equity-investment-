"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Share2,
  HelpCircle,
  History,
  Shield,
  LogOut,
  Bell,
  Menu,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import BrandLogo from "@/app/components/BrandLogo";
import LanguageSelector from "@/app/components/LanguageSelector";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, initialize, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize session
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protected route guard
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Fetch notifications with memoized callback
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
      const unread = response.data.filter((n: NotificationItem) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Background notifications failure ignored
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!isInitialized || (!isAuthenticated && isInitialized)) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Verifying secure session...</p>
      </div>
    );
  }

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Wallets & Deposits", href: "/dashboard/wallets", icon: Wallet },
    { name: "Investment Plans", href: "/dashboard/investments", icon: TrendingUp },
    { name: "Referral Network", href: "/dashboard/referrals", icon: Share2 },
    { name: "Support Desk", href: "/dashboard/tickets", icon: HelpCircle },
    { name: "Audit Ledgers", href: "/dashboard/transactions", icon: History },
  ];

  const adminItems = [
    { name: "Admin Dashboard", href: "/dashboard/admin", icon: Shield },
    { name: "System Wallets", href: "/dashboard/admin/wallets", icon: Wallet },
  ];

  const currentTitle =
    menuItems.find((i) => i.href === pathname)?.name ||
    adminItems.find((i) => i.href === pathname)?.name ||
    "Client Portal";

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col md:flex-row text-[#F5F7FA] font-sans selection:bg-[#4388F5]/30">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen bg-[#111821] border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Brand header */}
          <div className="flex justify-between items-center pb-2">
            <BrandLogo size="md" href="/dashboard" withSubtitle={false} />
            <button
              type="button"
              className="md:hidden p-1 text-[#7D8998] hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1" aria-label="Portal Navigation">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8998] px-2 mb-1">
              Member Operations
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`side-link ${isActive ? "bg-[#4388F5]/12 text-white font-semibold" : ""}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#4388F5]" : "text-[#7D8998]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Admin Section */}
            {user?.is_admin && (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8998] px-2 mt-5 mb-1">
                  System Administration
                </span>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`side-link ${isActive ? "bg-[#4388F5]/12 text-white font-semibold" : ""}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#4388F5]" : "text-[#7D8998]"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded bg-[#151F2B] border border-white/10 flex items-center justify-center font-bold text-xs text-[#4388F5] shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold truncate text-[#F5F7FA]">{user?.full_name}</span>
              <span className="text-[10px] text-[#7D8998] truncate">{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="side-link w-full text-left text-xs text-[#F06464] hover:bg-[#F06464]/10 hover:text-[#F06464]"
          >
            <LogOut className="h-4 w-4 text-[#F06464]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#0B0F14]/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-1.5 rounded-md bg-[#111821] border border-white/10 text-[#A6B0BE] hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector compact />

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label={`Notifications (${unreadCount} unread)`}
                className="h-9 w-9 rounded-md border border-white/10 bg-[#111821] flex items-center justify-center text-[#A6B0BE] hover:text-white hover:border-white/20 transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#4388F5]" />
                )}
              </button>

              {notifDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-h-96 bg-[#151F2B] border border-white/10 rounded-md shadow-2xl overflow-y-auto flex flex-col z-50 animate-rise">
                    <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-[10px] text-[#4388F5] font-semibold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#7D8998]">
                          No notifications to display
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 flex flex-col gap-1 text-xs ${
                              n.is_read ? "opacity-60" : "bg-[#4388F5]/5"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-white">{n.title}</span>
                              {!n.is_read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#4388F5] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[#A6B0BE] leading-relaxed mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-[#7D8998] mt-1">
                              {new Date(n.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/10 bg-[#111821]">
              <span className="text-xs font-semibold text-[#F5F7FA]">{user?.full_name}</span>
              {user?.is_admin && (
                <span className="badge badge-accent text-[9px] py-0 px-1">Admin</span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 bg-[#0B0F14] overflow-y-auto">
          {/* KYC Status Alert */}
          {user?.kyc_status === "rejected" && (
            <div className="alert alert-danger mb-6">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div className="alert-content text-xs">
                Your KYC compliance application was rejected. Please open a support ticket to re-verify your identity documentation.
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
