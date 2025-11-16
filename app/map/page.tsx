/**
 * FILE: app/map/page.tsx
 * URL: /map
 * CHỨC NĂNG: Trang hiển thị bản đồ và danh sách các điểm ngập.
 * Đây là Server Component, gọi API và truyền dữ liệu
 * xuống <FloodMapClient />.
 */

import { getFloodData } from "@/lib/api"; // <-- Import logic gọi API đã được tách ra
import FloodMapClient from "@/components/FloodMapClient";

// --- SỬA LỖI BUILD 1 ---
// Chỉ thị cho Next.js rằng trang này luôn là động (SSR)
// để tương thích với `cache: "no-store"` trong hàm fetch
export const dynamic = 'force-dynamic';
// -------------------------

// Đây là Server Component, chịu trách nhiệm lấy dữ liệu
export default async function MapPage() {
  // Page component giờ rất gọn gàng: chỉ gọi hàm và truyền dữ liệu
  const floodPoints = await getFloodData();

  // Log này sẽ xuất hiện trong terminal (server), không phải console trình duyệt
  console.log("Đã lấy dữ liệu từ Server:", floodPoints.length, "điểm");

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <h1 className="text-3xl font-bold mb-6">Bản đồ điểm ngập</h1>
      {/* Client Component không cần thay đổi */}
      <FloodMapClient points={floodPoints} />
    </div>
  );
}