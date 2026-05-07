import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpendSmart AI — Free AI Tool Spend Audit",
  description: "Find out if you're overpaying for AI tools. Get an instant audit of your Cursor, Claude, ChatGPT, and GitHub Copilot spend — free, no login required.",
  openGraph: {
    title: "SpendSmart AI — Free AI Tool Spend Audit",
    description: "Stop overpaying for AI tools. Get your free audit in 60 seconds.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SpendSmart AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendSmart AI — Free AI Tool Spend Audit",
    description: "Stop overpaying for AI tools. Get your free audit in 60 seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" toastOptions={{ style: { background: "#1f2937", color: "#f9fafb" } }} />
        {children}
      </body>
    </html>
  );
}
