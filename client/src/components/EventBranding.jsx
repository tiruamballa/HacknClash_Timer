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
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-7 py-2.5 sm:py-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-cyber-border shadow-xl overflow-hidden">

        {/* 3-Logos Row */}
        <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-5 overflow-hidden">

          {/* IIC LOGO - LEFT */}
          <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-cyber-border shadow-sm flex items-center justify-center bg-white p-1.5">
            <img
              src={iicLogo}
              alt="Institution's Innovation Council Logo"
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>

          {/* SRKR COLLEGE LOGO + TEXT - CENTER */}
          <div className="flex-1 flex flex-row items-center justify-center gap-2 sm:gap-4 bg-cyber-accent/5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-cyber-accent/20 min-w-0 overflow-hidden">
            
            {/* College Logo */}
            <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-cyber-accent/30 shadow-sm flex items-center justify-center bg-white p-0">
              <img
                src={srkrLogo}
                alt="SRKR Engineering College Logo"
                className="w-full h-full object-cover scale-110"
              />
            </div>

            {/* Text beside logo */}
            <div className="text-left select-none min-w-0 flex-1">
              <h2 className="text-sm sm:text-xl md:text-2xl font-black tracking-wide font-display text-cyber-ink leading-tight truncate">
                SRKR
              </h2>
              <p className="text-[9px] sm:text-xs md:text-sm font-extrabold text-cyber-accent tracking-wide uppercase truncate">
                ENGINEERING COLLEGE
              </p>
              <p className="hidden sm:block text-[10px] sm:text-xs text-cyber-muted font-semibold font-sans truncate">
                Sagi Rama Krishnam Raju Engineering College
              </p>
            </div>

          </div>

          {/* CSI LOGO - RIGHT */}
          <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-cyber-border shadow-sm flex items-center justify-center bg-white p-0">
            <img
              src={csiLogo}
              alt="Computer Society of India Logo"
              className="w-full h-full object-cover scale-125"
            />
          </div>

        </div>

        {/* Sub-Header Branding Line */}
        <div className="text-center mt-2 pt-1.5 border-t border-cyber-border/50">
          <p className="text-xs sm:text-sm md:text-base text-cyber-accent font-bold font-sans tracking-widest uppercase">
            Dept. of Information Technology
          </p>
        </div>

      </div>

    </div>
  );
}