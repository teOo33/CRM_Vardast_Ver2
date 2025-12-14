import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const VariableProximity = ({ label, className = "", onClick, fromFontVariationSettings = "'wght' 400", toFontVariationSettings = "'wght' 900", radius = 50 }) => {
    const itemRef = useRef(null);
    const [weight, setWeight] = useState(400); 
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!itemRef.current) return;
            const rect = itemRef.current.getBoundingClientRect();
            const itemX = rect.left + rect.width / 2;
            const itemY = rect.top + rect.height / 2;
            
            const dist = Math.sqrt(Math.pow(e.clientX - itemX, 2) + Math.pow(e.clientY - itemY, 2));
            
            const maxDist = radius;
            const intensity = Math.max(0, 1 - dist / maxDist);
            
            const newWeight = 400 + (intensity * 300); // 400 to 700
            setWeight(newWeight);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [radius]);

    return (
        <motion.span 
            ref={itemRef} 
            className={className}
            style={{ fontWeight: weight, cursor: 'pointer' }}
            onClick={onClick}
        >
            {label}
        </motion.span>
    );
};

export default VariableProximity;
