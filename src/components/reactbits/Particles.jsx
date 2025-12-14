import React, { useEffect, useRef } from 'react';

const Particles = ({ className = "", quantity = 40, color = "#a855f7" }) => {
    const canvasRef = useRef(null);
    const context = useRef(null);
    const circles = useRef([]);
    const canvasSize = useRef({ w: 0, h: 0 });
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

    useEffect(() => {
        if (canvasRef.current) {
            context.current = canvasRef.current.getContext('2d');
        }
        initCanvas();
        animate();
        window.addEventListener('resize', initCanvas);
        return () => window.removeEventListener('resize', initCanvas);
    }, []);

    const initCanvas = () => {
        resizeCanvas();
        drawParticles();
    };

    const resizeCanvas = () => {
        if (canvasRef.current && context.current) {
            canvasSize.current.w = window.innerWidth;
            canvasSize.current.h = window.innerHeight;
            canvasRef.current.width = canvasSize.current.w * dpr;
            canvasRef.current.height = canvasSize.current.h * dpr;
            canvasRef.current.style.width = `100%`;
            canvasRef.current.style.height = `100%`;
            context.current.scale(dpr, dpr);
        }
    };

    const circleParams = () => {
        const x = Math.floor(Math.random() * canvasSize.current.w);
        const y = Math.floor(Math.random() * canvasSize.current.h);
        const size = Math.floor(Math.random() * 2) + 0.5;
        const alpha = 0;
        const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.5;
        const dy = (Math.random() - 0.5) * 0.5;
        return { x, y, size, alpha, targetAlpha, dx, dy };
    };

    const drawParticles = () => {
        if (!context.current) return;
        context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
        for (let i = 0; i < quantity; i++) {
            const circle = circleParams();
            circles.current.push(circle);
        }
    };

    const drawCircle = (circle) => {
        if (context.current) {
            const { x, y, size, alpha } = circle;
            context.current.beginPath();
            context.current.arc(x, y, size, 0, 2 * Math.PI);
            context.current.fillStyle = color;
            context.current.globalAlpha = alpha;
            context.current.fill();
        }
    };

    const animate = () => {
        if (!context.current) return;
        context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
        circles.current.forEach((circle) => {
            circle.x += circle.dx;
            circle.y += circle.dy;
            if (circle.x > canvasSize.current.w) circle.x = 0;
            if (circle.x < 0) circle.x = canvasSize.current.w;
            if (circle.y > canvasSize.current.h) circle.y = 0;
            if (circle.y < 0) circle.y = canvasSize.current.h;
            if (circle.alpha < circle.targetAlpha) circle.alpha += 0.01;
            drawCircle(circle);
        });
        requestAnimationFrame(animate);
    };

    return <canvas className={`fixed inset-0 pointer-events-none z-0 ${className}`} ref={canvasRef} />;
};

export default Particles;
