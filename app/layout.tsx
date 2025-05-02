import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Roboto } from "next/font/google"; // Import Inter font
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter", // Define Inter font variable
  subsets: ["latin"],
});
// Removed unused Roboto font configuration

export const metadata: Metadata = {
  title: "AutoDocs AI",
  description: "The documentation tool that will change your life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
