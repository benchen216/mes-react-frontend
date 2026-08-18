export type LineId = 'A' | 'B';

export type OpKind = 'production' | 'qc';

export type MessageKind = 'ok' | 'warn' | 'error' | 'info';

export type GateBoardStatus = 'pending' | 'ready' | 'running' | 'done' | 'failed' | 'rework';

export type QueueRowStatus = '可開始' | '進行中' | '還不能開始' | '可重做';

export type OrderStatus = '待生產' | '進行中' | '暫停（等料）' | '已結案';

export type LotKind = 'main' | 'rework';

export type FieldType = 'number' | 'text' | 'select' | 'multiselect' | 'boolean' | 'date' | 'photo';

export type QcVerdict = 'pass' | 'fail' | 'partial';

export type RecordResult = 'done' | 'passed' | 'failed' | 'partial';

export type FieldValue = string | number | boolean | string[] | null;

export interface MaterialNeed {
  productCode: string;
  perUnit: number;
}

export interface OpDef {
  id: string;
  lineId: LineId;
  index: number;
  name: string;
  stationName: string;
  kind: OpKind;
  operator: string;
  role: string;
  reportsQty: boolean;
  inputMaterial?: MaterialNeed;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  code: string;
  label: string;
  type: FieldType;
  required: boolean;
  requiredWhen?: 'always' | 'fail' | 'scrap' | 'override';
  opIds: string[];
  enabled: boolean;
  min?: number;
  max?: number;
  options?: FieldOption[];
  optionsSource?: 'static' | 'frameLots';
  source?: 'operator' | 'fixture';
  overridable?: boolean;
  createdAt: string;
}

export interface CodeItem {
  code: string;
  label: string;
  enabled: boolean;
}

export interface LotState {
  id: string;
  kind: LotKind;
  qty: number;
  gates: Record<string, GateBoardStatus>;
  runningOpId: string | null;
  runningOperator: string | null;
  runningStartedAt: string | null;
}

export interface OpRecord {
  id: string;
  orderSeq: string;
  lotId: string;
  lotKind: LotKind;
  opId: string;
  attempt: number;
  operator: string;
  startedAt: string;
  endedAt: string;
  result: RecordResult;
  values: Record<string, FieldValue>;
  fieldSnapshot: FieldDef[];
  passQty?: number;
  reworkQty?: number;
  scrapQty?: number;
  defectCodes?: string[];
  returnOpId?: string;
  scrapReason?: string;
  overrideReason?: string;
}

export interface OrderState {
  seq: string;
  lineId: LineId;
  productCode: string;
  productName: string;
  shortName: string;
  plannedQty: number;
  unit: string;
  status: OrderStatus;
  lots: LotState[];
  records: OpRecord[];
  completedQty: number;
  scrapQty: number;
}

export interface ShopState {
  orders: OrderState[];
  inventory: Record<string, number>;
  fieldDefs: FieldDef[];
  defectCodes: CodeItem[];
  scrapReasons: CodeItem[];
  messages: Record<string, { text: string; kind: MessageKind }>;
}

export type ShopAction =
  | { type: 'start'; opId: string; lotId: string }
  | { type: 'complete'; opId: string; lotId: string; values: Record<string, FieldValue> }
  | {
      type: 'qcSubmit';
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
    }
  | { type: 'addField'; field: FieldDef }
  | { type: 'updateField'; code: string; patch: Partial<FieldDef> }
  | { type: 'setInventory'; productCode: string; qty: number }
  | { type: 'addCode'; kind: 'defect' | 'scrap'; item: CodeItem }
  | { type: 'reset' };

export interface QueueRow {
  orderSeq: string;
  lotId: string;
  lotKind: LotKind;
  product: string;
  opName: string;
  qty: number;
  unit: string;
  status: QueueRowStatus;
}

export interface GateView {
  index: number;
  id: string;
  opName: string;
  boardStatus: GateBoardStatus;
  boardLabel: string;
}

export interface CardView {
  lotId: string;
  lotKind: LotKind;
  qty: number;
  unit: string;
  opName: string;
  prevOp: string;
  nextOp: string;
  opStatusLabel: string;
  operator: string | null;
  startedAt: string | null;
  kind: OpKind;
  reportsQty: boolean;
  gate: GateBoardStatus;
  startVisible: boolean;
  startBlocked: boolean;
  completeEnabled: boolean;
  qcButtons: boolean;
}

export interface BoardView {
  order: OrderState;
  chain: string;
  sentences: string[];
  lots: { lot: LotState; label: string; gates: GateView[] }[];
}

export interface FormIssue {
  message: string;
  fields: string[];
}
