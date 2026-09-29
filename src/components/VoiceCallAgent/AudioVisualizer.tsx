import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'muted';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Color scheme for light theme
      let primaryColor = 'rgba(24, 24, 27, 0.75)'; // dark zinc
      let glowColor = 'rgba(24, 24, 27, 0.15)';
      let barsCount = 28;
      let amplitudeMultiplier = 0.2;

      if (state === 'listening') {
        primaryColor = 'rgba(2, 132, 199, 0.9)'; // sky-600
        glowColor = 'rgba(2, 132, 199, 0.2)';
        amplitudeMultiplier = 0.5 + Math.sin(phase * 3) * 0.2;
      } else if (state === 'thinking') {
        primaryColor = 'rgba(217, 119, 6, 0.9)'; // amber-600
        glowColor = 'rgba(217, 119, 6, 0.2)';
        amplitudeMultiplier = 0.4 + Math.sin(phase * 5) * 0.25;
      } else if (state === 'speaking') {
        primaryColor = 'rgba(16, 185, 129, 0.95)'; // emerald-600
        glowColor = 'rgba(16, 185, 129, 0.25)';
        amplitudeMultiplier = 0.85 + Math.sin(phase * 4) * 0.15;
      } else if (state === 'muted') {
        primaryColor = 'rgba(161, 161, 170, 0.4)';
        glowColor = 'rgba(161, 161, 170, 0.1)';
        amplitudeMultiplier = 0.05;
      }

      const barWidth = 4;
      const spacing = (width - barsCount * barWidth) / (barsCount + 1);

      for (let i = 0; i < barsCount; i++) {
        const x = spacing + i * (barWidth + spacing);
        const distanceToCenter = Math.abs(i - barsCount / 2) / (barsCount / 2);
        const centerWeight = 1 - Math.pow(distanceToCenter, 1.5);

        // Sinusoidal wave calculation with harmonics
        const freq1 = Math.sin(phase * 4 + i * 0.4);
        const freq2 = Math.cos(phase * 2.5 + i * 0.6);
        const h = Math.max(
          4,
          (centerY * 0.8) * centerWeight * amplitudeMultiplier * (0.4 + 0.3 * freq1 + 0.3 * freq2)
        );

        ctx.fillStyle = primaryColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = state === 'speaking' || state === 'listening' ? 8 : 2;

        ctx.beginPath();
        ctx.roundRect(x, centerY - h / 2, barWidth, h, 2);
        ctx.fill();
      }

      phase += 0.035;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <div className="relative flex items-center justify-center w-full py-2">
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
          state === 'speaking'
            ? 'bg-emerald-500/10 scale-105'
            : state === 'listening'
            ? 'bg-sky-500/10 scale-105'
            : state === 'thinking'
            ? 'bg-amber-500/10 scale-100'
            : 'bg-zinc-100/50'
        }`}
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className="w-full max-w-[320px] h-[80px] relative z-10"
      />
    </div>
  );
};
