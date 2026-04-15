import type { Metadata, Viewport } from "next";
import "./globals.css";
import ReduxProvider from "../lib/redux/providers/ReduxProvider";
import AuthLoader from "../lib/redux/authLoader";
import { Roboto_Condensed } from 'next/font/google';
import VerifyOtpGate from "@/components/auth/VerifyOtpGate";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: 'swap', // Improves LCP and prevents layout shift
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff', // Helps with browser UI theming
};

export const metadata: Metadata = {
  metadataBase: new URL('https://test-easy-mate.vercel.app'), // Replace with your actual domain
  title: {
    default: "Test Easy Mate - Create, Take & Master Quizzes Online",
    template: "%s | Test Easy Mate"
  },
  description: "Test Easy Mate: The ultimate free quiz platform. Create custom quizzes, test your knowledge, challenge friends, and track your progress. Perfect for students, teachers, and trivia enthusiasts.",
  keywords: ["online quiz", "create quiz", "take quiz", "test your knowledge", "trivia game", "quiz platform", "educational quiz", "Test Easy Mate", "free quiz maker"],
  authors: [{ name: "Test Easy Mate Team" }],
  creator: "Test Easy Mate",
  publisher: "Test Easy Mate",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Test Easy Mate - Master Quizzes & Challenge Yourself",
    description: "Test Easy Mate is an advanced online test portal for government exam preparation, designed to help aspirants practice smarter and score higher. The platform provides high-quality mock tests, topic-wise quizzes, and full-length test series based on the latest exam patterns. With real exam-like practice, Test Easy Mate helps you identify weak areas and improve performance through detailed analysis and insights. Whether you're preparing for UPSC, SSC, Banking, or any other competitive exam, Test Easy Mate offers a comprehensive suite of tools to enhance your preparation. Join our community of learners and take your exam readiness to the next level with Test Easy Mate.",
    url: "https://test-easy-mate.vercel.app",
    siteName: "Test Easy Mate",
    images: [
      {
        url: "/og-image.jpg", // Add an OG image to your public folder
        width: 1200,
        height: 630,
        alt: "Test Easy Mate - Quiz Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Test Easy Mate - Free Online Quiz Platform",
    description: "Create, take, and master quizzes with Test Easy Mate. Perfect for learning and fun!",
    images: ["/twitter-image.jpg"], // Add Twitter-specific image or reuse OG image
    creator: "@testeasymate", // Replace with your Twitter handle
    site: "@testeasymate", // Replace with your Twitter handle
  },
  alternates: {
    canonical: "https://test-easy-mate.vercel.app",
  },
  category: "education",
  classification: "Educational Gaming Platform",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${robotoCondensed.className} h-full antialiased`}
      // Add data-theme for potential dark mode support
      data-theme="light"
    >
      <head>
        {/* Preconnect to critical third-party domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for analytics or CDN domains */}
        <link rel="dns-prefetch" href="https://test-easy-mate.vercel.app" />
        
        {/* Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Test Easy Mate",
              "description": "Free online quiz platform for creating and taking interactive quizzes",
              "url": "https://test-easy-mate.vercel.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              }
            })
          }}
        />
        
        {/* BreadcrumbList Schema for better search visibility */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://test-easy-mate.vercel.app"
              }]
            })
          }}
        />
        
        {/* Meta tags for additional SEO */}
        <meta name="apple-mobile-web-app-title" content="Test Easy Mate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Geo and language tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="language" content="English" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Performance hints */}
        <meta name="google" content="notranslate" />
        
        {/* Sitemap reference */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <AuthLoader />
          <VerifyOtpGate>
            {/* Add skip to main content link for accessibility */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black">
              Skip to main content
            </a>
            <main id="main-content">
              {children}
            </main>
          </VerifyOtpGate>
        </ReduxProvider>
      </body>
    </html>
  );
}