import srkrLogo from '../assets/srkr_logo.jpg';
import csiLogo from '../assets/csi_logo.jpeg';
import iicLogo from '../assets/iic_logo.png';

/**
 * Renders the official event branding row: IIC (top-left), SRKR College
 * (top-center, the most prominent mark), and CSI Student Branch (top-right).
 * Includes the organizing branding line: SRKREC CSI Student Branch in
 * association with the Department of Information Technology.
 *
 * @param {string} size 'large' (for Hero page) or 'small' (for Live header)
 */
export function EventBranding({ size = 'large' }) {
  return (
    <div className="w-full flex flex-col items-center select-none animate-[fadeIn_0.8s_ease-out]">

      {/* Main Event Header */}
      <div className="w-full max-w-4xl mx-auto
        px-4 sm:px-6
        py-2.5 sm:py-3.5
        bg-white/90
        backdrop-blur-md
        rounded-2xl sm:rounded-3xl
        border border-cyber-border
        shadow-lg sm:shadow-xl">

        {/* Three Logos Layout (Always single horizontal row on all devices) */}
        <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-5">

          {/* IIC - LEFT */}
          <div className="flex items-center justify-start flex-shrink-0">
            <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20
              rounded-xl sm:rounded-2xl
              overflow-hidden
              border border-cyber-border
              shadow-md
              flex items-center justify-center
              bg-white
              p-1 sm:p-2
              transition-all duration-300">
              <img
                src={iicLogo}
                alt="Institution's Innovation Council Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* SRKR - CENTER (COLLEGE LOGO + TEXT) */}
          <div className="flex justify-center items-center flex-1 min-w-0">
            <div className="flex flex-row items-center gap-2 sm:gap-3.5 bg-cyber-accent/5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-cyber-accent/15 max-w-full overflow-hidden">
              {/* College Logo */}
              <div className="h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24
                rounded-xl sm:rounded-2xl
                overflow-hidden
                border-2 border-cyber-accent/30
                shadow-md sm:shadow-lg
                flex items-center justify-center
                bg-white
                p-1 sm:p-1.5
                ring-2 sm:ring-4 ring-cyber-accent/10
                flex-shrink-0">
                <img
                  src={srkrLogo}
                  alt="SRKR Engineering College Logo"
                  className="h-full w-full object-contain rounded-md sm:rounded-xl"
                />
              </div>

              {/* Text Beside College Logo */}
              <div className="text-left select-none min-w-0">
                <h2 className="text-sm sm:text-xl md:text-2xl font-extrabold tracking-wide font-display text-cyber-ink leading-tight truncate">
                  SRKR
                </h2>
                <p className="text-[9px] sm:text-xs md:text-sm font-bold text-cyber-accent tracking-wide uppercase truncate">
                  ENGINEERING COLLEGE
                </p>
                <p className="hidden sm:block text-[9px] sm:text-[11px] text-cyber-muted font-medium font-sans truncate">
                  Sagi Rama Krishnam Raju Engineering College
                </p>
              </div>
            </div>
          </div>

          {/* CSI - RIGHT */}
          <div className="flex items-center justify-end flex-shrink-0">
            <div className="h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24
              rounded-xl sm:rounded-2xl
              overflow-hidden
              border-2 border-cyber-border
              shadow-md sm:shadow-lg
              flex items-center justify-center
              bg-white
              p-1 sm:p-1.5
              ring-2 ring-cyber-accent/10
              transition-all duration-300">
              <img
                src={csiLogo}
                alt="Computer Society of India Logo"
                className="h-full w-full object-contain scale-105 sm:scale-125"
              />
            </div>
          </div>

        </div>


        {/* Branding Line - INSIDE HEADER */}
        <div className="text-center mt-2 pt-2 border-t border-cyber-border/40">

          <p className="text-[11px] sm:text-xs md:text-sm
            text-cyber-accent
            font-semibold
            font-sans
            tracking-wider
            uppercase">

            Dept. of Information Technology

          </p>

        </div>

      </div>

    </div>
  );
}