import { getFloodData } from "@/lib/api"; // <-- Import logic gọi API đã được tách ra
import FloodMapClient from "@/components/FloodMapClient";

// Đây là Server Component, chịu trách nhiệm lấy dữ liệu
export default async function MapPage() {
  // Page component giờ rất gọn gàng: chỉ gọi hàm và truyền dữ liệu
  const floodPoints = await getFloodData();

  // --- THÊM DÒNG NÀY ĐỂ KIỂM TRA ---
  // Bạn sẽ thấy kết quả này trong terminal (nơi chạy "npm run dev"),
  // KHÔNG phải trong console của trình duyệt.
  console.log("Đã lấy dữ liệu từ Server:", floodPoints);
  // ------------------------------------

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <h1 className="text-3xl font-bold mb-6">Bản đồ điểm ngập</h1>
      {/* Client Component không cần thay đổi */}
      <FloodMapClient points={floodPoints} />
    </div>
  );
}