import { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { TIMELINE_CONFIG } from '../constants';

export const useTimelineView = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  useEffect(() => {
    const checkViewMode = () => {
      const width = window.innerWidth;
      if (width >= TIMELINE_CONFIG.desktop.breakpoint) {
        setViewMode('desktop');
      } else if (width >= TIMELINE_CONFIG.laptop.breakpoint) {
        setViewMode('laptop');
      } else if (width >= TIMELINE_CONFIG.tablet.breakpoint) {
        setViewMode('tablet');
      } else {
        setViewMode('mobile');
      }
    };
    
    checkViewMode();
    window.addEventListener('resize', checkViewMode);
    
    return () => window.removeEventListener('resize', checkViewMode);
  }, []);

  return viewMode;
};
