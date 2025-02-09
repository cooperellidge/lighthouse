import { Inter } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import type React from "react";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Lighthouse",
  description: "Gym class timer",
  manifest: "/lighthouse/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        {/* <meta name="theme-color" content="#6B82B8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        /> */}
        <meta name="apple-mobile-web-app-title" content="Lighthouse" />
      </head>
      <body
        className={`${inter.variable} ${dmSerif.variable} ${bebas.variable} font-sans bg-lighthouse-blue`}
      >
        {children}
      </body>
    </html>
  );
}
