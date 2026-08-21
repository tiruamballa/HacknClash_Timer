import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, LogOut, RotateCcw, Play, Calendar, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export function AdminPanel({ isOpen, onClose, status, startedAt, endsAt, onStateChange, onLogout }) {
  const [newDeadline, setNewDeadline] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'start' | 'reset' | 'deadline' | null
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize input fields with endsAt prop when panel is opened
  useEffect(() => {
    if (endsAt) {
      // Convert endsAt (UTC/ISO) to naive local format YYYY-MM-DDTHH:MM for datetime-local picker
      // We represent the target in the target timezone (IST - UTC+5:30)
      const date = new Date(endsAt);
      // IST adjustment (add 5.5 hours to date object to construct datetime picker string)
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(date.getTime() + istOffsetMs);
      const isoStr = istDate.toISOString(); // "YYYY-MM-DDTHH:MM:SS.sssZ"
      setNewDeadline(isoStr.slice(0, 16)); // "YYYY-MM-DDTHH:MM"
    }
  }, [endsAt, isOpen]);

  const handleStartRound = async () => {
    setActionLoading('start');
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await api.startRound();
      onStateChange(data);
      setSuccessMsg('Round 1 is now LIVE!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start round');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetRound = async () => {
    setActionLoading('reset');
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await api.resetRound();
      onStateChange(data);
      setSuccessMsg('Round 1 has been reset to READY state.');
      setShowResetConfirm(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset round');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveDeadline = async (e) => {
    e.preventDefault();
    if (!newDeadline) return;

    setActionLoading('deadline');
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Parse Naive picker string (YYYY-MM-DDTHH:MM) as IST representation.
      // E.g. YYYY-MM-DDTHH:MM:00+05:30
      const targetIsoString = `${newDeadline}:00+05:30`;
      
      const data = await api.setEndTime(targetIsoString);
      onStateChange(data);
      setSuccessMsg('Deadline updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update deadline');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return 'Not started yet';
    const date = new Date(isoStr);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }) + ' (IST)';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-ink/40 backdrop-blur-md">
          {/* Backdrop click dismiss */}
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl p-6 relative z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-6 select-none">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyber-accent" />
                <h2 className="text-xl font-bold tracking-tight font-display text-cyber-ink">HACK 'N' CLASH &bull; ADMIN</h2>
              </div>
              <button
                onClick={onClose}
                className="text-cyber-muted hover:text-cyber-ink rounded-lg hover:bg-cyber-bg p-1 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 p-3 rounded-lg text-cyber-live text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Status Summary Panel */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded-xl">
                <span className="text-[10px] text-cyber-muted font-bold uppercase tracking-wider font-mono">Contest Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    status === 'LIVE' ? 'bg-rose-500 animate-pulse' : status === 'ENDED' ? 'bg-amber-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm font-bold text-cyber-ink font-mono">{status}</span>
                </div>
              </div>
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded-xl">
                <span className="text-[10px] text-cyber-muted font-bold uppercase tracking-wider font-mono">Trigger Time</span>
                <div className="text-xs font-semibold text-cyber-ink mt-1 truncate" title={formatTimestamp(startedAt)}>
                  {startedAt ? formatTimestamp(startedAt).split(' (')[0] : 'Ready state'}
                </div>
              </div>
            </div>

            {/* Deadline Form */}
            <form onSubmit={handleSaveDeadline} className="p-4 bg-cyber-bg border border-cyber-border rounded-xl space-y-4 mb-6">
              <div className="flex items-center gap-2 text-cyber-accent">
                <Calendar className="w-4 h-4" />
                <h3 className="text-sm font-bold tracking-wider font-mono uppercase">Round 1 Deadline</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] text-cyber-muted font-semibold uppercase tracking-wider font-mono">
                    Date & Time (IST / Asia/Kolkata)
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cyber-border focus:border-cyber-accent rounded-lg text-cyber-ink font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyber-accent transition-all [color-scheme:light]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading === 'deadline'}
                  className="px-5 py-2 bg-cyber-accent hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold rounded-lg transition-all shadow-md shrink-0 flex items-center gap-1.5 h-[38px] w-full sm:w-auto justify-center"
                >
                  {actionLoading === 'deadline' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>UPDATE DEADLINE</span>
                  )}
                </button>
              </div>
            </form>

            {/* State Management Buttons */}
            <div className="space-y-3 border-t border-cyber-border pt-6">
              {/* Start Button */}
              {status === 'READY' && (
                <button
                  onClick={handleStartRound}
                  disabled={actionLoading !== null}
                  className="w-full py-3 bg-cyber-live hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-bold tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-rose-600/20 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'start' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>START ROUND 1 LIVE</span>
                    </>
                  )}
                </button>
              )}

              {/* Reset Button & Confirmation Card */}
              {status !== 'READY' && (
                <div className="w-full">
                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      disabled={actionLoading !== null}
                      className="w-full py-3 bg-cyber-bg hover:bg-indigo-50 text-cyber-ink hover:text-cyber-accent border border-cyber-border hover:border-cyber-accent/40 active:scale-[0.98] text-sm font-bold tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>RESET ROUND 1</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-4 animate-[fadeIn_0.3s_ease-out]">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-cyber-live tracking-wider font-mono uppercase">CRITICAL ACTION</h4>
                        <p className="text-xs text-cyber-muted leading-relaxed font-sans">
                          Are you sure you want to reset Round 1? This will clear the trigger timestamp and return the site to pre-start status. The deadline is kept unchanged.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 py-2.5 bg-cyber-bg hover:bg-indigo-50 border border-cyber-border text-cyber-ink rounded-lg text-xs font-bold transition-all uppercase"
                        >
                          CANCEL
                        </button>
                        <button
                          type="button"
                          onClick={handleResetRound}
                          disabled={actionLoading === 'reset'}
                          className="flex-1 py-2.5 bg-cyber-live hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-1"
                        >
                          {actionLoading === 'reset' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>RESET ROUND</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Logout and Close controls */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={onLogout}
                  className="flex-1 py-2.5 bg-cyber-bg hover:bg-indigo-50 border border-cyber-border text-cyber-muted hover:text-cyber-accent rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOGOUT</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-cyber-bg hover:bg-indigo-50 border border-cyber-border text-cyber-ink rounded-lg text-xs font-bold transition-all uppercase"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
