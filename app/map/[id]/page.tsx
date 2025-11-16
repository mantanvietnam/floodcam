/**
 * FILE: app/map/[id]/page.tsx
 * URL: /map/[id] (ví dụ: /map/123)
 * CHỨC NĂNG: Trang chi tiết cho một điểm ngập cụ thể.
 * Đây là Server Component, lấy dữ liệu và tìm điểm
 * ngập tương ứng với `params.id`.
 */

import { getFloodData } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Waves,
  Ruler,
  Maximize,
  Wind,
  Video,
} from "lucide-react";
import { notFound } from "next/navigation";
import InteractiveImage from "@/components/InteractiveImage";
import RtspPlayer from "@/components/RtspPlayer"; // <-- 1. IMPORT COMPONENT RTSP MỚI

// --- Hàm Helper ---

// Hàm helper để định dạng thời gian
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

// Hàm helper lấy text trạng thái
function StatusBadge({ status }: { status: 0 | 1 }) {
  if (status === 1) {
    return (
      <span className="inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">
        Đang ngập
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
      Không ngập
    </span>
  );
}

// Component hiển thị một thông số chi tiết
function DetailItem({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
  unit?: string;
}) {
  if (!value) return null; // Không hiển thị nếu không có giá trị

  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600 mr-4" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">
          {value} {unit}
        </p>
      </div>
    </div>
  );
}

// --- Trang chi tiết (Server Component) ---

export default async function MapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Lấy dữ liệu
  const allPoints = await getFloodData();

  // Tìm điểm cụ thể dựa trên ID từ URL
  const point = allPoints.find((p) => p.id === params.id);

  // Nếu không tìm thấy, hiển thị trang 404
  if (!point) {
    notFound();
  }

  // --- 2. TÁCH LOGIC RENDER LIVESTREAM RA ---
  const renderLiveStream = () => {
    if (!point.link_live_stream) {
      // TRƯỜNG HỢP 1: Không có link stream -> Hiển thị ảnh
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Hình ảnh camera</h2>
          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden border">
            <InteractiveImage
              src={point.image_url}
              alt={`Hình ảnh ${point.name}`}
              fallbackText={point.name}
            />
          </div>
        </div>
      );
    }

    if (point.link_live_stream.startsWith("rtsp://")) {
      // TRƯỜNG HỢP 2: Link là RTSP -> Dùng component RtspPlayer
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Video size={22} /> Live Stream (RTSP)
          </h2>
          <RtspPlayer rtspLink={point.link_live_stream} />
        </div>
      );
    }

    // TRƯỜNG HỢP 3: Link web (YouTube, HLS, v.v.) -> Dùng iframe
    return (
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Video size={22} /> Live Stream
        </h2>
        <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden border">
          <iframe
            width="100%"
            height="100%"
            src={point.link_live_stream}
            title={`Live stream cho ${point.name}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  };
  // --- KẾT THÚC LOGIC RENDER ---

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 1. Nút quay lại và Tiêu đề */}
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
        <div className="flex items-center gap-4 mt-3 text-gray-500">
          <StatusBadge status={point.status_flood} />
          <span className="flex items-center gap-1">
            <MapPin size={16} /> {point.lat_gps.toFixed(5)},{" "}
            {point.long_gps.toFixed(5)}
          </span>
        </div>
      </div>

      {/* 2. Cột nội dung chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Livestream hoặc Ảnh */}
        <div className="space-y-4">
          {renderLiveStream()} {/* <-- 3. GỌI HÀM RENDER TẠI ĐÂY */}
        </div>

        {/* Cột phải: Thông số chi tiết */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-3">Thông số chi tiết</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem
              icon={Clock}
              label="Cập nhật lần cuối"
              value={formatTimestamp(point.update_at)}
            />
            <DetailItem
              icon={Waves}
              label="Độ sâu ngập"
              value={point.depth_cm}
              unit="cm"
            />
            <DetailItem
              icon={Ruler}
              label="Bề rộng"
              value={point.width_m}
              unit="m"
            />
            <DetailItem
              icon={Maximize}
              label="Diện tích ảnh hưởng"
              value={point.affected_area_m2}
              unit="m²"
            />
            <DetailItem
              icon={Wind}
              label="Tốc độ di chuyển tối đa"
              value={point.max_speed_kmh}
              unit="km/h"
            />
          </div>
        </div>
      </div>
    </div>
  );
}