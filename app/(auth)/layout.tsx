import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 pattern-overlay" />
        <Image
          src="/images/concepts/mosque.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-gold/50">
            <Image src="/images/logo.jpg" alt="Logo" width={48} height={48} className="object-cover" />
          </div>
          <div>
            <p className="text-gold font-semibold font-bangla">সিদ্দীকে আকবার রাযি.</p>
            <p className="text-white/60 text-sm font-bangla">ছাত্র কাফেলা গ্রন্থাগার</p>
          </div>
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <div className="font-arabic text-gold text-5xl leading-relaxed mb-8 text-center">
            هيئة طلاب الصديق الأكبر
          </div>
          <h2 className="text-3xl font-bold text-white font-bangla-serif mb-4 leading-snug">
            জ্ঞানের আলোয় উদ্ভাসিত
            <span className="text-gold block">একটি আলোকিত প্রজন্ম</span>
          </h2>
          <p className="text-white/60 font-bangla leading-relaxed">
            হযরত আবু বকর সিদ্দীকে আকবর রাযি.–এর আদর্শে অনুপ্রাণিত হয়ে দেশ, সমাজ ও উম্মাহর সেবায় নিবেদিত।
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { value: "২,৫০০+", label: "বই" },
              { value: "৩০০+", label: "সদস্য" },
              { value: "৩", label: "স্তর" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center border border-white/10">
                <p className="text-gold text-xl font-bold font-english">{stat.value}</p>
                <p className="text-white/60 text-xs font-bangla mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <div className="relative z-10 text-white/30 text-xs font-english">
          Designed & Developed by ZedDev • zedev@gmail.com
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <Image src="/images/logo.jpg" alt="Logo" width={40} height={40} className="object-cover" />
            </div>
            <p className="text-primary font-semibold font-bangla text-sm">কাফেলা গ্রন্থাগার</p>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
