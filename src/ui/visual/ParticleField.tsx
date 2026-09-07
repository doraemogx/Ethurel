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
    const jitter = motif === 'bone';
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

    // Cada motivo tem uma FORMA/comportamento próprio (spec §10 — "esconder
    // o nome da classe ainda deve deixar pistas visuais claras"), não só uma
    // cor diferente sobre o mesmo ponto circular.
    const drawParticle = (p: Particle, flicker: number, angle: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      switch (motif) {
        case 'thread': {
          // fios finos que giram devagar — "linhas que dobram o espaço"
          ctx.rotate(angle);
          ctx.globalAlpha = p.alpha * flicker * 0.9;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(-p.r * 2.4, 0);
          ctx.lineTo(p.r * 2.4, 0);
          ctx.stroke();
          break;
        }
        case 'trail': {
          // fragmento com rastro atrás do movimento — "rastros e marcas"
          ctx.globalAlpha = p.alpha * flicker * 0.5;
          ctx.beginPath();
          ctx.moveTo(-p.vx * 40, -p.vy * 40);
          ctx.lineTo(0, 0);
          ctx.lineWidth = p.r * 0.8;
          ctx.stroke();
          ctx.globalAlpha = p.alpha * flicker;
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'shadow': {
          // manchas escuras suaves que quase somem — "silhuetas que somem"
          ctx.globalAlpha = p.alpha * flicker * 0.35;
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 3.2);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'stone': {
          // fragmentos angulares — "pedra e runa defensiva"
          ctx.rotate(p.phase);
          ctx.globalAlpha = p.alpha * flicker;
          ctx.beginPath();
          ctx.rect(-p.r * 0.9, -p.r * 0.9, p.r * 1.8, p.r * 1.8);
          ctx.fill();
          break;
        }
        case 'sigil': {
          // pequenos círculos concêntricos — "círculos e inscrições"
          ctx.globalAlpha = p.alpha * flicker;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 1.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'bone': {
          // lascas finas e erráticas — "ossos e instabilidade controlada"
          ctx.rotate(p.phase * 3 + t * 0.01);
          ctx.globalAlpha = p.alpha * flicker;
          ctx.fillRect(-p.r * 1.6, -p.r * 0.35, p.r * 3.2, p.r * 0.7);
          break;
        }
        case 'moss': {
          // brilho bioluminescente pulsante — "esporos e bioluminescência"
          ctx.globalAlpha = p.alpha * flicker;
          const grad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 2.4);
          grad2.addColorStop(0, color);
          grad2.addColorStop(1, 'transparent');
          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 2.4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        default: {
          // ash/rain/spore — ponto simples com leve brilho quente (padrão)
          ctx.globalAlpha = p.alpha * flicker;
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const flicker = 0.7 + 0.3 * Math.sin(t * 0.02 + p.phase);
        const angle = Math.atan2(p.vy, p.vx || 0.001);
        drawParticle(p, flicker, angle);
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
        p.y += p.vy + (jitter ? (Math.random() - 0.5) * 0.3 : 0);
        p.x += p.vx + Math.sin(t * 0.01 + p.phase) * 0.05 + (jitter ? (Math.random() - 0.5) * 0.3 : 0);
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
