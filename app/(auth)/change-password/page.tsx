"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isForced, setIsForced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          router.push("/login");
          return;
        }
        setIsForced(d.data.mustChangePassword);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("নতুন পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: isForced ? undefined : form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ।");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock size={20} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-bangla-serif mb-2">
            {isForced ? "পাসওয়ার্ড সেট করুন" : "পাসওয়ার্ড পরিবর্তন করুন"}
          </h1>
          <p className="text-gray-500 font-bangla text-sm">
            {isForced
              ? "প্রথমবার লগিনের জন্য একটি নতুন পাসওয়ার্ড নির্ধারণ করুন।"
              : "আপনার বর্তমান পাসওয়ার্ড প্রবেশ করুন এবং নতুন পাসওয়ার্ড সেট করুন।"}
          </p>
        </div>

        {isForced && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl mb-6"
          >
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm font-bangla">
              নিরাপত্তার জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন। পাসওয়ার্ড পরিবর্তনের পর পুনরায় লগিন করতে হবে।
            </p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-bangla"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            পাসওয়ার্ড পরিবর্তন সফল। লগিন পেজে পুনঃনির্দেশ হচ্ছে…
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-bangla"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isForced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
                বর্তমান পাসওয়ার্ড *
              </label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  value={form.oldPassword}
                  onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  className="input-primary pr-12"
                  required
                  autoFocus
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              নতুন পাসওয়ার্ড *
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="কমপক্ষে ৮ অক্ষর"
                className="input-primary pr-12"
                required
                autoFocus={isForced}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              নতুন পাসওয়ার্ড নিশ্চিত করুন *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="একই পাসওয়ার্ড আবার লিখুন"
                className="input-primary pr-12"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 font-bangla">পাসওয়ার্ড দুটি মিলছে না।</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-teal font-bangla"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={18} />
                পাসওয়ার্ড পরিবর্তন করুন
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
