// src/components/layout/BackgroundBlobs.jsx
import React from "react";

export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blob 1 */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />

      {/* Blob 2 */}
      <div className="absolute top-[30%] left-[-15%] w-[450px] h-[450px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      {/* Blob 3 */}
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
    </div>
  );
}
