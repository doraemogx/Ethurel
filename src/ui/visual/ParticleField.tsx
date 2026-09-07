import { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  color: string;
  motif: 'ash' | 'thread' | 'trail' | 'shadow' | 'stone' | 'moss' | 'sigil' | 'bone' | 'rain' | 'spore';
  density?: number;
  reduceMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
  phase: number;
}

/**
 * Fundo de partículas leve (canvas 2D, sem WebGL, sem libs) — reage a
 * classe/local/Arcane trocando cor e contagem, nunca infinito (spec §61:
 * performance mobile). `reduceMotion` (settings) desenha um único frame
 * estático em vez de animar.
 */
export function ParticleField({ color, motif, density = 26, reduceMotion = false }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const isDownward = motif === 'ash' || motif === 'rain' || motif === 'spore' || motif === 'moss';
    const particles: Particle[] = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.8,
      vy: (isDownward ? 1 : -1) * (0.05 + Math.random() * 0.15),
      vx: (Math.random() - 0.5) * 0.06,
      alpha: 0.15 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const flicker = 0.7 + 0.3 * Math.sin(t * 0.02 + p.phase);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reduceMotion) {
      draw();
      return () => window.removeEventListener('resize', resize);
    }

    const tick = () => {
      t += 1;
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * 0.01 + p.phase) * 0.05;
        if (p.y < -4) p.y = height + 4;
        if (p.y > height + 4) p.y = -4;
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [color, motif, density, reduceMotion]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden />;
}
