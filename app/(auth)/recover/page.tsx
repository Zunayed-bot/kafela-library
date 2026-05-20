"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, ArrowLeft, Info } from "lucide-react";

export default function RecoverPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", recoveryKey: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

    setLoading(true);

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          recoveryKey: form.recoveryKey.trim(),
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "অ্যাকাউন্ট পুনরুদ্ধার ব্যর্থ।");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRound size={20} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-bangla-serif mb-2">
            অ্যাকাউন্ট পুনরুদ্ধার
          </h1>
          <p className="text-gray-500 font-bangla text-sm">
            সুপার অ্যাডমিনের প্রদত্ত রিকভারি কী ব্যবহার করে পাসওয়ার্ড পুনরুদ্ধার করুন।
          </p>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl mb-6">
          <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm font-bangla">
            এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য। রিকভারি কী পাওয়ার জন্য সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </div>

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-bangla"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            অ্যাকাউন্ট পুনরুদ্ধার সফল। লগিন পেজে পুনঃনির্দেশ হচ্ছে…
          </motion.div>
        )}

        {/* Error */}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              ইমেইল *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="আপনার অ্যাডমিন ইমেইল লিখুন"
              className="input-primary"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              রিকভারি কী *
            </label>
            <input
              type="text"
              value={form.recoveryKey}
              onChange={(e) => setForm({ ...form, recoveryKey: e.target.value })}
              placeholder="সুপার অ্যাডমিন প্রদত্ত রিকভারি কী"
              className="input-primary font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              নতুন পাসওয়ার্ড *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="কমপক্ষে ৮ অক্ষর"
                className="input-primary pr-12"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              পাসওয়ার্ড নিশ্চিত করুন *
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
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-teal font-bangla"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound size={18} />
                পাসওয়ার্ড পুনরুদ্ধার করুন
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-bangla">অথবা</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full text-center border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary-50 font-medium py-3.5 rounded-xl transition-all duration-300 font-bangla text-sm"
        >
          <ArrowLeft size={16} />
          লগিন পেজে ফিরে যান
        </Link>
      </motion.div>
    </div>
  );
}
