'use client';

import { useState } from 'react';
import { LatLng } from 'leaflet';
import { FloodPoint } from '@/lib/types';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/config';
import { Geometry } from 'geojson';
import { ArrowRight, Loader2, Bike, Car, ShieldAlert } from 'lucide-react';

// Định nghĩa props
interface DirectionsControlProps {
  startPoint: LatLng | null;
  endPoint: LatLng | null;
  allFloodPoints: FloodPoint[];
  onRouteFound: (route: Geometry) => void;
  onRouteError: (message: string) => void;
  onSetSelectionMode: (mode: 'start' | 'end') => void;
}

export default function DirectionsControl({
  startPoint,
  endPoint,
  allFloodPoints,
  onRouteFound,
  onRouteError,
  onSetSelectionMode,
}: DirectionsControlProps) {
  const [vehicleType, setVehicleType] = useState<'motobike' | 'car'>('motobike');
  const [isLoading, setIsLoading] = useState(false);
  const [avoidFlood, setAvoidFlood] = useState(true);

  // --- HÀM HELPER MỚI: TẠO VÙNG CHẶN BÁN KÍNH 20M ---
  // 1 độ vĩ độ ~ 111km => 20m ~ 0.00018 độ
  // Chúng ta làm tròn 0.0002 cho an toàn (~22m)
  const createBlockingPoints = (point: FloodPoint): string[] => {
    const OFFSET = 0.0002; 
    const { long_gps: lng, lat_gps: lat } = point;

    // Tạo 5 điểm: Tâm + 4 hướng
    const points = [
      `point(${lng} ${lat})`,                         // Tâm
      `point(${lng + OFFSET} ${lat})`,                // Đông
      `point(${lng - OFFSET} ${lat})`,                // Tây
      `point(${lng} ${lat + OFFSET})`,                // Bắc
      `point(${lng} ${lat - OFFSET})`,                // Nam
      // Có thể thêm 4 điểm chéo nếu đường quá rộng, nhưng 5 điểm thường là đủ
    ];

    return points;
  };

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
    onRouteError('');

    try {
      const profile = 'driving';
      const startCoords = `${startPoint.lng},${startPoint.lat}`;
      const endCoords = `${endPoint.lng},${endPoint.lat}`;
      
      const apiUrl = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords};${endCoords}`);
      apiUrl.searchParams.append('geometries', 'geojson');
      apiUrl.searchParams.append('access_token', MAPBOX_ACCESS_TOKEN);
      apiUrl.searchParams.append('overview', 'full');

      // --- LOGIC MỚI: TRÁNH VÙNG BÁN KÍNH 20M ---
      if (avoidFlood && allFloodPoints.length > 0) {
        const floodedPoints = allFloodPoints.filter(p => p.status_flood === 1);

        if (floodedPoints.length > 0) {
          // Với mỗi điểm ngập, tạo ra 5 điểm chặn (exclude)
          // Dùng flatMap để gộp mảng các mảng thành 1 mảng duy nhất
          const allBlockedPoints = floodedPoints.flatMap(createBlockingPoints);
          
          // Nối thành chuỗi ngăn cách bằng dấu phẩy
          const excludeString = allBlockedPoints.join(',');

          // Gửi vào API
          apiUrl.searchParams.append('exclude', excludeString);
          
          console.log(`Đang tránh ${floodedPoints.length} vùng ngập (${allBlockedPoints.length} điểm chặn).`);
        }
      }
      // ------------------------------------------

      const response = await fetch(apiUrl.toString());
      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'NoRoute') {
          throw new Error('Không tìm thấy đường đi (có thể do các điểm ngập đã chặn hết lối đi).');
        }
        // Xử lý lỗi URL quá dài nếu có quá nhiều điểm ngập
        if (response.status === 414) { 
           throw new Error('Quá nhiều điểm ngập cần tránh, vui lòng thử lại sau.');
        }
        throw new Error(data.message || 'Lỗi từ Mapbox API');
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('Không tìm thấy đường đi.');
      }

      onRouteFound(data.routes[0].geometry);

    } catch (error: any) {
      console.error('Lỗi tìm đường:', error);
      onRouteError(error.message || 'Lỗi không xác định khi tìm đường.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-lg space-y-3 w-72">
      <h3 className="text-lg font-semibold text-center text-gray-800">Tìm đường đi</h3>

      {/* Chọn phương tiện */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setVehicleType('motobike')}
          className={`flex items-center justify-center gap-2 p-2 rounded-md transition border ${
            vehicleType === 'motobike'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          <Bike size={18} /> Xe máy
        </button>
        <button
          onClick={() => setVehicleType('car')}
          className={`flex items-center justify-center gap-2 p-2 rounded-md transition border ${
            vehicleType === 'car'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          <Car size={18} /> Ô tô
        </button>
      </div>

      {/* Checkbox Tránh ngập */}
      <div className="flex items-center gap-2 px-1">
        <input
          id="avoid-flood"
          type="checkbox"
          checked={avoidFlood}
          onChange={(e) => setAvoidFlood(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="avoid-flood" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1">
          <ShieldAlert size={14} className="text-orange-500" />
          Tránh điểm ngập (R=20m)
        </label>
      </div>

      {/* Chọn điểm */}
      <div className="space-y-2">
        <button
          onClick={() => onSetSelectionMode('start')}
          className={`w-full p-2 rounded-md text-left text-sm border transition-colors ${
             startPoint ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span className="font-bold text-green-700 block text-xs uppercase mb-1">Điểm đi</span>
          <span className="text-gray-700 truncate block">
            {startPoint ? `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}` : 'Bấm để chọn trên bản đồ...'}
          </span>
        </button>

        <button
          onClick={() => onSetSelectionMode('end')}
          className={`w-full p-2 rounded-md text-left text-sm border transition-colors ${
             endPoint ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span className="font-bold text-red-700 block text-xs uppercase mb-1">Điểm đến</span>
          <span className="text-gray-700 truncate block">
            {endPoint ? `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}` : 'Bấm để chọn trên bản đồ...'}
          </span>
        </button>
      </div>

      <button
        onClick={handleFindRoute}
        disabled={isLoading || !startPoint || !endPoint}
        className="w-full p-3 bg-blue-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> Đang tìm...
          </>
        ) : (
          <>
            <ArrowRight size={20} /> Tìm đường
          </>
        )}
      </button>
    </div>
  );
}