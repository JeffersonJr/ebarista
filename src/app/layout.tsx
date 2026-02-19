import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e.barista - Seu Laboratório de Café",
  description: "Aplicação profissional para preparo de café com métodos especiais. V60, Chemex, Prensa Francesa e mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
