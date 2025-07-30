import { useSpring } from '@momoyu-ink/kit';
import { useState, useRef, useEffect } from 'react';

export interface UseNotificationOptions {
  /** Display duration, default 2000ms */
  duration?: number;
  /** Fade in duration, default 300ms */
  fadeInDuration?: number;
  /** Fade out duration, default 300ms */
  fadeOutDuration?: number;
}

export interface NotificationHandle {
  /** Show notification with message */
  show: (message: string, options?: UseNotificationOptions) => void;
  /** Hide notification immediately */
  hide: () => void;
}

/**
 * Simple notification hook for imperative control
 */
export function useNotification() {
  const [shouldRender, setShouldRender] = useState(false);
  const [text, setText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);

  const [style, api] = useSpring(() => ({
    opacity: 0,
    config: { duration: 300 },
  }));

  const show = (message: string, options: UseNotificationOptions = {}) => {
    const {
      duration = 2000,
      fadeInDuration = 300,
      fadeOutDuration = 300,
    } = options;

    // Stop current animation if any
    if (isAnimatingRef.current) {
      hide();
      setTimeout(() => show(message, options), 50);
      return;
    }

    setText(message);
    setShouldRender(true);
    isAnimatingRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Fade in
    api.start({
      opacity: 1,
      config: { duration: fadeInDuration },
      onRest: () => {
        // Hold then fade out
        timeoutRef.current = setTimeout(() => {
          api.start({
            opacity: 0,
            config: { duration: fadeOutDuration },
            onRest: () => {
              setShouldRender(false);
              isAnimatingRef.current = false;
              setText('');
            },
          });
        }, duration);
      },
    });
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    api.stop();
    api.set({ opacity: 0 });
    setShouldRender(false);
    isAnimatingRef.current = false;
    setText('');
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    shouldRender,
    style,
    text,
    handle: { show, hide },
  };
}
