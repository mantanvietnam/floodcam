'use client'; // Cần 'use client' vì dùng next/link

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/map", label: "Bản đồ điểm ngập" },
    { href: "/contact", label: "Liên hệ" },
  ];

  return (
    <header className="w-full bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Camera size={28} />
          <span>FloodCam</span>
        </Link>
        <ul className="flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`pb-1 ${
                  pathname === item.href
                    ? "font-semibold border-b-2 border-white"
                    : "text-blue-100 hover:text-white"
                } transition-colors`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}