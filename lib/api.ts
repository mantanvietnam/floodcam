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
  link_live_stream: string | null; // <-- THÊM TRƯỜNG MỚI TỪ API
}

interface ApiResponse {
  data: ApiCameraData[];
  code: number;
  mess: string;
}

// Hàm xử lý ảnh:
// (Logic giữ nguyên, chỉ thay đổi hằng số thành biến config)
function transformImageUrl(
  image: string | null,
  status: 0 | 1,
  name: string
): string {
  if (image) {
    // Nếu ảnh là đường dẫn tương đối (ví dụ: /storage/image.png)
    if (image.startsWith("/")) {
      return `${API_DOMAIN}${image}`; // <-- Sử dụng biến config
    }
    // Nếu đã là URL tuyệt đối
    return image;
  }

  // Nếu không có ảnh (null), tạo placeholder
  const statusColor = status === 1 ? "F87171" : "4ADE80";
  return `https://placehold.co/600x400/${statusColor}/FFFFFF?text=${encodeURIComponent(
    name
  )}`;
}

// Gọi API thực tế
export async function getFloodData(): Promise<FloodPoint[]> {
  try {
    // --- THAY ĐỔI TỪ GET SANG POST ---
    const response = await fetch(API_URL, {
      method: "POST", // <-- Đổi phương thức sang POST
      headers: {
        "Content-Type": "application/json", // <-- Thêm header cho POST request
      },
      // body: JSON.stringify({}), // Nếu BE cần gửi body, hãy thêm vào đây. Tạm thời để trống.
      cache: "no-store", // Giữ nguyên 'no-store' để đảm bảo dữ liệu mới nhất
    });
    // ---------------------------------

    if (!response.ok) {
      console.error("Lỗi khi gọi API:", response.statusText);
      return []; // Trả về mảng rỗng nếu fetch lỗi
    }

    const apiResponse: ApiResponse = await response.json();

    // Kiểm tra mã trả về từ API
    if (apiResponse.code !== 1 || !apiResponse.data) {
      console.error("API trả về lỗi:", apiResponse.mess);
      return [];
    }

    // -- Đây là bước quan trọng: Biến đổi (Map) dữ liệu API --
    // Chuyển đổi cấu trúc API (ApiCameraData) sang cấu trúc nội bộ (FloodPoint)
    const transformedData: FloodPoint[] = apiResponse.data.map((item) => {
      return {
        // Chuyển đổi các trường không khớp
        id: String(item.id), // API (number) -> App (string)
        lat_gps: parseFloat(item.lat_gps), // API (string) -> App (number)
        long_gps: parseFloat(item.long_gps), // API (string) -> App (number)
        update_at: item.update_at * 1000, // API (giây) -> App (milliseconds)
        image_url: transformImageUrl(item.image, item.status_flood, item.name), // API (image) -> App (image_url)
        depth_cm: item.depth ?? undefined, // API (depth) -> App (depth_cm)
        max_speed_kmh: item.speed_max ?? undefined, // API (speed_max) -> App (max_speed_kmh)
        width_cm: item.width ?? undefined, // <-- ĐỔI TÊN TỪ width_m
        affected_area_m2: item.acreage ?? undefined, // API (acreage) -> App (affected_area_m2)
        link_live_stream: item.link_live_stream ?? undefined, // <-- THÊM TRƯỜNG MỚI VÀO LOGIC MAP

        // Các trường đã khớp tên
        name: item.name,
        status_flood: item.status_flood,
      };
    });

    return transformedData;
  } catch (error) {
    console.error("Lỗi nghiêm trọng khi fetch dữ liệu:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}