import React from "react";

const StarBorder = ({
  as: Component = "button",
  className = "",
  color = "cyan",
  speed = "6s",
  children,
  ...props
}) => {
  return (
    <Component className={`relative inline-block overflow-hidden rounded-xl p-[1px] ${className}`} {...props}>
      <div
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0%, ${color} 50%, transparent 100%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative h-full w-full rounded-xl bg-slate-950 text-white backdrop-blur-3xl flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
