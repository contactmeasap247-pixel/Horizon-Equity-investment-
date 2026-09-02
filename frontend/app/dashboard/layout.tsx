"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

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

  // Initialize session state
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protected route check
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
      const unread = response.data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.warn("Error fetching notifications:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 30s for notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!isInitialized || (!isAuthenticated && isInitialized)) {
    return (
      <div className="min-h-screen bg-[#07111F] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
        <p className="text-sm text-text-secondary">Establishing secure connection...</p>
      </div>
    );
  }

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Wallets & Deposits", href: "/dashboard/wallets", icon: Wallet },
    { name: "Investments Plans", href: "/dashboard/investments", icon: TrendingUp },
    { name: "Referral Network", href: "/dashboard/referrals", icon: Share2 },
    { name: "Support Tickets", href: "/dashboard/tickets", icon: HelpCircle },
    { name: "Audit Transactions", href: "/dashboard/transactions", icon: History },
  ];

  const adminItems = [
    { name: "Admin Stats", href: "/dashboard/admin", icon: Shield },
    { name: "System Wallets", href: "/dashboard/admin/wallets", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col md:flex-row text-white font-sans">
      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-[#0A2540] border-r border-white/5 flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col gap-8 overflow-y-auto">
          {/* Brand header */}
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0">
                <Image src="/logo.jpg" alt="Horizon Equity Logo" width={40} height={40} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-wider text-gradient">HORIZON</span>
                <span className="text-[8px] font-semibold tracking-widest text-text-muted">EQUITY</span>
              </div>
            </Link>
            <button className="md:hidden text-text-muted hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User links list */}
          <nav className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">Member Panel</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Admin specific links */}
            {user?.is_admin && (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 mt-6 mb-2">Administration</span>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* User profile actions bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col px-3">
            <span className="text-sm font-semibold truncate text-white">{user?.full_name}</span>
            <span className="text-[10px] text-text-muted mt-0.5 truncate">{user?.email}</span>
            {user?.is_admin && <span className="badge badge-gold mt-2 self-start py-0.5 px-2">ADMIN</span>}
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left hover:text-[#ff6b6b] hover:bg-red-500/5 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content viewport wrapper */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#07111F]/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-secondary hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold tracking-tight">
              {menuItems.find((i) => i.href === pathname)?.name || adminItems.find((i) => i.href === pathname)?.name || "Overview"}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification alert dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="h-10 w-10 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center text-text-secondary hover:text-white transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-300" />
                )}
              </button>

              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 max-h-[380px] bg-[#0A2540] border border-white/10 rounded-xl shadow-2xl overflow-y-auto flex flex-col z-50 animate-slide-up">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[10px] text-gold-300 font-semibold hover:text-gold-200"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-text-muted">
                          No notifications to display
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-4 flex flex-col gap-1 text-xs ${n.is_read ? "opacity-60" : "bg-white/[0.01]"}`}>
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-white">{n.title}</span>
                              {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-gold-300 flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-text-secondary leading-relaxed mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-text-muted mt-1">
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

            {/* Quick Profile Header Badge */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center font-bold text-[10px] text-[#07111F]">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-text-secondary">{user?.full_name}</span>
            </Link>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 p-6 md:p-8 bg-[#07111F] relative overflow-y-auto">
          {/* User suspension warning */}
          {user?.kyc_status === "rejected" && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-[#ff6b6b] flex items-center justify-between">
              <span>Your KYC application was rejected. Please re-submit your documentation to resolve the issue.</span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
