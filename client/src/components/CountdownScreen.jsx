import { motion } from 'motion/react';
import { CountdownTimer } from './CountdownTimer';
import { EventBranding } from './EventBranding';
import { WifiOff } from 'lucide-react';

export function CountdownScreen({
  status,
  endsAt,
  secondsRemaining,
  isOffline,
  isRevealing = false
}) {
  const isEnded = status === 'ENDED' || secondsRemaining <= 0;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center py-2 sm:py-4 px-2 sm:px-4 relative overflow-y-auto overflow-x-hidden">

      {/* Offline Status indicator banner */}
      {isOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 rounded-full shadow-lg backdrop-blur-md">
          <WifiOff className="w-4 h-4 text-cyber-ended animate-pulse" />

          <span className="text-xs font-semibold tracking-wider text-cyber-ended uppercase font-mono">
            Reconnecting...
          </span>
        </div>
      )}

      {/* Header with branding logos */}
      <header className="w-full flex justify-center mt-1 sm:mt-2 select-none px-2">
        <EventBranding />
      </header>

      {/* Main Countdown dashboard */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full my-auto py-2">

        {!isEnded ? (

          // --- ACTIVE LIVE TIMER STATE ---
          <div className="w-full space-y-4 sm:space-y-6 text-center">

            {/* Event Title + Round Status */}
            <div className="space-y-3">

              {/* HACK 'N' CLASH */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.12em] font-display brand-gradient-text glow-text uppercase select-none">
                HACK 'N' CLASH
              </h1>

              {/* Round Live Status */}
              <div className="flex items-center justify-center gap-2.5">

                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>

                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>

                <h2 className="text-lg sm:text-2xl font-bold tracking-[0.2em] font-display text-cyber-live uppercase select-none">
                  ROUND 1 IS LIVE
                </h2>

              </div>

              {/* Deadline */}
              <p className="text-xs sm:text-sm font-mono text-cyber-muted tracking-widest uppercase">
                deadline ends on 30 August 2026 (IST)
              </p>

            </div>

            {/* 3D Calendar Flip-Card Countdown */}
            <div className="w-full">
              <CountdownTimer
                secondsRemaining={secondsRemaining}
                isRevealing={isRevealing}
              />
            </div>

          </div>

        ) : (

          // --- ENDED STATE ---
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl bg-cyber-card/95 backdrop-blur-md border border-amber-300/60 p-8 sm:p-12 rounded-2xl glow-box-ended shadow-2xl text-center space-y-8"
          >

            <div className="space-y-3">

              <div className="text-cyber-ended font-display font-semibold tracking-[0.25em] text-sm uppercase">
                Round 1 Complete
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-cyber-ink glow-text-ended font-display">
                ROUND 1 HAS ENDED
              </h2>

              <p className="text-xs sm:text-sm text-cyber-muted font-mono">
                Official deadline reached. All online submissions are now locked.
              </p>

            </div>

            {/* Separator line */}
            <div className="w-full h-[1px] bg-cyber-border" />

            {/* Future Round 2 Offline Placeholder */}
            <div className="p-6 bg-cyber-bg border border-cyber-border rounded-xl text-left space-y-3">

              <h3 className="text-sm font-bold tracking-wider text-cyber-accent uppercase font-mono">
                WHAT'S NEXT? &bull; ROUND 2
              </h3>

              <p className="text-xs text-cyber-muted leading-relaxed font-sans">
                Thank you to all participants for competing in Round 1.
                Evaluated qualifiers will be notified via email for the
                offline **Round 2 (Offline Battle)** commencing on
                **12 September 2026** at the college campus.
              </p>

            </div>

          </motion.div>

        )}

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-4 select-none">

        <p className="text-[10px] text-cyber-muted tracking-widest font-mono uppercase">
          HACK 'N' CLASH Coding Contest &bull; SRKREC CSI STUDENT BRANCH in assoc. with Dept. of Information Technology
        </p>

      </footer>

    </div>
  );
}