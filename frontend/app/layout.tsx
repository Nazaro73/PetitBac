import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Petit Bac — Édition Maître du Jeu",
  description:
    "Petit Bac multijoueur temps réel avec Maître du Jeu. Frontend Vercel, backend Docker local avec tunnel Ngrok.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
