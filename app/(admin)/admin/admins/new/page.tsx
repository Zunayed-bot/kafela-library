"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

export default function NewAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "অ্যাডমিন তৈরি ব্যর্থ।");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/admins"), 1500);
    } catch {
      setError("সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/admins" className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary font-bangla-serif">নতুন অ্যাডমিন</h1>
          <p className="text-gray-500 text-sm font-bangla">নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm font-bangla">
            নতুন অ্যাডমিন প্রথম লগিনে পাসওয়ার্ড পরিবর্তন করতে বাধ্য হবেন। লগিনের জন্য ইমেইল ব্যবহার করতে হবে।
          </p>
        </div>

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-bangla"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            অ্যাডমিন সফলভাবে তৈরি হয়েছে। পুনঃনির্দেশ হচ্ছে…
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bangla"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              পূর্ণ নাম *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="অ্যাডমিনের পূর্ণ নাম লিখুন"
              className="input-primary"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              ইমেইল *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="input-primary"
              required
            />
            <p className="text-xs text-gray-400 mt-1 font-bangla">এই ইমেইল দিয়ে লগিন করতে হবে।</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              অস্থায়ী পাসওয়ার্ড *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="কমপক্ষে ৮ অক্ষর"
                className="input-primary pr-12"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-bangla">অ্যাডমিন প্রথম লগিনে এটি পরিবর্তন করবেন।</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/admin/admins"
              className="flex-1 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors font-bangla text-sm"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors font-bangla text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  অ্যাডমিন তৈরি করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
