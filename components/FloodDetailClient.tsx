'use client'; // <-- Đánh dấu đây là Client Component

import { useState, useEffect } from 'react';
import { FloodPoint } from '@/lib/types';
import { getFloodData } from '@/lib/api';
import {
  MapPin,
  Clock,
  Waves,
  Ruler,
  Maximize,
  Wind,
  Video,
} from 'lucide-react';

// Import các component con
import InteractiveImage from '@/components/InteractiveImage';
import HlsPlayer from '@/components/HlsPlayer';

// --- Định nghĩa props ---
interface FloodDetailClientProps {
  initialPoint: FloodPoint; // Dữ liệu ban đầu từ Server
}

// --- Các hàm helper (di chuyển từ server component sang) ---

// Hàm helper để định dạng thời gian
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('vi-VN', {
    dateStyle: 'long',
    timeStyle: 'short',
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

// --- Component Client chính ---

export default function FloodDetailClient({ initialPoint }: FloodDetailClientProps) {
  // Dùng state để lưu trữ thông tin, với giá trị ban đầu từ server
  const [point, setPoint] = useState(initialPoint);

  // --- LOGIC TỰ ĐỘNG CẬP NHẬT ---
  useEffect(() => {
    // Hàm gọi API và cập nhật state
    const refreshDetail = async () => {
      try {
        console.log(`Đang làm mới dữ liệu cho điểm: ${point.id}`);
        const allPoints = await getFloodData();
        const newPoint = allPoints.find((p) => p.id === point.id);

        if (newPoint) {
          setPoint(newPoint); // Cập nhật state với dữ liệu mới
        }
      } catch (error) {
        console.error('Lỗi khi làm mới chi tiết:', error);
      }
    };

    // Đặt lịch gọi API mỗi 10 giây
    const intervalId = setInterval(refreshDetail, 10000); // 10000ms = 10s

    // Hàm dọn dẹp (cleanup)
    return () => {
      clearInterval(intervalId); // Hủy bỏ interval
    };
  }, [point.id]); // Phụ thuộc vào point.id
  // ---------------------------------

  // --- Logic render (giữ nguyên) ---
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

    if (point.link_live_stream.endsWith('.m3u8')) {
      // TRƯỜN HỢP 2: Link là HLS (.m3u8) -> Dùng HlsPlayer
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Video size={22} /> Live Stream
          </h2>
          <HlsPlayer src={point.link_live_stream} />
        </div>
      );
    }

    // TRƯỜNG HỢP 3: Link web khác (YouTube, v.v.) -> Dùng iframe
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

  // Trả về JSX, giao diện này sẽ tự động cập nhật khi state `point` thay đổi
  return (
    <>
      <div className="flex items-center gap-4 mt-3 text-gray-500">
        <StatusBadge status={point.status_flood} />
        <span className="flex items-center gap-1">
          <MapPin size={16} /> {point.lat_gps.toFixed(5)},{' '}
          {point.long_gps.toFixed(5)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Cột trái: Livestream hoặc Ảnh */}
        <div className="space-y-4">
          {renderLiveStream()}
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
    </>
  );
}