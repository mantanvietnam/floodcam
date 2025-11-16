'use client'; // <-- Bắt buộc là Client Component để dùng useState, onClick

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function RtspPlayer({ rtspLink }: { rtspLink: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    // Dùng document.execCommand để tương thích tốt nhất trong iframe
    // (navigator.clipboard.writeText có thể bị chặn)
    const input = document.createElement('input');
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    input.value = rtspLink;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Tự động tắt "Đã copy" sau 2s
    } catch (err) {
      console.error('Không thể sao chép link:', err);
    }
    document.body.removeChild(input);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 space-y-3">
      <p className="text-sm font-medium text-gray-700">
        Trình duyệt web không thể phát trực tiếp link RTSP.
      </p>
      <p className="text-xs text-gray-600">
        Vui lòng sao chép liên kết này và mở bằng một trình phát media
        như <strong>VLC Media Player</strong>.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={rtspLink}
          readOnly
          className="flex-grow p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md"
        />
        <button
          onClick={copyToClipboard}
          className={`flex-shrink-0 p-2 rounded-md transition-colors ${
            isCopied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Sao chép link"
        >
          {isCopied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
}