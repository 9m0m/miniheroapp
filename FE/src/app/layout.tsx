import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Hero - Idle Party RPG",
  description: "Trò chơi nhập vai nhàn rỗi 2D Pixel trên World App",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0E14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-game-dark text-slate-100 flex justify-center min-h-screen">
        <div className="w-full max-w-md bg-game-dark border-x border-game-border flex flex-col min-h-screen relative shadow-2xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
