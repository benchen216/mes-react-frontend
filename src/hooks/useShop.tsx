import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createInitialShopState } from '../data/shopMock';
import {
  boardForOrder,
  cardFor,
  defaultLotId,
  queueForOp,
  reduceShop,
} from '../lib/shopMachine';
import type {
  BoardView,
  CardView,
  FieldDef,
  FieldValue,
  QcVerdict,
  QueueRow,
  ShopState,
} from '../types/shop';

const STORAGE_KEY = 'mes.shop.v2';

interface ShopContextValue {
  state: ShopState;
  start: (opId: string, lotId: string) => void;
  complete: (opId: string, lotId: string, values: Record<string, FieldValue>) => void;
  qcSubmit: (payload: {
    opId: string;
    lotId: string;
    verdict: QcVerdict;
    values: Record<string, FieldValue>;
    passQty: number;
    reworkQty: number;
    scrapQty: number;
    defectCodes: string[];
    returnOpId?: string;
    scrapReason?: string;
    overrideReason?: string;
  }) => void;
  addField: (field: FieldDef) => void;
  updateField: (code: string, patch: Partial<FieldDef>) => void;
  setInventory: (productCode: string, qty: number) => void;
  addCode: (kind: 'defect' | 'scrap', item: { code: string; label: string; enabled: boolean }) => void;
  reset: () => void;
  queueFor: (opId: string) => QueueRow[];
  cardForOp: (opId: string, lotId: string | null) => CardView | null;
  boardFor: (seq: string) => BoardView | null;
  defaultLot: (opId: string) => string | null;
}

const ShopContext = createContext<ShopContextValue | null>(null);

function loadState(): ShopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialShopState();
    const parsed = JSON.parse(raw) as ShopState;
    const fresh = createInitialShopState();
    return {
      ...fresh,
      ...parsed,
      orders: parsed.orders?.length ? parsed.orders : fresh.orders,
      fieldDefs: parsed.fieldDefs?.length ? parsed.fieldDefs : fresh.fieldDefs,
      defectCodes: parsed.defectCodes?.length ? parsed.defectCodes : fresh.defectCodes,
      scrapReasons: parsed.scrapReasons?.length ? parsed.scrapReasons : fresh.scrapReasons,
      messages: parsed.messages ?? {},
      inventory: { ...fresh.inventory, ...parsed.inventory },
    };
  } catch {
    return createInitialShopState();
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(loadState);

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
        setState(JSON.parse(event.newValue) as ShopState);
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const start = useCallback((opId: string, lotId: string) => {
    setState((prev) => reduceShop(prev, { type: 'start', opId, lotId }));
  }, []);

  const complete = useCallback((opId: string, lotId: string, values: Record<string, FieldValue>) => {
    setState((prev) => reduceShop(prev, { type: 'complete', opId, lotId, values }));
  }, []);

  const qcSubmit = useCallback<ShopContextValue['qcSubmit']>((payload) => {
    setState((prev) => reduceShop(prev, { type: 'qcSubmit', ...payload }));
  }, []);

  const addField = useCallback((field: FieldDef) => {
    setState((prev) => reduceShop(prev, { type: 'addField', field }));
  }, []);

  const updateField = useCallback((code: string, patch: Partial<FieldDef>) => {
    setState((prev) => reduceShop(prev, { type: 'updateField', code, patch }));
  }, []);

  const setInventory = useCallback((productCode: string, qty: number) => {
    setState((prev) => reduceShop(prev, { type: 'setInventory', productCode, qty }));
  }, []);

  const addCode = useCallback<ShopContextValue['addCode']>((kind, item) => {
    setState((prev) => reduceShop(prev, { type: 'addCode', kind, item }));
  }, []);

  const reset = useCallback(() => {
    const next = createInitialShopState();
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      state,
      start,
      complete,
      qcSubmit,
      addField,
      updateField,
      setInventory,
      addCode,
      reset,
      queueFor: (opId) => queueForOp(state, opId),
      cardForOp: (opId, lotId) => cardFor(state, opId, lotId),
      boardFor: (seq) => boardForOrder(state, seq),
      defaultLot: (opId) => defaultLotId(state, opId),
    }),
    [state, start, complete, qcSubmit, addField, updateField, setInventory, addCode, reset],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
