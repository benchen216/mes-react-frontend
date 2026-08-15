import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { ManufOrder, MoStatus, OperationOrder } from '../types';
import { manufOrders as seedOrders } from '../data/mockData';
import { canTransition } from '../utils/status';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'mes.manufOrders.v1';

interface ManufOrderContextValue {
  orders: ManufOrder[];
  getOrder: (id: number) => ManufOrder | undefined;
  transitionOrder: (orderId: number, to: MoStatus) => void;
  transitionOperation: (orderId: number, operationId: number, to: MoStatus) => void;
  resetData: () => void;
}

const ManufOrderContext = createContext<ManufOrderContextValue | null>(null);

function nowISO(): string {
  return new Date().toISOString().slice(0, 19);
}

export function ManufOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useLocalStorage<ManufOrder[]>(STORAGE_KEY, seedOrders);

  const getOrder = useCallback(
    (id: number) => orders.find((o) => o.id === id),
    [orders]
  );

  const transitionOrder = useCallback(
    (orderId: number, to: MoStatus) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          if (!canTransition(o.statusSelect, to)) return o;
          const next: ManufOrder = { ...o, statusSelect: to };
          if (to === 4 && !o.realStartDateT) next.realStartDateT = nowISO();
          if (to === 6) next.realEndDateT = nowISO();
          return next;
        })
      );
    },
    [setOrders]
  );

  const transitionOperation = useCallback(
    (orderId: number, operationId: number, to: MoStatus) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;

          const ops = o.operationOrders.map((op) => {
            if (op.id !== operationId) return op;
            if (!canTransition(op.statusSelect, to)) return op;
            const updated: OperationOrder = { ...op, statusSelect: to };
            if (to === 4 && !op.realStartDateT) updated.realStartDateT = nowISO();
            if (to === 6) updated.realEndDateT = nowISO();
            return updated;
          });

          // 聯動工單狀態：啟動任一工序（MO 為已計畫）→ MO 進行中
          let moStatus = o.statusSelect;
          let realStartDateT = o.realStartDateT;
          if (to === 4 && moStatus === 3) {
            moStatus = 4;
            if (!realStartDateT) realStartDateT = nowISO();
          }
          // 全部工序完工 → MO 自動完工
          if (ops.length > 0 && ops.every((op) => op.statusSelect === 6)) {
            moStatus = 6;
          }

          const next: ManufOrder = {
            ...o,
            operationOrders: ops,
            statusSelect: moStatus,
            realStartDateT,
          };
          if (moStatus === 6) next.realEndDateT = nowISO();
          return next;
        })
      );
    },
    [setOrders]
  );

  const resetData = useCallback(() => {
    setOrders(seedOrders);
  }, [setOrders]);

  const value = useMemo(
    () => ({ orders, getOrder, transitionOrder, transitionOperation, resetData }),
    [orders, getOrder, transitionOrder, transitionOperation, resetData]
  );

  return <ManufOrderContext.Provider value={value}>{children}</ManufOrderContext.Provider>;
}

export function useManufOrders() {
  const ctx = useContext(ManufOrderContext);
  if (!ctx) throw new Error('useManufOrders must be used within ManufOrderProvider');
  return ctx;
}
