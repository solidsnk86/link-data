import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "./context/LocationContext";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Link Data — transmite y comparte",
  description:
    "Transmite tu cámara en vivo o comparte un archivo con un link. Sin cuentas, sin datos extras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-40" />
        <div className="fixed inset-0 grid grid-cols-6 gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`item-${i + 1}`}
              className="bg-hero"
              style={{ background: `hsl(${280 + (i / 18) * 120}, 100%, 55%)` }}
            ></div>
          ))}
        </div>
        <LocationProvider>
            {children}
        </LocationProvider>
      </body>
    </html>
  );
}
