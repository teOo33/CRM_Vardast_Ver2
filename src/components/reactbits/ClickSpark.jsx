import React, { useState, useCallback, useRef } from "react";

const ClickSpark = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "cubic-bezier(0.25, 1, 0.5, 1)",
  extraScale = 1.3,
  children,
  className,
  onClick
}) => {
  const [sparks, setSparks] = useState([]);
  const rectRef = useRef(null);

  const createSpark = useCallback((e) => {
    const rect = rectRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const now = Date.now();
    const newSparks = Array.from({ length: sparkCount }).map((_, i) => {
      const angle = (i / sparkCount) * 2 * Math.PI;
      return {
        id: now + i,
        x,
        y,
        angle,
        startTime: now,
      };
    });

    setSparks((prev) => [...prev, ...newSparks]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.startTime !== now));
    }, duration);
    
    if (onClick) onClick(e);
  }, [onClick, sparkCount, duration]);

  return (
    <div
      ref={rectRef}
      className={`relative inline-block ${className || ""}`}
      onClick={createSpark}
      style={{ cursor: "pointer" }}
    >
      {children}
      {sparks.map((spark) => (
        <Spark
          key={spark.id}
          {...spark}
          color={sparkColor}
          size={sparkSize}
          radius={sparkRadius}
          duration={duration}
          easing={easing}
          extraScale={extraScale}
        />
      ))}
    </div>
  );
};

const Spark = ({ x, y, angle, startTime, duration, color, size, radius, easing, extraScale }) => {
  const [style, setStyle] = useState({});

  React.useLayoutEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) return;

      const offset = radius * progress;
      const currentX = x + Math.cos(angle) * offset;
      const currentY = y + Math.sin(angle) * offset;
      const scale = 1 - progress; // Fade out size

      setStyle({
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `translate(${currentX - size / 2}px, ${currentY - size / 2}px) scale(${scale})`,
        pointerEvents: "none",
        opacity: 1 - progress,
        transition: "none",
        zIndex: 9999
      });

      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return <span style={style} />;
};

export default ClickSpark;
