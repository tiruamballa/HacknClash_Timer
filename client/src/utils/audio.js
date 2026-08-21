// Web Audio API Synthesizer for Ignition sound effects
// Does not auto-play. Requires user interaction (clicking START ROUND 1).

let isMuted = false;

export function setMuteState(muted) {
  isMuted = muted;
  try {
    localStorage.setItem('hnv_mute_audio', muted ? 'true' : 'false');
  } catch (e) {
    // Ignore storage blocker
  }
}

export function getMuteState() {
  try {
    const val = localStorage.getItem('hnv_mute_audio');
    if (val !== null) {
      isMuted = val === 'true';
    }
  } catch (e) {
    // Ignore storage blocker
  }
  return isMuted;
}

/**
 * Synthesizes a riser and an explosion boom using lowpass filters, oscillators, and gain ramps.
 */
export function playRiserAndBoom() {
  if (getMuteState()) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // --- STAGE 1: THE RISER (1.0 second duration) ---
    const riserOsc = ctx.createOscillator();
    const riserGain = ctx.createGain();
    const riserFilter = ctx.createBiquadFilter();
    
    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note (low rumble)
    riserOsc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 1.0); // sweep up
    
    riserGain.gain.setValueAtTime(0.001, ctx.currentTime);
    riserGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.9);
    riserGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 1.0); // cut off
    
    riserFilter.type = 'lowpass';
    riserFilter.frequency.setValueAtTime(150, ctx.currentTime);
    riserFilter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 1.0);
    
    riserOsc.connect(riserGain);
    riserGain.connect(riserFilter);
    riserFilter.connect(ctx.destination);
    
    riserOsc.start(ctx.currentTime);
    riserOsc.stop(ctx.currentTime + 1.0);
    
    // --- STAGE 2: THE SUB-BASS BOOM (Triggered at 1.0s) ---
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    const boomFilter = ctx.createBiquadFilter();
    
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(100, ctx.currentTime + 1.0);
    boomOsc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 2.5); // sub drop
    
    boomGain.gain.setValueAtTime(0.0, ctx.currentTime);
    boomGain.gain.setValueAtTime(0.35, ctx.currentTime + 1.02); // strike/attack
    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.6); // decay
    
    boomFilter.type = 'lowpass';
    boomFilter.frequency.setValueAtTime(130, ctx.currentTime + 1.0);
    
    // Secondary kick click for high-mid definition
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(180, ctx.currentTime + 1.0);
    clickOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.15);
    
    clickGain.gain.setValueAtTime(0.0, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.25, ctx.currentTime + 1.0);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    
    boomOsc.connect(boomGain);
    boomGain.connect(boomFilter);
    boomFilter.connect(ctx.destination);
    
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    
    boomOsc.start(ctx.currentTime + 1.0);
    boomOsc.stop(ctx.currentTime + 2.7);
    
    clickOsc.start(ctx.currentTime + 1.0);
    clickOsc.stop(ctx.currentTime + 1.25);
    
  } catch (err) {
    console.error("Web Audio API Synthesis failed:", err);
  }
}
