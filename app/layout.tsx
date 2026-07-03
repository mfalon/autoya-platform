import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoYa — Concesionaria Multimarca Argentina",
  description:
    "Tu próximo auto te espera. Toyota, Volkswagen, Chevrolet, Ford, Fiat, Renault y más. Nuevos y usados con financiación en pesos. Gran Buenos Aires.",
  keywords: ["concesionaria", "autos", "argentina", "toyota", "volkswagen", "chevrolet", "ford", "financiación"],
  authors: [{ name: "AutoYa" }],
  openGraph: {
    title: "AutoYa — Concesionaria Multimarca Argentina",
    description: "Tu próximo auto te espera. Las marcas más vendidas de Argentina en un solo lugar.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className="dark">
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} font-geist antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
