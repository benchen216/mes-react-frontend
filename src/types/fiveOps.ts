export type StationId = 'STAMP' | 'STAMP_QC' | 'WELD' | 'WASH' | 'FINAL_QC';

export type StationKind = 'production' | 'qc';

export type GateBoardStatus = 'pending' | 'ready' | 'running' | 'done' | 'failed' | 'rework';

export type ProductionCardState = 'idle' | 'running' | 'done' | 'blocked';

export type QcCardState = 'idle' | 'judging' | 'passed' | 'failed' | 'blocked';

export type CardState = ProductionCardState | QcCardState;

export type QueueRowStatus = '可開始' | '進行中' | '還不能開始';

export type MessageKind = 'ok' | 'warn' | 'error' | 'info';

export interface StationDef {
  id: StationId;
  index: 0 | 1 | 2 | 3 | 4;
  opName: string;
  hereLabel: string;
  role: string;
  kind: StationKind;
  operator: string;
  reportsQty: boolean;
}

export interface FiveOpsOrder {
  seq: string;
  productCode: string;
  productName: string;
  shortName: string;
  qty: number;
  unit: string;
}

export interface FiveOpsState {
  stampDone: boolean;
  stampQcPassed: boolean;
  stampQcFailed: boolean;
  weldDone: boolean;
  washDone: boolean;
  finalQcPassed: boolean;
  runningStation: StationId | null;
  runningOperator: string | null;
  runningStartedAt: string | null;
  reportedQty: number | null;
  lastMessage: string | null;
  lastMessageKind: MessageKind | null;
  orderFinished: boolean;
}

export type FiveOpsAction =
  | { type: 'start'; station: StationId }
  | { type: 'complete'; station: StationId; qty?: number }
  | { type: 'pass'; station: StationId }
  | { type: 'fail'; station: StationId }
  | { type: 'reset' };

export interface QueueRow {
  seq: string;
  product: string;
  opName: string;
  qty: number;
  status: QueueRowStatus;
}

export interface GateView {
  index: number;
  id: StationId;
  opName: string;
  boardStatus: GateBoardStatus;
  boardLabel: string;
}

export interface CardView {
  state: CardState;
  opName: string;
  prevOp: string;
  nextOp: string;
  opStatusLabel: string;
  operator: string | null;
  startedAt: string | null;
  kind: StationKind;
  reportsQty: boolean;
  finalQcFailDisabled: boolean;
}

export interface FiveOpsDerived {
  actionableStation: StationId | null;
  gates: GateView[];
  boardSentence: string;
  orderStatusLabel: '進行中' | '已結束';
}
