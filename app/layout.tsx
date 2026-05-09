import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা | গ্রন্থাগার",
    template: "%s | কাফেলা গ্রন্থাগার",
  },
  description:
    "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা — জামিয়াতুস সাহাবা ঢাকা'র শিক্ষার্থীদের সম্মিলিত প্ল্যাটফর্মের অফিসিয়াল গ্রন্থাগার ব্যবস্থাপনা সিস্টেম।",
  keywords: ["library", "kafela", "islamic", "dhaka", "books", "গ্রন্থাগার", "কাফেলা"],
  authors: [{ name: "ZedDev", url: "mailto:zedev@gmail.com" }],
  creator: "ZedDev",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "bn_BD",
    title: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা | গ্রন্থাগার",
    description: "জামিয়াতুস সাহাবা ঢাকা'র শিক্ষার্থীদের জন্য প্রিমিয়াম গ্রন্থাগার ব্যবস্থাপনা।",
    siteName: "কাফেলা গ্রন্থাগার",
  },
  icons: {
    icon: "/images/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-bangla bg-background min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
