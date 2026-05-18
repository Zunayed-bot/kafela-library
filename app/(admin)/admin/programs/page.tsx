"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Video, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface Program {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  colorClass: string;
  order: number;
  isActive: boolean;
}

const COLOR_OPTIONS = [
  { value: "bg-emerald-500", label: "সবুজ" },
  { value: "bg-amber-500", label: "হলুদ" },
  { value: "bg-blue-500", label: "নীল" },
  { value: "bg-purple-500", label: "বেগুনি" },
  { value: "bg-rose-500", label: "গোলাপি" },
  { value: "bg-cyan-500", label: "সিয়ান" },
  { value: "bg-orange-500", label: "কমলা" },
  { value: "bg-primary", label: "সবুজ-গাঢ়" },
];

const emptyForm = { title: "", description: "", videoUrl: "", thumbnail: "", colorClass: "bg-emerald-500", order: 0, isActive: true };

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPrograms = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/programs");
    const data = await res.json();
    if (data.success) setPrograms(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchPrograms(); }, []);

  const openAdd = () => { setForm({ ...emptyForm, order: programs.length }); setEditProgram(null); setModal("add"); };
  const openEdit = (p: Program) => {
    setEditProgram(p);
    setForm({ title: p.title, description: p.description || "", videoUrl: p.videoUrl || "", thumbnail: p.thumbnail || "", colorClass: p.colorClass, order: p.order, isActive: p.isActive });
    setModal("edit");
  };
  const closeModal = () => { setModal(null); setEditProgram(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error("শিরোনাম আবশ্যক।"); return; }
    setSaving(true);

    const url = modal === "edit" ? `/api/admin/programs/${editProgram!.id}` : "/api/admin/programs";
    const method = modal === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      toast.success(modal === "edit" ? "আপডেট হয়েছে!" : "কার্যক্রম যোগ হয়েছে!");
      closeModal();
      fetchPrograms();
    } else {
      toast.error(data.error || "সংরক্ষণ ব্যর্থ।");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/programs/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { toast.success("মুছে ফেলা হয়েছে।"); setDeleteId(null); fetchPrograms(); }
    else toast.error("মুছতে ব্যর্থ।");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">কার্যক্রম ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">ল্যান্ডিং পেজে প্রদর্শিত ধারাবাহিক কার্যক্রমসমূহ</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bangla text-sm font-medium transition-all shadow-teal">
          <Plus size={18} />
          নতুন কার্যক্রম
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Video size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">কোনো কার্যক্রম নেই।</p>
          <button onClick={openAdd} className="mt-4 text-primary hover:underline font-bangla text-sm">কার্যক্রম যোগ করুন</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {programs.map((prog, i) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-card transition-all"
            >
              <div className={`w-12 h-12 ${prog.colorClass} rounded-xl flex items-center justify-center shrink-0`}>
                <Video size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 font-bangla">{prog.title}</p>
                {prog.description && <p className="text-gray-500 text-xs font-bangla mt-0.5 truncate">{prog.description}</p>}
                {prog.videoUrl && (
                  <a href={prog.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5 font-english">
                    <ExternalLink size={10} />
                    ভিডিও লিংক
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-bangla ${prog.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {prog.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </span>
                <button onClick={() => openEdit(prog)} className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary-100 transition-colors">
                  <Edit2 size={14} className="text-primary" />
                </button>
                <button onClick={() => setDeleteId(prog.id)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
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
                  {modal === "add" ? "নতুন কার্যক্রম" : "কার্যক্রম সম্পাদনা"}
                </h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">শিরোনাম <span className="text-red-500">*</span></label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-primary font-bangla" placeholder="কার্যক্রমের নাম" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">বিবরণ (ঐচ্ছিক)</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-primary font-bangla resize-none" rows={2} placeholder="সংক্ষিপ্ত বিবরণ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ভিডিও লিংক (YouTube/Drive)</label>
                  <input type="url" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} className="input-primary font-english" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">থাম্বনেইল URL (ঐচ্ছিক)</label>
                  <input type="url" value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} className="input-primary font-english" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">রঙ</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, colorClass: opt.value }))}
                        className={`w-8 h-8 rounded-lg ${opt.value} border-2 ${form.colorClass === opt.value ? "border-gray-800 scale-110" : "border-transparent"} transition-all`}
                        title={opt.label}
                      />
                    ))}
                  </div>
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
              <h3 className="text-center font-bold text-gray-900 font-bangla text-lg mb-2">কার্যক্রম মুছবেন?</h3>
              <p className="text-center text-gray-500 text-sm font-bangla mb-6">এই কার্যক্রম স্থায়ীভাবে মুছে যাবে।</p>
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
