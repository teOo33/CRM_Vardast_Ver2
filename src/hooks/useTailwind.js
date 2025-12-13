import { useEffect } from 'react';

export const useTailwind = () => {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        window.tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                slate: { 750: '#2d3748', 850: '#1a202c', 950: '#0f172a' } // Custom dark shades
              }
            }
          }
        };
      };
      document.head.appendChild(script);
      
      const style = document.createElement('style');
      style.innerHTML = `
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .animate-blob { animation: blob 7s infinite; }
        .animate-pulse-red { animation: pulse-red 2s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `;
      document.head.appendChild(style);
    }
  }, []);
};
