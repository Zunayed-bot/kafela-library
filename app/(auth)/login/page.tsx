"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ studentId: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "লগিন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        return;
      }

      if (data.data?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("সংযোগ ব্যর্থ হয়েছে। ইন্টারনেট চেক করুন।");
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
              <BookOpen size={20} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-bangla-serif mb-2">
            গ্রন্থাগারে প্রবেশ করুন
          </h1>
          <p className="text-gray-500 font-bangla text-sm">
            আপনার ছাত্র আইডি ও পাসওয়ার্ড দিয়ে লগিন করুন।
          </p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              ছাত্র আইডি *
            </label>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              placeholder="আপনার ছাত্র আইডি লিখুন"
              className="input-primary"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">
              পাসওয়ার্ড *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                className="input-primary pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600 font-bangla">মনে রাখুন</span>
            </label>
            <div className="text-sm text-gray-500 font-bangla">
              পাসওয়ার্ড ভুলে গেলে অ্যাডমিনের সাথে যোগাযোগ করুন
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-teal font-bangla"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                লগিন করুন
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-bangla">অথবা</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Activate account */}
        <Link
          href="/activate"
          className="block w-full text-center border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary-50 font-medium py-3.5 rounded-xl transition-all duration-300 font-bangla text-sm"
        >
          প্রথমবার? অ্যাকাউন্ট সক্রিয় করুন
        </Link>

        <p className="text-center text-xs text-gray-400 mt-6 font-bangla">
          সমস্যা হলে অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
      </motion.div>
    </div>
  );
}
