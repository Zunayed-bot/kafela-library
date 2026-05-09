"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Search, ChevronLeft, ChevronRight, Shield, User, BookOpen, BookMarked, Settings, LogIn } from "lucide-react";
import { banglaNumber } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; studentId: string; role: string };
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  LOGIN: LogIn,
  BOOK_CREATED: BookOpen,
  BOOK_UPDATED: BookOpen,
  BOOK_DELETED: BookOpen,
  BOOK_ISSUED: BookMarked,
  BOOK_RETURNED: BookMarked,
  BOOK_RENEWED: BookMarked,
  BOOK_RESERVED: BookMarked,
  USER_CREATED: User,
  USER_UPDATED: User,
  USER_DELETED: User,
  USER_ACTIVATED: User,
  PASSWORD_RESET: Shield,
  SETTINGS_UPDATED: Settings,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  BOOK_CREATED: "bg-green-100 text-green-700",
  BOOK_UPDATED: "bg-amber-100 text-amber-700",
  BOOK_DELETED: "bg-red-100 text-red-700",
  BOOK_ISSUED: "bg-primary-100 text-primary-700",
  BOOK_RETURNED: "bg-emerald-100 text-emerald-700",
  BOOK_RENEWED: "bg-teal-100 text-teal-700",
  BOOK_RESERVED: "bg-purple-100 text-purple-700",
  USER_CREATED: "bg-cyan-100 text-cyan-700",
  USER_UPDATED: "bg-orange-100 text-orange-700",
  USER_DELETED: "bg-red-100 text-red-700",
  USER_ACTIVATED: "bg-green-100 text-green-700",
  PASSWORD_RESET: "bg-rose-100 text-rose-700",
  SETTINGS_UPDATED: "bg-gray-100 text-gray-700",
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "লগইন",
  BOOK_CREATED: "বই যোগ",
  BOOK_UPDATED: "বই আপডেট",
  BOOK_DELETED: "বই মুছে ফেলা",
  BOOK_ISSUED: "বই ইস্যু",
  BOOK_RETURNED: "বই ফেরত",
  BOOK_RENEWED: "ধার নবায়ন",
  BOOK_RESERVED: "বই রিজার্ভ",
  USER_CREATED: "সদস্য যোগ",
  USER_UPDATED: "সদস্য আপডেট",
  USER_DELETED: "সদস্য মুছে ফেলা",
  USER_ACTIVATED: "অ্যাকাউন্ট সক্রিয়",
  PASSWORD_RESET: "পাসওয়ার্ড রিসেট",
  SETTINGS_UPDATED: "সেটিংস আপডেট",
};

const ACTION_FILTER_OPTS = [
  { value: "", label: "সব কার্যক্রম" },
  ...Object.entries(ACTION_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search && { search }),
      ...(actionFilter && { action: actionFilter }),
    });
    const res = await fetch(`/api/admin/logs?${params}`);
    const data = await res.json();
    if (data.success) {
      setLogs(data.data.logs || []);
      setTotal(data.data.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page, search, actionFilter]);

  const totalPages = Math.ceil(total / limit);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("bn-BD", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary font-bangla-serif flex items-center gap-2">
          <ScrollText size={22} />
          অডিট লগ
        </h1>
        <p className="text-gray-500 text-sm font-bangla mt-0.5">{banglaNumber(total)}টি কার্যক্রমের রেকর্ড</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="সদস্যের নাম বা আইডি দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bangla focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bangla focus:outline-none focus:border-primary bg-white"
          >
            {ACTION_FILTER_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bangla">কোনো লগ পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log, i) => {
              const Icon = ACTION_ICONS[log.action] || Shield;
              const colorClass = ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700";
              const label = ACTION_LABELS[log.action] || log.action;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={16} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-bangla ${colorClass}`}>
                        {label}
                      </span>
                      {log.user && (
                        <span className="text-sm text-gray-700 font-bangla font-medium">{log.user.name}</span>
                      )}
                      {log.user && (
                        <span className="text-xs text-gray-400 font-english">({log.user.studentId})</span>
                      )}
                      {log.user?.role === "ADMIN" && (
                        <span className="text-xs bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded font-bangla">অ্যাডমিন</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-gray-500 font-bangla mt-0.5 truncate">{log.details}</p>
                    )}
                  </div>

                  {/* Time & IP */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500 font-english">{formatTime(log.createdAt)}</p>
                    {log.ipAddress && (
                      <p className="text-xs text-gray-300 font-english mt-0.5">{log.ipAddress}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-primary transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600 font-bangla px-2">{banglaNumber(page)} / {banglaNumber(totalPages)}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-primary transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
