'use client';

import { useState, useMemo } from 'react';
import { LatLng } from 'leaflet';
import { FloodPoint } from '@/lib/types';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/config';
// import MapboxDirections from '@mapbox/mapbox-sdk/services/directions'; // <-- KHÔNG DÙNG SDK NỮA
import { Geometry } from 'geojson';
import { MapPin, ArrowRight, Loader2, Bike, Car } from 'lucide-react';

// Định nghĩa props
interface DirectionsControlProps {
  startPoint: LatLng | null;
  endPoint: LatLng | null;
  allFloodPoints: FloodPoint[]; // Vẫn giữ lại, có thể dùng sau
  onRouteFound: (route: Geometry) => void;
  onRouteError: (message: string) => void;
  onSetSelectionMode: (mode: 'start' | 'end') => void;
}

export default function DirectionsControl({
  startPoint,
  endPoint,
  allFloodPoints, // Vẫn nhận, nhưng tạm thời không dùng
  onRouteFound,
  onRouteError,
  onSetSelectionMode,
}: DirectionsControlProps) {
  const [vehicleType, setVehicleType] = useState<'motobike' | 'car'>('motobike');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý tìm đường
  const handleFindRoute = async () => {
    if (!startPoint || !endPoint) {
      onRouteError('Vui lòng chọn điểm đi và điểm đến trên bản đồ.');
      return;
    }
    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
      onRouteError('Thiếu Mapbox Token. Vui lòng kiểm tra file config.');
      return;
    }

    setIsLoading(true);
    onRouteError(''); // Xóa lỗi cũ

    try {
      // --- LOGIC TÌM ĐƯỜNG TRỰC TIẾP (ĐÃ XÓA BỎ 'exclude') ---

      // 1. Xây dựng URL cho Mapbox Directions API
      const profile = 'driving'; // 'driving', 'walking', 'cycling'
      const startCoords = `${startPoint.lng},${startPoint.lat}`;
      const endCoords = `${endPoint.lng},${endPoint.lat}`;
      
      const apiUrl = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords};${endCoords}`);
      apiUrl.searchParams.append('geometries', 'geojson');
      apiUrl.searchParams.append('access_token', MAPBOX_ACCESS_TOKEN);

      // --- Toàn bộ logic lọc điểm ngập và 'exclude' đã được XÓA ---
      // const impassablePoints = ...
      // const excludeString = ...
      // if (excludeString !== '') { ... }
      // -----------------------------------------------------------

      // 2. Gọi API bằng fetch
      const response = await fetch(apiUrl.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi từ Mapbox API');
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('Không tìm thấy đường đi.');
      }

      // 3. Trả về tuyến đường (geometry)
      const routeGeometry = data.routes[0].geometry;
      onRouteFound(routeGeometry);

    } catch (error: any) {
      console.error('Lỗi tìm đường:', error);
      onRouteError(error.message || 'Lỗi không xác định khi tìm đường.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-lg space-y-3 w-64">
      {/* Tiêu đề đã đổi, không còn "an toàn" */}
      <h3 className="text-lg font-semibold text-center">Tìm đường đi</h3>

      {/* Chọn phương tiện (Tạm thời vô hiệu hóa vì chưa dùng) */}
      <div className="grid grid-cols-2 gap-2 opacity-50">
        <button
          disabled
          onClick={() => setVehicleType('motobike')}
          className={`flex items-center justify-center gap-2 p-2 rounded-md transition ${
            vehicleType === 'motobike'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100'
          }`}
        >
          <Bike size={18} /> Xe máy
        </button>
        <button
          disabled
          onClick={() => setVehicleType('car')}
          className={`flex items-center justify-center gap-2 p-2 rounded-md transition ${
            vehicleType === 'car'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100'
          }`}
        >
          <Car size={18} /> Ô tô
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">
        (Tính năng tránh điểm ngập đang được phát triển)
      </p>

      {/* Chọn điểm */}
      <div className="space-y-2">
        <button
          onClick={() => onSetSelectionMode('start')}
          className="w-full p-2 bg-gray-100 rounded-md text-left text-sm text-gray-700 hover:bg-gray-200"
        >
          <span className="font-semibold text-green-700">Điểm đi:</span>{' '}
          {startPoint ? `Đã chọn` : 'Bấm vào bản đồ...'}
        </button>
        <button
          onClick={() => onSetSelectionMode('end')}
          className="w-full p-2 bg-gray-100 rounded-md text-left text-sm text-gray-700 hover:bg-gray-200"
        >
          <span className="font-semibold text-red-700">Điểm đến:</span>{' '}
          {endPoint ? `Đã chọn` : 'Bấm vào bản đồ...'}
        </button>
      </div>

      {/* Nút tìm đường */}
      <button
        onClick={handleFindRoute}
        disabled={isLoading || !startPoint || !endPoint}
        className="w-full p-3 bg-blue-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-300"
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <ArrowRight size={20} />
        )}
        Tìm đường
      </button>
    </div>
  );
}