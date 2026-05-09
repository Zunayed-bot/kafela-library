"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, X, Edit2, Trash2, Upload, ChevronLeft, ChevronRight,
  Tag, Hash, Building2, DollarSign, Layers, BookMarked, Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { banglaNumber } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  titleBangla?: string;
  author: string;
  authorBangla?: string;
  publisher?: string;
  publisherBangla?: string;
  isbn?: string;
  category: string;
  description?: string;
  coverImage?: string;
  shelfNumber?: string;
  totalCopies: number;
  availableCopies: number;
  price?: number;
  status: string;
  language: string;
  publishedYear?: number;
}

const CATEGORIES = [
  "ইসলামি সাহিত্য", "ফিকহ ও আইন", "হাদিস", "তাফসির", "আকিদা", "সিরাত",
  "ইতিহাস", "দর্শন", "বিজ্ঞান ও প্রযুক্তি", "সাহিত্য ও কবিতা",
  "ভাষা ও ব্যাকরণ", "চিকিৎসা", "সমাজবিজ্ঞান", "রাজনীতি", "অন্যান্য",
];

const LANGUAGES = ["বাংলা", "আরবি", "ইংরেজি", "উর্দু", "ফার্সি"];

const STATUS_OPTS = [
  { value: "", label: "সব স্ট্যাটাস" },
  { value: "AVAILABLE", label: "উপলব্ধ" },
  { value: "ISSUED", label: "ইস্যু করা" },
  { value: "RESERVED", label: "রিজার্ভড" },
];

