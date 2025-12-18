import React from 'react';

const GradientText = ({ 
  children, 
  className = "", 
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"], 
  animationSpeed = 8, 
  showBorder = false, 
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    backgroundSize: "200% auto",
    animation: `animatedTextGradient ${animationSpeed}s linear infinite`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <style>
        {`
          @keyframes animatedTextGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <span style={gradientStyle}>{children}</span>
    </div>
  );
};

export default GradientText;
