/**
 * Calculates remaining days, hours, minutes, and seconds from total remaining seconds.
 * @param {number} totalSeconds 
 * @returns {object} { days, hours, minutes, seconds } padded strings
 */
export function formatTimeRemaining(totalSeconds) {
  if (totalSeconds <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

/**
 * Safely parses an ISO date string and returns its Unix timestamp in milliseconds.
 * Returns 0 if invalid.
 * @param {string} dateStr 
 * @returns {number} Timestamp in ms
 */
export function parseDateToMs(dateStr) {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
}
