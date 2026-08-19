import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Hero - Idle Party RPG",
  description: "2D Pixel Idle Party RPG on World App MiniKit",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0E14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#07090E] text-slate-100 min-h-screen">
        <div id="app-root" className="min-h-screen flex flex-col">
          {children}
        </div>
        <div id="dialog-root" />
      </body>
    </html>
  );
}
