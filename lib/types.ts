// Định nghĩa cấu trúc dữ liệu cho một điểm ngập
export interface FloodPoint {
  id: string;
  name: string;
  lat_gps: number;
  long_gps: number;
  /**
   * 1 = Đang ngập
   * 0 = Không ngập
   */
  status_flood: 0 | 1;
  update_at: number; // Timestamp

  // --- Thông tin chi tiết (optional) ---
  image_url?: string; // Ảnh minh họa
  max_speed_kmh?: number; // Vận tốc di chuyển tối đa
  affected_area_m2?: number; // Diện tích ngập
  width_m?: number; // Bề rộng
  depth_cm?: number; // Độ sâu (cm)
  link_live_stream?: string; // <-- THÊM TRƯỜNG MỚI
}