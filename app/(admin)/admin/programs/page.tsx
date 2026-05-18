"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Video, ExternalLink, ChevronLeft, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProgramVideo {
  id: string;
  title?: string;
  thumbnail?: string;
  videoUrl: string;
  order: number;
}

interface Program {
  id: string;
  title: string;
  description?: string;
  colorClass: string;
  order: number;
  isActive: boolean;
  videos: ProgramVideo[];
}

const emptyVideoForm = { title: "", thumbnail: "", videoUrl: "", order: 0 };

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // video modal state
  const [videoModal, setVideoModal] = useState<"add" | "edit" | null>(null);
  const [editVideo, setEditVideo] = useState<ProgramVideo | null>(null);
  const [videoForm, setVideoForm] = useState({ ...emptyVideoForm });
  const [savingVideo, setSavingVideo] = useState(false);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState(false);

  const fetchPrograms = async () => {
    setLoading(true);
    const res = await fetch("/api/public/programs");
    const data = await res.json();
    if (data.success) {
      setPrograms(data.data);
      if (selectedProgram) {
        const updated = data.data.find((p: Program) => p.id === selectedProgram.id);
        if (updated) setSelectedProgram(updated);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPrograms(); }, []);

  const openAddVideo = () => {
    setVideoForm({ ...emptyVideoForm, order: selectedProgram?.videos.length ?? 0 });
    setEditVideo(null);
    setVideoModal("add");
  };

  const openEditVideo = (v: ProgramVideo) => {
    setEditVideo(v);
    setVideoForm({ title: v.title || "", thumbnail: v.thumbnail || "", videoUrl: v.videoUrl, order: v.order });
    setVideoModal("edit");
  };

  const closeVideoModal = () => { setVideoModal(null); setEditVideo(null); };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.videoUrl) { toast.error("ভিডিও লিংক আবশ্যক।"); return; }
    if (!selectedProgram) return;
    setSavingVideo(true);

    const url = videoModal === "edit"
      ? `/api/admin/programs/${selectedProgram.id}/videos/${editVideo!.id}`
      : `/api/admin/programs/${selectedProgram.id}/videos`;
    const method = videoModal === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videoForm),
    });
    const data = await res.json();
    setSavingVideo(false);

    if (res.ok) {
      toast.success(videoModal === "edit" ? "আপডেট হয়েছে!" : "ভিডিও যোগ হয়েছে!");
      closeVideoModal();
      fetchPrograms();
    } else {
      toast.error(data.error || "সংরক্ষণ ব্যর্থ।");
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteVideoId || !selectedProgram) return;
    setDeletingVideo(true);
    const res = await fetch(`/api/admin/programs/${selectedProgram.id}/videos/${deleteVideoId}`, { method: "DELETE" });
    setDeletingVideo(false);
    if (res.ok) { toast.success("মুছে ফেলা হয়েছে।"); setDeleteVideoId(null); fetchPrograms(); }
    else toast.error("মুছতে ব্যর্থ।");
  };

  // ── Program list view ───────────────────────────────────────────────
  if (!selectedProgram) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">কার্যক্রম ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">একটি কার্যক্রমে ক্লিক করে ভিডিও যোগ করুন</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog) => (
              <motion.button
                key={prog.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedProgram(prog)}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/40 hover:shadow-card transition-all text-left"
              >
                <div className={`w-12 h-12 ${prog.colorClass} rounded-xl flex items-center justify-center mb-3`}>
                  <Video size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 font-bangla mb-1">{prog.title}</h3>
                {prog.description && <p className="text-gray-500 text-xs font-bangla mb-3 line-clamp-2">{prog.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-bangla font-medium">
                    {prog.videos.length}টি ভিডিও
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-primary transition-colors font-bangla">ভিডিও পরিচালনা →</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Video management view ───────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedProgram(null)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">{selectedProgram.title}</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">ভিডিও যোগ ও পরিচালনা করুন</p>
        </div>
        <button
          onClick={openAddVideo}
          className="ml-auto flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bangla text-sm font-medium transition-all shadow-teal"
        >
          <Plus size={18} />
          ভিডিও যোগ করুন
        </button>
      </div>

      {selectedProgram.videos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Video size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bangla text-lg">এখনো কোনো ভিডিও নেই।</p>
          <button onClick={openAddVideo} className="mt-4 text-primary hover:underline font-bangla text-sm">ভিডিও যোগ করুন</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedProgram.videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative h-36 bg-gray-100">
                {video.thumbnail ? (
                  <Image src={video.thumbnail} alt={video.title || "ভিডিও"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-primary-50"
                  >
                    <ExternalLink size={15} className="text-primary" />
                  </a>
                  <button
                    onClick={() => openEditVideo(video)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-primary-50"
                  >
                    <Edit2 size={15} className="text-primary" />
                  </button>
                  <button
                    onClick={() => setDeleteVideoId(video.id)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-50"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900 font-bangla text-sm truncate">{video.title || "শিরোনামহীন"}</p>
                <a href={video.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-english truncate block mt-0.5">
                  {video.videoUrl.slice(0, 40)}...
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Video Modal */}
      <AnimatePresence>
        {videoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeVideoModal()}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 font-bangla text-lg">
                  {videoModal === "add" ? "নতুন ভিডিও যোগ করুন" : "ভিডিও সম্পাদনা"}
                </h2>
                <button onClick={closeVideoModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                    ভিডিও লিংক (YouTube/Drive/ইত্যাদি) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={videoForm.videoUrl}
                    onChange={e => setVideoForm(f => ({ ...f, videoUrl: e.target.value }))}
                    className="input-primary font-english"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">শিরোনাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))}
                    className="input-primary font-bangla"
                    placeholder="ভিডিওর শিরোনাম"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">থাম্বনেইল URL (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    value={videoForm.thumbnail}
                    onChange={e => setVideoForm(f => ({ ...f, thumbnail: e.target.value }))}
                    className="input-primary font-english"
                    placeholder="https://i.ytimg.com/vi/.../hqdefault.jpg"
                  />
                  {videoForm.thumbnail && (
                    <div className="mt-2 relative h-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={videoForm.thumbnail} alt="preview" fill className="object-cover" onError={() => setVideoForm(f => ({ ...f, thumbnail: "" }))} />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1 font-bangla">YouTube থাম্বনেইল: https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeVideoModal} className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50 transition-colors">বাতিল</button>
                  <button type="submit" disabled={savingVideo} className="flex-1 px-5 py-3 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium transition-colors">
                    {savingVideo ? "সংরক্ষণ হচ্ছে..." : videoModal === "add" ? "যোগ করুন" : "সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteVideoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-center font-bold text-gray-900 font-bangla text-lg mb-2">ভিডিও মুছবেন?</h3>
              <p className="text-center text-gray-500 text-sm font-bangla mb-6">এই ভিডিও স্থায়ীভাবে মুছে যাবে।</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteVideoId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bangla hover:bg-gray-50">বাতিল</button>
                <button onClick={handleDeleteVideo} disabled={deletingVideo} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bangla font-medium">
                  {deletingVideo ? "মুছছে..." : "মুছে ফেলুন"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
