import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hook to scroll to top when route changes
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);
};

// Hook for manual scroll to top with smooth animation
export const useScrollToTopFunction = () => {
  const scrollToTop = (behavior: 'smooth' | 'auto' = 'smooth') => {
    window.scrollTo({
      top: 0,
      behavior,
    });
  };

  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToSection = (sectionName: string) => {
    const element = document.querySelector(`[data-section="${sectionName}"]`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return {
    scrollToTop,
    scrollToElement,
    scrollToSection,
  };
};