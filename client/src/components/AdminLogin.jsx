import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Loader2 } from 'lucide-react';

export function AdminLogin({ isOpen, onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      await onLogin(password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Incorrect passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-ink/40 backdrop-blur-md">
          {/* Backdrop click dismiss */}
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-sm bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl p-6 relative z-10"
          >
            {/* Close Cross */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cyber-muted hover:text-cyber-ink rounded-lg hover:bg-cyber-bg p-1 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-6 select-none">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 text-cyber-accent rounded-xl flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight font-display text-cyber-ink">ADMIN ACCESS</h2>
              <p className="text-xs text-cyber-muted font-mono mt-1">Key in authorization credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cyber-bg border border-cyber-border focus:border-cyber-accent rounded-lg text-cyber-ink font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyber-accent transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-cyber-live text-xs font-semibold tracking-wide bg-rose-50 border border-rose-200 p-2 rounded text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyber-accent hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <span>AUTHENTICATE</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
