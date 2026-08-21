import { useState, useEffect } from 'react';
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

function App() {
  const { status, startedAt, endsAt, serverTime, loading, error, isOffline, refetch, setData } = useRoundStatus();
  const secondsRemaining = useServerTime(serverTime, endsAt);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Drives the single, app-wide space canvas: 'idle' | 'charging' | 'shockwave' | 'error'.
  // Lifted up from LaunchScreen so the same solar-system scene (sun, orbiting
  // planets, starfield) persists behind the countdown and ended screens too,
  // instead of the space theme disappearing once Round 1 goes live.
  const [ignitionStage, setIgnitionStage] = useState('idle');

  // Check admin session validation on startup
  useEffect(() => {
    const checkSession = async () => {
      const valid = await api.verifyAdmin();
      setIsAdminAuthenticated(valid);
    };
    checkSession();
  }, []);

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

  // Callback from LaunchScreen ignition success
  const handleLaunchSuccess = (updatedData) => {
    // 1. Instantly trigger confetti explosion centered on the screen
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // 2. Trigger initial calendar page-flip reveal sequence (~3.5s)
    setIsRevealing(true);
    setTimeout(() => {
      setIsRevealing(false);
    }, 4200);

    // Settle the background canvas back to calm ambient (sun + orbiting
    // planets, no meteor/shockwave) now that the countdown is taking over.
    setIgnitionStage('idle');

    // 3. Update local state immediately to avoid API poll delay visual lag
    setData({
      status: updatedData.status,
      startedAt: updatedData.startedAt,
      endsAt: updatedData.endsAt,
      serverTime: updatedData.serverTime
    });
  };

  // Callback when status is altered from admin panel (start, reset, update deadline)
  const handleAdminStateChange = (updatedState) => {
    if (updatedState.status === 'LIVE' && status === 'READY') {
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 4200);
    }
    setData(updatedState);
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
              onLaunchSuccess={handleLaunchSuccess}
              stage={ignitionStage}
              setStage={setIgnitionStage}
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
