"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookMarked, Search, Plus, X, ChevronLeft, ChevronRight, RotateCcw,
  Calendar, User, BookOpen, CheckCircle2, AlertTriangle, Clock,
} from "lucide-react";
import { formatDate, banglaNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface Borrowing {
  id: string;
  issuedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: string;
  renewCount: number;
  maxRenewals: number;
  user: { id: string; name: string; studentId: string; profilePicture?: string };
  book: { id: string; title: string; titleBangla?: string; author: string; coverImage?: string; shelfNumber?: string };
}

interface UserOption { id: string; name: string; studentId: string }
interface BookOption { id: string; title: string; titleBangla?: string; availableCopies: number }

const STATUS_OPTS = [
  { value: "", label: "সব স্ট্যাটাস" },
  { value: "ACTIVE", label: "সক্রিয়" },
  { value: "OVERDUE", label: "মেয়াদ উত্তীর্ণ" },
  { value: "RETURNED", label: "ফেরত" },
];

export default function AdminBorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [issueModal, setIssueModal] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [issueForm, setIssueForm] = useState({ userId: "", bookId: "", dueDate: "", notes: "" });
  const [issuing, setIssuing] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  const fetchBorrowings = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
    });
    const res = await fetch(`/api/admin/borrowings?${params}`);
    const data = await res.json();
    if (data.success) {
      setBorrowings(data.data.borrowings || []);
      setTotal(data.data.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBorrowings(); }, [page, search, statusFilter]);

  const fetchUsersAndBooks = async () => {
    const [ur, br] = await Promise.all([
      fetch("/api/users?limit=100&status=ACTIVE").then((r) => r.json()),
      fetch("/api/books?limit=200&status=AVAILABLE").then((r) => r.json()),
    ]);
    if (ur.success) setUsers(ur.data.users || []);
    if (br.success) setBooks(br.data.books || []);
  };

  const openIssue = () => {
    fetchUsersAndBooks();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    setIssueForm({ userId: "", bookId: "", dueDate: dueDate.toISOString().split("T")[0], notes: "" });
    setUserSearch("");
    setBookSearch("");
    setIssueModal(true);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.userId || !issueForm.bookId) {
      toast.error("সদস্য ও বই নির্বাচন করুন।");
      return;
    }
    setIssuing(true);
    const res = await fetch("/api/borrowings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: issueForm.userId,
        bookId: issueForm.bookId,
        dueDate: issueForm.dueDate,
        notes: issueForm.notes,
      }),
    });
    const data = await res.json();
    setIssuing(false);
    if (res.ok) {
      toast.success("বই ইস্যু করা হয়েছে!");
      setIssueModal(false);
      fetchBorrowings();
    } else {
      toast.error(data.error || "ইস্যু ব্যর্থ হয়েছে।");
    }
  };

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
      fetchBorrowings();
    } else {
      toast.error(data.error || "ফেরত ব্যর্থ হয়েছে।");
    }
  };

  const filteredUsers = users.filter((u) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.studentId.includes(userSearch)
  );
  const filteredBooks = books.filter((b) =>
    !bookSearch || b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (b.titleBangla && b.titleBangla.includes(bookSearch))
  );

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (status: string) => {
    if (status === "RETURNED") return <span className="badge-available">ফেরত</span>;
    if (status === "OVERDUE") return <span className="badge-overdue">মেয়াদ উত্তীর্ণ</span>;
    return <span className="badge-issued">সক্রিয়</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">ধার ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">{banglaNumber(total)}টি ধারের রেকর্ড</p>
        </div>
        <button
          onClick={openIssue}
          className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bangla text-sm font-medium transition-all shadow-teal"
        >
          <Plus size={18} />
          বই ইস্যু করুন
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="সদস্য বা বই খুঁজুন..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bangla focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bangla focus:outline-none focus:border-primary bg-white"
          >
            {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 font-bangla uppercase tracking-wide">সদস্য</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 font-bangla uppercase tracking-wide">বই</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 font-bangla uppercase tracking-wide">ইস্যু তারিখ</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 font-bangla uppercase tracking-wide">ফেরতের তারিখ</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 font-bangla uppercase tracking-wide">স্ট্যাটাস</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="skeleton h-4 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : borrowings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <BookMarked size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-bangla">কোনো ধার পাওয়া যায়নি।</p>
                  </td>
                </tr>
              ) : (
                borrowings.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                          {b.user.profilePicture ? (
                            <Image src={b.user.profilePicture} alt={b.user.name} width={36} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm font-bangla">
                              {b.user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm font-bangla">{b.user.name}</p>
                          <p className="text-xs text-gray-400 font-english">{b.user.studentId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Book */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm font-bangla max-w-[180px] truncate">
                        {b.book.titleBangla || b.book.title}
                      </p>
                      {b.book.shelfNumber && (
                        <p className="text-xs text-gray-400 font-english">{b.book.shelfNumber}</p>
                      )}
                    </td>

                    {/* Issued */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 font-english">{formatDate(b.issuedDate)}</p>
                    </td>

                    {/* Due / Returned */}
                    <td className="px-6 py-4">
                      {b.status === "RETURNED" && b.returnedDate ? (
                        <p className="text-sm text-green-600 font-english">{formatDate(b.returnedDate)}</p>
                      ) : (
                        <p className={`text-sm font-english ${b.status === "OVERDUE" ? "text-red-600 font-medium" : "text-gray-600"}`}>
                          {formatDate(b.dueDate)}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{statusBadge(b.status)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {b.status !== "RETURNED" && (
                        <button
                          onClick={() => handleReturn(b.id)}
                          disabled={returning === b.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-700 border border-primary-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors font-bangla disabled:opacity-50"
                        >
                          {returning === b.id ? (
                            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RotateCcw size={13} />
                          )}
                          ফেরত
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

      {/* Issue Modal */}
      {issueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setIssueModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900 font-bangla text-lg">বই ইস্যু করুন</h2>
              <button onClick={() => setIssueModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleIssue} className="p-6 space-y-5">
              {/* User select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                  <User size={14} className="inline mr-1" />
                  সদস্য নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input-primary mb-2 font-bangla"
                />
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm font-bangla">কোনো সদস্য পাওয়া যায়নি</p>
                  ) : (
                    filteredUsers.slice(0, 20).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { setIssueForm((f) => ({ ...f, userId: u.id })); setUserSearch(u.name); }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${issueForm.userId === u.id ? "bg-primary-50" : ""}`}
                      >
                        <span className="font-bangla text-sm text-gray-900">{u.name}</span>
                        <span className="text-xs text-gray-400 font-english">{u.studentId}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Book select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                  <BookOpen size={14} className="inline mr-1" />
                  বই নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="বইয়ের নাম দিয়ে খুঁজুন..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="input-primary mb-2 font-bangla"
                />
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredBooks.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm font-bangla">কোনো উপলব্ধ বই পাওয়া যায়নি</p>
                  ) : (
                    filteredBooks.slice(0, 20).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => { setIssueForm((f) => ({ ...f, bookId: b.id })); setBookSearch(b.titleBangla || b.title); }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${issueForm.bookId === b.id ? "bg-primary-50" : ""}`}
                      >
                        <span className="font-bangla text-sm text-gray-900 truncate max-w-[70%]">{b.titleBangla || b.title}</span>
                        <span className="text-xs text-green-600 font-bangla">{banglaNumber(b.availableCopies)} কপি</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                  <Calendar size={14} className="inline mr-1" />
                  ফেরতের তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="input-primary"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIssueModal(false)}
                  className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors">
                  বাতিল
                </button>
                <button type="submit" disabled={issuing}
                  className="flex-1 px-5 py-3 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors">
                  {issuing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ইস্যু হচ্ছে...
                    </span>
                  ) : "বই ইস্যু করুন"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
