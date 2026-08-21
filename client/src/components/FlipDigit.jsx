import { useState, useEffect, useRef } from 'react';

/**
 * 3D Calendar / Scoreboard Split-Flap Digit Card Component.
 * 
 * Perfect alignment guaranteed via 200% height offset inner containers:
 * - Upper half clips top 50% of the centered digit text.
 * - Lower half clips bottom 50% of the centered digit text.
 * - Upper and lower halves ALWAYS match when static/idle.
 * - Dynamic 3D page flip transition on live tick / reveal.
 */
export function FlipDigit({
  value,
  label,
  isRevealing = false,
  revealDelay = 0,
  borderAccentClass = 'border-indigo-500/20 shadow-indigo-500/5',
  textAccentClass = 'text-white'
}) {
  const targetDigit = String(value ?? '00');

  // currentDigit: settled digit currently shown
  const [currentDigit, setCurrentDigit] = useState(targetDigit);
  // nextDigit: incoming target digit during flip
  const [nextDigit, setNextDigit] = useState(targetDigit);
  
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0); // 0 to 1
  const animatingRef = useRef(false);

  // Reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Initial Reveal Sequence Handler ---
  useEffect(() => {
    if (!isRevealing || prefersReducedMotion) {
      setCurrentDigit(targetDigit);
      setNextDigit(targetDigit);
      setIsFlipping(false);
      return;
    }

    let isCancelled = false;
    let timerId = null;

    const startRevealSequence = async () => {
      await new Promise((r) => setTimeout(r, revealDelay));
      if (isCancelled) return;

      const targetNum = parseInt(targetDigit, 10) || 0;
      const flipSequence = [];
      const totalSteps = 10 + (targetNum % 10);

      for (let i = 0; i <= totalSteps; i++) {
        const num = (i % 10);
        flipSequence.push(String(num).padStart(targetDigit.length, '0'));
      }
      flipSequence[flipSequence.length - 1] = targetDigit;

      let index = 0;
      const step = () => {
        if (isCancelled || index >= flipSequence.length) {
          setCurrentDigit(targetDigit);
          setNextDigit(targetDigit);
          setIsFlipping(false);
          return;
        }

        const nextVal = flipSequence[index];
        setCurrentDigit(nextVal);
        setNextDigit(nextVal);

        const progressRatio = index / totalSteps;
        const delay = 60 + Math.pow(progressRatio, 2.5) * 200;

        index++;
        timerId = setTimeout(step, delay);
      };

      step();
    };

    startRevealSequence();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [isRevealing, targetDigit, revealDelay, prefersReducedMotion]);

  // --- Ongoing Live Ticking Flip Handler ---
  useEffect(() => {
    if (isRevealing) return;

    if (targetDigit !== currentDigit && !animatingRef.current) {
      if (prefersReducedMotion) {
        setCurrentDigit(targetDigit);
        setNextDigit(targetDigit);
        return;
      }

      animatingRef.current = true;
      setNextDigit(targetDigit);
      setIsFlipping(true);
      setFlipProgress(0);

      const animDuration = 320; // ms
      const startTime = performance.now();

      const animateFlip = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / animDuration, 1);
        setFlipProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animateFlip);
        } else {
          setCurrentDigit(targetDigit);
          setNextDigit(targetDigit);
          setIsFlipping(false);
          setFlipProgress(0);
          animatingRef.current = false;
        }
      };

      requestAnimationFrame(animateFlip);
    }
  }, [targetDigit, currentDigit, isRevealing, prefersReducedMotion]);

  // Angle calculations for split-flap:
  // Phase 1 (0 <= progress < 0.5): Top flap peeks down from 0 to -90deg
  // Phase 2 (0.5 <= progress <= 1): Bottom flap lands down from 90 to 0deg
  const topFlapAngle = flipProgress < 0.5 ? flipProgress * 2 * 90 : 90;
  const bottomFlapAngle = flipProgress >= 0.5 ? (1 - flipProgress) * 2 * 90 : 90;

  // Render static digit when not flipping, or incoming/outgoing during flip
  const topBackDigit = isFlipping ? nextDigit : currentDigit;
  const bottomBackDigit = currentDigit;

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3D Flip Card Container */}
      <div 
        className={`relative w-14 sm:w-20 md:w-24 h-18 sm:h-26 md:h-28 bg-[#101012] border-2 rounded-xl shadow-2xl overflow-hidden ${borderAccentClass}`}
        style={{ perspective: '400px' }}
      >
        {/* Ambient background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* 1. TOP STATIC HALF (Back layer: shows next digit top during flip, current digit top when idle) */}
        <div className="relative w-full h-[50%] overflow-hidden bg-[#141417] border-b border-black/60">
          <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center">
            <span className={`text-3xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight leading-none ${textAccentClass}`}>
              {topBackDigit}
            </span>
          </div>
        </div>

        {/* 2. BOTTOM STATIC HALF (Back layer: shows current digit bottom until covered) */}
        <div className="relative w-full h-[50%] overflow-hidden bg-[#101012]">
          <div className="absolute bottom-0 left-0 right-0 h-[200%] flex items-center justify-center">
            <span className={`text-3xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight leading-none ${textAccentClass}`}>
              {bottomBackDigit}
            </span>
          </div>
        </div>

        {/* 3. ANIMATING TOP FLAP (Phase 1: 0 -> 0.5 progress, flips down showing current digit top) */}
        {isFlipping && !prefersReducedMotion && flipProgress < 0.5 && (
          <div
            className="absolute top-0 left-0 right-0 h-[50%] overflow-hidden bg-[#16161a] border-b border-black/80 shadow-md z-20"
            style={{
              transformOrigin: 'bottom center',
              transform: `rotateX(-${topFlapAngle}deg)`,
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center">
              <span className={`text-3xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight leading-none ${textAccentClass}`}>
                {currentDigit}
              </span>
            </div>
            {/* Top flap darkening shadow */}
            <div 
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: flipProgress * 2 * 0.4 }}
            />
          </div>
        )}

        {/* 4. ANIMATING BOTTOM FLAP (Phase 2: 0.5 -> 1.0 progress, drops down showing next digit bottom) */}
        {isFlipping && !prefersReducedMotion && flipProgress >= 0.5 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[50%] overflow-hidden bg-[#121215] shadow-lg z-20"
            style={{
              transformOrigin: 'top center',
              transform: `rotateX(${bottomFlapAngle}deg)`,
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-[200%] flex items-center justify-center">
              <span className={`text-3xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight leading-none ${textAccentClass}`}>
                {nextDigit}
              </span>
            </div>
            {/* Bottom flap lightening shadow */}
            <div 
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: (1 - flipProgress) * 2 * 0.4 }}
            />
          </div>
        )}

        {/* Center horizontal seam line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-black/90 shadow-[0_1px_2px_rgba(0,0,0,0.9)] z-30 pointer-events-none" />
      </div>

      {/* Card Label */}
      {label && (
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-cyber-muted mt-2.5 font-mono">
          {label}
        </span>
      )}
    </div>
  );
}
