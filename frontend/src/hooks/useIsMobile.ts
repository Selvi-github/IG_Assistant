import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile screen width (< 768px).
 * Automatically updates on window resize and device orientation changes.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Set initial
    setIsMobile(mql.matches);

    // Modern listener with backward compatibility
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    } else {
      // @ts-ignore
      mql.addListener(handleChange);
      // @ts-ignore
      return () => mql.removeListener(handleChange);
    }
  }, [breakpoint]);

  return isMobile;
}

