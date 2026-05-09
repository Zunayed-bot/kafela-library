"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, AlertTriangle, Bookmark, ArrowRight,
  CheckCircle2, Calendar, BookMarked,
} from "lucide-react";
import { formatDateBn, getDaysOverdue, getDaysRemaining, isOverdue, membershipTierLabel, membershipTierColor, banglaNumber } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

interface Borrowing {
  id: string;
  dueDate: string;
  issuedDate: string;
  status: string;
  book: { title: string; author: string; coverImage?: string };
}

interface UserProfile {
  name: string;
  studentId: string;
  profilePicture?: string;
  membershipTier: string;
  borrowLimit: number;
  department?: string;
  session?: string;
  activeBorrowings: number;
  _count: { borrowings: number; reservations: number };
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/borrowings?status=ACTIVE&limit=5").then((r) => r.json()),
    ]).then(([userData, borrowingData]) => {
      if (userData.success) setUser(userData.data);
      if (borrowingData.success) setBorrowings(borrowingData.data.borrowings || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const overdueCount = borrowings.filter((b) => isOverdue(b.dueDate)).length;
  const activeCount = borrowings.filter((b) => b.status === "ACTIVE" && !isOverdue(b.dueDate)).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <motion.div variants={fadeUp} className="bg-gradient-hero rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-overlay opacity-30" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-gold/50 bg-primary-700">
              {user?.profilePicture ? (
                <Image src={user.profilePicture} alt={user.name || ""} width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold font-bangla">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            {!user?.profilePicture && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                <AlertTriangle size={10} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-white/60 text-sm font-bangla">আস-সালামু আলাইকুম,</p>
            <h1 className="text-xl font-bold text-white font-bangla-serif">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-white/60 text-xs font-english">#{user?.studentId}</span>
              {user?.membershipTier && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full font-bangla ${membershipTierColor(user.membershipTier)}`}>
                  {membershipTierLabel(user.membershipTier)}
                </span>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/books"
            className="flex items-center gap-2 bg-gold hover:bg-gold-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all font-bangla text-sm shrink-0"
          >
            <BookOpen size={16} />
            বই ধার করুন
          </Link>
        </div>

        {!user?.profilePicture && (
          <div className="relative mt-4 bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3">
            <p className="text-amber-200 text-sm font-bangla">
              ⚠ বই নিতে প্রোফাইল ছবি আপলোড করুন।{" "}
              <Link href="/dashboard/profile" className="underline hover:text-amber-100">এখনই আপলোড করুন</Link>
            </p>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "সক্রিয় ধার",
            value: banglaNumber(activeCount),
            icon: BookOpen,
            color: "text-blue-600 bg-blue-50",
            border: "border-blue-100",
          },
          {
            label: "মেয়াদ উত্তীর্ণ",
            value: banglaNumber(overdueCount),
            icon: AlertTriangle,
            color: "text-red-600 bg-red-50",
            border: "border-red-100",
          },
          {
            label: "মোট ধার",
            value: banglaNumber(user?._count?.borrowings || 0),
            icon: BookMarked,
            color: "text-green-600 bg-green-50",
            border: "border-green-100",
          },
          {
            label: "রিজার্ভেশন",
            value: banglaNumber(user?._count?.reservations || 0),
            icon: Bookmark,
            color: "text-purple-600 bg-purple-50",
            border: "border-purple-100",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`bg-white rounded-2xl p-4 border ${stat.border} card-hover`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-english">{stat.value}</p>
            <p className="text-sm text-gray-500 font-bangla mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Borrowings */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 font-bangla flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            সক্রিয় ধার
          </h2>
          <Link href="/dashboard/borrowed" className="text-sm text-primary hover:underline font-bangla flex items-center gap-1">
            সব দেখুন <ArrowRight size={14} />
          </Link>
        </div>

        {borrowings.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bangla">কোনো সক্রিয় ধার নেই।</p>
            <Link href="/dashboard/books" className="mt-3 inline-block text-sm text-primary hover:underline font-bangla">
              বই ধার করুন →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {borrowings.map((b) => {
              const overdue = isOverdue(b.dueDate);
              const daysOver = getDaysOverdue(b.dueDate);
              const daysLeft = getDaysRemaining(b.dueDate);

              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Book cover */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-primary-50 shrink-0">
                    {b.book.coverImage ? (
                      <Image src={b.book.coverImage} alt={b.book.title} width={48} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={20} className="text-primary-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 font-bangla truncate">{b.book.title}</p>
                    <p className="text-gray-500 text-sm font-bangla">{b.book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500 font-bangla">
                        ফেরতের তারিখ: {formatDateBn(b.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {overdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bangla">
                        <AlertTriangle size={12} />
                        {banglaNumber(daysOver)} দিন বিলম্ব
                      </span>
                    ) : daysLeft <= 2 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-bangla">
                        <Clock size={12} />
                        {banglaNumber(daysLeft)} দিন বাকি
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bangla">
                        <CheckCircle2 size={12} />
                        {banglaNumber(daysLeft)} দিন বাকি
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick links */}
      <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/books", label: "বই খুঁজুন", desc: "ক্যাটালগ ব্রাউজ করুন", icon: BookOpen, color: "bg-primary" },
          { href: "/dashboard/borrowed", label: "ধার ইতিহাস", desc: "সকল ধারের রেকর্ড", icon: History, color: "bg-gold" },
          { href: "/dashboard/profile", label: "প্রোফাইল", desc: "তথ্য আপডেট করুন", icon: User, color: "bg-purple-600" },
        ].map((link, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Link
              href={link.href}
              className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary-100 hover:shadow-card transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl ${link.color} flex items-center justify-center shrink-0`}>
                <link.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 font-bangla">{link.label}</p>
                <p className="text-gray-500 text-xs font-bangla">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function History({ size, className }: { size: number; className?: string }) {
  return <Clock size={size} className={className} />;
}
function User({ size, className }: { size: number; className?: string }) {
  return <BookMarked size={size} className={className} />;
}
