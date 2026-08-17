import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { INITIAL_FIVE_OPS_STATE } from '../data/fiveOpsMock';
import {
  cardForStation,
  createInitialFiveOpsState,
  deriveFiveOps,
  queueForStation,
  reduceFiveOps,
} from '../lib/fiveOpsMachine';
import type { CardView, FiveOpsDerived, FiveOpsState, QueueRow, StationId } from '../types/fiveOps';

const STORAGE_KEY = 'mes.fiveOps.v1';

interface FiveOpsContextValue {
  state: FiveOpsState;
  derived: FiveOpsDerived;
  start: (station: StationId) => void;
  complete: (station: StationId, qty?: number) => void;
  pass: (station: StationId) => void;
  fail: (station: StationId) => void;
  reset: () => void;
  queueFor: (station: StationId) => { todo: QueueRow[]; other: QueueRow[] };
  cardFor: (station: StationId) => CardView;
}

const FiveOpsContext = createContext<FiveOpsContextValue | null>(null);

function loadState(): FiveOpsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_FIVE_OPS_STATE };
    return { ...INITIAL_FIVE_OPS_STATE, ...(JSON.parse(raw) as FiveOpsState) };
  } catch {
    return { ...INITIAL_FIVE_OPS_STATE };
  }
}

export function FiveOpsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FiveOpsState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setState({ ...INITIAL_FIVE_OPS_STATE, ...(JSON.parse(event.newValue) as FiveOpsState) });
      } catch {
        // ignore bad payload
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const start = useCallback((station: StationId) => {
    setState((prev) => reduceFiveOps(prev, { type: 'start', station }));
  }, []);

  const complete = useCallback((station: StationId, qty?: number) => {
    setState((prev) => reduceFiveOps(prev, { type: 'complete', station, qty }));
  }, []);

  const pass = useCallback((station: StationId) => {
    setState((prev) => reduceFiveOps(prev, { type: 'pass', station }));
  }, []);

  const fail = useCallback((station: StationId) => {
    setState((prev) => reduceFiveOps(prev, { type: 'fail', station }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialFiveOpsState());
  }, []);

  const derived = useMemo(() => deriveFiveOps(state), [state]);

  const value = useMemo<FiveOpsContextValue>(
    () => ({
      state,
      derived,
      start,
      complete,
      pass,
      fail,
      reset,
      queueFor: (station) => queueForStation(state, station),
      cardFor: (station) => cardForStation(state, station),
    }),
    [state, derived, start, complete, pass, fail, reset],
  );

  return <FiveOpsContext.Provider value={value}>{children}</FiveOpsContext.Provider>;
}

export function useFiveOps() {
  const ctx = useContext(FiveOpsContext);
  if (!ctx) {
    throw new Error('useFiveOps must be used within FiveOpsProvider');
  }
  return ctx;
}
