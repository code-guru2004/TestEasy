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
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 transition rounded-full p-3 text-white"
          >
            <X size={28} />
          </button>

          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-contain"
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

          {/* IMAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setPreviewImage(img)}
                className="group relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-md cursor-pointer bg-gray-100"
              >
                <Image
                  src={img}
                  alt={`Step ${index + 1}`}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-black text-sm font-semibold px-4 py-2 rounded-lg shadow">
                    Click to Preview
                  </div>
                </div>

                {/* Step Badge */}
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
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