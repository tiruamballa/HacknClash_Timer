import { useEffect, useRef } from 'react';

/**
 * Ambient Space Canvas Component.
 *
 * Single persistent background mounted at App level:
 * - Faint blueprint grid & soft aurora gradient depth.
 * - Drifting network of circuit nodes & connective links.
 * - CONTINUOUS AMBIENT FALLING STARS: Glowing shooting stars with shimmering tails
 *   and stardust spark trails that continuously streak across the cosmic background.
 * - INAUGURAL HYPER-METEOR IGNITION: When guest triggers launch ('charging'), a grand
 *   hyper-meteor streaks towards screen center followed by a shockwave burst ('shockwave').
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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- 1. Circuit Nodes Network ---
    const nodeCount = 45;
    const maxLinkDistance = 140;
    const nodeColors = ['#4338CA', '#0EA5E9', '#10B981'];
    const nodes = [];

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

    // --- 2. Ambient Continuous Falling Stars Engine ---
    const shootingStars = [];
    const MAX_AMBIENT_STARS = 5;
    let lastStarSpawnTime = 0;

    const createShootingStar = () => {
      // Spawn from top edge or left edge
      const spawnFromTop = Math.random() > 0.4;
      const startX = spawnFromTop ? Math.random() * canvas.width * 1.2 - canvas.width * 0.2 : -50;
      const startY = spawnFromTop ? -50 : Math.random() * canvas.height * 0.5;

      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // ~45 degrees diagonal drop
      const speed = Math.random() * 6 + 5;
      const tailLength = Math.random() * 100 + 80;
      const thickness = Math.random() * 1.8 + 1.2;
      const color = nodeColors[Math.floor(Math.random() * nodeColors.length)];

      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        tailLength,
        thickness,
        color,
        alpha: 1,
        maxLife: Math.random() * 120 + 80,
        life: 0,
        sparks: []
      };
    };

    // Initialize 2 shooting stars right away
    for (let i = 0; i < 2; i++) {
      shootingStars.push(createShootingStar());
    }

    // --- 3. Inaugural Ignition Hyper-Meteor State ---
    let ignitionStartTimestamp = null;
    let shockwaveRadius = 0;
    let shockwaveAlpha = 0;
    let impactParticles = [];

    const drawStaticBackground = () => {
      // Base light gradient wash
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#F5F8FD');
      bgGrad.addColorStop(0.55, '#F0F4FC');
      bgGrad.addColorStop(1, '#EAF1FB');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blueprint grid lines
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

      // Soft aurora color depth blobs
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
    };

    if (prefersReducedMotion) {
      drawStaticBackground();
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
        drawStaticBackground();
      };
      window.addEventListener('resize', redraw);
      return () => window.removeEventListener('resize', redraw);
    }

    let prevTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      drawStaticBackground();

      // --- Update & Draw Circuit Nodes ---
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

      // --- Render Continuous Ambient Falling Stars ---
      if (now - lastStarSpawnTime > (Math.random() * 1500 + 1000) && shootingStars.length < MAX_AMBIENT_STARS) {
        shootingStars.push(createShootingStar());
        lastStarSpawnTime = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.life++;
        star.x += star.vx;
        star.y += star.vy;

        // Fade out near end of life or canvas bounds
        const fadeStart = star.maxLife * 0.7;
        if (star.life > fadeStart) {
          star.alpha = Math.max(0, 1 - (star.life - fadeStart) / (star.maxLife - fadeStart));
        }

        // Spawn tiny stardust sparks along tail
        if (Math.random() < 0.4) {
          star.sparks.push({
            x: star.x + (Math.random() - 0.5) * 4,
            y: star.y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 1.5 + 0.5,
            alpha: star.alpha * 0.8
          });
        }

        // Calculate tail end position
        const tailX = star.x - (star.vx / Math.hypot(star.vx, star.vy)) * star.tailLength;
        const tailY = star.y - (star.vy / Math.hypot(star.vx, star.vy)) * star.tailLength;

        // Draw shooting star gradient tail
        const tailGrad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        tailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        tailGrad.addColorStop(0.6, star.color);
        tailGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = star.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw star head glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.thickness * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();

        // Update and draw trailing sparks
        for (let s = star.sparks.length - 1; s >= 0; s--) {
          const sp = star.sparks[s];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.alpha -= 0.03;
          if (sp.alpha <= 0) {
            star.sparks.splice(s, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = sp.alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Remove star if faded or far off screen
        if (star.alpha <= 0 || star.x > canvas.width + 100 || star.y > canvas.height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      // --- 4. Grand Inaugural Hyper-Meteor Sequence ---
      if (stage === 'charging') {
        if (!ignitionStartTimestamp) {
          ignitionStartTimestamp = now;
        }

        const elapsed = Math.min((now - ignitionStartTimestamp) / 2200, 1);
        const easeProgress = Math.pow(elapsed, 2.6); // Star falling trajectory curve

        // Drop from top sky directly down to the center of "HACK 'N' CLASH"
        const startX = canvas.width * 0.55;
        const startY = -150;
        const targetX = canvas.width / 2;
        const targetY = canvas.height * 0.38; // Exact vertical center of HACK 'N' CLASH text

        const currentX = startX + (targetX - startX) * easeProgress;
        const currentY = startY + (targetY - startY) * easeProgress;

        ctx.save();

        // 1. Massive Burning Plasma Tail
        const tailLength = 250 + easeProgress * 200;
        const tailAngle = Math.atan2(currentY - startY, currentX - startX);
        const tailStartX = currentX - Math.cos(tailAngle) * tailLength;
        const tailStartY = currentY - Math.sin(tailAngle) * tailLength;

        const meteorGrad = ctx.createLinearGradient(tailStartX, tailStartY, currentX, currentY);
        meteorGrad.addColorStop(0, 'rgba(79, 70, 229, 0)');
        meteorGrad.addColorStop(0.35, 'rgba(79, 70, 229, 0.6)');
        meteorGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.9)');
        meteorGrad.addColorStop(1, 'rgba(16, 185, 129, 1)');

        // Outer Fire Trail
        ctx.beginPath();
        ctx.moveTo(tailStartX, tailStartY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 18 + easeProgress * 28;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#0EA5E9';
        ctx.shadowBlur = 35;
        ctx.stroke();

        // Inner White Core Streak
        ctx.beginPath();
        ctx.moveTo(tailStartX, tailStartY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6 + easeProgress * 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2. Trailing Stardust Spark Shower
        for (let i = 0; i < 4; i++) {
          const offset = Math.random() * tailLength;
          const px = currentX - Math.cos(tailAngle) * offset + (Math.random() - 0.5) * 20;
          const py = currentY - Math.sin(tailAngle) * offset + (Math.random() - 0.5) * 20;
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#10B981' : '#38BDF8';
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 10;
          ctx.fill();
        }

        // 3. Giant Radiant Star Aura (140px glow radius)
        const headRadius = 24 + easeProgress * 28;
        const starGlow = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, headRadius * 3.5);
        starGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        starGlow.addColorStop(0.25, 'rgba(16, 185, 129, 0.9)');
        starGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.5)');
        starGlow.addColorStop(1, 'rgba(79, 70, 229, 0)');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(currentX, currentY, headRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Bright Blinding White Core
        ctx.beginPath();
        ctx.arc(currentX, currentY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 45;
        ctx.fill();

        // 5. Spinning 8-Point Celestial Star Beams
        const rotationAngle = now * 0.003;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3.5;
        const rayLen = headRadius * 2.8;

        for (let r = 0; r < 4; r++) {
          const angle = rotationAngle + (r * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(currentX - Math.cos(angle) * rayLen, currentY - Math.sin(angle) * rayLen);
          ctx.lineTo(currentX + Math.cos(angle) * rayLen, currentY + Math.sin(angle) * rayLen);
          ctx.stroke();
        }

        ctx.restore();
      } else {
        ignitionStartTimestamp = null;
      }

      // --- 5. Shockwave Blast & Debris Burst on Event Title ---
      if (stage === 'shockwave') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.38; // Impact center on event title

        if (shockwaveRadius === 0) {
          shockwaveRadius = 10;
          shockwaveAlpha = 1;

          for (let i = 0; i < 110; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 16 + 5;
            impactParticles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 5 + 2,
              alpha: 1,
              color: i % 4 === 0 ? '#4F46E5' : i % 4 === 1 ? '#0EA5E9' : i % 4 === 2 ? '#10B981' : '#F59E0B'
            });
          }
        }

        shockwaveRadius += 25;
        shockwaveAlpha = Math.max(1 - shockwaveRadius / (Math.max(canvas.width, canvas.height) * 0.85), 0);

        ctx.save();
        // Central Impact Blinding Flash
        if (shockwaveRadius < 120) {
          const flashGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 220);
          flashGlow.addColorStop(0, `rgba(255, 255, 255, ${1 - shockwaveRadius / 120})`);
          flashGlow.addColorStop(0.5, `rgba(16, 185, 129, ${(1 - shockwaveRadius / 120) * 0.7})`);
          flashGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = flashGlow;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 220, 0, Math.PI * 2);
          ctx.fill();
        }

        // Primary shockwave ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${shockwaveAlpha})`;
        ctx.lineWidth = 8;
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 25;
        ctx.stroke();

        if (shockwaveRadius > 35) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, shockwaveRadius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(14, 165, 233, ${shockwaveAlpha * 0.85})`;
          ctx.lineWidth = 5;
          ctx.stroke();
        }

        impactParticles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.016;
          if (p.alpha < 0) p.alpha = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.restore();
      } else if (stage !== 'charging') {
        shockwaveRadius = 0;
        shockwaveAlpha = 0;
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

  const isIgniting = stage === 'charging' || stage === 'shockwave';

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-cyber-bg"
    />
  );
}

