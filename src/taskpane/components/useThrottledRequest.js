import { useCallback, useRef } from "react";

const COOLDOWN_PERIOD = 2000; // 2 seconds cooldown between requests
const DEBOUNCE_DELAY = 300; // 300ms debounce delay

export const useThrottledRequest = (apiCallback) => {
  const lastRequestTime = useRef(0);
  const debounceTimer = useRef(null);

  const throttledRequest = useCallback(
    (...args) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      return new Promise((resolve, reject) => {
        debounceTimer.current = setTimeout(async () => {
          try {
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime.current;

            if (timeSinceLastRequest < COOLDOWN_PERIOD) {
              const waitTime = COOLDOWN_PERIOD - timeSinceLastRequest;
              await new Promise((r) => setTimeout(r, waitTime));
            }

            lastRequestTime.current = Date.now();
            const result = await apiCallback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, DEBOUNCE_DELAY);
      });
    },
    [apiCallback]
  );

  return { throttledRequest };
};
