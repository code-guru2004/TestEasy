import type { Metadata } from "next";
import "./globals.css";
import  ReduxProvider  from "../lib/redux/providers/ReduxProvider";
import AuthLoader from "../lib/redux/authLoader";
import { Roboto_Condensed } from 'next/font/google';

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Test Easy Mate",
  description: "A quiz app built with Next.js, React, and Redux. Create and take quizzes with ease!",
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
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <AuthLoader />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
