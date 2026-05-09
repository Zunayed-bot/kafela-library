"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen, Users, BookMarked, AlertTriangle, RotateCcw, TrendingUp,
  Bookmark, UserCheck, Clock, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDate, banglaNumber } from "@/lib/utils";

interface Stats {
  totalBooks: number;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  issuedBooks: number;
  overdueBooks: number;
  reservations: number;
  returnedToday: number;
  issuedToday: number;
  availableBooks: number;
  recentBorrowings: Array<{
    id: string;
    issuedDate: string;
    dueDate: string;
    status: string;
    user: { name: string; studentId: string; profilePicture?: string };
    book: { title: string; author: string; coverImage?: string };
  }>;
  categoryStats: Array<{ category: string; _count: { category: number } }>;
  monthlyData: Array<{ month: string; count: number }>;
}

const COLORS = ["#1a3c34", "#c9a227", "#2d6a5f", "#e8c96d", "#4d9e90", "#9a7a1a", "#81bfb3", "#e8b52d"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => d.success && setStats(d.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statsCards = [
    { label: "মোট বই", value: banglaNumber(stats.totalBooks), icon: BookOpen, color: "bg-primary", change: `${banglaNumber(stats.availableBooks)} উপলব্ধ` },
    { label: "সক্রিয় সদস্য", value: banglaNumber(stats.activeUsers), icon: Users, color: "bg-emerald-600", change: `${banglaNumber(stats.pendingUsers)} অপেক্ষমাণ` },
    { label: "ইস্যু করা বই", value: banglaNumber(stats.issuedBooks), icon: BookMarked, color: "bg-blue-600", change: `আজ ${banglaNumber(stats.issuedToday)}টি ইস্যু` },
    { label: "মেয়াদ উত্তীর্ণ", value: banglaNumber(stats.overdueBooks), icon: AlertTriangle, color: "bg-red-600", change: "অবিলম্বে ব্যবস্থা নিন" },
    { label: "আজ ফেরত", value: banglaNumber(stats.returnedToday), icon: RotateCcw, color: "bg-purple-600", change: "সফল রিটার্ন" },
    { label: "রিজার্ভেশন", value: banglaNumber(stats.reservations), icon: Bookmark, color: "bg-amber-600", change: "অপেক্ষায় আছে" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-7xl">
      {/* Stats grid */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-card transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-english">{card.value}</p>
            <p className="text-sm font-medium text-gray-700 font-bangla mt-0.5">{card.label}</p>
            <p className="text-xs text-gray-400 font-bangla mt-1">{card.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly chart */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-bold text-gray-900 font-bangla">মাসিক ধারের পরিসংখ্যান</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Inter" }} />
              <YAxis tick={{ fontSize: 12, fontFamily: "Inter" }} />
              <Tooltip
                formatter={(value) => [banglaNumber(Number(value)), "ধার"]}
                contentStyle={{ fontFamily: "Hind Siliguri, sans-serif", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="count" fill="#1a3c34" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category chart */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={18} className="text-primary" />
            <h2 className="font-bold text-gray-900 font-bangla">বিভাগ অনুযায়ী বই</h2>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={stats.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="_count.category"
                  nameKey="category"
                >
                  {stats.categoryStats.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [banglaNumber(Number(v)), "বই"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {stats.categoryStats.slice(0, 6).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-gray-600 font-bangla truncate">{cat.category}</span>
                  <span className="ml-auto text-xs font-bold text-gray-900 font-english">{banglaNumber(cat._count.category)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/users", label: "নতুন সদস্য যোগ করুন", icon: UserCheck, color: "bg-emerald-500", count: stats.pendingUsers, countLabel: "অপেক্ষমাণ" },
          { href: "/admin/books", label: "নতুন বই যোগ করুন", icon: BookOpen, color: "bg-primary", count: stats.totalBooks, countLabel: "মোট বই" },
          { href: "/admin/overdue", label: "মেয়াদ উত্তীর্ণ দেখুন", icon: AlertTriangle, color: "bg-red-500", count: stats.overdueBooks, countLabel: "জরুরি" },
        ].map((action, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Link
              href={action.href}
              className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary-100 hover:shadow-card transition-all"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shrink-0`}>
                <action.icon size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 font-bangla">{action.label}</p>
                <p className="text-xs text-gray-400 font-bangla mt-0.5">
                  {banglaNumber(action.count)} {action.countLabel}
                </p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Borrowings */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 font-bangla flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            সাম্প্রতিক ধার
          </h2>
          <Link href="/admin/borrowings" className="text-sm text-primary hover:underline font-bangla flex items-center gap-1">
            সব দেখুন <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {stats.recentBorrowings.slice(0, 8).map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                {b.user.profilePicture ? (
                  <Image src={b.user.profilePicture} alt={b.user.name} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold font-bangla">
                    {b.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm font-bangla truncate">{b.user.name}</p>
                <p className="text-xs text-gray-500 font-bangla truncate">{b.book.title}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500 font-english">{formatDate(b.issuedDate)}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  b.status === "RETURNED" ? "bg-green-100 text-green-700" :
                  b.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                } font-bangla`}>
                  {b.status === "RETURNED" ? "ফেরত" : b.status === "OVERDUE" ? "মেয়াদ উত্তীর্ণ" : "সক্রিয়"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
