import { useState, useEffect, useRef } from 'react';
import { useRoundStatus } from './hooks/useRoundStatus';
import { useServerTime } from './hooks/useServerTime';
import { api } from './services/api';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SpaceIgnition } from './components/SpaceIgnition';
import { LaunchScreen } from './components/LaunchScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { Settings, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playRiserAndBoom } from './utils/audio';

function App() {
  const { status, startedAt, endsAt, serverTime, loading, error, isOffline, refetch, setData } = useRoundStatus();
  const secondsRemaining = useServerTime(serverTime, endsAt);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [hasPlayedInauguration, setHasPlayedInauguration] = useState(false);

  // Drives the single, app-wide space canvas: 'idle' | 'charging' | 'shockwave' | 'error'.
  const [ignitionStage, setIgnitionStage] = useState('idle');

  // Check admin session validation on startup
  useEffect(() => {
    const checkSession = async () => {
      const valid = await api.verifyAdmin();
      setIsAdminAuthenticated(valid);
    };
    checkSession();
  }, []);

  // Multi-device synchronized star falling inauguration trigger
  useEffect(() => {
    if (status === 'READY') {
      setHasPlayedInauguration(false);
      setIgnitionStage('idle');
      return;
    }

    const isFreshLive = status === 'LIVE' && startedAt && (Date.now() - new Date(startedAt).getTime() < 12000);

    if (isFreshLive && !hasPlayedInauguration && ignitionStage === 'idle') {
      setHasPlayedInauguration(true);
      triggerInauguralAnimation();
    }
  }, [status, startedAt]);

  const triggerInauguralAnimation = (updatedStateData) => {
    // 1. Play Web Audio API sound & start star falling sequence on event name
    setIgnitionStage('charging');
    playRiserAndBoom();

    // 2. After 2200ms, star impacts event name -> shockwave explosion & confetti burst
    setTimeout(() => {
      setIgnitionStage('shockwave');
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { x: 0.5, y: 0.4 } // Centered directly on event title!
      });

      // 3. After 1500ms, shockwave settles -> mount CountdownScreen & play Vending Machine Digit Roll-Up!
      setTimeout(() => {
        setIgnitionStage('idle');
        if (updatedStateData) {
          setData(updatedStateData);
        }
        setIsRevealing(true); // Triggers 3D Vending Machine / Slot Machine Digit Roll-Up reveal!

        setTimeout(() => {
          setIsRevealing(false);
        }, 3600);
      }, 1500);
    }, 2200);
  };

  // Handle admin gear click
  const handleAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  // Callback on successful admin verification login
  const handleLoginSuccess = async (password) => {
    const data = await api.login(password);
    if (data.token) {
      setIsAdminAuthenticated(true);
      setIsAdminPanelOpen(true);
    }
  };

  // Callback on admin logout
  const handleLogout = () => {
    api.logout();
    setIsAdminAuthenticated(false);
    setIsAdminPanelOpen(false);
  };

  // Triggered when Admin clicks START ROUND 1 on the LaunchScreen or AdminPanel
  const handleStartLaunch = async () => {
    if (ignitionStage !== 'idle') return;

    try {
      setHasPlayedInauguration(true);
      setIgnitionStage('charging');
      playRiserAndBoom();

      // Call startRound API concurrently
      const apiData = await api.startRound();

      // Phase 1: Falling Star trajectory (2200ms)
      setTimeout(() => {
        // Phase 2: Shockwave explosion & confetti burst (1500ms)
        setIgnitionStage('shockwave');
        confetti({
          particleCount: 180,
          spread: 90,
          origin: { x: 0.5, y: 0.4 }
        });

        // Phase 3: Transition to CountdownScreen & start Vending Machine Digit Roll-Up!
        setTimeout(() => {
          setIgnitionStage('idle');
          setData(apiData);
          setIsRevealing(true); // Triggers slot machine / vending machine digit roll-up!

          setTimeout(() => {
            setIsRevealing(false);
          }, 3600);
        }, 1500);
      }, 2200);
    } catch (err) {
      console.error('[IGNITION START ERROR]', err);
      setIgnitionStage('idle');
      setHasPlayedInauguration(false);
    }
  };

  // Callback when status is altered from admin panel (start, reset, update deadline)
  const handleAdminStateChange = (updatedState) => {
    if (updatedState.triggerLaunch) {
      handleStartLaunch();
    } else if (updatedState.status === 'LIVE') {
      setHasPlayedInauguration(true);
      triggerInauguralAnimation(updatedState);
    } else {
      setData(updatedState);
    }
  };

  return (
    <ErrorBoundary>
      {/* Persistent solar-system space scene: starfield, sun, orbiting planets,
          and (during launch) the meteor/shockwave ignition sequence. Mounted
          once here so it never resets or flickers as screens change. */}
      <SpaceIgnition stage={ignitionStage} />

        <div className="relative min-h-screen">
          {/* Main Content Router: Keep LaunchScreen mounted until inauguration animation completes */}
          {status === 'READY' || ignitionStage === 'charging' || ignitionStage === 'shockwave' ? (
            <LaunchScreen
              stage={ignitionStage}
              setStage={setIgnitionStage}
              isAdminAuthenticated={isAdminAuthenticated}
              onStartLaunch={handleStartLaunch}
            />
          ) : (
            <CountdownScreen
              status={status}
              endsAt={endsAt}
              secondsRemaining={secondsRemaining}
              isOffline={isOffline}
              isRevealing={isRevealing}
            />
          )}


          {/* Unobtrusive Fixed Admin Trigger (Bottom-Right Gear) */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={handleAdminTrigger}
              className="p-3 bg-white/80 border border-cyber-border text-cyber-muted hover:text-cyber-accent rounded-full transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm cursor-pointer hover:rotate-45"
              title="Admin Portal Settings"
              aria-label="Admin settings panel"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Passcode Modal */}
          <AdminLogin
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onLogin={handleLoginSuccess}
          />

          {/* Admin Management Dashboard Panel */}
          <AdminPanel
            isOpen={isAdminPanelOpen}
            onClose={() => setIsAdminPanelOpen(false)}
            status={status}
            startedAt={startedAt}
            endsAt={endsAt}
            onStateChange={handleAdminStateChange}
            onLogout={handleLogout}
          />
        </div>
    </ErrorBoundary>
  );
}

export default App;
