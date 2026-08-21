const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '5174')
    ? 'http://localhost:5000'
    : ''
);

/**
 * Helper to execute fetch requests with JSON parsing and standardized error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  // Attach content type and token if available
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('hnv_admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.error) {
        errorMessage = errBody.error;
      }
    } catch (e) {
      // Ignore body parse errors on text errors
    }
    const err = new Error(errorMessage);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  /**
   * Fetches the current round status and server time.
   */
  async getStatus() {
    return apiRequest('/api/round/status');
  },

  /**
   * Triggers the round start (used on the public button and admin start).
   */
  async startRound() {
    return apiRequest('/api/round/start', { method: 'POST' });
  },

  /**
   * Submits passcode to authenticate as administrator.
   */
  async login(password) {
    const data = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (data.token) {
      localStorage.setItem('hnv_admin_token', data.token);
    }
    return data;
  },

  /**
   * Resets the round state to READY.
   */
  async resetRound() {
    return apiRequest('/api/admin/reset', { method: 'POST' });
  },

  /**
   * Configures a new deadline target.
   */
  async setEndTime(endsAtStr) {
    return apiRequest('/api/admin/set-end-time', {
      method: 'POST',
      body: JSON.stringify({ endsAt: endsAtStr }),
    });
  },

  /**
   * Verifies if local token is still valid.
   */
  async verifyAdmin() {
    try {
      const data = await apiRequest('/api/admin/verify');
      return data.valid === true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Returns the URL for Server-Sent Events real-time stream.
   */
  getEventsUrl() {
    return `${API_BASE}/api/round/events`;
  },

  /**
   * Clears the admin token from local storage.
   */
  logout() {
    localStorage.removeItem('hnv_admin_token');
  }
};
