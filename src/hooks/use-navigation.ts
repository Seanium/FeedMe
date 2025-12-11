import { useEffect, useState } from 'react';

/**
 * Custom hook to read URL search parameters
 * Replacement for Next.js useSearchParams
 */
export function useSearchParams() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return searchParams;
}

/**
 * Custom hook to navigate between pages
 * Replacement for Next.js useRouter
 */
export function useRouter() {
  const push = (url: string) => {
    window.history.pushState({}, '', url);
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const replace = (url: string) => {
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return {
    push,
    replace,
  };
}
