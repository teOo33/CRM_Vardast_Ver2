import React from 'react';

const GridDistortion = ({ className = "" }) => {
    return (
        <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
            <div className="absolute inset-[-50%] w-[200%] h-[200%] opacity-10"
                 style={{
                     backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
                     backgroundSize: '60px 60px',
                     transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                     animation: 'grid-move 20s linear infinite'
                 }}
            />
            <style>{`
                @keyframes grid-move {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(60px) translateZ(-200px); }
                }
            `}</style>
        </div>
    );
};

export default GridDistortion;