const emptyForm = {
  title: "", titleBangla: "", author: "", authorBangla: "",
  publisher: "", publisherBangla: "", isbn: "", category: "ইসলামি সাহিত্য",
  description: "", shelfNumber: "", totalCopies: 1, price: "",
  status: "AVAILABLE", language: "বাংলা", publishedYear: "",
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(categoryFilter && { category: categoryFilter }),
      ...(statusFilter && { status: statusFilter }),
    });
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    if (data.success) {
      setBooks(data.data.books || []);
      setTotal(data.data.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, [page, search, categoryFilter, statusFilter]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setCoverFile(null);
    setCoverPreview(null);
    setEditBook(null);
    setModal("add");
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title,
      titleBangla: book.titleBangla || "",
      author: book.author,
      authorBangla: book.authorBangla || "",
      publisher: book.publisher || "",
      publisherBangla: book.publisherBangla || "",
      isbn: book.isbn || "",
      category: book.category,
      description: book.description || "",
      shelfNumber: book.shelfNumber || "",
      totalCopies: book.totalCopies,
      price: book.price ? String(book.price) : "",
      status: book.status,
      language: book.language,
      publishedYear: book.publishedYear ? String(book.publishedYear) : "",
    });
    setCoverFile(null);
    setCoverPreview(book.coverImage || null);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditBook(null);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", coverFile);
    fd.append("type", "book");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { toast.error(data.error || "আপলোড ব্যর্থ"); return null; }
    return data.data.url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.category) {
      toast.error("বইয়ের নাম, লেখক ও বিভাগ আবশ্যক।");
      return;
    }
    setSaving(true);

    let coverImage: string | undefined;
    if (coverFile) {
      const url = await uploadCover();
      if (!url) { setSaving(false); return; }
      coverImage = url;
    } else if (modal === "edit" && editBook?.coverImage && !coverPreview) {
      coverImage = undefined;
    } else if (modal === "edit" && editBook?.coverImage) {
      coverImage = editBook.coverImage;
    }

    const payload = {
      ...form,
      totalCopies: Number(form.totalCopies),
      price: form.price ? Number(form.price) : undefined,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
      ...(coverImage !== undefined && { coverImage }),
    };

    const url = modal === "edit" ? `/api/books/${editBook!.id}` : "/api/books";
    const method = modal === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      toast.success(modal === "edit" ? "বই আপডেট হয়েছে!" : "বই যোগ হয়েছে!");
      closeModal();
      fetchBooks();
    } else {
      toast.error(data.error || "সংরক্ষণ ব্যর্থ হয়েছে।");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/books/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(false);
    if (res.ok) {
      toast.success("বই মুছে ফেলা হয়েছে।");
      setDeleteId(null);
      fetchBooks();
    } else {
      toast.error(data.error || "মুছতে ব্যর্থ হয়েছে।");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (status: string, available: number, total: number) => {
    if (available === 0) return <span className="badge-overdue">অনুপলব্ধ</span>;
    if (status === "AVAILABLE") return <span className="badge-available">{banglaNumber(available)}/{banglaNumber(total)} উপলব্ধ</span>;
    return <span className="badge-issued">{status}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">বই ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">{banglaNumber(total)}টি বই পাওয়া গেছে</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bangla text-sm font-medium transition-all shadow-teal"
        >
          <Plus size={18} />
          নতুন বই যোগ করুন
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="বই খুঁজুন (নাম, লেখক, ISBN...)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bangla focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bangla focus:outline-none focus:border-primary bg-white"
            >
              <option value="">সব বিভাগ</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bangla focus:outline-none focus:border-primary bg-white"
            >
              {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="skeleton h-48 w-full" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">কোনো বই পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-card transition-all duration-300"
            >
              {/* Cover */}
              <div className="relative h-48 bg-primary-50">
                {book.coverImage ? (
                  <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={40} className="text-primary-200" />
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(book)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors"
                  >
                    <Edit2 size={15} className="text-primary" />
                  </button>
                  <button
                    onClick={() => setDeleteId(book.id)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-semibold text-gray-900 text-sm font-bangla line-clamp-2 leading-snug">
                  {book.titleBangla || book.title}
                </p>
                <p className="text-gray-500 text-xs font-bangla mt-0.5 truncate">
                  {book.authorBangla || book.author}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  {statusBadge(book.status, book.availableCopies, book.totalCopies)}
                  {book.shelfNumber && (
                    <span className="text-xs text-gray-400 font-english">{book.shelfNumber}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-bangla mt-1 truncate">{book.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-primary transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600 font-bangla px-2">
            {banglaNumber(page)} / {banglaNumber(totalPages)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-primary transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="font-bold text-gray-900 font-bangla text-lg">
                  {modal === "add" ? "নতুন বই যোগ করুন" : "বই সম্পাদনা করুন"}
                </h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                {/* Cover upload */}
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-primary-50 border-2 border-dashed border-primary-200 shrink-0">
                    {coverPreview ? (
                      <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <BookOpen size={20} className="text-primary-300" />
                        <span className="text-xs text-primary-400 font-bangla text-center">কভার</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 font-bangla mb-2">বইয়ের কভার ছবি</p>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 border border-gray-200 hover:border-primary text-gray-600 hover:text-primary px-4 py-2 rounded-xl text-sm font-bangla transition-colors"
                    >
                      <Upload size={15} />
                      {uploading ? "আপলোড হচ্ছে..." : "ছবি বেছে নিন"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                        className="mt-2 text-xs text-red-500 hover:underline font-bangla block"
                      >
                        ছবি সরান
                      </button>
                    )}
                    <p className="text-xs text-gray-400 font-bangla mt-1">JPG, PNG, WebP — সর্বোচ্চ ৫ MB</p>
                  </div>
                </div>

                {/* Title */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                      বইয়ের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="input-primary"
                      placeholder="Book title (English)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">বইয়ের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={form.titleBangla}
                      onChange={(e) => setForm((f) => ({ ...f, titleBangla: e.target.value }))}
                      className="input-primary font-bangla"
                      placeholder="বইয়ের বাংলা নাম"
                    />
                  </div>
                </div>

                {/* Author */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                      লেখক <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                      className="input-primary"
                      placeholder="Author name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">লেখক (বাংলা)</label>
                    <input
                      type="text"
                      value={form.authorBangla}
                      onChange={(e) => setForm((f) => ({ ...f, authorBangla: e.target.value }))}
                      className="input-primary font-bangla"
                      placeholder="লেখকের বাংলা নাম"
                    />
                  </div>
                </div>

                {/* Publisher */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">প্রকাশক</label>
                    <input
                      type="text"
                      value={form.publisher}
                      onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
                      className="input-primary"
                      placeholder="Publisher"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">প্রকাশক (বাংলা)</label>
                    <input
                      type="text"
                      value={form.publisherBangla}
                      onChange={(e) => setForm((f) => ({ ...f, publisherBangla: e.target.value }))}
                      className="input-primary font-bangla"
                      placeholder="প্রকাশকের বাংলা নাম"
                    />
                  </div>
                </div>

                {/* Category, Language, Year */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                      বিভাগ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="input-primary font-bangla"
                      required
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ভাষা</label>
                    <select
                      value={form.language}
                      onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                      className="input-primary font-bangla"
                    >
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">প্রকাশ সাল</label>
                    <input
                      type="number"
                      value={form.publishedYear}
                      onChange={(e) => setForm((f) => ({ ...f, publishedYear: e.target.value }))}
                      className="input-primary"
                      placeholder="2024"
                      min="1000"
                      max="2100"
                    />
                  </div>
                </div>

                {/* ISBN, Shelf, Price, Copies */}
                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ISBN</label>
                    <input
                      type="text"
                      value={form.isbn}
                      onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                      className="input-primary"
                      placeholder="978-..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">শেলফ নম্বর</label>
                    <input
                      type="text"
                      value={form.shelfNumber}
                      onChange={(e) => setForm((f) => ({ ...f, shelfNumber: e.target.value }))}
                      className="input-primary"
                      placeholder="A-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">মূল্য (৳)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className="input-primary"
                      placeholder="০"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                      মোট কপি <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.totalCopies}
                      onChange={(e) => setForm((f) => ({ ...f, totalCopies: Number(e.target.value) }))}
                      className="input-primary"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">বিবরণ</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="input-primary font-bangla resize-none"
                    rows={3}
                    placeholder="বইয়ের সংক্ষিপ্ত বিবরণ..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors">
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="flex-1 px-5 py-3 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        সংরক্ষণ হচ্ছে...
                      </span>
                    ) : (
                      modal === "add" ? "বই যোগ করুন" : "পরিবর্তন সংরক্ষণ করুন"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-center font-bold text-gray-900 font-bangla text-lg mb-2">বই মুছে ফেলবেন?</h3>
              <p className="text-center text-gray-500 text-sm font-bangla mb-6">
                এই বই স্থায়ীভাবে মুছে যাবে। সক্রিয় ধার থাকলে মুছে ফেলা যাবে না।
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors"
                >
                  {deleting ? "মুছছে..." : "মুছে ফেলুন"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
