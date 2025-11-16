'use client'; // <-- Đánh dấu đây là Client Component

import { useState, useEffect } from 'react';

interface InteractiveImageProps {
  src?: string;
  alt: string;
  fallbackText: string;
}

/**
 * Component này render một thẻ <img> và xử lý lỗi
 * (ví dụ: ảnh bị hỏng, null) bằng cách hiển thị một placeholder.
 * Đây là Client Component vì nó dùng hook (useState) và event handler (onError).
 */
export default function InteractiveImage({ src, alt, fallbackText }: InteractiveImageProps) {
  // Dùng state để quản lý nguồn ảnh, cho phép chúng ta thay đổi nó khi có lỗi
  const [imgSrc, setImgSrc] = useState(src);

  // Cập nhật lại state nếu prop `src` thay đổi (quan trọng khi data-fetching)
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    // Nếu có lỗi (ảnh 404, hỏng), đổi nguồn ảnh sang placeholder
    setImgSrc(`https://placehold.co/600x400/F87171/FFFFFF?text=${encodeURIComponent(
      fallbackText || "Lỗi ảnh"
    )}`);
  };

  const defaultSrc = `https://placehold.co/600x400/CCCCCC/FFFFFF?text=${encodeURIComponent(
    fallbackText || "Đang tải"
  )}`;

  return (
    <img
      src={imgSrc || defaultSrc} // Sử dụng imgSrc từ state, nếu không có thì dùng placeholder
      alt={alt}
      className="w-full h-full object-cover"
      onError={handleError} // Event handler `onError` giờ đã an toàn trong Client Component
    />
  );
}