// app/camera-permission/page.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function CameraPermissionPage() {
  const [images] = useState([
    "/camera-steps/step1.png",
    "/camera-steps/step2.png",
  ]);

  const [previewImage, setPreviewImage] = useState(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* FULL SCREEN PREVIEW */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)} // Click background to close
        >
          {/* Close Button - Made more visible */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent closing when clicking button
              setPreviewImage(null);
            }}
            className="absolute top-5 right-5 bg-black/50 hover:bg-red-600 transition-all duration-200 rounded-full p-3 text-white z-10 shadow-lg backdrop-blur-sm border border-white/20"
            aria-label="Close preview"
          >
            <X size={28} />
          </button>

          {/* Close button alternative for mobile (bottom) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-full px-6 py-3 text-white text-sm font-medium backdrop-blur-sm border border-white/30 md:hidden"
          >
            Close Preview
          </button>

          {/* Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          >
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      <div className="w-full min-h-screen px-4 py-10 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Main Card */}
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              <span className="font-medium">
                Follow the screenshots below to enable camera permission
              </span>
            </div>
          </div>

          {/* IMAGES - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setPreviewImage(img)}
                className="group relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md cursor-pointer bg-gray-100 transition-transform hover:scale-[1.02]"
                style={{ aspectRatio: "16/9" }}
              >
                <Image
                  src={img}
                  alt={`Step ${index + 1}`}
                  fill
                  className="object-contain transition-transform duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition bg-white/95 text-black text-sm font-semibold px-4 py-2 rounded-lg shadow-lg">
                    🔍 Click to Preview
                  </div>
                </div>

                {/* Step Badge */}
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                  Step {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6 max-w-xl">
          Camera access is required to continue the examination. Your webcam is
          used only for proctoring and security purposes.
        </p>
      </div>
    </div>
  );
}