"use client"

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../config/firebase';

const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };
  
  const useAnalytics = () => {
    const pathname = usePathname();
  
    useEffect(() => {
      const logPageView = debounce(() => {
        if (analytics) {
          logEvent(analytics, 'page_view', { page_path: pathname });
          console.log('Page view logged:', pathname);
        }
      }, 300); // Adjust the debounce delay as necessary
  
      logPageView();
    }, [pathname]);
  };

export default useAnalytics;
