import React from 'react';

const UserAvatar = ({ name, size = 'md' }) => {
  const safeName = name || '?';
  const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600'];
  const colorIndex = safeName.length % colors.length;
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white flex-shrink-0`}>
      {safeName.charAt(0)}
    </div>
  );
};

export default UserAvatar;
