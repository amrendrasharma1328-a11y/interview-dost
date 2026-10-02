"use client";
import { useEffect, useRef } from "react";

function createTubes(width, height, pointerX, pointerY) {
    const tubes = Array.from({ length: 18 }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        radius: 18 + Math.random() * 80,
        speed: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        hue: index % 3,
    }));

    return {
        width,
        height,
        pointerX,
        pointerY,
        tubes,
    };
}

export default function TubesBackground({ children, className = "", enableClickInteraction = true }) {
    const canvasRef = useRef(null);
    const pointerRef = useRef({ x: 0.5, y: 0.5 });
    const pulseRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        let animationId = null;
        let theme = createTubes(0, 0, pointerRef.current.x, pointerRef.current.y);

        const setSize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.max(1, Math.round(rect.width * dpr));
            canvas.height = Math.max(1, Math.round(rect.height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            theme = createTubes(rect.width, rect.height, pointerRef.current.x, pointerRef.current.y);
        };

        const drawStatic = () => {
            const { width, height } = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, width, height);
            const bg = ctx.createRadialGradient(width * 0.5, height * 0.2, 40, width * 0.5, height * 0.5, width * 0.8);
            bg.addColorStop(0, "rgba(139,92,246,0.22)");
            bg.addColorStop(0.5, "rgba(17,24,39,0.08)");
            bg.addColorStop(1, "rgba(3,7,18,0)");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);
        };

        const drawFrame = (time) => {
            const { width, height } = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, width, height);

            const glow = ctx.createRadialGradient(
                width * (pointerRef.current.x + 0.1),
                height * pointerRef.current.y,
                20,
                width * 0.5,
                height * 0.4,
                width * 0.9,
            );
            glow.addColorStop(0, "rgba(249,103,251,0.25)");
            glow.addColorStop(0.4, "rgba(83,188,40,0.12)");
            glow.addColorStop(1, "rgba(7,10,20,0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);

            const palette = ["#f967fb", "#53bc28", "#6958d5", "#60aed5", "#fe8a2e"];
            theme.tubes.forEach((tube, index) => {
                const dx = (tube.x * width) + (Math.sin(time / 900 + tube.phase) * 36) + ((pointerRef.current.x - 0.5) * width * 0.7);
                const dy = (tube.y * height) + (Math.cos(time / 1200 + tube.phase) * 28) + ((pointerRef.current.y - 0.5) * height * 0.7);
                const radius = tube.radius + Math.sin(time / 900 + tube.phase + index) * 12 + pulseRef.current * 8;

                const stroke = ctx.createRadialGradient(dx, dy, 0, dx, dy, radius * 1.7);
                stroke.addColorStop(0, `${palette[index % palette.length]}cc`);
                stroke.addColorStop(0.5, `${palette[(index + 1) % palette.length]}66`);
                stroke.addColorStop(1, "rgba(0,0,0,0)");

                ctx.beginPath();
                ctx.fillStyle = stroke;
                ctx.arc(dx, dy, radius, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(drawFrame);
        };

        const handlePointerMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            pointerRef.current.x = (event.clientX - rect.left) / rect.width;
            pointerRef.current.y = (event.clientY - rect.top) / rect.height;
        };

        window.addEventListener("resize", setSize);
        canvas.addEventListener("pointermove", handlePointerMove);
        setSize();

        if (prefersReducedMotion) {
            drawStatic();
        } else {
            animationId = requestAnimationFrame(drawFrame);
        }

        return () => {
            window.removeEventListener("resize", setSize);
            canvas.removeEventListener("pointermove", handlePointerMove);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, []);

    const onClick = () => {
        if (!enableClickInteraction) return;
        pulseRef.current = 1;
        setTimeout(() => { pulseRef.current = 0; }, 240);
    };

    return (
        <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.22),transparent_60%)]" />
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ touchAction: "none" }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/50 to-bg" />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
