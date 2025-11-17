import { FloodPoint } from "./types";
import { API_URL, API_DOMAIN } from "./config";

// Định nghĩa cấu trúc dữ liệu thô trả về từ API
// (Chúng ta chỉ định nghĩa những trường cần dùng)
interface ApiCameraData {
  id: number;
  name: string;
  lat_gps: string; // API trả về string
  long_gps: string; // API trả về string
  status_flood: 0 | 1;
  update_at: number; // API trả về timestamp (giây)
  image: string | null;
  depth: number | null;
  speed_max: number | null;
  width: number | null;
  acreage: number | null;
  link_live_stream: string | null;
}

interface ApiResponse {
  data: ApiCameraData[];
  code: number;
  mess: string;
}

// Hàm xử lý ảnh:
function transformImageUrl(
  image: string | null,
  status: 0 | 1,
  name: string
): string {
  if (image) {
    if (image.startsWith("/")) {
      return `${API_DOMAIN}${image}`;
    }
    return image;
  }
  const statusColor = status === 1 ? "F87171" : "4ADE80";
  return `https://placehold.co/600x400/${statusColor}/FFFFFF?text=${encodeURIComponent(
    name
  )}`;
}

// --- HÀM HELPER (ĐÃ XÓA) ---
// function calculateRadius(area_m2: number): number { ... }
// ----------------------------

// Gọi API thực tế
export async function getFloodData(): Promise<FloodPoint[]> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({}), // Nếu BE cần gửi body
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Lỗi khi gọi API:", response.statusText);
      return [];
    }

    const apiResponse: ApiResponse = await response.json();

    if (apiResponse.code !== 1 || !apiResponse.data) {
      console.error("API trả về lỗi:", apiResponse.mess);
      return [];
    }

    // -- Đây là bước quan trọng: Biến đổi (Map) dữ liệu API --
    const transformedData: FloodPoint[] = apiResponse.data.map((item) => {
      // --- LOGIC TÍNH BÁN KÍNH (ĐÃ XÓA) ---
      // const radius_m = ...
      // ---------------------------------

      return {
        id: String(item.id),
        lat_gps: parseFloat(item.lat_gps),
        long_gps: parseFloat(item.long_gps),
        update_at: item.update_at * 1000,
        image_url: transformImageUrl(item.image, item.status_flood, item.name),
        depth_cm: item.depth ?? undefined,
        max_speed_kmh: item.speed_max ?? undefined,
        width_cm: item.width ?? undefined,
        affected_area_m2: item.acreage ?? undefined, // <-- VẪN GIỮ LẠI ĐỂ HIỂN THỊ
        link_live_stream: item.link_live_stream ?? undefined,

        // radius_m: radius_m, // <-- ĐÃ XÓA
        
        name: item.name,
        status_flood: item.status_flood,
      };
    });

    return transformedData;
  } catch (error) {
    console.error("Lỗi nghiêm trọng khi fetch dữ liệu:", error);
    return [];
  }
}