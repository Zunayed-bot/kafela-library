"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Eye, EyeOff, Save, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { membershipTierLabel, membershipTierColor, formatDateBn } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserProfile {
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
  activatedAt?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && setUser(d.data));
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData.error || "আপলোড ব্যর্থ হয়েছে।");
        return;
      }

      const updateRes = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture: uploadData.data.url }),
      });
      const updateData = await updateRes.json();

      if (updateRes.ok) {
        setUser((u) => u ? { ...u, profilePicture: uploadData.data.url } : u);
        toast.success("প্রোফাইল ছবি আপডেট হয়েছে!");
      } else {
        toast.error(updateData.error || "আপডেট ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("আপলোড ব্যর্থ হয়েছে।");
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("নতুন পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।");
      return;
    }

    setSavingPw(true);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } else {
      toast.error(data.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।");
    }
    setSavingPw(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusInfo = {
    ACTIVE: { label: "সক্রিয়", cls: "text-green-700 bg-green-100" },
    PENDING: { label: "অপেক্ষমাণ", cls: "text-amber-700 bg-amber-100" },
    SUSPENDED: { label: "স্থগিত", cls: "text-red-700 bg-red-100" },
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 pattern-overlay opacity-30" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar upload */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-gold/40 bg-primary-700">
              {user.profilePicture ? (
                <Image src={user.profilePicture} alt={user.name} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold font-bangla">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold hover:bg-gold-600 rounded-full flex items-center justify-center shadow-gold transition-colors"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white font-bangla-serif">{user.name}</h1>
            <p className="text-white/60 font-english mt-1">{user.studentId}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full font-bangla ${membershipTierColor(user.membershipTier)}`}>
                {membershipTierLabel(user.membershipTier)}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full font-bangla ${statusInfo[user.status as keyof typeof statusInfo]?.cls}`}>
                {statusInfo[user.status as keyof typeof statusInfo]?.label}
              </span>
            </div>

            {!user.profilePicture && (
              <div className="mt-3 inline-flex items-center gap-2 text-amber-300 text-sm font-bangla">
                <AlertCircle size={15} />
                বই নিতে প্রোফাইল ছবি আপলোড করুন
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Personal Info (Read-only) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-primary" />
          <h2 className="font-bold text-gray-900 font-bangla">ব্যক্তিগত তথ্য</h2>
          <span className="ml-auto text-xs text-gray-400 font-bangla bg-gray-50 px-2 py-1 rounded">অ্যাডমিন কর্তৃক নিয়ন্ত্রিত</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "পূর্ণ নাম", value: user.name },
            { label: "ছাত্র আইডি", value: user.studentId },
            { label: "ফোন নম্বর", value: user.phone },
            { label: "ইমেইল", value: user.email || "—" },
            { label: "বিভাগ", value: user.department || "—" },
            { label: "সেশন", value: user.session || "—" },
            { label: "ধার সীমা", value: `${user.borrowLimit}টি বই` },
            { label: "সক্রিয়করণের তারিখ", value: user.activatedAt ? formatDateBn(user.activatedAt) : "—" },
          ].map((field, i) => (
            <div key={i} className="space-y-1">
              <label className="text-xs font-medium text-gray-500 font-bangla">{field.label}</label>
              <p className="text-gray-900 font-bangla text-sm bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-primary" />
          <h2 className="font-bold text-gray-900 font-bangla">পাসওয়ার্ড পরিবর্তন</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: "currentPassword", label: "বর্তমান পাসওয়ার্ড", show: showPw.current, toggle: () => setShowPw((s) => ({ ...s, current: !s.current })) },
            { key: "newPassword", label: "নতুন পাসওয়ার্ড", show: showPw.new, toggle: () => setShowPw((s) => ({ ...s, new: !s.new })) },
            { key: "confirm", label: "পাসওয়ার্ড নিশ্চিত করুন", show: showPw.confirm, toggle: () => setShowPw((s) => ({ ...s, confirm: !s.confirm })) },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={field.show ? "text" : "password"}
                  value={pwForm[field.key as keyof typeof pwForm]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="input-primary pr-12"
                  required
                />
                <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
            <p className="text-red-500 text-sm font-bangla flex items-center gap-1">
              <AlertCircle size={14} /> পাসওয়ার্ড দুটি মিলছে না
            </p>
          )}

          <button
            type="submit"
            disabled={savingPw}
            className="flex items-center gap-2 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-xl transition-all font-bangla"
          >
            {savingPw ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save size={16} /> পাসওয়ার্ড সংরক্ষণ করুন</>
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-blue-700 text-xs font-bangla flex items-start gap-2">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            পাসওয়ার্ড ভুলে গেলে অ্যাডমিনের সাথে যোগাযোগ করুন। অ্যাডমিন একটি OTP তৈরি করে দেবেন।
          </p>
        </div>
      </motion.div>
    </div>
  );
}
