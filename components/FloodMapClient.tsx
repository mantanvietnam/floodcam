'use client';

import { useState, useMemo, useEffect } from 'react';
import { FloodPoint } from '@/lib/types';
import { List, Map as MapIcon } from 'lucide-react';
import { LatLng, Icon, LatLngExpression } from 'leaflet'; // Import Icon
import { getFloodData } from '@/lib/api';
import { Geometry } from 'geojson';
import Link from 'next/link'; // Import Link

// --- IMPORT TĨNH (STATIC) TẤT CẢ CÁC COMPONENT CỦA LEAFLET ---
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
} from 'react-leaflet';

// --- IMPORT CSS CỦA LEAFLET SẼ ĐƯỢC DI CHUYỂN VÀO TRONG ---
// import 'leaflet/dist/leaflet.css'; // <-- DÒNG NÀY GÂY LỖI SSR

// --- IMPORT COMPONENT CHỈ ĐƯỜNG ---
import DirectionsControl from './DirectionsControl';

// --- Component MapEvents (để lắng nghe click) ---
// (Phải là component con để dùng hook useMapEvents)
function MapEvents({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// --- ĐỊNH NGHĨA PROPS ---
interface FloodMapClientProps {
  points: FloodPoint[]; // Dữ liệu ban đầu
}

// --- COMPONENT CHÍNH ---
export default function FloodMapClient({
  points: initialPoints,
}: FloodMapClientProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [points, setPoints] = useState(initialPoints);

  // --- STATE MỚI CHO CHỨC NĂNG CHỈ ĐƯỜNG ---
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(
    null
  );
  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<Geometry | null>(null);
  const [routeError, setRouteError] = useState<string>('');

  // --- Logic auto-refresh ---
  useEffect(() => {
    const refreshData = async () => {
      try {
        const newPoints = await getFloodData();
        setPoints(newPoints);
      } catch (error) {
        console.error('Lỗi khi làm mới dữ liệu:', error);
      }
    };
    const intervalId = setInterval(refreshData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // --- SỬA LỖI SSR: Import CSS của Leaflet ở đây ---
  useEffect(() => {
    // Import CSS động ở phía client
    import('leaflet/dist/leaflet.css');
  }, []); // Chỉ chạy 1 lần
  // ---------------------------------------------

  // --- LOGIC TẠO ICON ---
  const { floodIcon, normalIcon, directionIcon } = useMemo(() => {
    const floodIcon = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      iconRetinaUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    const normalIcon = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      iconRetinaUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // --- SỬA LỖI MÀU ICON: Thêm icon màu tím ---
    const directionIcon = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
      iconRetinaUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    // ------------------------------------------
    
    return { floodIcon, normalIcon, directionIcon }; // Trả về cả 3 icon
  }, []);

  // --- HÀM MỚI (Callbacks) ---
  const handleMapClick = (latlng: LatLng) => {
    if (selectionMode === 'start') {
      setStartPoint(latlng);
      setSelectionMode(null); // Tắt chế độ chọn
      setRoute(null); // Xóa tuyến đường cũ
    } else if (selectionMode === 'end') {
      setEndPoint(latlng);
      setSelectionMode(null); // Tắt chế độ chọn
      setRoute(null); // Xóa tuyến đường cũ
    }
  };

  const handleRouteFound = (routeGeometry: Geometry) => {
    setRoute(routeGeometry);
    setRouteError('');
  };

  const handleRouteError = (message: string) => {
    setRouteError(message);
    setRoute(null); // Xóa tuyến đường nếu có lỗi
  };

  // (Các hàm helper cũ)
  const centerPosition: LatLngExpression =
    points.length > 0
      ? [points[0].lat_gps, points[0].long_gps]
      : [10.7769, 106.7009]; // Tọa độ dự phòng
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };
  const getStatusText = (status: 0 | 1) => {
    return status === 1 ? 'Đang ngập' : 'Không ngập';
  };
  // --------------------

  return (
    <div className="flex-grow flex flex-col">
      {/* Nút chuyển đổi View */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <List size={20} />
          Danh sách
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            viewMode === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <MapIcon size={20} />
          Bản đồ
        </button>
      </div>

      {/* Vùng hiển thị nội dung */}
      <div className="flex-grow rounded-lg overflow-hidden shadow-md border border-gray-200">
        {viewMode === 'list' && (
          <div className="divide-y divide-y-gray-200 h-full overflow-y-auto">
            {points.map((point) => (
              <div
                key={point.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {point.name}
                  </h3>
                  <p
                    className={`text-sm font-medium ${
                      point.status_flood === 1
                        ? 'text-red-600'
                        : 'text-green-600'
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

        {viewMode === 'map' && (
          // Dùng relative-parent để định vị các control
          <div className="h-full w-full relative">
            <MapContainer
              center={centerPosition}
              zoom={13}
              className="h-full w-full"
            >
              {/* Lớp bản đồ nền CartoDB */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {/* Component lắng nghe click */}
              <MapEvents onMapClick={handleMapClick} />

              {/* Marker các điểm ngập */}
              {points.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.lat_gps, point.long_gps]}
                  icon={point.status_flood === 1 ? floodIcon : normalIcon}
                >
                  <Popup>
                    <div className="space-y-1">
                      <h4 className="font-bold">{point.name}</h4>
                      <p
                        className={
                          point.status_flood === 1
                            ? 'text-red-600'
                            : 'text-green-600'
                        }
                      >
                        {getStatusText(point.status_flood)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Cập nhật: {formatTimestamp(point.update_at)}
                      </p>
                      {/* Dùng Link của Next.js (giờ đã an toàn) */}
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

              {/* --- SỬA LỖI MÀU ICON: Dùng icon TÍM --- */}
              {/* Marker cho Điểm đi (Start) */}
              {startPoint && (
                <Marker position={startPoint} icon={directionIcon}>
                  <Popup>Điểm bắt đầu</Popup>
                </Marker>
              )}

              {/* Marker cho Điểm đến (End) */}
              {endPoint && (
                <Marker position={endPoint} icon={directionIcon}>
                  <Popup>Điểm đến</Popup>
                </Marker>
              )}
              {/* -------------------------------------- */}

              {/* Vẽ tuyến đường (Route) nếu có */}
              {route && (
                <GeoJSON
                  data={route}
                  style={{ color: '#007bff', weight: 5, opacity: 0.7 }}
                />
              )}
            </MapContainer>

            {/* Control chỉ đường */}
            <div className="absolute top-3 right-3 z-[1000]">
              <DirectionsControl
                startPoint={startPoint}
                endPoint={endPoint}
                allFloodPoints={points}
                onRouteFound={handleRouteFound}
                onRouteError={handleRouteError}
                onSetSelectionMode={setSelectionMode}
              />
            </div>

            {/* Control báo lỗi */}
            {routeError && (
              <div className="absolute bottom-3 left-3 z-[1000] max-w-xs">
                <div className="bg-red-600 text-white p-3 rounded-md shadow-lg">
                  {routeError}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}