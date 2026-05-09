"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search, BookOpen, Filter, Grid, List, SortAsc,
  AlertTriangle, Bookmark, BookMarked, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { banglaNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface Book {
  id: string;
  title: string;
  titleBangla?: string;
  author: string;
  authorBangla?: string;
  publisher?: string;
  publishedYear?: number;
  category: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  shelfNumber?: string;
  price?: number;
  language: string;
  tags: string[];
  status: string;
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: "পাওয়া যাচ্ছে", cls: "badge-available" },
  ALL_ISSUED: { label: "ইস্যু করা", cls: "badge-issued" },
  RESERVED: { label: "রিজার্ভ করা", cls: "badge-reserved" },
  UNAVAILABLE: { label: "অনুপলব্ধ", cls: "badge" },
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hasProfilePicture, setHasProfilePicture] = useState(true);

  const [filters, setFilters] = useState({
    search: "", category: "", status: "", sort: "createdAt", order: "desc",
  });
  const [searchInput, setSearchInput] = useState("");

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    });
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    if (data.success) {
      setBooks(data.data.books);
      setTotal(data.data.total);
      setPages(data.data.pages);
      setCategories(data.data.categories || []);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.success) setHasProfilePicture(!!d.data.profilePicture);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput }));
    setPage(1);
  };

  const handleBorrow = async (bookId: string, bookTitle: string) => {
    if (!hasProfilePicture) {
      toast.error("বই নিতে প্রোফাইল ছবি আপলোড করুন।");
      return;
    }
    const res = await fetch("/api/borrowings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`"${bookTitle}" সফলভাবে ধার নেওয়া হয়েছে!`);
      fetchBooks();
    } else {
      toast.error(data.error || "ধার নিতে ব্যর্থ হয়েছে।");
    }
  };

  const handleReserve = async (bookId: string, bookTitle: string) => {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`"${bookTitle}" রিজার্ভ করা হয়েছে!`);
    } else {
      toast.error(data.error || "রিজার্ভ ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">বই ক্যাটালগ</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">মোট {banglaNumber(total)}টি বই</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Profile picture warning */}
      {!hasProfilePicture && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-amber-700 text-sm font-bangla">
            বই নিতে প্রোফাইল ছবি আপলোড করুন।{" "}
            <a href="/dashboard/profile" className="underline font-medium">এখনই যান</a>
          </p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="বই, লেখক, প্রকাশক বা ISBN দিয়ে খুঁজুন..."
              className="input-primary pl-10"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setFilters((f) => ({ ...f, search: "" })); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-colors font-bangla flex items-center gap-2">
            <Search size={16} />
            খুঁজুন
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-bangla">ফিল্টার:</span>
          </div>

          <select
            value={filters.category}
            onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary font-bangla"
          >
            <option value="">সব বিভাগ</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary font-bangla"
          >
            <option value="">সব স্ট্যাটাস</option>
            <option value="AVAILABLE">পাওয়া যাচ্ছে</option>
            <option value="ALL_ISSUED">ইস্যু করা</option>
          </select>

          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-gray-400" />
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                setFilters((f) => ({ ...f, sort, order }));
                setPage(1);
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary font-bangla"
            >
              <option value="createdAt-desc">নতুন আগে</option>
              <option value="createdAt-asc">পুরানো আগে</option>
              <option value="title-asc">নাম (A-Z)</option>
              <option value="title-desc">নাম (Z-A)</option>
              <option value="availableCopies-desc">পাওয়া যাচ্ছে</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      {loading ? (
        <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="skeleton h-48 w-full" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">কোনো বই পাওয়া যায়নি।</p>
          <p className="text-gray-300 text-sm font-bangla mt-1">ভিন্ন কিওয়ার্ড বা ফিল্টার চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group bg-white rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-card-hover transition-all duration-300 overflow-hidden ${view === "list" ? "flex gap-4 items-start" : ""}`}
            >
              {/* Cover */}
              <div className={`${view === "grid" ? "relative h-48 w-full" : "relative h-24 w-16 shrink-0"} bg-primary-50 overflow-hidden`}>
                {book.coverImage ? (
                  <Image src={book.coverImage} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-400" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <BookOpen size={view === "grid" ? 32 : 20} className="text-primary-300" />
                  </div>
                )}
                <div className={`absolute top-2 ${view === "grid" ? "left-2" : "left-1"}`}>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full font-bangla ${statusLabels[book.status]?.cls || "badge"}`}>
                    {statusLabels[book.status]?.label || book.status}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className={`${view === "grid" ? "p-4" : "py-3 pr-4 flex-1"}`}>
                <span className="text-xs text-primary/70 bg-primary-50 px-2 py-0.5 rounded-full font-bangla">{book.category}</span>
                <h3 className={`font-semibold text-gray-900 font-bangla mt-2 line-clamp-2 ${view === "grid" ? "text-sm" : "text-base"}`}>
                  {book.titleBangla || book.title}
                </h3>
                <p className="text-gray-500 text-xs font-bangla mt-0.5">{book.authorBangla || book.author}</p>
                {book.publisher && (
                  <p className="text-gray-400 text-xs font-bangla mt-0.5">{book.publisher}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400 font-bangla">
                    {banglaNumber(book.availableCopies)}/{banglaNumber(book.totalCopies)} কপি
                  </p>
                  {book.shelfNumber && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-english">
                      {book.shelfNumber}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  {book.availableCopies > 0 ? (
                    <button
                      onClick={() => handleBorrow(book.id, book.titleBangla || book.title)}
                      disabled={!hasProfilePicture}
                      className="flex-1 bg-primary hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg transition-colors font-bangla flex items-center justify-center gap-1"
                    >
                      <BookMarked size={13} />
                      ধার নিন
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReserve(book.id, book.titleBangla || book.title)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium py-2 rounded-lg transition-colors font-bangla flex items-center justify-center gap-1"
                    >
                      <Bookmark size={13} />
                      রিজার্ভ করুন
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page >= pages - 2 ? pages - 4 + i : page - 2 + i;
            if (p < 1 || p > pages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
              >
                {banglaNumber(p)}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
