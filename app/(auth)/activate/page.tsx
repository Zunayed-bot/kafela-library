"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type Step = "verify" | "setPassword" | "success";

export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [verifyForm, setVerifyForm] = useState({ studentId: "", phone: "" });
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  // Step 2
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "verify", ...verifyForm }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUserId(data.data.userId);
      setUserName(data.data.name);
      setStep("setPassword");
    } catch {
      setError("সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwordForm.password !== passwordForm.confirm) {
      setError("পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }
    if (passwordForm.password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "setPassword", userId, password: passwordForm.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("success");
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
        className="w-full max-w-md"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["তথ্য যাচাই", "পাসওয়ার্ড সেট", "সম্পন্ন"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all ${
                (step === "verify" && i === 0) || (step === "setPassword" && i === 1) || (step === "success" && i === 2)
                  ? "bg-primary text-white"
                  : (step === "setPassword" && i === 0) || (step === "success" && i <= 1)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
                {((step === "setPassword" && i === 0) || (step === "success" && i <= 1)) ? (
                  <CheckCircle2 size={14} />
                ) : i + 1}
              </div>
              <span className="text-xs text-gray-500 font-bangla hidden sm:block">{label}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 w-8" />}
            </div>
          ))}
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

        {/* Step 1: Verify */}
        {step === "verify" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-bold text-primary font-bangla-serif mb-2">
              অ্যাকাউন্ট সক্রিয় করুন
            </h1>
            <p className="text-gray-500 font-bangla text-sm mb-8">
              আপনার ছাত্র আইডি ও ফোন নম্বর দিয়ে পরিচয় নিশ্চিত করুন।
            </p>
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ছাত্র আইডি *</label>
                <input
                  type="text"
                  value={verifyForm.studentId}
                  onChange={(e) => setVerifyForm({ ...verifyForm, studentId: e.target.value })}
                  placeholder="আপনার ছাত্র আইডি"
                  className="input-primary"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">ফোন নম্বর *</label>
                <input
                  type="tel"
                  value={verifyForm.phone}
                  onChange={(e) => setVerifyForm({ ...verifyForm, phone: e.target.value })}
                  placeholder="০১XXXXXXXXX"
                  className="input-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-3.5 rounded-xl transition-all font-bangla"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <><UserCheck size={18} /> পরিচয় নিশ্চিত করুন</>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Set Password */}
        {step === "setPassword" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
              <p className="text-primary font-bangla text-sm font-medium">✓ স্বাগতম, {userName}!</p>
              <p className="text-primary/70 font-bangla text-xs mt-1">আপনার পরিচয় নিশ্চিত হয়েছে। এখন পাসওয়ার্ড সেট করুন।</p>
            </div>
            <h2 className="text-xl font-bold text-primary font-bangla-serif mb-2">পাসওয়ার্ড তৈরি করুন</h2>
            <p className="text-gray-500 font-bangla text-sm mb-6">একটি শক্তিশালী পাসওয়ার্ড বেছে নিন (কমপক্ষে ৮ অক্ষর)।</p>
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">নতুন পাসওয়ার্ড *</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    className="input-primary pr-12"
                    required
                    minLength={8}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bangla mb-1.5">পাসওয়ার্ড নিশ্চিত করুন *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="পাসওয়ার্ড আবার লিখুন"
                    className="input-primary pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {passwordForm.confirm && passwordForm.password !== passwordForm.confirm && (
                <p className="text-red-500 text-xs font-bangla">পাসওয়ার্ড দুটি মিলছে না</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-600 disabled:opacity-60 text-white font-medium py-3.5 rounded-xl transition-all font-bangla"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <><CheckCircle2 size={18} /> অ্যাকাউন্ট সক্রিয় করুন</>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary font-bangla-serif mb-3">অ্যাকাউন্ট সক্রিয় হয়েছে!</h2>
            <p className="text-gray-500 font-bangla mb-6 leading-relaxed">
              আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় হয়েছে। কয়েক সেকেন্ডের মধ্যে লগিন পেজে নিয়ে যাওয়া হবে।
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-xl font-bangla hover:bg-primary-700 transition-colors">
              লগিন করুন
            </Link>
          </motion.div>
        )}

        {step !== "success" && (
          <p className="text-center text-sm text-gray-400 mt-6 font-bangla">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">লগিন করুন</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
