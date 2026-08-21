import srkrLogo from '../assets/srkr_logo.jpg';
import csiLogo from '../assets/csi_logo.jpeg';
import iicLogo from '../assets/iic_logo.png';

/**
 * Renders official event branding: IIC (left), SRKR (center), CSI (right).
 * Uses strictly valid, rigid pixel bounds to prevent image expansion on mobile screens.
 */
export function EventBranding() {
  return (
    <div className="w-full flex flex-col items-center select-none">

      {/* Main Header Box */}
      <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 bg-white/95 backdrop-blur-md rounded-2xl border border-cyber-border shadow-lg overflow-hidden">

        {/* 3-Logos Row */}
        <div className="w-full flex flex-row items-center justify-between gap-1.5 sm:gap-4 overflow-hidden">

          {/* IIC LOGO - LEFT */}
          <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border border-cyber-border shadow-sm flex items-center justify-center bg-white p-1">
            <img
              src={iicLogo}
              alt="Institution's Innovation Council Logo"
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>

          {/* SRKR COLLEGE LOGO + TEXT - CENTER */}
          <div className="flex-1 flex flex-row items-center justify-center gap-1.5 sm:gap-3 bg-cyber-accent/5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-cyber-accent/15 min-w-0 overflow-hidden">
            
            {/* College Logo */}
            <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border border-cyber-accent/30 shadow-sm flex items-center justify-center bg-white p-0">
              <img
                src={srkrLogo}
                alt="SRKR Engineering College Logo"
                className="w-full h-full object-cover scale-110"
              />
            </div>

            {/* Text beside logo */}
            <div className="text-left select-none min-w-0 flex-1">
              <h2 className="text-xs sm:text-lg md:text-xl font-extrabold tracking-wide font-display text-cyber-ink leading-tight truncate">
                SRKR
              </h2>
              <p className="text-[8px] sm:text-xs font-bold text-cyber-accent tracking-wide uppercase truncate">
                ENGINEERING COLLEGE
              </p>
              <p className="hidden sm:block text-[9px] sm:text-[11px] text-cyber-muted font-medium font-sans truncate">
                Sagi Rama Krishnam Raju Engineering College
              </p>
            </div>

          </div>

          {/* CSI LOGO - RIGHT */}
          <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border border-cyber-border shadow-sm flex items-center justify-center bg-white p-0">
            <img
              src={csiLogo}
              alt="Computer Society of India Logo"
              className="w-full h-full object-cover scale-120"
            />
          </div>

        </div>

        {/* Sub-Header Branding Line */}
        <div className="text-center mt-1.5 pt-1.5 border-t border-cyber-border/40">
          <p className="text-[10px] sm:text-xs md:text-sm text-cyber-accent font-semibold font-sans tracking-wider uppercase">
            Dept. of Information Technology
          </p>
        </div>

      </div>

    </div>
  );
}