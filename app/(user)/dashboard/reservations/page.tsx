"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Clock, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDateBn, banglaNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface Reservation {
  id: string;
  requestedAt: string;
  expiresAt?: string;
  status: string;
  queuePosition: number;
  book: { title: string; titleBangla?: string; author: string; authorBangla?: string; coverImage?: string; availableCopies: number };
}

const STATUS_INFO: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "অপেক্ষমাণ", cls: "bg-amber-100 text-amber-700" },
  READY: { label: "প্রস্তুত — নিন!", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "বাতিল", cls: "bg-gray-100 text-gray-500" },
  EXPIRED: { label: "মেয়াদ শেষ", cls: "bg-red-100 text-red-600" },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    const res = await fetch("/api/reservations?limit=50");
    const data = await res.json();
    if (data.success) setReservations(data.data.reservations || []);
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    setCancelling(null);
    if (res.ok) {
      toast.success("রিজার্ভেশন বাতিল হয়েছে।");
      fetchReservations();
    } else {
      toast.error(data.error || "বাতিল ব্যর্থ হয়েছে।");
    }
  };

  const active = reservations.filter((r) => r.status === "PENDING" || r.status === "READY");
  const past = reservations.filter((r) => r.status === "CANCELLED" || r.status === "EXPIRED");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary font-bangla-serif">আমার রিজার্ভেশন</h1>
        <p className="text-gray-500 text-sm font-bangla mt-0.5">
          {loading ? "লোড হচ্ছে..." : `${banglaNumber(active.length)}টি সক্রিয় রিজার্ভেশন`}
        </p>
      </div>

      {/* Ready alert */}
      {!loading && reservations.some((r) => r.status === "READY") && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <p className="text-green-700 text-sm font-bangla">
            একটি বই আপনার জন্য প্রস্তুত! অনুগ্রহ করে লাইব্রেরি থেকে সংগ্রহ করুন।
          </p>
        </div>
      )}

      {/* Active reservations */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <div className="skeleton w-12 h-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">কোনো সক্রিয় রিজার্ভেশন নেই।</p>
          <p className="text-gray-400 font-bangla text-sm mt-1">বই তালিকা থেকে রিজার্ভ করুন।</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 font-bangla text-sm">সক্রিয় রিজার্ভেশন</h2>
          {active.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border p-4 flex gap-4 ${r.status === "READY" ? "border-green-300" : "border-gray-100"}`}
            >
              {/* Cover */}
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-primary-50 shrink-0">
                {r.book.coverImage ? (
                  <Image src={r.book.coverImage} alt={r.book.title} width={48} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={18} className="text-primary-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 font-bangla truncate">{r.book.titleBangla || r.book.title}</p>
                <p className="text-gray-500 text-sm font-bangla">{r.book.authorBangla || r.book.author}</p>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full font-bangla ${STATUS_INFO[r.status]?.cls}`}>
                    {STATUS_INFO[r.status]?.label}
                  </span>
                  {r.status === "PENDING" && (
                    <span className="text-xs text-gray-500 font-bangla flex items-center gap-1">
                      <Clock size={12} />
                      সিরিয়াল: {banglaNumber(r.queuePosition)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-bangla flex items-center gap-1">
                    <Clock size={12} />
                    রিজার্ভ: {formatDateBn(r.requestedAt)}
                  </span>
                  {r.expiresAt && r.status === "READY" && (
                    <span className="text-xs text-amber-600 font-bangla flex items-center gap-1">
                      <AlertCircle size={12} />
                      মেয়াদ: {formatDateBn(r.expiresAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Cancel */}
              {r.status === "PENDING" && (
                <button
                  onClick={() => handleCancel(r.id)}
                  disabled={cancelling === r.id}
                  className="self-start flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors font-bangla disabled:opacity-50"
                >
                  {cancelling === r.id ? (
                    <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  বাতিল
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Past reservations */}
      {!loading && past.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-500 font-bangla text-sm">পুরানো রিজার্ভেশন</h2>
          {past.map((r) => (
            <div key={r.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex gap-4 opacity-70">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {r.book.coverImage ? (
                  <Image src={r.book.coverImage} alt={r.book.title} width={48} height={64} className="object-cover w-full h-full grayscale" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={18} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-600 font-bangla truncate">{r.book.titleBangla || r.book.title}</p>
                <p className="text-gray-400 text-sm font-bangla">{r.book.authorBangla || r.book.author}</p>
                <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full font-bangla ${STATUS_INFO[r.status]?.cls}`}>
                  {STATUS_INFO[r.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
