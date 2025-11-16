/**
 * FILE: app/map/[id]/page.tsx
 * URL: /map/[id] (ví dụ: /map/123)
 * CHỨC NĂNG: Trang chi tiết cho một điểm ngập cụ thể.
 * Đây là Server Component, chỉ tải dữ liệu ban đầu
 * và truyền cho <FloodDetailClient />.
 */

import { getFloodData } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import FloodDetailClient from "@/components/FloodDetailClient"; // <-- 1. IMPORT CLIENT COMPONENT

// --- Trang chi tiết (Server Component) ---

export default async function MapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 2. Lấy dữ liệu (chỉ 1 lần khi tải trang)
  const allPoints = await getFloodData();

  // 3. Tìm điểm cụ thể dựa trên ID từ URL
  const point = allPoints.find((p) => p.id === params.id);

  // 4. Nếu không tìm thấy, hiển thị trang 404
  if (!point) {
    notFound();
  }

  // 5. Render giao diện
  // Giao diện tĩnh (Tiêu đề, nút quay lại) được render ở Server
  // Giao diện động (Trạng thái, thông số) được render bởi Client
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 1. Nút quay lại và Tiêu đề (Render ở Server) */}
      <div className="mb-6">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Quay lại bản đồ
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {point.name}
        </h1>
      </div>

      {/* 2. Phần nội dung động (Render ở Client) */}
      {/* Truyền dữ liệu ban đầu cho Client Component */}
      <FloodDetailClient initialPoint={point} />
    </div>
  );
}