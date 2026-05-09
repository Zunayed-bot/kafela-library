"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users, Plus, Search, Edit2, Trash2, Key, CheckCircle, XCircle,
  MoreVertical, X, Save, AlertCircle, UserCheck,
} from "lucide-react";
import { membershipTierLabel, membershipTierColor, formatDate, banglaNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  studentId: string;
  phone: string;
  email?: string;
  department?: string;
  session?: string;
  profilePicture?: string;
  membershipTier: string;
  borrowLimit: number;
  status: string;
  isActivated: boolean;
  createdAt: string;
  _count: { borrowings: number; reservations: number };
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "সক্রিয়", cls: "bg-green-100 text-green-700" },
  PENDING: { label: "অপেক্ষমাণ", cls: "bg-amber-100 text-amber-700" },
  SUSPENDED: { label: "স্থগিত", cls: "bg-red-100 text-red-700" },
  INACTIVE: { label: "নিষ্ক্রিয়", cls: "bg-gray-100 text-gray-700" },
};

const defaultForm = {
  name: "", studentId: "", phone: "", email: "",
  department: "", session: "", borrowLimit: "3", membershipTier: "GOLDEN",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const [resetModal, setResetModal] = useState<{ userId: string; userName: string } | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    if (data.success) {
      setUsers(data.data.users);
      setTotal(data.data.total);
      setPages(data.data.pages);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => { setEditUser(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      name: u.name, studentId: u.studentId, phone: u.phone,
      email: u.email || "", department: u.department || "", session: u.session || "",
      borrowLimit: u.borrowLimit.toString(), membershipTier: u.membershipTier,
    });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editUser ? `/api/users/${editUser.id}` : "/api/users";
      const method = editUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editUser ? "সদস্য আপডেট হয়েছে!" : "সদস্য নিবন্ধিত হয়েছে!");
        setShowModal(false);
        fetchUsers();
      } else {
        toast.error(data.error || "ব্যর্থ হয়েছে।");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("স্ট্যাটাস আপডেট হয়েছে।");
      fetchUsers();
    } else {
      toast.error(data.error || "ব্যর্থ হয়েছে।");
    }
    setOpenMenu(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("এই সদস্যকে মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { toast.success("সদস্য মুছে ফেলা হয়েছে।"); fetchUsers(); }
    else toast.error(data.error || "মুছতে ব্যর্থ হয়েছে।");
    setOpenMenu(null);
  };

  const handleGenerateResetToken = async () => {
    if (!resetModal) return;
    setGeneratingToken(true);
    const res = await fetch("/api/admin/reset-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: resetModal.userId }),
    });
    const data = await res.json();
    if (res.ok) {
      setResetToken(data.data.token);
      toast.success("রিসেট টোকেন তৈরি হয়েছে!");
    } else {
      toast.error(data.error || "ব্যর্থ হয়েছে।");
    }
    setGeneratingToken(false);
  };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">সদস্য ব্যবস্থাপনা</h1>
          <p className="text-gray-500 text-sm font-bangla mt-0.5">মোট {banglaNumber(total)} সদস্য</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors font-bangla"
        >
          <Plus size={18} />
          নতুন সদস্য যোগ করুন
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="নাম, ছাত্র আইডি বা ফোন..."
            className="input-primary pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-bangla focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">সব স্ট্যাটাস</option>
          <option value="ACTIVE">সক্রিয়</option>
          <option value="PENDING">অপেক্ষমাণ</option>
          <option value="SUSPENDED">স্থগিত</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left font-semibold text-gray-600 font-bangla">সদস্য</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 font-bangla">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 font-bangla">স্তর</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 font-bangla">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 font-bangla">ধার</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 font-bangla">যোগের তারিখ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="skeleton h-4 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                        {user.profilePicture ? (
                          <Image src={user.profilePicture} alt={user.name} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm font-bangla">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 font-bangla">{user.name}</p>
                        <p className="text-xs text-gray-400 font-english">{user.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 font-english text-sm">{user.phone}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full font-bangla ${membershipTierColor(user.membershipTier)}`}>
                      {membershipTierLabel(user.membershipTier).split("(")[0].trim()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full font-bangla ${statusLabels[user.status]?.cls}`}>
                      {statusLabels[user.status]?.label}
                    </span>
                    {!user.isActivated && (
                      <span className="ml-1 text-xs text-amber-600 font-bangla">(সক্রিয় নয়)</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600 font-bangla text-sm">
                    {banglaNumber(user._count.borrowings)}টি
                  </td>
                  <td className="px-4 py-4 text-gray-400 font-english text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden z-10">
                          <button onClick={() => openEdit(user)} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bangla">
                            <Edit2 size={14} /> সম্পাদনা
                          </button>
                          <button
                            onClick={() => { setResetModal({ userId: user.id, userName: user.name }); setResetToken(null); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-50 font-bangla"
                          >
                            <Key size={14} /> পাসওয়ার্ড রিসেট
                          </button>
                          {user.status === "ACTIVE" ? (
                            <button onClick={() => handleStatusChange(user.id, "SUSPENDED")} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-amber-700 hover:bg-amber-50 font-bangla">
                              <XCircle size={14} /> স্থগিত করুন
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(user.id, "ACTIVE")} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-green-700 hover:bg-green-50 font-bangla">
                              <CheckCircle size={14} /> সক্রিয় করুন
                            </button>
                          )}
                          <div className="border-t border-gray-100" />
                          <button onClick={() => handleDelete(user.id)} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bangla">
                            <Trash2 size={14} /> মুছুন
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-bangla">মোট {banglaNumber(total)} সদস্য</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-bangla">
                পূর্ববর্তী
              </button>
              <span className="px-3 py-1.5 text-sm font-bangla">{banglaNumber(page)} / {banglaNumber(pages)}</span>
              <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-bangla">
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 font-bangla flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                {editUser ? "সদস্য সম্পাদনা" : "নতুন সদস্য নিবন্ধন"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "পূর্ণ নাম *", type: "text", required: true },
                  { key: "studentId", label: "ছাত্র আইডি *", type: "text", required: true },
                  { key: "phone", label: "ফোন নম্বর *", type: "tel", required: true },
                  { key: "email", label: "ইমেইল", type: "email", required: false },
                  { key: "department", label: "বিভাগ", type: "text", required: false },
                  { key: "session", label: "সেশন", type: "text", required: false },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 font-bangla mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="input-primary text-sm py-2"
                      required={f.required}
                    />
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 font-bangla mb-1">ধার সীমা</label>
                  <input
                    type="number"
                    min="1" max="10"
                    value={form.borrowLimit}
                    onChange={(e) => setForm((f) => ({ ...f, borrowLimit: e.target.value }))}
                    className="input-primary text-sm py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 font-bangla mb-1">সদস্যপদ স্তর</label>
                  <select
                    value={form.membershipTier}
                    onChange={(e) => setForm((f) => ({ ...f, membershipTier: e.target.value }))}
                    className="input-primary text-sm py-2"
                  >
                    <option value="SILVER">সিলভার (আল ফিদ্দাহ)</option>
                    <option value="GOLDEN">গোল্ডেন (আয যাহাব)</option>
                    <option value="PLATINUM">প্লাটিনাম (আল মারজান)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-bangla flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                নিবন্ধনের পর সদস্য নিজে অ্যাকাউন্ট সক্রিয় করে পাসওয়ার্ড সেট করবেন।
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bangla text-sm hover:bg-gray-50 transition-colors">
                  বাতিল
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-700 text-white py-2.5 rounded-xl font-bangla text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> সংরক্ষণ</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Reset Token Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-bangla flex items-center gap-2">
                <Key size={18} className="text-blue-600" />
                পাসওয়ার্ড রিসেট
              </h2>
              <button onClick={() => { setResetModal(null); setResetToken(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-gray-600 text-sm font-bangla mb-5">
              <strong>{resetModal.userName}</strong>-এর জন্য একটি এককালীন রিসেট টোকেন তৈরি করুন।
            </p>

            {resetToken ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-bangla mb-2">রিসেট টোকেন (৩০ মিনিট মেয়াদ):</p>
                  <p className="font-bold text-green-800 text-xl font-english tracking-widest text-center">{resetToken}</p>
                </div>
                <p className="text-xs text-gray-500 font-bangla">এই টোকেনটি সদস্যকে দিন। তারা এটি দিয়ে পাসওয়ার্ড রিসেট করতে পারবেন।</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateResetToken}
                disabled={generatingToken}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bangla transition-colors disabled:opacity-60"
              >
                {generatingToken ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Key size={16} /> টোকেন তৈরি করুন</>}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
