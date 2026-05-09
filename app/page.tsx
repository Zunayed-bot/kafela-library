"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import {
  BookOpen, Users, BookMarked, Award, ChevronRight, Star,
  Search, Menu, X, ArrowRight, Library, Globe, Lightbulb,
  Monitor, Video, Calendar, Mic, PenTool, Building2,
  Clock, CheckCircle2, Sparkles, Heart,
} from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-gold/40">
              <Image src="/images/logo.jpg" alt="Logo" width={44} height={44} className="object-cover" />
            </div>
            <div className="hidden sm:block">
              <p className="text-gold font-semibold text-sm leading-tight font-bangla">সিদ্দীকে আকবার রাযি.</p>
              <p className="text-white/70 text-xs font-bangla">ছাত্র কাফেলা গ্রন্থাগার</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "হোম", href: "#home" },
              { label: "গ্রন্থাগার", href: "#library" },
              { label: "নেতৃত্ব", href: "#leadership" },
              { label: "ভবিষ্যৎ পরিকল্পনা", href: "#vision" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-white/80 hover:text-gold transition-colors text-sm font-medium font-bangla"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors font-bangla"
            >
              লগিন
            </Link>
            <Link
              href="/activate"
              className="bg-gold hover:bg-gold-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-gold font-bangla"
            >
              অ্যাকাউন্ট সক্রিয় করুন
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white p-2 rounded-lg"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-dark border-t border-white/10 px-4 py-4"
        >
          <div className="flex flex-col gap-3">
            {[
              { label: "হোম", href: "#home" },
              { label: "গ্রন্থাগার", href: "#library" },
              { label: "নেতৃত্ব", href: "#leadership" },
              { label: "ভবিষ্যৎ পরিকল্পনা", href: "#vision" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-gold py-2 text-sm font-bangla"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" className="text-white/80 text-sm py-2 font-bangla">লগিন</Link>
              <Link
                href="/activate"
                className="bg-gold text-white text-sm font-medium px-4 py-2.5 rounded-xl text-center font-bangla"
              >
                অ্যাকাউন্ট সক্রিয় করুন
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/images/concepts/mosque.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/92 via-primary-900/85 to-primary-950/95" />
      </motion.div>

      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 pattern-overlay opacity-50" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Arabic Calligraphy Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-2 mb-6">
              <span className="font-arabic text-gold text-lg leading-none">هيئة طلاب الصديق الأكبر</span>
              <span className="text-gold/60 text-xs">•</span>
              <span className="text-gold/90 text-xs font-english">Student Delegation</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 font-bangla-serif">
              <span className="text-white">সিদ্দীকে আকবার</span>
              <br />
              <span className="gradient-text">রাযি. ছাত্র কাফেলা</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-white/70 text-lg mb-2 font-bangla">
              জামিয়াতুস সাহাবা ঢাকা'র শিক্ষার্থীদের সম্মিলিত প্ল্যাটফর্ম
            </motion.p>

            <motion.div variants={fadeUp} className="divider-gold my-6 w-48" />

            <motion.p variants={fadeUp} className="text-white/65 text-base leading-relaxed mb-8 max-w-lg font-bangla">
              ইমান, আকীদা, চরিত্র ও জ্ঞান-প্রজ্ঞায় সমৃদ্ধ একটি আলোকিত প্রজন্ম গড়ে তোলার লক্ষ্যে আমাদের প্রিমিয়াম গ্রন্থাগার — জ্ঞান সাধনের এক অনন্য কেন্দ্র।
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group flex items-center gap-2 bg-gold hover:bg-gold-600 text-white font-medium px-7 py-3.5 rounded-xl transition-all duration-300 hover:shadow-gold-lg font-bangla"
              >
                গ্রন্থাগারে প্রবেশ করুন
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/activate"
                className="flex items-center gap-2 glass border border-white/20 text-white hover:bg-white/10 font-medium px-7 py-3.5 rounded-xl transition-all duration-300 font-bangla"
              >
                <BookOpen size={18} />
                অ্যাকাউন্ট সক্রিয় করুন
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats floating card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {[
              { icon: BookOpen, value: "২,৫০০+", label: "মোট বই", color: "text-gold" },
              { icon: Users, value: "৩০০+", label: "সক্রিয় সদস্য", color: "text-emerald-400" },
              { icon: BookMarked, value: "৫,০০০+", label: "সফল ধার", color: "text-blue-400" },
              { icon: Award, value: "৩", label: "সদস্যপদ স্তর", color: "text-purple-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/15 hover:border-gold/30 transition-all duration-300"
              >
                <stat.icon size={28} className={`${stat.color} mb-3`} />
                <p className={`text-3xl font-bold font-english ${stat.color}`}>{stat.value}</p>
                <p className="text-white/60 text-sm mt-1 font-bangla">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-white/40 text-xs font-bangla">স্ক্রোল করুন</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 bg-gold rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Stats Section ─────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: "২,৫০০+", label: "মোট বই সংগ্রহ", icon: BookOpen, desc: "ইসলামি ও আধুনিক জ্ঞানের বিশাল ভান্ডার" },
    { value: "৩০০+", label: "নিবন্ধিত সদস্য", icon: Users, desc: "তিন স্তরের বিশেষ সদস্যপদ" },
    { value: "১৫+", label: "বিভাগ", icon: Library, desc: "বিভিন্ন জ্ঞানশাখার শ্রেণিবদ্ধ সংগ্রহ" },
    { value: "৫,০০০+", label: "সফল ধার", icon: BookMarked, desc: "জ্ঞানচর্চার অব্যাহত ধারা" },
  ];

  return (
    <section id="library" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-card-hover transition-all duration-300 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                <stat.icon size={26} className="text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary font-english mb-1">{stat.value}</p>
              <p className="font-semibold text-gray-900 font-bangla mb-1">{stat.label}</p>
              <p className="text-gray-500 text-sm font-bangla">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  const mission = [
    "শিক্ষার্থীদের মধ্যে ইমান, আকীদা, চরিত্র ও আমলের পরিশুদ্ধতা প্রতিষ্ঠা করা",
    "সত্য, ন্যায়, সাহস ও নেতৃত্ব চর্চা জোরদার করা",
    "আধুনিক শিক্ষা ও ইসলামী জ্ঞানের সমন্বয়ে দক্ষ নেতৃত্ব তৈরি করা",
    "দাওয়াতি ও সামাজিক কার্যক্রমে শিক্ষার্থীদের ভূমিকা নিশ্চিত করা",
    "ছাত্রসমাজকে একটি ঐক্যবদ্ধ, শৃঙ্খলাবদ্ধ কাফেলা হিসেবে গড়ে তোলা",
    "জাতীয় ও আন্তর্জাতিক পরিমণ্ডলে ইসলামী মূল্যবোধভিত্তিক নেতৃত্ব তৈরি করা",
  ];

  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Vision */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-gold" />
              <span className="text-gold text-sm font-bangla font-medium">আমাদের ভিশন</span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white font-bangla-serif mb-6 leading-snug">
              আলোকিত প্রজন্ম গড়ার
              <span className="gradient-text block mt-1">অঙ্গীকার</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-white/70 text-base leading-relaxed mb-8 font-bangla">
              হযরত আবু বকর সিদ্দীকে আকবর রাযি.–এর সত্যনিষ্ঠা, নেতৃত্ব ও ত্যাগের আদর্শে অনুপ্রাণিত হয়ে এমন একটি আলোকিত প্রজন্ম গড়ে তোলা, যারা ইসলামি মূল্যবোধ, নৈতিক চরিত্র ও জ্ঞান–প্রজ্ঞায় সমৃদ্ধ হয়ে দেশ, সমাজ ও উম্মাহর সেবায় অগ্রণী ভূমিকা পালন করবে।
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 bg-gold hover:bg-gold-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-gold font-bangla"
              >
                গ্রন্থাগারে যোগ দিন
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Mission List */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            <motion.h3 variants={fadeUp} className="text-white/60 text-sm font-bangla mb-4 uppercase tracking-wider">
              সুনির্দিষ্ট মিশন
            </motion.h3>
            {mission.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-start gap-3 glass rounded-xl p-4 border border-white/10 hover:border-gold/30 transition-colors"
              >
                <CheckCircle2 size={18} className="text-gold mt-0.5 shrink-0" />
                <p className="text-white/80 text-sm font-bangla leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Programs Section ─────────────────────────────────────────────────────────
function ProgramsSection() {
  const programs = [
    { icon: Mic, title: "বিশুদ্ধ বাংলা বক্তৃতা", desc: "নৈতিক চরিত্র, শালীনতা ও যোগাযোগ দক্ষতা উন্নয়ন", color: "bg-emerald-500" },
    { icon: Globe, title: "আরবী বক্তৃতা", desc: "মুসলিম উম্মাহর সাথে সেতুবন্ধন তৈরি করতে আরবিতে দাওয়াহ", color: "bg-amber-500" },
    { icon: Globe, title: "ইংরেজি বক্তৃতা", desc: "বিশ্বের ১৩৫ কোটি ইংরেজিভাষী মানুষের কাছে হিদায়াতের বার্তা", color: "bg-blue-500" },
    { icon: BookOpen, title: "অধ্যয়ন ও জ্ঞান সাধন", desc: "সমৃদ্ধ পাঠাগার ও নিয়মিত জ্ঞানচর্চার আয়োজন", color: "bg-purple-500" },
    { icon: PenTool, title: "লেখালেখি প্রশিক্ষণ", desc: "প্রবন্ধ, গল্প, কবিতা, বই রচনায় দক্ষতা অর্জন", color: "bg-rose-500" },
    { icon: Monitor, title: "প্রযুক্তিবিদ্যা ও মিডিয়া", desc: "AI যুগে উম্মাহর প্রযুক্তিগত নেতৃত্বের প্রস্তুতি", color: "bg-cyan-500" },
  ];

  return (
    <section className="py-24 bg-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1.5 mb-4">
            <Star size={14} className="text-primary" />
            <span className="text-primary text-sm font-bangla font-medium">আমাদের কার্যক্রম</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-primary font-bangla-serif mb-4">
            কাফেলার সদস্যদের জন্য ধারাবাহিক আয়োজন
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 max-w-2xl mx-auto font-bangla">
            জ্ঞান, দক্ষতা ও চরিত্র গঠনে আমরা বিভিন্ন ধারাবাহিক কার্যক্রম পরিচালনা করে থাকি।
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {programs.map((program, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gold/30 hover:shadow-card-hover transition-all duration-300 card-hover"
            >
              <div className={`w-12 h-12 ${program.color} rounded-xl flex items-center justify-center mb-4`}>
                <program.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 font-bangla mb-2 text-lg">{program.title}</h3>
              <p className="text-gray-500 text-sm font-bangla leading-relaxed">{program.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Membership Section ───────────────────────────────────────────────────────
function MembershipSection() {
  const tiers = [
    {
      name: "আল ফিদ্দাহ",
      english: "Al Fiddah • Silver",
      color: "border-slate-300",
      badge: "bg-slate-100 text-slate-700",
      icon: "🥈",
      desc: "জামিয়ার প্রাক্তন শিক্ষক-শিক্ষার্থীগণের জন্য বিশেষ সদস্যপদ।",
      features: ["বার্ষিক আয়োজনে আমন্ত্রণ", "উম্মাহর সেবায় নিয়োজিত থাকার সুযোগ", "বিশেষ অ্যালামনাই নেটওয়ার্ক"],
    },
    {
      name: "আয যাহাব",
      english: "Al Zahab • Golden",
      color: "border-gold",
      badge: "bg-gold/10 text-gold-dark",
      icon: "🥇",
      desc: "নির্বাচিত শিক্ষার্থীদের জন্য নিয়মিত কর্মশালা ও সেমিনারে অংশগ্রহণের সুযোগ।",
      features: ["নিয়মিত কর্মশালায় অংশগ্রহণ", "জ্ঞান ও দক্ষতা অর্জনের সুযোগ", "উম্মাহর খিদমতে যুক্ত হওয়ার পথ"],
      featured: true,
    },
    {
      name: "আল মারজান",
      english: "Al Marjan • Platinum",
      color: "border-teal-500",
      badge: "bg-teal-50 text-teal-700",
      icon: "💎",
      desc: "বিশেষ প্রশিক্ষণ ও আন্তর্জাতিক উচ্চশিক্ষার সুযোগ সহ সর্বোচ্চ স্তরের সদস্যপদ।",
      features: ["বিদেশে উচ্চশিক্ষার প্রস্তুতি", "হাফ/ফুল স্কলারশিপের সুযোগ", "আল-আযহার, মদীনা বিশ্ববিদ্যালয়ে সুযোগ"],
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-1.5 mb-4">
            <Award size={14} className="text-gold-dark" />
            <span className="text-gold-dark text-sm font-bangla font-medium">সদস্যপদের স্তর</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-primary font-bangla-serif mb-4">
            কাফেলার সদস্যপদ ও স্তর
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`relative rounded-2xl p-8 border-2 ${tier.color} ${tier.featured ? "shadow-gold-lg scale-105" : "shadow-card"} transition-all duration-300 hover:shadow-card-hover bg-white`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-medium px-4 py-1 rounded-full font-bangla">
                  সবচেয়ে জনপ্রিয়
                </div>
              )}
              <div className="text-4xl mb-4">{tier.icon}</div>
              <div className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 font-english ${tier.badge}`}>
                {tier.english}
              </div>
              <h3 className="text-xl font-bold text-primary font-bangla-serif mb-2">{tier.name}</h3>
              <p className="text-gray-500 text-sm font-bangla mb-6 leading-relaxed">{tier.desc}</p>
              <ul className="space-y-2">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-700 font-bangla">
                    <CheckCircle2 size={15} className="text-gold shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Leadership Section ───────────────────────────────────────────────────────
function LeadershipSection() {
  const leaders = [
    {
      name: "মুফতী খালেদ সাইফুল্লাহ",
      role: "প্রধান উপদেষ্টা",
      desc: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা",
      image: "/images/leaders/leader1.jpg",
    },
    {
      name: "মুফতী আহমাদ মাসউদ",
      role: "উপদেষ্টা ও প্রধান দিক নির্দেশক",
      desc: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা",
      image: "/images/leaders/leader2.jpg",
    },
    {
      name: "মুফতী ওয়াসিফ আরাফ",
      role: "উপদেষ্টা ও তত্ত্বাবধায়ক",
      desc: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা",
      image: "/images/leaders/leader3.jpg",
    },
  ];

  return (
    <section id="leadership" className="py-24 bg-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1.5 mb-4">
            <Heart size={14} className="text-primary" />
            <span className="text-primary text-sm font-bangla font-medium">প্রতিষ্ঠালগ্ন থেকে</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-primary font-bangla-serif mb-4">
            আমাদের অভিভাবক যারা
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto font-bangla">
            যাদের অক্লান্ত পরিশ্রম ও দিকনির্দেশনায় কাফেলা আজ এখানে।
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {leaders.map((leader, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold/30 hover:shadow-gold transition-all duration-400 card-hover"
            >
              {/* Photo */}
              <div className="relative h-64 overflow-hidden bg-primary-50">
                <Image
                  src={leader.image}
                  alt={leader.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-6 border-t-2 border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-gold text-xs font-medium font-bangla">{leader.role}</span>
                </div>
                <h3 className="text-xl font-bold text-primary font-bangla-serif mb-1">{leader.name}</h3>
                <p className="text-gray-500 text-sm font-bangla">{leader.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Future Vision Section ────────────────────────────────────────────────────
function FutureVisionSection() {
  const visions = [
    {
      image: "/images/concepts/hall.jpg",
      title: "গ্র্যান্ড ইভেন্ট হল",
      desc: "বার্ষিক সম্মেলন, মাহফিল ও বিশেষ অনুষ্ঠানের জন্য প্রিমিয়াম মিলনায়তন।",
      tag: "ভবিষ্যৎ পরিকল্পনা",
      icon: Building2,
    },
    {
      image: "/images/concepts/conference.jpg",
      title: "কনফারেন্স ও সেমিনার রুম",
      desc: "উচ্চ মানের আলোচনা সভা, সেমিনার ও কর্মশালার জন্য আধুনিক কক্ষ।",
      tag: "আসছে শীঘ্রই",
      icon: Mic,
    },
    {
      image: "/images/concepts/auditorium.jpg",
      title: "মিডিয়া অডিটোরিয়াম",
      desc: "লাইভ স্ট্রিমিং ও রেকর্ডিং সুবিধাসহ আধুনিক অডিটোরিয়াম।",
      tag: "ভবিষ্যৎ পরিকল্পনা",
      icon: Video,
    },
    {
      image: "/images/concepts/tech-lab.jpg",
      title: "টেক ল্যাব ও কম্পিউটার রুম",
      desc: "AI ও প্রযুক্তি শিক্ষার জন্য অত্যাধুনিক কম্পিউটার ল্যাবরেটরি।",
      tag: "আসছে শীঘ্রই",
      icon: Monitor,
    },
    {
      image: "/images/concepts/studio.jpg",
      title: "মিডিয়া প্রোডাকশন স্টুডিও",
      desc: "ভিডিও প্রোডাকশন, পডকাস্ট ও ডিজিটাল কনটেন্ট তৈরির পূর্ণাঙ্গ স্টুডিও।",
      tag: "ভবিষ্যৎ পরিকল্পনা",
      icon: Video,
    },
    {
      image: "/images/concepts/manuscript.jpg",
      title: "ডিজিটাল আর্কাইভ",
      desc: "ইসলামি পাণ্ডুলিপি ও বিরল গ্রন্থের ডিজিটাল সংরক্ষণ ও গবেষণা কেন্দ্র।",
      tag: "পরিকল্পনাধীন",
      icon: Library,
    },
    {
      image: "/images/concepts/lecture.jpg",
      title: "স্মার্ট লেকচার হল",
      desc: "ইন্টারেক্টিভ ডিসপ্লে ও স্মার্ট টেকনোলজিসহ আধুনিক পাঠকক্ষ।",
      tag: "আসছে শীঘ্রই",
      icon: Lightbulb,
    },
    {
      image: "/images/concepts/study-circle.jpg",
      title: "ইলম সার্কেল ও স্টাডি লাউঞ্জ",
      desc: "গ্রুপ স্টাডি ও হালাকার জন্য আরামদায়ক, অনুপ্রেরণাদায়ক পরিবেশ।",
      tag: "পরিকল্পনাধীন",
      icon: BookOpen,
    },
  ];

  const tagColors: Record<string, string> = {
    "ভবিষ্যৎ পরিকল্পনা": "bg-purple-100 text-purple-700",
    "আসছে শীঘ্রই": "bg-amber-100 text-amber-700",
    "পরিকল্পনাধীন": "bg-blue-100 text-blue-700",
  };

  return (
    <section id="vision" className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={14} className="text-gold" />
            <span className="text-gold text-sm font-bangla font-medium">ভবিষ্যৎ পরিকল্পনা</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white font-bangla-serif mb-4">
            আমাদের স্বপ্নের জ্ঞান-কেন্দ্র
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 max-w-2xl mx-auto font-bangla leading-relaxed">
            এই সুবিধাগুলো বর্তমানে পরিকল্পনাধীন। ইনশাআল্লাহ ভবিষ্যতে কাফেলার সদস্যরা এই সম্পূর্ণ জ্ঞান-পরিবেশ উপভোগ করতে পারবেন।
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mt-6">
            {Object.entries(tagColors).map(([tag, cls]) => (
              <span key={tag} className={`text-xs font-medium px-3 py-1 rounded-full font-bangla ${cls}`}>
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {visions.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-gold/40 transition-all duration-400 card-hover cursor-default"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/50 to-transparent" />
                {/* Tag */}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full font-bangla ${tagColors[item.tag]}`}>
                    {item.tag}
                  </span>
                </div>
                {/* Icon */}
                <div className="absolute top-3 right-3 w-8 h-8 glass rounded-lg flex items-center justify-center">
                  <item.icon size={15} className="text-gold" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 glass-dark border-t border-white/5">
                <h3 className="font-bold text-white font-bangla mb-1.5 text-sm leading-snug">{item.title}</h3>
                <p className="text-white/50 text-xs font-bangla leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Vision note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass rounded-2xl border border-white/10 p-8 text-center"
        >
          <Clock size={32} className="text-gold mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white font-bangla-serif mb-2">
            বিশ্বমঞ্চে ইসলামকে নেতৃত্বের অবস্থানে ফিরিয়ে আনার অঙ্গীকার
          </h3>
          <p className="text-white/60 font-bangla max-w-2xl mx-auto text-sm leading-relaxed">
            আমাদের অবিরাম প্রচেষ্টা অব্যাহত থাকবে, ইনশাআল্লাহ। এই সুবিধাগুলো পর্যায়ক্রমে বাস্তবায়িত হবে। আপনার সহযোগিতা ও দোয়া প্রয়োজন।
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Quick Search CTA ─────────────────────────────────────────────────────────
function QuickSearchCTA() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1.5 mb-6">
            <Search size={14} className="text-primary" />
            <span className="text-primary text-sm font-bangla font-medium">বই খুঁজুন</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-primary font-bangla-serif mb-4">
            আপনার পছন্দের বই খুঁজে নিন
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 font-bangla mb-8">
            নাম, লেখক, প্রকাশক বা বিভাগ দিয়ে সহজেই বই অনুসন্ধান করুন।
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center">
            <Link
              href="/login"
              className="group flex items-center gap-3 bg-primary hover:bg-primary-700 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-teal-lg font-bangla text-lg"
            >
              <BookOpen size={22} />
              গ্রন্থাগারে প্রবেশ করুন
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-primary-950 text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-gold/40">
                <Image src="/images/logo.jpg" alt="Logo" width={48} height={48} className="object-cover" />
              </div>
              <div>
                <p className="text-white font-bold font-bangla-serif text-lg">সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা</p>
                <p className="text-white/50 text-sm font-bangla">গ্রন্থাগার ব্যবস্থাপনা সিস্টেম</p>
              </div>
            </div>
            <p className="text-white/50 text-sm font-bangla leading-relaxed mb-4 max-w-sm">
              জামিয়াতুস সাহাবা ঢাকা'র শিক্ষার্থীদের সম্মিলিত প্ল্যাটফর্ম। জ্ঞান, চরিত্র ও নেতৃত্বের পথে আমরা একসাথে।
            </p>
            <div className="font-arabic text-gold text-xl leading-relaxed">
              جَزَاكُمُ اللّٰهُ خَيْرًا
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold font-bangla mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2.5">
              {[
                { label: "গ্রন্থাগারে লগিন", href: "/login" },
                { label: "অ্যাকাউন্ট সক্রিয় করুন", href: "/activate" },
                { label: "আমাদের কার্যক্রম", href: "#programs" },
                { label: "ভবিষ্যৎ পরিকল্পনা", href: "#vision" },
                { label: "নেতৃত্ব", href: "#leadership" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-gold transition-colors font-bangla flex items-center gap-1.5">
                    <ChevronRight size={14} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold font-bangla mb-4">যোগাযোগ</h4>
            <div className="space-y-2 text-sm font-bangla">
              <p>জামিয়াতুস সাহাবা</p>
              <p>ঢাকা, বাংলাদেশ</p>
              <div className="divider-gold my-4 opacity-30" />
              <p className="text-white/40 text-xs font-english">
                Designed & Developed by
              </p>
              <p className="text-gold text-sm font-english font-semibold">ZedDev</p>
              <a
                href="mailto:zedev@gmail.com"
                className="text-white/50 hover:text-gold text-xs font-english transition-colors"
              >
                zedev@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="divider-gold mt-12 mb-6 opacity-20" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p className="font-bangla">
            © ২০২৪ সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="font-english">
            Designed & Developed by{" "}
            <a href="mailto:zedev@gmail.com" className="text-gold hover:text-gold-light transition-colors">
              ZedDev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <ProgramsSection />
      <MembershipSection />
      <LeadershipSection />
      <FutureVisionSection />
      <QuickSearchCTA />
      <Footer />
    </main>
  );
}
