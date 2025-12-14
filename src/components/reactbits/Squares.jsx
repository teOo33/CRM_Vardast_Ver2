import React, { useState, useEffect } from 'react';

const Squares = ({ className = "" }) => {
    const [squares, setSquares] = useState([]);

    useEffect(() => {
        // Generate grid
        const cols = 20;
        const rows = 15;
        const newSquares = Array.from({ length: cols * rows }).map((_, i) => ({
            id: i,
            opacity: 0.1
        }));
        setSquares(newSquares);

        const interval = setInterval(() => {
            setSquares(prev => prev.map(s => ({
                ...s,
                opacity: Math.random() > 0.95 ? 0.4 : 0.05
            })));
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1 w-full h-full absolute inset-0 pointer-events-none z-0 ${className}`}>
            {squares.map(s => (
                <div key={s.id} className="bg-white transition-opacity duration-1000" style={{ opacity: s.opacity }} />
            ))}
        </div>
    );
};

export default Squares;
