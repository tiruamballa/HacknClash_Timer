import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { formatTimeRemaining } from '../utils/time';
import { FlipDigit } from './FlipDigit';

/**
 * Fully synchronized live countdown panel using 3D Calendar Page-Flip cards.
 */
export function CountdownTimer({ secondsRemaining, isRevealing = false }) {
  const { days, hours, minutes, seconds } = formatTimeRemaining(secondsRemaining);
  const [pulse, setPulse] = useState(false);
  const prevMinutesRef = useRef(minutes);

  // Monitor minute changes to trigger the milestone visual pulse
  useEffect(() => {
    if (minutes !== prevMinutesRef.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prevMinutesRef.current = minutes;
      return () => clearTimeout(t);
    }
  }, [minutes]);

  // Determine urgency tier configurations
  let statusTier = 'calm'; // >24h
  if (secondsRemaining <= 3600) {
    statusTier = 'critical'; // <1h
  } else if (secondsRemaining <= 86400) {
    statusTier = 'warning'; // 1h-24h
  }

  // Set colors based on urgency
  let borderAccentClass = 'border-indigo-200 shadow-indigo-500/5';
  let textAccentClass = 'text-white';
  let badgeColor = 'bg-indigo-50 text-cyber-accent border-indigo-200';

  if (statusTier === 'critical') {
    borderAccentClass = 'border-rose-300 shadow-rose-500/10';
    textAccentClass = 'text-rose-400 glow-text-live';
    badgeColor = 'bg-rose-50 text-cyber-live border-rose-200 animate-pulse';
  } else if (statusTier === 'warning') {
    borderAccentClass = 'border-amber-300 shadow-amber-500/5';
    textAccentClass = 'text-amber-400 glow-text-ended';
    badgeColor = 'bg-amber-50 text-cyber-ended border-amber-200';
  }

  // Handle accessibility reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      animate={!prefersReducedMotion && pulse ? { scale: 1.025 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      className={`relative p-6 sm:p-10 bg-cyber-card/90 backdrop-blur-md rounded-2xl border ${borderAccentClass} shadow-xl max-w-2xl mx-auto flex flex-col items-center gap-6`}
    >
      {/* Header Live / Urgency Badge */}
      <div className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase font-mono ${badgeColor}`}>
        {statusTier === 'critical' && '⚠️ CLOSING SOON'}
        {statusTier === 'warning' && '⏳ FINAL 24 HOURS'}
        {statusTier === 'calm' && '⚡ COMPETITION LIVE'}
      </div>

      {/* 3D Calendar Page-Flip Cards Layout */}
      <div className="flex items-center gap-2 sm:gap-5 md:gap-6">
        <FlipDigit 
          value={days} 
          label="Days" 
          isRevealing={isRevealing}
          revealDelay={2200} // Days lock last
          borderAccentClass={borderAccentClass} 
          textAccentClass={textAccentClass}
        />
        <span className="text-xl sm:text-3xl font-bold text-cyber-muted select-none pb-5 sm:pb-7 font-mono">:</span>
        <FlipDigit 
          value={hours} 
          label="Hours" 
          isRevealing={isRevealing}
          revealDelay={1500} // Hours lock 3rd
          borderAccentClass={borderAccentClass} 
          textAccentClass={textAccentClass}
        />
        <span className="text-xl sm:text-3xl font-bold text-cyber-muted select-none pb-5 sm:pb-7 font-mono">:</span>
        <FlipDigit 
          value={minutes} 
          label="Minutes" 
          isRevealing={isRevealing}
          revealDelay={800} // Minutes lock 2nd
          borderAccentClass={borderAccentClass} 
          textAccentClass={textAccentClass}
        />
        <span className="text-xl sm:text-3xl font-bold text-cyber-muted select-none pb-5 sm:pb-7 font-mono">:</span>
        <FlipDigit 
          value={seconds} 
          label="Seconds" 
          isRevealing={isRevealing}
          revealDelay={100} // Seconds lock 1st
          borderAccentClass={borderAccentClass} 
          textAccentClass={textAccentClass}
        />
      </div>

      {/* Background sweep element (Ambient motion loop) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_8s_infinite] pointer-events-none rounded-2xl" />
      )}
    </motion.div>
  );
}

