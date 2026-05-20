"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Trash2, Key, Shield, ShieldCheck, AlertTriangle,
  Copy, Check, X, RefreshCw, UserCog,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Admin {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  createdAt: string;
  recoveryKeys: Array<{ id: string; createdAt: string }>;
}

interface RecoveryKeyResult {
  key: string;
  isExisting: boolean;
  name: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [keyModal, setKeyModal] = useState<RecoveryKeyResult | null>(null);
  const [keyLoading, setKeyLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const [adminsRes, meRes] = await Promise.all([
        fetch("/api/admin/admins"),
        fetch("/api/auth/me"),
      ]);
      const adminsData = await adminsRes.json();
      const meData = await meRes.json();
      if (adminsData.success) setAdmins(adminsData.data);
      if (meData.success) setCurrentUserId(meData.data.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(data.error || "মুছতে ব্যর্থ।");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGenerateKey = async (adminId: string) => {
    setKeyLoading(adminId);
    try {
      const res = await fetch(`/api/admin/admins/${adminId}/recovery-key`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setKeyModal(data.data);
        loadAdmins();
      } else {
        alert(data.error || "রিকভারি কী তৈরি ব্যর্থ।");
      }
    } finally {
      setKeyLoading(null);
    }
  };

  const handleCopy = () => {
    if (!keyModal) return;
    navigator.clipboard.writeText(keyModal.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">অ্যাডমিন ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-1">অ্যাডমিন অ্যাকাউন্ট তৈরি ও পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/admins/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all font-bangla text-sm shadow-sm"
        >
          <UserPlus size={16} />
          নতুন অ্যাডমিন যুক্ত করুন
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <UserCog size={40} className="mb-3 opacity-40" />
            <p className="font-bangla">কোনো অ্যাডমিন নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-bangla">নাম ও ইমেইল</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-bangla">ভূমিকা</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-bangla">অবস্থা</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-bangla">যোগদানের তারিখ</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-bangla">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 font-bangla text-sm">{admin.name}</p>
                          <p className="text-gray-500 text-xs">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.role === "SUPER_ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gold/10 text-amber-700 font-bangla">
                          <ShieldCheck size={12} />
                          সুপার অ্যাডমিন
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary font-bangla">
                          <Shield size={12} />
                          অ্যাডমিন
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-bangla ${
                          admin.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                          {admin.status === "ACTIVE" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                        {admin.mustChangePassword && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 font-bangla">
                            <AlertTriangle size={10} />
                            পাসওয়ার্ড পরিবর্তন বাকি
                          </span>
                        )}
                        {admin.recoveryKeys.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 font-bangla">
                            <Key size={10} />
                            সক্রিয় রিকভারি কী
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-bangla">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {admin.role !== "SUPER_ADMIN" && (
                          <>
                            <button
                              onClick={() => handleGenerateKey(admin.id)}
                              disabled={keyLoading === admin.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors font-bangla disabled:opacity-50"
                              title="রিকভারি কী তৈরি করুন"
                            >
                              {keyLoading === admin.id ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Key size={12} />
                              )}
                              রিকভারি কী
                            </button>
                            {admin.id !== currentUserId && (
                              <button
                                onClick={() => setDeleteTarget(admin)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 transition-colors font-bangla"
                              >
                                <Trash2 size={12} />
                                মুছুন
                              </button>
                            )}
                          </>
                        )}
                        {admin.id === currentUserId && (
                          <span className="text-xs text-gray-400 font-bangla italic">আপনি</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recovery Key Modal */}
      <AnimatePresence>
        {keyModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setKeyModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Key size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 font-bangla">রিকভারি কী</h3>
                      <p className="text-gray-500 text-xs font-bangla">{keyModal.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setKeyModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-semibold text-sm font-bangla">
                      {keyModal.isExisting ? "বিদ্যমান রিকভারি কী" : "এই রিকভারি কী সুরক্ষিতভাবে সংরক্ষণ করুন।"}
                    </p>
                    <p className="text-amber-700 text-xs font-bangla mt-1">
                      {keyModal.isExisting
                        ? "এই অ্যাডমিনের একটি অব্যবহৃত রিকভারি কী বিদ্যমান আছে। নিচে দেখানো হচ্ছে।"
                        : "এই কী শুধুমাত্র একটি নিরাপদ স্থানে লিখে রাখুন। অ্যাডমিনকে এটি প্রদান করুন।"}
                    </p>
                  </div>
                </div>

                {/* Key display */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 font-bangla mb-2">রিকভারি কী</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <code className="flex-1 text-sm font-mono text-gray-800 break-all select-all">
                      {keyModal.key}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                      title="কপি করুন"
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-bangla text-center">
                  অ্যাডমিন এই কী ব্যবহার করে <strong>/recover</strong> পেজ থেকে পাসওয়ার্ড পুনরুদ্ধার করবেন।
                </p>
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => setKeyModal(null)}
                  className="w-full bg-primary hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors font-bangla"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-bangla">অ্যাডমিন মুছুন</h3>
                    <p className="text-gray-500 text-xs font-bangla">এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-bangla mb-6">
                  আপনি কি <strong className="text-gray-900">{deleteTarget.name}</strong>-এর অ্যাকাউন্ট মুছতে চান?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl transition-colors font-bangla text-sm"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors font-bangla text-sm flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    মুছে দিন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
