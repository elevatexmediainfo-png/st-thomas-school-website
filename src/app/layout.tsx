import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "St. Thomas English School, Ruabandha, Bhilai.",
  description: "St. Thomas English School, Ruabandha, Bhilai.",
  openGraph: {
    title: "St. Thomas English School, Ruabandha, Bhilai.",
    description: "St. Thomas English School, Ruabandha, Bhilai.",
    siteName: "St. Thomas English School, Ruabandha, Bhilai.",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
