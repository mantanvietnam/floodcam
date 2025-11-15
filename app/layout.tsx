import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

// Import CSS của Leaflet
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FloodCam - Cảnh báo ngập lụt",
  description: "Theo dõi các điểm ngập lụt theo thời gian thực",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="w-full bg-gray-100 p-4 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} FloodCam Project.
          </footer>
        </div>
      </body>
    </html>
  );
}