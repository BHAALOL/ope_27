import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Présidentielle 2027 | Suivez la campagne",
    template: "%s | Présidentielle 2027",
  },
  description:
    "Plateforme de suivi de la campagne présidentielle française 2027. Candidats, sondages, actualités, programme.",
  keywords: [
    "présidentielle 2027",
    "élection france",
    "candidats",
    "sondages",
    "campagne",
  ],
  authors: [{ name: "Présidentielle 2027" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://presidentielle2027.fr",
    title: "Présidentielle 2027",
    description: "Suivez la campagne présidentielle française 2027",
    siteName: "Présidentielle 2027",
  },
  twitter: {
    card: "summary_large_image",
    title: "Présidentielle 2027",
    description: "Suivez la campagne présidentielle française 2027",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-900 text-white antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
