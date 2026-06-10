import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospect-On 3.0 | Otto Pinturas",
  description: "OTTO Pinturas de Grande Porte — Especialistas em Pintura Predial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-['Outfit'] min-h-screen bg-otto-blue">
        {children}
      </body>
    </html>
  );
}
