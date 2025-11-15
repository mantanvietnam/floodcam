import Link from 'next/link';
import { Map, Clock, Camera, ShieldAlert, ArrowRight } from 'lucide-react';

/**
 * Đây là Trang chủ (Homepage) của dự án.
 * File này nằm ở `app/page.tsx`
 * Nó là một Server Component, tập trung vào việc giới thiệu dự án và điều hướng
 * người dùng đến trang bản đồ chính (`/map`).
 */
export default function HomePage() {
  return (
    <div className="bg-white text-gray-800">
      {/* --- 1. Hero Section --- */}
      {/* Phần mở đầu ấn tượng, nêu rõ giá trị cốt lõi */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 sm:py-28 lg:py-36">
          <ShieldAlert
            size={64}
            className="mx-auto text-blue-600"
            aria-hidden="true"
          />
          <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            Cảnh báo ngập lụt thời gian thực
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Đừng để ngập lụt cản đường bạn. Kiểm tra tình hình giao thông và các
            điểm ngập trước khi ra đường.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Xem bản đồ ngay <ArrowRight size={20} />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 text-lg font-semibold rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>

        {/* --- 2. Features Section --- */}
        {/* Giải thích các tính năng chính của dự án */}
        <section id="features" className="py-20 bg-gray-50 rounded-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Giải pháp của chúng tôi
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1: Dữ liệu thời gian thực */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                  <Clock size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-900">
                  Dữ liệu thời gian thực
                </h3>
                <p className="text-gray-600">
                  Thông tin được cập nhật liên tục từ hệ thống camera và cảm biến
                  thông minh, cho bạn cái nhìn mới nhất về tình hình.
                </p>
              </div>

              {/* Feature 2: Bản đồ trực quan */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                  <Map size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-900">
                  Bản đồ trực quan
                </h3>
                <p className="text-gray-600">
                  Xem nhanh các điểm đang ngập (icon đỏ) và các điểm không ngập
                  (icon xanh) trên một bản đồ đơn giản, dễ hiểu.
                </p>
              </div>

              {/* Feature 3: Chi tiết & Hình ảnh */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                  <Camera size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-900">
                  Chi tiết & Hình ảnh
                </h3>
                <p className="text-gray-600">
                  Bấm vào điểm ngập để xem chi tiết độ sâu (nếu có) và hình ảnh
                  thực tế từ camera, giúp bạn ra quyết định chính xác.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. Final Call-to-Action (CTA) Section --- */}
        {/* Kêu gọi hành động lần cuối */}
        <section className="py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sẵn sàng di chuyển an toàn?
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            Đừng phó mặc lộ trình của bạn cho may rủi. Hãy là người chủ động
            trước mọi cơn mưa.
          </p>
          <Link
            href="/map"
            className="mt-10 inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đến Bản đồ Cảnh báo Ngập <ArrowRight size={20} />
          </Link>
        </section>
      </main>
    </div>
  );
}