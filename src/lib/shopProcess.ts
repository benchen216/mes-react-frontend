import type { GateBoardStatus, OpDef } from '../types/shop';
import { OPERATIONS } from '../data/shopMock';

export function opsOf(lineId: string): OpDef[] {
  return OPERATIONS.filter((op) => op.lineId === lineId).sort((a, b) => a.index - b.index);
}

export function opById(opId: string): OpDef | undefined {
  return OPERATIONS.find((op) => op.id === opId);
}

export function neighborOps(op: OpDef): { prevOp: string; nextOp: string } {
  const line = opsOf(op.lineId);
  const prev = line[op.index - 1];
  const next = line[op.index + 1];
  return {
    prevOp: prev ? prev.name : '無',
    nextOp: next ? next.name : '無（工單結束）',
  };
}

export function productionOpsBefore(op: OpDef): OpDef[] {
  return opsOf(op.lineId).filter((item) => item.index < op.index && item.kind === 'production');
}

export function lastOp(lineId: string): OpDef {
  const line = opsOf(lineId);
  return line[line.length - 1];
}

export function initialGates(ops: OpDef[]): Record<string, GateBoardStatus> {
  const gates: Record<string, GateBoardStatus> = {};
  for (const op of ops) {
    gates[op.id] = op.index === 0 ? 'ready' : 'pending';
  }
  return gates;
}

export function boardLabel(status: GateBoardStatus): string {
  switch (status) {
    case 'pending':
      return '尚未開始';
    case 'ready':
      return '可開始';
    case 'running':
      return '進行中';
    case 'done':
      return '已完成';
    case 'failed':
      return '不合格';
    case 'rework':
      return '可重做';
  }
}
