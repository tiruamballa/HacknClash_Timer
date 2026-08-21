import { useEffect, useRef } from 'react';

/**
 * Ambient Code Canvas Component.
 *
 * This is the site's single persistent background — mounted once at the App
 * level so the same bright, modern "coding" scene carries across the launch
 * screen, the live countdown, and the ended screen.
 *
 * Features:
 * - Clean light gradient backdrop with a faint blueprint/code grid.
 * - Soft ambient "aurora" color blobs (indigo / sky / emerald) for depth.
 * - Drifting network of small circuit-style nodes & connecting lines.
 * - Active ignition sequence: a bright comet streaks in from off-screen to
 *   center (~2.2s), representing the round "compiling" / launching.
 * - Impact shockwave ripple & radial spark particles (~2.0s).
 * - Reduced motion fallback: static grid + blobs, no motion, no comet.
 */
export function SpaceIgnition({ stage }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId;
    let nodes = [];
    const nodeCount = 46;
    const maxLinkDistance = 150;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodeColors = ['#4338CA', '#0EA5E9', '#10B981'];

    // Initialize drifting circuit-style node field
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 1.1,
        alpha: Math.random() * 0.5 + 0.35,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        color: nodeColors[i % nodeColors.length]
      });
    }

    // Meteor / shockwave ignition state
    let meteor = null;
    let shockwaveRadius = 0;
    let shockwaveAlpha = 0;
    let impactParticles = [];

    const drawStaticScene = () => {
      // Base light gradient wash
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#F5F8FD');
      bgGrad.addColorStop(0.55, '#F0F4FC');
      bgGrad.addColorStop(1, '#EAF1FB');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Faint blueprint grid
      ctx.strokeStyle = 'rgba(67, 56, 202, 0.045)';
      ctx.lineWidth = 1;
      const gridSize = 90;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Soft aurora color blobs for depth
      const blobA = ctx.createRadialGradient(
        canvas.width * 0.88, canvas.height * 0.1, 0,
        canvas.width * 0.88, canvas.height * 0.1, canvas.width * 0.5
      );
      blobA.addColorStop(0, 'rgba(67, 56, 202, 0.10)');
      blobA.addColorStop(1, 'rgba(67, 56, 202, 0)');
      ctx.fillStyle = blobA;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const blobB = ctx.createRadialGradient(
        canvas.width * 0.08, canvas.height * 0.85, 0,
        canvas.width * 0.08, canvas.height * 0.85, canvas.width * 0.45
      );
      blobB.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      blobB.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = blobB;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const blobC = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.95, 0,
        canvas.width * 0.5, canvas.height * 0.95, canvas.width * 0.35
      );
      blobC.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
      blobC.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = blobC;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    if (prefersReducedMotion) {
      drawStaticScene();
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.alpha * 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      const redraw = () => {
        resizeCanvas();
        drawStaticScene();
      };
      window.addEventListener('resize', redraw);
      return () => window.removeEventListener('resize', redraw);
    }

    const animate = (now) => {
      drawStaticScene();

      // Update & draw drifting circuit nodes
      nodes.forEach((n) => {
        n.alpha += Math.sin(now * n.twinkleSpeed) * 0.008;
        if (n.alpha > 0.85) n.alpha = 0.85;
        if (n.alpha < 0.25) n.alpha = 0.25;

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = canvas.width;
        if (n.x > canvas.width) n.x = 0;
        if (n.y < 0) n.y = canvas.height;
        if (n.y > canvas.height) n.y = 0;
      });

      // Connective circuit lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLinkDistance) {
            const alpha = (1 - dist / maxLinkDistance) * 0.10;
            ctx.strokeStyle = `rgba(67, 56, 202, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // --- IGNITION STAGE ANIMATION ---
      if (stage === 'charging' || stage === 'shockwave') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (stage === 'charging') {
          // Phase 1: bright comet streaking towards screen center
          if (!meteor) {
            meteor = {
              x: canvas.width * 0.1,
              y: canvas.height * 0.12,
              startX: canvas.width * 0.1,
              startY: canvas.height * 0.12,
              targetX: centerX,
              targetY: centerY,
              startTime: now
            };
          }

          const mElapsed = Math.min((now - meteor.startTime) / 2200, 1);
          const easeProgress = Math.pow(mElapsed, 2.5);

          meteor.x = meteor.startX + (meteor.targetX - meteor.startX) * easeProgress;
          meteor.y = meteor.startY + (meteor.targetY - meteor.startY) * easeProgress;

          // Comet Tail & Core Flame (indigo -> emerald gradient trail)
          const gradient = ctx.createLinearGradient(meteor.startX, meteor.startY, meteor.x, meteor.y);
          gradient.addColorStop(0, 'rgba(67, 56, 202, 0)');
          gradient.addColorStop(0.6, 'rgba(79, 70, 229, 0.55)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.95)');

          ctx.beginPath();
          ctx.moveTo(meteor.startX, meteor.startY);
          ctx.lineTo(meteor.x, meteor.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 5 + easeProgress * 7;
          ctx.stroke();

          // Core comet glow head
          ctx.beginPath();
          ctx.arc(meteor.x, meteor.y, 7 + easeProgress * 10, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 28;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (stage === 'shockwave') {
          // Phase 2: shockwave impact / "build succeeded" burst
          if (shockwaveRadius === 0) {
            shockwaveRadius = 10;
            shockwaveAlpha = 1;

            for (let i = 0; i < 60; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 8 + 3;
              impactParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                alpha: 1,
                color: i % 3 === 0 ? '#4338CA' : i % 3 === 1 ? '#0EA5E9' : '#10B981'
              });
            }
          }

          shockwaveRadius += 18;
          shockwaveAlpha = Math.max(1 - shockwaveRadius / (Math.max(canvas.width, canvas.height) * 0.8), 0);

          // Radial impact ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${shockwaveAlpha})`;
          ctx.lineWidth = 5;
          ctx.stroke();

          // Secondary inner indigo ring
          if (shockwaveRadius > 40) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, shockwaveRadius * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(67, 56, 202, ${shockwaveAlpha * 0.8})`;
            ctx.lineWidth = 3.5;
            ctx.stroke();
          }

          // Impact debris particles
          impactParticles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.015;
            if (p.alpha < 0) p.alpha = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          });
        }
      } else {
        meteor = null;
        shockwaveRadius = 0;
        impactParticles = [];
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [stage]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-cyber-bg"
    />
  );
}
