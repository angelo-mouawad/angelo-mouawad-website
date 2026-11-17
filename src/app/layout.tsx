import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";

// Archivo belongs to the room's overlay UI. Sora and Inter carry everything beyond it.
const archivo = Archivo({ variable: "--font-sans", subsets: ["latin"], axes: ["wdth"] });
const sora = Sora({ variable: "--font-display", subsets: ["latin"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Angelo Mouawad",
  description: "Step into Angelo Mouawad's room. Notes, Bible and web design work, all one click away.",
  metadataBase: new URL("https://angelomouawad.com"),
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
