# HACK 'N' CLASH — Launch & Countdown Portal

Official event-launch and synchronized countdown portal for the **HACK 'N' CLASH** coding contest organized by the **SRKREC CSI Student Branch**.

Designed for display on a projector during the live inauguration event, the portal features a choreographed "ignition sequence" that officially kicks off the contest, transition to a synchronized countdown, and has a secure hidden admin dashboard.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
You can install both client and server dependencies with a single command from the root folder:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy the template `.env.example` in the `server` directory and rename it to `.env`:
```bash
cp server/.env.example server/.env
```
Inside `server/.env`, verify the following details:
- `PORT`: Port to run the server on (default: `5000`).
- `JWT_SECRET`: A secure key for JWT tokens.
- `DEFAULT_ENDS_AT`: Default competition deadline ISO-8601 string (IST: `2026-08-30T23:59:59+05:30`).
- `ADMIN_PASSWORD_HASH`: Hashed password using bcrypt (default represents password `tiru1002`).

### 3. Run Development Servers
Start both the React (Vite) client and Express server concurrently:
```bash
npm run dev
```
- Frontend will open at `http://localhost:5173`
- Backend runs on `http://localhost:5000`

---

## 🛠️ Production Build & Single Server Run

To bundle the frontend assets and run the application from a single unified server port:

1. Build the frontend client:
   ```bash
   npm run build
   ```
2. Start the Express server:
   ```bash
   npm start
   ```
The portal will be hosted entirely on `http://localhost:5000` (serving both backend APIs and React frontend assets).

---

## 🖥️ Live Event Operation Manual

### Pre-Start Phase (`status = READY`)
- **Displaying on Projector:** Open the website full-screen (`F11` in browser). The screen features logo entrances, typing headings, and a breathing **START ROUND 1** button.
- **Audio Prep:** Ensure speaker volume is configured. A speaker icon is available at the top-right corner to toggle audio muting.
- **Ignition:** The authorized guest clicks the **START ROUND 1** button.
  1. The button triggers an immediate scale down.
  2. The screen dims, and a rising sound riser plays to build tension.
  3. A full-screen shockwave ring expands, accompanied by a brief camera shake and sub-bass impact sound.
  4. Confetti explodes, and the screen transitions smoothly to the live countdown timer.

### Live Countdown Phase (`status = LIVE`)
- **Synchronized Clocks:** Multiple clients (projector, participant laptops, phones) poll the backend server every 10 seconds. The countdown automatically synchronizes with the server time (compensating for client-side local clock drift).
- **Odometer animations:** Numbers slide up and down on change to feel mechanical and clean.
- **Urgency states:**
  - `> 24 hours remaining`: Indigo borders, white digits, calm breathing badge.
  - `1 to 24 hours remaining`: Amber warning text, faster pulsing badge.
  - `< 1 hour remaining`: Crimson flashing text, rapid flashing critical badge.
- **Roll Rollover Pulse:** On every full-minute rollover, the countdown clock executes a slight spring-scale pulse to highlight the passing of time on the projector.

### Admin Dashboard Control
- **Accessing:** Hover over the bottom-right corner of the screen to reveal a low-opacity gear (`⚙`) icon.
- **Authentication:** Click the gear to open the passcode modal. Enter the passcode (default: `tiru1002`).
- **Throttling:** Incorrect passcodes will lockout the IP for 15 minutes after 5 consecutive failures.
- **Adjusting Deadlines:** Use the datetime-local picker in the admin dashboard (clearly marked **IST**). When updated, it automatically parses and syncs the new UTC timestamp to the server database.
- **Resetting Round:** Click the reset button and confirm in the alert warning card. Once confirmed, the database state resets to `READY`, and the projector/all visitor tabs will return to the Pre-Start inauguration screen within 10 seconds without manual refreshes.

---

## 🔒 Deployment and Persistence Details

- **Storage Type:** The application saves state using an atomic, single-process JSON mutex writer in `/server/data/db.json` and writes admin action logs to `/server/data/audit.log`.
- **Target Host:** Designed for standard VPS deployments (e.g., DigitalOcean, AWS EC2) or persistent container hosts (e.g., Render/Railway configured with a persistent disk mount at `/server/data`).
- **ephemeral platforms warning:** If deploying to serverless platforms (e.g., Vercel, AWS Lambda), the local filesystem is ephemeral; a remote database configuration (e.g., MongoDB/PostgreSQL) should be plugged in to prevent resetting states on cold boot.

---

## 🎨 Official Assets (Logos)
The logo files are loaded directly from the React build assets using standard Vite bundles:
- `client/src/assets/clg_name_and_logo.avif` (College Logo & Text Banner)
- `client/src/assets/csi_logo.jpeg` (CSI Student Branch Crest Logo)

To update the branding, replace these files directly inside `client/src/assets/` while keeping the same filenames.
