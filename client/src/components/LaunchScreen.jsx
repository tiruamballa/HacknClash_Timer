import { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { playRiserAndBoom, getMuteState, setMuteState } from '../utils/audio';
import { EventBranding } from './EventBranding';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

// Note: the space/solar-system canvas itself is mounted once at the App level
// (see App.jsx -> <SpaceIgnition stage={ignitionStage} />) so the same scene
// persists behind the countdown and ended screens. This component only owns
// the foreground UI and drives that shared canvas via the `stage`/`setStage`
// props passed down from App.
export function LaunchScreen({ onLaunchSuccess, stage, setStage, isAdminAuthenticated, onStartLaunch }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [muted, setMuted] = useState(getMuteState());

  const handleMuteToggle = () => {
    const newState = !muted;
    setMuted(newState);
    setMuteState(newState);
  };

  const handleStartButtonClick = () => {
    if (stage !== 'idle') return;
    if (onStartLaunch) {
      onStartLaunch();
    }
  };

  // Accessibility check
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden">
      <motion.div
        animate={stage === 'shockwave' && !prefersReducedMotion ? {
          x: [0, -15, 15, -10, 10, -5, 5, 0],
          y: [0, 10, -10, 6, -6, 3, -3, 0],
          rotate: [0, -1.2, 1.2, -0.6, 0.6, 0, 0, 0]
        } : {}}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        className={`min-h-screen w-full flex flex-col justify-between items-center py-2 sm:py-4 px-2 sm:px-4 relative transition-all duration-700 ${
          stage === 'charging' ? 'bg-cyber-ink/30 backdrop-blur-[2px]' : 'bg-transparent'
        }`}
      >
        {/* Mute/Unmute Audio Button */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={handleMuteToggle}
            className="p-2.5 bg-white/80 hover:bg-white active:scale-95 text-cyber-muted hover:text-cyber-accent rounded-full border border-cyber-border transition-all backdrop-blur-md shadow-lg cursor-pointer"
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Header Organizer Info */}
        <header className="w-full flex justify-center mt-1 select-none px-2">
          <EventBranding />
        </header>

        {/* Hero Display Elements */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl px-4 select-none my-auto py-1 space-y-2 sm:space-y-3">
          {/* Main Event Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight font-display brand-gradient-text glow-text select-none">
            HACK 'N' CLASH
          </h1>
          
          {/* Round Tagline */}
          <p className="text-xs sm:text-base md:text-lg tracking-[0.3em] font-bold text-cyber-muted uppercase font-sans">
            ROUND 1: OPEN BOOK &bull; ONLINE
          </p>

          {/* Short Loop Tagline */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono tracking-widest text-cyber-accent bg-cyber-accent/10 px-4 py-1.5 rounded-full border border-cyber-accent/25 shadow-sm">
            <span>CODE</span>
            <span className="w-2 h-2 rounded-full bg-cyber-accent" />
            <span>CLASH</span>
            <span className="w-2 h-2 rounded-full bg-cyber-accent" />
            <span>CONQUER</span>
          </div>
        </div>

        {/* Bottom Section: Show Start Button if Admin Authenticated; otherwise show Vibrant Highlighted Awaiting Badge */}
        <div className="w-full max-w-md flex flex-col items-center gap-2 mb-2 sm:mb-3 z-20">
          {isAdminAuthenticated ? (
            <div className="relative">
              {/* Pulsing Outer Glow Ring */}
              {stage === 'idle' && !prefersReducedMotion && (
                <div className="absolute inset-0 bg-cyber-accent/30 blur-xl rounded-full scale-110 animate-ping pointer-events-none" />
              )}

              {/* Ignition Button (Displayed on page after admin login) */}
              <button
                onClick={handleStartButtonClick}
                disabled={stage === 'charging' || stage === 'shockwave'}
                className={`px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold text-base sm:text-lg tracking-[0.18em] font-display uppercase border transition-all duration-300 shadow-2xl relative min-w-[240px] sm:min-w-[280px] ${
                  stage === 'idle'
                    ? 'bg-cyber-accent border-cyber-accent text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 cursor-pointer shadow-indigo-600/40'
                    : stage === 'charging'
                    ? 'bg-white border-cyber-border text-cyber-muted select-none shadow-md flex items-center justify-center gap-3'
                    : stage === 'shockwave'
                    ? 'bg-cyber-mint border-cyber-mint text-white select-none'
                    : 'bg-cyber-accent border-cyber-accent text-white'
                }`}
              >
                {stage === 'idle' && 'START ROUND 1'}
                {stage === 'charging' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyber-accent" />
                    <span>FALLING STAR IGNITION...</span>
                  </>
                )}
                {stage === 'shockwave' && 'INAUGURAL IMPACT!'}
                {stage === 'error' && 'START ROUND 1'}
              </button>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              {/* Pulsing Ambient Glow Ring */}
              {!prefersReducedMotion && (
                <div className="absolute inset-0 bg-indigo-600/35 blur-xl rounded-full scale-125 animate-pulse pointer-events-none" />
              )}

              {/* Highlighted Glowing Badge for Normal Users (Matches Start Button Color) */}
              <div className={`px-7 py-3.5 sm:px-9 sm:py-4 rounded-full font-extrabold text-xs sm:text-sm tracking-[0.2em] font-mono uppercase border-2 transition-all duration-500 shadow-2xl relative backdrop-blur-md flex items-center gap-3 ${
                stage === 'charging'
                  ? 'bg-cyber-ink border-cyber-accent text-cyber-accent scale-105 shadow-cyber-accent/40'
                  : stage === 'shockwave'
                  ? 'bg-cyber-mint border-cyber-mint text-white scale-110 shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-indigo-600 via-cyber-accent to-purple-600 border-indigo-300/40 text-white shadow-indigo-600/40'
              }`}>
                {stage === 'charging' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyber-accent" />
                    <span>STAR FALLING ON EVENT NAME...</span>
                  </>
                ) : stage === 'shockwave' ? (
                  <span>INAUGURAL CELESTIAL IMPACT!</span>
                ) : (
                  <>
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                    </span>
                    <span>AWAITING INAUGURAL START</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error message handling */}
          {errorMessage && (
            <div className="text-cyber-live text-xs sm:text-sm font-semibold tracking-wide bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-lg text-center animate-[bounce_1s_infinite]">
              {errorMessage}
            </div>
          )}

          <div className="text-cyber-muted text-[10px] sm:text-xs tracking-widest font-mono uppercase text-center mt-1">
            Inaugural Launch Portal &bull; Department of IT &bull; SRKREC CSI
          </div>
        </div>
      </motion.div>
    </div>
  );
}

