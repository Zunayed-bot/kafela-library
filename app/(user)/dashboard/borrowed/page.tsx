"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, CheckCircle2, AlertTriangle, Calendar, RotateCcw,
} from "lucide-react";
import { formatDateBn, getDaysOverdue, getDaysRemaining, isOverdue, banglaNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface Borrowing {
  id: string;
  issuedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: string;
  renewCount: number;
  maxRenewals: number;
  book: { title: string; titleBangla?: string; author: string; authorBangla?: string; coverImage?: string; shelfNumber?: string };
}

const tabs = [
  { key: "all", label: "সব" },
  { key: "ACTIVE", label: "সক্রিয়" },
  { key: "OVERDUE", label: "মেয়াদ উত্তীর্ণ" },
  { key: "RETURNED", label: "ফেরত দেওয়া" },
];

export default function BorrowedPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [renewing, setRenewing] = useState<string | null>(null);

  const fetchBorrowings = async () => {
    setLoading(true);
    const status = activeTab === "all" ? "" : activeTab;
    const res = await fetch(`/api/borrowings?limit=50${status ? `&status=${status}` : ""}`);
    const data = await res.json();
    if (data.success) setBorrowings(data.data.borrowings || []);
    setLoading(false);
  };

  useEffect(() => { fetchBorrowings(); }, [activeTab]);

  const handleRenew = async (id: string) => {
    setRenewing(id);
    const res = await fetch(`/api/borrowings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("ধারের মেয়াদ নবায়ন হয়েছে!");
      fetchBorrowings();
    } else {
      toast.error(data.error || "নবায়ন ব্যর্থ হয়েছে।");
    }
    setRenewing(null);
  };

  const overdueCount = borrowings.filter((b) => b.status === "OVERDUE").length;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary font-bangla-serif">ধার ইতিহাস</h1>
        <p className="text-gray-500 text-sm font-bangla mt-0.5">আপনার সকল ধারের রেকর্ড</p>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          <p className="text-red-700 text-sm font-bangla">
            <strong>{banglaNumber(overdueCount)}টি বই</strong> মেয়াদ উত্তীর্ণ। অনুগ্রহ করে ফেরত দিন।
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all font-bangla ${
              activeTab === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4">
              <div className="skeleton w-12 h-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : borrowings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla">কোনো রেকর্ড পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {borrowings.map((b, i) => {
            const overdue = isOverdue(b.dueDate) && b.status !== "RETURNED";
            const daysOver = getDaysOverdue(b.dueDate);
            const daysLeft = getDaysRemaining(b.dueDate);
            const canRenew = b.status !== "RETURNED" && b.renewCount < b.maxRenewals;

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border ${overdue ? "border-red-200" : "border-gray-100"} p-4 flex gap-4`}
              >
                {/* Cover */}
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-primary-50 shrink-0">
                  {b.book.coverImage ? (
                    <Image src={b.book.coverImage} alt={b.book.title} width={48} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={18} className="text-primary-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 font-bangla truncate">
                    {b.book.titleBangla || b.book.title}
                  </p>
                  <p className="text-gray-500 text-sm font-bangla">{b.book.authorBangla || b.book.author}</p>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-bangla">
                      <Calendar size={12} />
                      ইস্যু: {formatDateBn(b.issuedDate)}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bangla ${overdue ? "text-red-600" : "text-gray-500"}`}>
                      <Clock size={12} />
                      ফেরত: {formatDateBn(b.dueDate)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Status badge */}
                    <div>
                      {b.status === "RETURNED" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-bangla">
                          <CheckCircle2 size={12} />
                          {b.returnedDate ? `${formatDateBn(b.returnedDate)} ফেরত` : "ফেরত দেওয়া"}
                        </span>
                      ) : overdue ? (
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
                          <Clock size={12} />
                          {banglaNumber(daysLeft)} দিন বাকি
                        </span>
                      )}
                    </div>

                    {/* Renew button */}
                    {canRenew && (
                      <button
                        onClick={() => handleRenew(b.id)}
                        disabled={renewing === b.id}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-700 border border-primary-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors font-bangla disabled:opacity-50"
                      >
                        {renewing === b.id ? (
                          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RotateCcw size={12} />
                        )}
                        নবায়ন ({banglaNumber(b.renewCount)}/{banglaNumber(b.maxRenewals)})
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
