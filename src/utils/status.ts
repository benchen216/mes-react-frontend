import type { BomStatus, MoStatus, Priority } from '../types';

// ===== 製造工單狀態機 =====
export const MO_TRANSITIONS: Record<MoStatus, MoStatus[]> = {
  1: [3, 2], // 草稿 → 已計畫, 已取消
  2: [3, 1], // 已取消 → 已計畫, 草稿
  3: [4, 2], // 已計畫 → 進行中, 已取消
  4: [5, 6, 2], // 進行中 → 暫停, 已完工, 已取消
  5: [4, 2], // 暫停 → 進行中, 已取消
  6: [], // 已完工（終態）
};

export function canTransition(from: MoStatus, to: MoStatus): boolean {
  return MO_TRANSITIONS[from]?.includes(to) ?? false;
}

// ===== 狀態顯示 =====
export const MO_STATUS_LABEL: Record<MoStatus, string> = {
  1: '草稿',
  2: '已取消',
  3: '已計畫',
  4: '進行中',
  5: '暫停',
  6: '已完工',
};

export const MO_STATUS_STYLE: Record<MoStatus, string> = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-blue-100 text-blue-700',
  4: 'bg-green-100 text-green-700',
  5: 'bg-yellow-100 text-yellow-800',
  6: 'bg-purple-100 text-purple-700',
};

export const MO_STATUS_DOT: Record<MoStatus, string> = {
  1: 'bg-gray-400',
  2: 'bg-red-500',
  3: 'bg-blue-500',
  4: 'bg-green-500',
  5: 'bg-yellow-500',
  6: 'bg-purple-500',
};

export const BOM_STATUS_LABEL: Record<BomStatus, string> = {
  1: '草稿',
  2: '已核可',
  3: '適用中',
  4: '已停用',
};

export const BOM_STATUS_STYLE: Record<BomStatus, string> = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-red-100 text-red-700',
};

export const BOM_TRANSITIONS: Record<BomStatus, BomStatus[]> = {
  1: [2], // 草稿 → 已核可
  2: [3], // 已核可 → 適用中
  3: [4], // 適用中 → 已停用
  4: [], // 已停用（終態）
};

export function canTransitionBom(from: BomStatus, to: BomStatus): boolean {
  return BOM_TRANSITIONS[from]?.includes(to) ?? false;
}

// ===== 優先級 =====
export const PRIORITY_LABEL: Record<Priority, string> = {
  1: '低',
  2: '一般',
  3: '高',
  4: '緊急',
};

export const PRIORITY_STYLE: Record<Priority, string> = {
  1: 'bg-gray-100 text-gray-600',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

// ===== 格式化工具 =====
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function formatNumber(n?: number): string {
  if (n === undefined || n === null || Number.isNaN(n)) return '—';
  return n.toLocaleString('zh-TW');
}

export function formatCurrency(n?: number): string {
  if (n === undefined || n === null) return '—';
  return `NT$ ${n.toLocaleString('zh-TW', { minimumFractionDigits: 0 })}`;
}
