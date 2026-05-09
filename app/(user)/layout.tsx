"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, History, Bookmark, User,
  LogOut, Menu, X, Bell, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  name: string;
  studentId: string;
  profilePicture?: string;
  membershipTier: string;
  activeBorrowings?: number;
}

const navItems = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/dashboard/books", label: "বই খুঁজুন", icon: BookOpen },
  { href: "/dashboard/borrowed", label: "ধার করা বই", icon: History },
  { href: "/dashboard/reservations", label: "রিজার্ভেশন", icon: Bookmark },
  { href: "/dashboard/profile", label: "প্রোফাইল", icon: User },
];

const tierColors: Record<string, string> = {
  SILVER: "bg-slate-100 text-slate-700",
  GOLDEN: "bg-amber-100 text-amber-700",
  PLATINUM: "bg-teal-100 text-teal-700",
};

const tierLabels: Record<string, string> = {
  SILVER: "সিলভার",
  GOLDEN: "গোল্ডেন",
  PLATINUM: "প্লাটিনাম",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && setUser(d.data))
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-surface-2 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
            )}

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: sidebarOpen || typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : -280 }}
              className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-gradient-hero border-r border-white/5 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              } transition-transform lg:transition-none`}
            >
              {/* Sidebar header */}
              <div className="flex items-center gap-3 p-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-gold/40 shrink-0">
                  <Image src="/images/logo.jpg" alt="Logo" width={36} height={36} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gold text-xs font-medium font-bangla truncate">কাফেলা গ্রন্থাগার</p>
                  <p className="text-white/50 text-xs font-bangla truncate">শিক্ষার্থী পোর্টাল</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* User card */}
              {user && (
                <div className="mx-3 mt-3 p-3 glass rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-700 shrink-0">
                      {user.profilePicture ? (
                        <Image src={user.profilePicture} alt={user.name} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm font-bangla">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium font-bangla truncate">{user.name}</p>
                      <p className="text-white/50 text-xs font-english">{user.studentId}</p>
                    </div>
                  </div>
                  {user.membershipTier && (
                    <div className="mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full font-bangla ${tierColors[user.membershipTier]}`}>
                        {tierLabels[user.membershipTier]}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Nav items */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-item ${active ? "active" : ""}`}
                    >
                      <item.icon size={18} />
                      <span className="font-bangla text-sm">{item.label}</span>
                      {item.href === "/dashboard/borrowed" && (user?.activeBorrowings || 0) > 0 && (
                        <span className="ml-auto bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-english">
                          {user?.activeBorrowings}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut size={18} />
                  <span className="font-bangla text-sm">লগআউট</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <p className="text-primary font-bold font-bangla-serif text-lg">
                {navItems.find((n) => n.href === pathname)?.label || "ড্যাশবোর্ড"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!user?.profilePicture && (
              <Link
                href="/dashboard/profile"
                className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-bangla hover:bg-amber-100 transition-colors"
              >
                ⚠ প্রোফাইল ছবি যোগ করুন
              </Link>
            )}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100">
                  {user?.profilePicture ? (
                    <Image src={user.profilePicture} alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm font-bangla">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-700 font-bangla hidden sm:block">{user?.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden z-50"
                  >
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bangla"
                    >
                      <User size={16} />
                      প্রোফাইল
                    </Link>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bangla"
                    >
                      <LogOut size={16} />
                      লগআউট
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
