"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, User, BookOpen, Calendar, Search, RotateCcw } from "lucide-react";
import { formatDate, banglaNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface OverdueBorrowing {
  id: string;
  issuedDate: string;
  dueDate: string;
  daysOverdue: number;
  user: { id: string; name: string; studentId: string; phone: string; profilePicture?: string; department?: string };
  book: { id: string; title: string; titleBangla?: string; author: string; coverImage?: string; shelfNumber?: string };
}

export default function AdminOverduePage() {
  const [borrowings, setBorrowings] = useState<OverdueBorrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [returning, setReturning] = useState<string | null>(null);

  const fetchOverdue = async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "OVERDUE", limit: "100", ...(search && { search }) });
    const res = await fetch(`/api/admin/borrowings?${params}`);
    const data = await res.json();
    if (data.success) {
      const now = new Date();
      const items = (data.data.borrowings || []).map((b: OverdueBorrowing & { dueDate: string }) => ({
        ...b,
        daysOverdue: Math.floor((now.getTime() - new Date(b.dueDate).getTime()) / 86400000),
      }));
      setBorrowings(items);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOverdue(); }, [search]);

  const handleReturn = async (id: string) => {
    setReturning(id);
    const res = await fetch(`/api/borrowings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "return" }),
    });
    const data = await res.json();
    setReturning(null);
    if (res.ok) {
      toast.success("বই ফেরত নেওয়া হয়েছে!");
      fetchOverdue();
    } else {
      toast.error(data.error || "ফেরত ব্যর্থ হয়েছে।");
    }
  };

  const urgencyColor = (days: number) => {
    if (days >= 14) return "border-red-400 bg-red-50";
    if (days >= 7) return "border-orange-300 bg-orange-50";
    return "border-amber-200 bg-amber-50";
  };

  const urgencyBadge = (days: number) => {
    if (days >= 14) return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-bangla">{banglaNumber(days)} দিন বিলম্ব — জরুরি!</span>;
    if (days >= 7) return <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-bangla">{banglaNumber(days)} দিন বিলম্ব</span>;
    return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bangla">{banglaNumber(days)} দিন বিলম্ব</span>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-red-600 font-bangla-serif flex items-center gap-2">
          <AlertTriangle size={24} />
          মেয়াদ উত্তীর্ণ বই
        </h1>
        <p className="text-gray-500 text-sm font-bangla mt-0.5">
          {loading ? "লোড হচ্ছে..." : `${banglaNumber(borrowings.length)}টি বই মেয়াদ উত্তীর্ণ`}
        </p>
      </div>

      {/* Summary alert */}
      {!loading && borrowings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3"
        >
          <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 font-bangla">
              {banglaNumber(borrowings.filter((b) => b.daysOverdue >= 14).length)}টি বই ১৪ দিনের বেশি মেয়াদ উত্তীর্ণ — অবিলম্বে ব্যবস্থা নিন।
            </p>
            <p className="text-red-600 text-sm font-bangla mt-0.5">
              সদস্যদের সাথে যোগাযোগ করুন এবং বই ফেরত নিশ্চিত করুন।
            </p>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="সদস্যের নাম বা বইয়ের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bangla focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : borrowings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={30} className="text-green-500" />
          </div>
          <p className="text-gray-500 font-bangla text-lg font-medium">কোনো মেয়াদ উত্তীর্ণ বই নেই!</p>
          <p className="text-gray-400 font-bangla text-sm mt-1">সকল বই যথাসময়ে ফেরত দেওয়া হয়েছে।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {borrowings.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border-2 p-4 ${urgencyColor(b.daysOverdue)}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* User */}
                <div className="flex items-center gap-3 sm:w-52 shrink-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                    {b.user.profilePicture ? (
                      <Image src={b.user.profilePicture} alt={b.user.name} width={44} height={44} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold font-bangla">
                        {b.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm font-bangla">{b.user.name}</p>
                    <p className="text-xs text-gray-500 font-english">{b.user.studentId}</p>
                    {b.user.department && <p className="text-xs text-gray-400 font-bangla">{b.user.department}</p>}
                  </div>
                </div>

                {/* Book */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm font-bangla">{b.book.titleBangla || b.book.title}</p>
                  <p className="text-xs text-gray-500 font-bangla">{b.book.author}</p>
                  {b.book.shelfNumber && <p className="text-xs text-gray-400 font-english mt-0.5">শেলফ: {b.book.shelfNumber}</p>}
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-2 sm:items-end">
                  {urgencyBadge(b.daysOverdue)}
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-bangla">
                    <Calendar size={12} />
                    ফেরত ছিল: {formatDate(b.dueDate)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-bangla font-medium">
                    <Phone size={12} />
                    {b.user.phone}
                  </div>
                </div>

                {/* Return btn */}
                <div className="flex items-center sm:items-end">
                  <button
                    onClick={() => handleReturn(b.id)}
                    disabled={returning === b.id}
                    className="flex items-center gap-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-colors font-bangla disabled:opacity-50 shadow-sm"
                  >
                    {returning === b.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <RotateCcw size={15} />
                    )}
                    ফেরত নিন
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
