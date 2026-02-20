import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "e.barista - Seu laboratório de café",
  description: "App profissional para preparo de café com métodos especiais. V60, Prensa Francesa e mais.",
  authors: [{ name: "Felipe Gavazzi" }],
  themeColor: "#09090b",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  openGraph: {
    title: "e.barista - Seu laboratório de café",
    description: "App profissional para preparo de café com métodos especiais. V60, Prensa Francesa e mais.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
