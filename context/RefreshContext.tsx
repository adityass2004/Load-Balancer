'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export const REFRESH_INTERVALS = [
  { label: '5s', value: 5_000 },
  { label: '10s', value: 10_000 },
  { label: '30s', value: 30_000 },
  { label: '1m', value: 60_000 },
] as const;

type RefreshContextValue = {
  enabled: boolean;
  intervalMs: number;
  setEnabled: (v: boolean) => void;
  setIntervalMs: (v: number) => void;
  toggle: () => void;
  /** Returns `intervalMs` when enabled, `false` when paused (React Query format) */
  refetchInterval: number | false;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [intervalMs, setIntervalMsState] = useState(30_000);

  React.useEffect(() => {
    const savedEnabled = localStorage.getItem('load-balancer-refresh-enabled');
    const savedInterval = localStorage.getItem('load-balancer-refresh-interval');
    if (savedEnabled !== null) {
      setEnabledState(savedEnabled === 'true');
    }
    if (savedInterval !== null) {
      setIntervalMsState(Number(savedInterval));
    }
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    localStorage.setItem('load-balancer-refresh-enabled', String(v));
  }, []);

  const setIntervalMs = useCallback((v: number) => {
    setIntervalMsState(v);
    localStorage.setItem('load-balancer-refresh-interval', String(v));
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((v) => {
      const next = !v;
      localStorage.setItem('load-balancer-refresh-enabled', String(next));
      return next;
    });
  }, []);

  const refetchInterval: number | false = enabled ? intervalMs : false;

  return (
    <RefreshContext.Provider
      value={{ enabled, intervalMs, setEnabled, setIntervalMs, toggle, refetchInterval }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error('useRefresh must be used inside RefreshProvider');
  return ctx;
}
