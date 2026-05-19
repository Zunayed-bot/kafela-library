"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Upload, UserSquare2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

interface Leader {
  id: string;
  name: string;
  role: string;
  description?: string;
  photo?: string;
  email?: string;
  phone?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  order: number;
  isActive: boolean;
}

const emptyForm = { name: "", role: "", description: "", photo: "", email: "", phone: "", facebookUrl: "", youtubeUrl: "", order: 0, isActive: true };

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editLeader, setEditLeader] = useState<Leader | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchLeaders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/leadership");
    const data = await res.json();
    if (data.success) setLeaders(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchLeaders(); }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, order: leaders.length });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditLeader(null);
    setModal("add");
  };

  const openEdit = (l: Leader) => {
    setEditLeader(l);
    setForm({ name: l.name, role: l.role, description: l.description || "", photo: l.photo || "", email: l.email || "", phone: l.phone || "", facebookUrl: l.facebookUrl || "", youtubeUrl: l.youtubeUrl || "", order: l.order, isActive: l.isActive });
    setPhotoFile(null);
    setPhotoPreview(l.photo || null);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setEditLeader(null); setPhotoFile(null); setPhotoPreview(null); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("type", "profile");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { toast.error("আপলোড ব্যর্থ"); return null; }
    return data.data.url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) { toast.error("নাম ও পদবি আবশ্যক।"); return; }
    setSaving(true);

    let photo = form.photo;
    if (photoFile) {
      const url = await uploadPhoto();
      if (!url) { setSaving(false); return; }
      photo = url;
    }

    const url = modal === "edit" ? `/api/admin/leadership/${editLeader!.id}` : "/api/admin/leadership";
    const method = modal === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photo }),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      toast.success(modal === "edit" ? "আপডেট হয়েছে!" : "যোগ হয়েছে!");
      closeModal();
      fetchLeaders();
    } else {
      toast.error(data.error || "সংরক্ষণ ব্যর্থ।");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/leadership/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { toast.success("মুছে ফেলা হয়েছে।"); setDeleteId(null); fetchLeaders(); }
    else toast.error("মুছতে ব্যর্থ।");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">নেতৃত্ব ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">ল্যান্ডিং পেজে প্রদর্শিত নেতৃত্ব সদস্যগণ</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bangla text-sm font-medium transition-all shadow-teal">
          <Plus size={18} />
          নতুন যোগ করুন
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <UserSquare2 size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">কোনো নেতৃত্ব সদস্য নেই।</p>
          <button onClick={openAdd} className="mt-4 text-primary hover:underline font-bangla text-sm">যোগ করুন</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaders.map((leader, i) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-card transition-all"
            >
              <GripVertical size={18} className="text-gray-300 shrink-0" />
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                {leader.photo ? (
                  <Image src={leader.photo} alt={leader.name} width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl font-bangla">
                    {leader.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 font-bangla">{leader.name}</p>
                <p className="text-gold text-sm font-bangla">{leader.role}</p>
                {leader.description && <p className="text-gray-500 text-xs font-bangla mt-0.5 truncate">{leader.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-bangla ${leader.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {leader.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </span>
                <button onClick={() => openEdit(leader)} className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary-100 transition-colors">
                  <Edit2 size={14} className="text-primary" />
                </button>
                <button onClick={() => setDeleteId(leader.id)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
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
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="font-bold text-gray-900 font-bangla text-lg">
                  {modal === "add" ? "নতুন নেতৃত্ব সদস্য" : "সম্পাদনা করুন"}
                </h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Photo */}
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-primary-50 border-2 border-dashed border-primary-200 shrink-0">
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Photo" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-300 font-bold text-2xl font-bangla">
                        {form.name.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 font-bangla mb-2">ছবি</p>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 border border-gray-200 hover:border-primary text-gray-600 hover:text-primary px-3 py-1.5 rounded-lg text-sm font-bangla transition-colors"
                    >
                      <Upload size={14} />
                      {uploading ? "আপলোড হচ্ছে..." : "ছবি বেছে নিন"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    {photoPreview && (
                      <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); setForm(f => ({ ...f, photo: "" })); }}
                        className="mt-1 text-xs text-red-500 hover:underline font-bangla block"
                      >ছবি সরান</button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">নাম <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-primary font-bangla" placeholder="নেতার নাম" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">পদবি <span className="text-red-500">*</span></label>
                  <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-primary font-bangla" placeholder="যেমন: প্রধান উপদেষ্টা" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">বিবরণ (ঐচ্ছিক)</label>
                  <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-primary font-bangla" placeholder="সংগঠনের নাম ইত্যাদি" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ইমেইল (ঐচ্ছিক)</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-primary font-english" placeholder="name@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ফোন (ঐচ্ছিক)</label>
                    <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-primary font-bangla" placeholder="০১৭..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ফেসবুক লিংক (ঐচ্ছিক)</label>
                  <input type="url" value={form.facebookUrl} onChange={e => setForm(f => ({ ...f, facebookUrl: e.target.value }))} className="input-primary font-english" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ইউটিউব লিংক (ঐচ্ছিক)</label>
                  <input type="url" value={form.youtubeUrl} onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} className="input-primary font-english" placeholder="https://youtube.com/..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ক্রমবিন্যাস</label>
                    <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="input-primary" min="0" />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
                      <span className="text-sm text-gray-700 font-bangla">সক্রিয়</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors">বাতিল</button>
                  <button type="submit" disabled={saving || uploading} className="flex-1 px-5 py-3 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors">
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
              <h3 className="text-center font-bold text-gray-900 font-bangla text-lg mb-2">মুছে ফেলবেন?</h3>
              <p className="text-center text-gray-500 text-sm font-bangla mb-6">এই নেতৃত্ব সদস্য স্থায়ীভাবে মুছে যাবে।</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors">বাতিল</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors">
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
