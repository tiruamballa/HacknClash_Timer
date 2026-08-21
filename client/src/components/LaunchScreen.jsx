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
export function LaunchScreen({ onLaunchSuccess, stage, setStage }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [muted, setMuted] = useState(getMuteState());

  const handleMuteToggle = () => {
    const newState = !muted;
    setMuted(newState);
    setMuteState(newState);
  };

  const triggerIgnition = async () => {
    if (stage !== 'idle') return;

    setStage('charging');
    setErrorMessage('');
    
    // 1. Play Web Audio API synthesizer riser & meteor rumble immediately
    playRiserAndBoom();

    // 2. Start API request concurrently
    let apiSuccess = false;
    let apiData = null;
    let apiErrorMsg = '';

    const apiPromise = api.startRound()
      .then((data) => {
        apiSuccess = true;
        apiData = data;
      })
      .catch((err) => {
        apiSuccess = false;
        apiErrorMsg = err.message || 'Failed to start Round 1. Please try again.';
      });

    // 3. Minimum duration for Phase 1 meteor streak visual (~2200ms)
    const meteorDelay = new Promise((resolve) => setTimeout(resolve, 2200));

    try {
      await Promise.all([apiPromise, meteorDelay]);

      if (apiSuccess && apiData) {
        // 4. API Success -> Trigger Phase 2 shockwave & screen shake stage (~1800ms)
        setStage('shockwave');
        
        await new Promise((resolve) => setTimeout(resolve, 1800));
        
        // 5. Swap page to live countdown with flip-reveal
        onLaunchSuccess(apiData);
      } else {
        throw new Error(apiErrorMsg);
      }
    } catch (err) {
      console.error('[IGNITION ERROR]', err);
      setErrorMessage(err.message || 'Network error occurred.');
      setStage('error');
      
      setTimeout(() => {
        setStage('idle');
      }, 4000);
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
        <header className="w-full flex justify-center mt-1 sm:mt-2 select-none px-2">
          <EventBranding />
        </header>

        {/* Hero Display Elements */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl px-4 select-none my-auto py-2">
          {/* Main Event Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-display brand-gradient-text glow-text mb-2 select-none">
            HACK 'N' CLASH
          </h1>
          
          {/* Round Tagline */}
          <p className="text-xs sm:text-base tracking-[0.3em] font-semibold text-cyber-muted uppercase font-sans mb-4">
            ROUND 1: OPEN BOOK &bull; ONLINE
          </p>

          {/* Short Loop Tagline */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-mono tracking-widest text-cyber-accent bg-cyber-accent/5 px-3.5 py-1.5 rounded-full border border-cyber-accent/15">
            <span>CODE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent/50" />
            <span>CLASH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent/50" />
            <span>CONQUER</span>
          </div>
        </div>

        {/* Trigger Button Section */}
        <div className="w-full max-w-md flex flex-col items-center gap-3 mb-2 sm:mb-4 z-20">
          <div className="relative">
            {/* Pulsing Outer Glow Ring */}
            {stage === 'idle' && !prefersReducedMotion && (
              <div className="absolute inset-0 bg-cyber-accent/25 blur-xl rounded-full scale-110 animate-ping pointer-events-none" />
            )}

            {/* Ignition Button */}
            <button
              onClick={triggerIgnition}
              disabled={stage === 'charging' || stage === 'shockwave'}
              className={`px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold text-base sm:text-lg tracking-[0.18em] font-display uppercase border transition-all duration-300 shadow-2xl relative min-w-[240px] sm:min-w-[280px] ${
                stage === 'idle'
                  ? 'bg-cyber-accent border-cyber-accent text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 cursor-pointer shadow-indigo-600/30'
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
                  <span>COMPILING IGNITION...</span>
                </>
              )}
              {stage === 'shockwave' && 'IGNITING LIVE SYSTEM'}
              {stage === 'error' && 'START ROUND 1'}
            </button>
          </div>

          {/* Error message handling */}
          {errorMessage && (
            <div className="text-cyber-live text-xs sm:text-sm font-semibold tracking-wide bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-lg text-center animate-[bounce_1s_infinite]">
              {errorMessage}
            </div>
          )}

          <div className="text-cyber-muted text-[10px] tracking-widest font-mono uppercase">
            Inaugural Launch Portal &bull; SRKREC CSI
          </div>
        </div>
      </motion.div>
    </div>
  );
}

