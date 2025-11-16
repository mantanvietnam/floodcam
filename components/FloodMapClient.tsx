'use client'; // Đây là Client Component vì cần useState và tương tác người dùng

import { useState, useMemo, useEffect } from "react"; // <-- IMPORT useEffect
import { FloodPoint } from "@/lib/types";
import { List, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Icon } from "leaflet"; // <-- Giữ lại import này
import Link from "next/link";
import { getFloodData } from "@/lib/api"; // <-- IMPORT HÀM GỌI API

// Định nghĩa props
interface FloodMapClientProps {
  points: FloodPoint[]; // Prop này là dữ liệu ban đầu do Server tải
}

// --- Cấu hình cho bản đồ ---

// Leaflet cần được import động (dynamic import) để tránh lỗi SSR (vì nó cần đối tượng 'window')
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// --- Component chính ---

export default function FloodMapClient({ points: initialPoints }: FloodMapClientProps) { // <-- Đổi tên prop nhận vào
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [points, setPoints] = useState(initialPoints); // <-- TẠO STATE MỚI, dùng data ban đầu

  // --- THÊM useEffect ĐỂ TỰ ĐỘNG CẬP NHẬT ---
  useEffect(() => {
    // Hàm gọi API và cập nhật state
    const refreshData = async () => {
      try {
        console.log("Đang làm mới dữ liệu bản đồ...");
        const newPoints = await getFloodData();
        setPoints(newPoints); // Cập nhật state với dữ liệu mới
      } catch (error) {
        console.error("Lỗi khi làm mới dữ liệu:", error);
      }
    };

    // Đặt lịch gọi API mỗi 10 giây
    const intervalId = setInterval(refreshData, 10000); // 10000ms = 10s

    // Hàm dọn dẹp (cleanup)
    // Sẽ được gọi khi component bị unmount (rời khỏi trang)
    return () => {
      clearInterval(intervalId); // Hủy bỏ interval
    };
  }, []); // Mảng rỗng `[]` đảm bảo effect này chỉ chạy 1 lần khi component mount
  // ------------------------------------------------

  // --- DI CHUYỂN ICON VÀO ĐÂY VỚI useMemo (Sửa lỗi build) ---
  const { floodIcon, normalIcon } = useMemo(() => {
    // Icon cho điểm ngập (Màu đỏ)
    const floodIcon = new Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconRetinaUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Icon cho điểm không ngập (Màu xanh lá)
    const normalIcon = new Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      iconRetinaUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    return { floodIcon, normalIcon };
  }, []); // Mảng rỗng đảm bảo nó chỉ chạy 1 lần khi component mount
  // ---------------------------------------------

  // Lấy vị trí trung tâm (ví dụ: điểm đầu tiên)
  // Code này giờ sẽ tự động dùng `points` TỪ STATE
  const centerPosition: [number, number] =
    points.length > 0
      ? [points[0].lat_gps, points[0].long_gps]
      : [10.7769, 106.7009]; // Vị trí dự phòng (TP.HCM)

  // Hàm helper để định dạng thời gian
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Hàm helper lấy text trạng thái
  const getStatusText = (status: 0 | 1) => {
    return status === 1 ? "Đang ngập" : "Không ngập";
  };

  return (
    // Toàn bộ phần JSX này đã dùng `points` (là state)
    // nên sẽ tự động re-render khi `setPoints` được gọi.
    <div className="flex-grow flex flex-col">
      {/* Nút chuyển đổi View */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <List size={20} />
          Danh sách
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            viewMode === "map"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <MapIcon size={20} />
          Bản đồ
        </button>
      </div>

      {/* Vùng hiển thị nội dung (List hoặc Map) */}
      <div className="flex-grow rounded-lg overflow-hidden shadow-md border border-gray-200">
        {viewMode === "list" && (
          <div className="divide-y divide-gray-200 h-full overflow-y-auto">
            {points.map((point) => (
              <div key={point.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{point.name}</h3>
                  <p
                    className={`text-sm font-medium ${
                      point.status_flood === 1 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {getStatusText(point.status_flood)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Cập nhật lúc:</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {formatTimestamp(point.update_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "map" && (
          <MapContainer center={centerPosition} zoom={13} className="h-full w-full">
            {/* --- THAY ĐỔI BẢN ĐỒ NỀN (TRÁNH ĐƯỜNG LƯỠI BÒ) --- */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {/* ---------------------------------------------------- */}
            
            {points.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat_gps, point.long_gps]}
                icon={point.status_flood === 1 ? floodIcon : normalIcon} // Code này giờ đã an toàn
              >
                <Popup>
                  <div className="space-y-1">
                    <h4 className="font-bold">{point.name}</h4>
                    <p className={point.status_flood === 1 ? "text-red-600" : "text-green-600"}>
                      {getStatusText(point.status_flood)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Cập nhật: {formatTimestamp(point.update_at)}
                    </p>

                    <Link
                      href={`/map/${point.id}`}
                      className="mt-2 inline-block w-full text-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}