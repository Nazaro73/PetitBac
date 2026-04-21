import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950">
          {children}
        </div>
      </body>
    </html>
  );
}
