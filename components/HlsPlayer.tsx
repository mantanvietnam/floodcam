'use client'; // Bắt buộc là Client Component để dùng useEffect, useRef

import { useEffect, useRef } from 'react';
import Head from 'next/head';

// Định nghĩa props
interface HlsPlayerProps {
  src: string; // Link .m3u8
}

/**
 * Component này dùng thư viện hls.js để phát
 * các file stream .m3u8 (HLS) trên trình duyệt.
 */
export default function HlsPlayer({ src }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Dùng ref để lưu trữ instance của Hls
  const hlsInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Biến để kiểm tra xem component có còn mount không
    let isMounted = true;
    let Hls: any = null; // Biến để giữ constructor Hls

    // Hàm để khởi tạo player
    const initPlayer = () => {
      if (Hls && videoRef.current) {
        if (hlsInstanceRef.current) {
          // Hủy instance cũ nếu có
          hlsInstanceRef.current.destroy();
        }

        const hls = new Hls();
        hlsInstanceRef.current = hls; // Lưu instance mới

        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isMounted) {
            videoRef.current?.play().catch((e) => {
              console.warn("Autoplay bị chặn, cần tương tác của người dùng", e);
              // Thêm 'muted' nếu muốn tự động phát mà không có tiếng
              if (videoRef.current) videoRef.current.muted = true;
              videoRef.current?.play();
            });
          }
        });
        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            console.error('Lỗi HLS nghiêm trọng:', data);
          }
        });
      }
    };

    // Hàm để tải script hls.js từ CDN
    const loadScript = () => {
      // Kiểm tra xem Hls đã tồn tại trên window chưa
      if ((window as any).Hls) {
        Hls = (window as any).Hls;
        initPlayer();
        return;
      }

      // Nếu chưa, tạo và tải script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = () => {
        if ((window as any).Hls) {
          Hls = (window as any).Hls;
          if (isMounted) {
            initPlayer();
          }
        }
      };
      script.onerror = () => {
        console.error('Không thể tải hls.js');
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup: Xóa script khi component unmount
        document.body.removeChild(script);
      };
    };

    if (videoRef.current && src) {
      loadScript();
    }

    // Hàm cleanup khi component unmount
    return () => {
      isMounted = false;
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [src]); // Chạy lại effect nếu link `src` thay đổi

  return (
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border border-gray-700">
      <video
        ref={videoRef}
        controls // Hiển thị nút controls (play, pause, âm lượng)
        className="w-full h-full"
        // Thêm muted nếu bạn muốn tự động phát ngay khi tải
        muted
      ></video>
    </div>
  );
}