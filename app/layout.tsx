import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rotex Master Ads",
  description: "Seu roteiro de vídeo, no seu tom, em 30 segundos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // dark: classe padrão (SSR). ThemeProvider corrige no cliente se preciso.
    // suppressHydrationWarning: evita aviso quando o cliente remove a classe.
    <html lang="pt-BR" className={`${geist.variable} h-full dark`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
