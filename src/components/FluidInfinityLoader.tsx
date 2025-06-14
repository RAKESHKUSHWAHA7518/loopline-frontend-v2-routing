"use client";

import React, { useEffect, useRef } from "react";

type Size = "sm" | "md" | "lg" | "xl";

interface FluidInfinityLoaderProps {
  size?: Size;
  color?: string;
  className?: string;
}

interface Point {
  t: number;
  x?: number;
  y?: number;
}

export function FluidInfinityLoader({
  size = "md",
  color = "#3b82f6",
  className = "",
}: FluidInfinityLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sizeMap: Record<Size, { width: number; height: number }> = {
    sm: { width: 100, height: 50 },
    md: { width: 150, height: 75 },
    lg: { width: 200, height: 100 },
    xl: { width: 300, height: 150 },
  };

  const { width, height } = sizeMap[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let animationFrameId: number;
    let phase = 0;
    const speed = 0.05;

    const numPoints = 100;
    const points: Point[] = [];

    for (let i = 0; i < numPoints; i++) {
      const t = (i / (numPoints - 1)) * Math.PI * 2;
      points.push({ t });
    }

    const calculatePosition = (t: number, time: number) => {
      const a = width / 3;
      const b = height / 2;
      const waveAmplitude = height * 0.05;
      const waveFrequency = 3;
      const wave = Math.sin(t * waveFrequency + time) * waveAmplitude;

      const x = width / 2 + a * Math.sin(t);
      const y = height / 2 + b * Math.sin(t) * Math.cos(t) + wave;

      return { x, y };
    };

    const drawFluidCurve = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      phase += speed;

      for (let i = 0; i < points.length; i++) {
        const pos = calculatePosition(points[i].t, phase);
        points[i].x = pos.x;
        points[i].y = pos.y;
      }

      ctx.lineWidth = 0;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, adjustColor(color, 20));
      gradient.addColorStop(1, color);

      ctx.beginPath();
      if (points.length > 0) ctx.moveTo(points[0].x!, points[0].y!);

      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const prevPoint = points[i - 1];
        const cpx = (prevPoint.x! + point.x!) / 2;
        const cpy = (prevPoint.y! + point.y!) / 2;
        ctx.quadraticCurveTo(cpx, cpy, point.x!, point.y!);
      }

      for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        const nextIdx = (i + 1) % points.length;
        const dx = (points[nextIdx].x! - point.x!);
        const dy = (points[nextIdx].y! - point.y!);
        const len = Math.sqrt(dx * dx + dy * dy);

        const thickness = Math.sin(point.t + phase) * 5 + 10;

        if (len > 0) {
          const nx = -dy / len;
          const ny = dx / len;
          ctx.lineTo(point.x! + nx * thickness, point.y! + ny * thickness);
        } else {
          ctx.lineTo(point.x!, point.y!);
        }
      }

      ctx.closePath();
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = gradient;
      ctx.fill();

      animationFrameId = requestAnimationFrame(() => drawFluidCurve(time + speed));
    };

    animationFrameId = requestAnimationFrame(() => drawFluidCurve(0));

    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height, color]);

  const adjustColor = (hex: string, amt: number): string => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    r = Math.min(255, Math.max(0, r + amt));
    g = Math.min(255, Math.max(0, g + amt));
    b = Math.min(255, Math.max(0, b + amt));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Loading indicator"
        className="block"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
