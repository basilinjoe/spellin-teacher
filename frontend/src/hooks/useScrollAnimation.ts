import { useState, useEffect } from 'react';

interface ScrollState {
  isScrolled: boolean;
  scrollDirection: 'up' | 'down' | null;
  lastScrollY: number;
}

export const useScrollAnimation = (threshold = 50) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolled: false,
    scrollDirection: null,
    lastScrollY: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setScrollState(prevState => ({
        isScrolled: currentScrollY > threshold,
        scrollDirection: currentScrollY > prevState.lastScrollY ? 'down' : 'up',
        lastScrollY: currentScrollY,
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrollState;
};