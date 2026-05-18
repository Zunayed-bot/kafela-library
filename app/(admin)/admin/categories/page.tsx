"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
}

const emptyForm = { name: "", nameEn: "", order: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setForm({ ...emptyForm, order: categories.length }); setEditCat(null); setModal("add"); };
  const openEdit = (c: Category) => { setEditCat(c); setForm({ name: c.name, nameEn: c.nameEn || "", order: c.order }); setModal("edit"); };
  const closeModal = () => { setModal(null); setEditCat(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("বিভাগের নাম আবশ্যক।"); return; }
    setSaving(true);

    const url = modal === "edit" ? `/api/admin/categories/${editCat!.id}` : "/api/admin/categories";
    const method = modal === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      toast.success(modal === "edit" ? "আপডেট হয়েছে!" : "বিভাগ যোগ হয়েছে!");
      closeModal();
      fetchCategories();
    } else {
      toast.error(data.error || "সংরক্ষণ ব্যর্থ।");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { toast.success("মুছে ফেলা হয়েছে।"); setDeleteId(null); fetchCategories(); }
    else toast.error("মুছতে ব্যর্থ।");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">বিভাগ ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">বইয়ের বিভাগ তৈরি ও পরিচালনা করুন</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bangla text-sm font-medium transition-all shadow-teal">
          <Plus size={18} />
          নতুন বিভাগ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Tag size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">কোনো বিভাগ নেই।</p>
          <button onClick={openAdd} className="mt-4 text-primary hover:underline font-bangla text-sm">বিভাগ যোগ করুন</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Tag size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 font-bangla">{cat.name}</p>
                {cat.nameEn && <p className="text-gray-400 text-xs font-english mt-0.5">{cat.nameEn}</p>}
              </div>
              <span className="text-xs text-gray-400 font-english">#{cat.order}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary-100 transition-colors">
                  <Edit2 size={14} className="text-primary" />
                </button>
                <button onClick={() => setDeleteId(cat.id)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 font-bangla text-lg">
                  {modal === "add" ? "নতুন বিভাগ" : "বিভাগ সম্পাদনা"}
                </h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">বিভাগের নাম (বাংলা) <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-primary font-bangla" placeholder="যেমন: ইসলামি সাহিত্য" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ইংরেজি নাম (ঐচ্ছিক)</label>
                  <input type="text" value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} className="input-primary" placeholder="Islamic Literature" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ক্রমবিন্যাস</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="input-primary" min="0" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors">বাতিল</button>
                  <button type="submit" disabled={saving} className="flex-1 px-5 py-3 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors">
                    {saving ? "সংরক্ষণ হচ্ছে..." : modal === "add" ? "যোগ করুন" : "সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-center font-bold text-gray-900 font-bangla text-lg mb-2">বিভাগ মুছবেন?</h3>
              <p className="text-center text-gray-500 text-sm font-bangla mb-6">এই বিভাগ মুছে ফেলা হবে। বই তালিকায় বিভাগটি থাকবে তবে নতুন বইয়ে দেখাবে না।</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50">বাতিল</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium">
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
