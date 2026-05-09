"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, BookMarked, AlertTriangle,
  ScrollText, LogOut, Menu, X, ChevronDown, Settings, Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/books", label: "বই ব্যবস্থাপনা", icon: BookOpen },
  { href: "/admin/users", label: "সদস্য ব্যবস্থাপনা", icon: Users },
  { href: "/admin/borrowings", label: "ধার ব্যবস্থাপনা", icon: BookMarked },
  { href: "/admin/overdue", label: "মেয়াদ উত্তীর্ণ", icon: AlertTriangle },
  { href: "/admin/logs", label: "অডিট লগ", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.data.role !== "ADMIN") router.push("/dashboard");
          else setAdminName(d.data.name);
        } else {
          router.push("/login");
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const currentLabel = navItems.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "অ্যাডমিন";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-primary-950 border-r border-white/5 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-gold/40 shrink-0">
            <Image src="/images/logo.jpg" alt="Logo" width={36} height={36} className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gold text-xs font-semibold font-bangla truncate">কাফেলা গ্রন্থাগার</p>
            <p className="text-white/50 text-xs font-bangla">অ্যাডমিন প্যানেল</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="mx-3 mt-3 p-3 glass rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
              <Settings size={16} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium font-bangla truncate">{adminName}</p>
              <p className="text-gold text-xs font-bangla">সুপার অ্যাডমিন</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-item ${active ? "active" : ""} ${item.href === "/admin/overdue" && !active ? "text-red-300/80 hover:text-red-300" : ""}`}
              >
                <item.icon size={18} />
                <span className="font-bangla text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* View site */}
        <div className="px-3 py-2">
          <Link href="/" className="sidebar-item text-white/40 hover:text-white/70" target="_blank">
            <Globe size={16} />
            <span className="font-bangla text-sm">সাইট দেখুন</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={18} />
            <span className="font-bangla text-sm">লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1">
              <Menu size={22} />
            </button>
            <div>
              <p className="text-primary font-bold font-bangla-serif text-lg">{currentLabel}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-sm font-bangla">
                {adminName.charAt(0)}
              </div>
              <span className="text-sm text-gray-700 font-bangla hidden sm:block">{adminName}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden z-50"
                >
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bangla">
                    <LogOut size={16} />
                    লগআউট
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
