import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tunify — Your Music. Your Way.",
  description:
    "Tunify is a modern music player for streaming, organizing, and enjoying your music library, built for speed and a distraction-free listening experience.",
  openGraph: {
    title: "Tunify — Your Music. Your Way.",
    description: "A modern music player built for speed, focus, and your own library.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
