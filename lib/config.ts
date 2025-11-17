// Đọc biến môi trường từ file .env.local
// Nếu không tìm thấy, sử dụng giá trị dự phòng (fallback)

// Dùng cho logic gọi API (cần URL đầy đủ)
export const API_DOMAIN =
  process.env.NEXT_PUBLIC_API_DOMAIN || "https://flood.phoenixtech.vn";

// Dùng cho cấu hình ảnh của Next.js (chỉ cần hostname)
export const API_HOSTNAME =
  process.env.NEXT_PUBLIC_API_HOSTNAME || "flood.phoenixtech.vn";

// URL API đầy đủ
export const API_URL = `${API_DOMAIN}/apis/getListCameraAPI`;

// Dán Mapbox Access Token của bạn vào đây
// Tốt nhất là đặt nó trong file .env.local (NEXT_PUBLIC_MAPBOX_TOKEN)
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';