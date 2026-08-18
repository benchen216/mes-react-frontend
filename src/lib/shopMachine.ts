import { createInitialShopState, FIXTURE_READINGS, OPERATIONS, OPS_BY_ID } from '../data/shopMock';
import type {
  BoardView,
  CardView,
  FieldDef,
  FieldValue,
  FormIssue,
  GateView,
  LotState,
  MessageKind,
  OpRecord,
  OrderState,
  QcVerdict,
  QueueRow,
  ShopAction,
  ShopState,
} from '../types/shop';
import { boardLabel, lastOp, neighborOps, opsOf, productionOpsBefore } from './shopProcess';

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatSpan(startIso: string, endIso: string): string {
  const start = formatClock(startIso).slice(0, 5);
  const end = formatClock(endIso).slice(0, 5);
  return `${start}–${end}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function withMessage(state: ShopState, opId: string, text: string, kind: MessageKind): ShopState {
  return {
    ...state,
    messages: { ...state.messages, [opId]: { text, kind } },
  };
}

function findOrderByOp(state: ShopState, opId: string): OrderState | undefined {
  const op = OPS_BY_ID[opId];
  if (!op) return undefined;
  return state.orders.find((order) => order.lineId === op.lineId);
}

function findLot(order: OrderState, lotId: string): LotState | undefined {
  return order.lots.find((lot) => lot.id === lotId);
}

function earliestUnfinished(lot: LotState, lineId: string) {
  return opsOf(lineId).find((op) => lot.gates[op.id] !== 'done');
}

function fieldsForOp(state: ShopState, opId: string): FieldDef[] {
  return state.fieldDefs.filter((field) => field.enabled && field.opIds.includes(opId));
}

export function frameLotOptions(state: ShopState): { value: string; label: string }[] {
  return state.orders
    .filter((order) => order.productCode === 'FR-27-BZ-A' && order.completedQty > 0)
    .map((order) => ({ value: order.seq, label: `${order.seq}（完工 ${order.completedQty.toLocaleString('zh-TW')}）` }));
}

function asNumber(value: FieldValue | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isEmpty(value: FieldValue | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'boolean') return false;
  return false;
}

function fieldRequired(field: FieldDef, ctx: { verdict?: QcVerdict; scrapQty?: number; override?: boolean }): boolean {
  if (field.requiredWhen === 'fail') return ctx.verdict === 'fail' || ctx.verdict === 'partial';
  if (field.requiredWhen === 'scrap') return (ctx.scrapQty ?? 0) > 0;
  if (field.requiredWhen === 'override') return Boolean(ctx.override);
  return field.required;
}

export function fixtureValues(opId: string): Record<string, FieldValue> {
  const reading = FIXTURE_READINGS[opId];
  if (!reading) return {};
  const values: Record<string, FieldValue> = {};
  for (const [key, value] of Object.entries(reading)) values[key] = value;
  return values;
}

export function fixtureOutOfRange(state: ShopState, opId: string, values: Record<string, FieldValue>): boolean {
  return fieldsForOp(state, opId).some((field) => {
    if (field.source !== 'fixture' || field.type !== 'number') return false;
    const num = asNumber(values[field.code]);
    if (num === null) return false;
    if (field.min !== undefined && num < field.min) return true;
    if (field.max !== undefined && num > field.max) return true;
    return false;
  });
}

export function validateProductionForm(
  state: ShopState,
  opId: string,
  values: Record<string, FieldValue>,
): FormIssue | null {
  const fields = fieldsForOp(state, opId);
  const missing: string[] = [];
  const range: string[] = [];
  let rangeMessage = '';

  for (const field of fields) {
    if (fieldRequired(field, {}) && isEmpty(values[field.code])) missing.push(field.code);
    if (field.type === 'number' && !isEmpty(values[field.code])) {
      const num = asNumber(values[field.code]);
      if (num === null) {
        missing.push(field.code);
        continue;
      }
      if ((field.min !== undefined && num < field.min) || (field.max !== undefined && num > field.max)) {
        range.push(field.code);
        const min = field.min ?? '—';
        const max = field.max ?? '—';
        rangeMessage = `${field.label} ${num} 超出有效範圍 ${min} ~ ${max}。`;
      }
    }
  }

  if (missing.length) return { message: '必填欄位未填完，無法送出。', fields: missing };
  if (range.length) return { message: rangeMessage, fields: range };
  return null;
}

export function validateQcForm(
  state: ShopState,
  opId: string,
  payload: {
    values: Record<string, FieldValue>;
    verdict: QcVerdict;
    passQty: number;
    reworkQty: number;
    scrapQty: number;
    inspectedQty: number;
    defectCodes: string[];
    returnOpId?: string;
    scrapReason?: string;
    overrideReason?: string;
  },
): FormIssue | null {
  const op = OPS_BY_ID[opId];
  const fields = fieldsForOp(state, opId);
  const missing: string[] = [];
  const marked: string[] = [];
  const overrideNeeded = payload.verdict === 'pass' && fixtureOutOfRange(state, opId, payload.values);

  for (const field of fields) {
    if (fieldRequired(field, { verdict: payload.verdict, scrapQty: payload.scrapQty, override: overrideNeeded }) && isEmpty(payload.values[field.code])) {
      missing.push(field.code);
    }
    if (field.type !== 'number' || isEmpty(payload.values[field.code])) continue;
    const num = asNumber(payload.values[field.code]);
    if (num === null) {
      missing.push(field.code);
      continue;
    }
    const over = (field.min !== undefined && num < field.min) || (field.max !== undefined && num > field.max);
    if (over && payload.verdict === 'pass' && !field.overridable) {
      marked.push(field.code);
      return { message: `${field.label} ${num} 超出上限，不可判定合格。`, fields: marked };
    }
    if (over && field.overridable && payload.verdict === 'pass' && !payload.overrideReason?.trim()) {
      return { message: '覆寫超出範圍的量測值並改為合格時，必須填寫覆寫理由。', fields: ['overrideReason'] };
    }
  }

  if (missing.length) return { message: '必填欄位未填完，無法送出。', fields: missing };

  const sum = payload.passQty + payload.reworkQty + payload.scrapQty;
  if (![payload.passQty, payload.reworkQty, payload.scrapQty].every((n) => Number.isFinite(n) && n >= 0) || sum !== payload.inspectedQty) {
    return { message: `合格數 + 重工數 + 報廢數必須等於送檢數（${payload.inspectedQty.toLocaleString('zh-TW')}）。`, fields: ['passQty', 'reworkQty', 'scrapQty'] };
  }

  if ((payload.verdict === 'fail' || payload.verdict === 'partial') && payload.defectCodes.length === 0) {
    return { message: '判定不合格時，不良代碼為必填。', fields: ['defectCodes'] };
  }

  if (payload.reworkQty > 0 && !payload.returnOpId) {
    return { message: '有重工數時必須指定退回工序。', fields: ['returnOpId'] };
  }

  if (payload.returnOpId) {
    const allowed = productionOpsBefore(op).some((item) => item.id === payload.returnOpId);
    if (!allowed) return { message: '退回工序只能選本站之前的生產工序。', fields: ['returnOpId'] };
  }

  if (payload.scrapQty > 0 && !payload.scrapReason) {
    return { message: '報廢數大於 0 時，報廢原因為必填。', fields: ['scrapReason'] };
  }

  if (overrideNeeded && !payload.overrideReason?.trim()) {
    return { message: '覆寫超出範圍的量測值並改為合格時，必須填寫覆寫理由。', fields: ['overrideReason'] };
  }

  return null;
}

function materialShortage(state: ShopState, opId: string, lot: LotState) {
  const op = OPS_BY_ID[opId];
  if (!op?.inputMaterial) return null;
  const need = lot.qty * op.inputMaterial.perUnit;
  const avail = state.inventory[op.inputMaterial.productCode] ?? 0;
  if (avail >= need) return null;
  return { code: op.inputMaterial.productCode, avail, need, short: need - avail };
}

function nextAfter(opId: string) {
  const op = OPS_BY_ID[opId];
  return opsOf(op.lineId).find((item) => item.index === op.index + 1) ?? null;
}

function attemptOf(order: OrderState, opId: string): number {
  return order.records.filter((record) => record.opId === opId).length + 1;
}

function clearRun(lot: LotState): LotState {
  return { ...lot, runningOpId: null, runningOperator: null, runningStartedAt: null };
}

function replaceLot(order: OrderState, lot: LotState): OrderState {
  return { ...order, lots: order.lots.map((item) => (item.id === lot.id ? lot : item)) };
}

function replaceOrder(state: ShopState, order: OrderState): ShopState {
  return { ...state, orders: state.orders.map((item) => (item.seq === order.seq ? order : item)) };
}

function closeLotIfLast(order: OrderState, lot: LotState, opId: string, state: ShopState): { order: OrderState; state: ShopState } {
  const last = lastOp(order.lineId);
  if (opId !== last.id || lot.gates[opId] !== 'done') return { order, state };

  let nextOrder: OrderState = order;
  let nextState = state;
  if (lot.qty > 0) {
    nextOrder = { ...order, completedQty: order.completedQty + lot.qty };
    nextState = {
      ...state,
      inventory: {
        ...state.inventory,
        [nextOrder.productCode]: (state.inventory[nextOrder.productCode] ?? 0) + lot.qty,
      },
    };
  }

  const allDone = nextOrder.lots.every((item) => item.qty <= 0 || item.gates[last.id] === 'done');
  if (allDone) nextOrder = { ...nextOrder, status: '已結案' };
  return { order: nextOrder, state: nextState };
}

function finishOp(lot: LotState, opId: string): LotState {
  const gates = { ...lot.gates, [opId]: 'done' as const };
  const next = nextAfter(opId);
  if (next && (gates[next.id] === 'pending' || gates[next.id] === 'failed')) {
    gates[next.id] = 'ready';
  }
  return clearRun({ ...lot, gates });
}

function makeRecord(
  order: OrderState,
  lot: LotState,
  opId: string,
  result: OpRecord['result'],
  values: Record<string, FieldValue>,
  snapshot: FieldDef[],
  extra: Partial<OpRecord> = {},
): OpRecord {
  return {
    id: uid('rec'),
    orderSeq: order.seq,
    lotId: lot.id,
    lotKind: lot.kind,
    opId,
    attempt: attemptOf(order, opId),
    operator: lot.runningOperator ?? OPS_BY_ID[opId].operator,
    startedAt: lot.runningStartedAt ?? nowIso(),
    endedAt: nowIso(),
    result,
    values,
    fieldSnapshot: snapshot.map((field) => ({ ...field })),
    ...extra,
  };
}

function startOrder(order: OrderState): OrderState {
  if (order.status === '待生產' || order.status === '暫停（等料）') {
    return { ...order, status: '進行中' };
  }
  return order;
}

function reduceStart(state: ShopState, opId: string, lotId: string): ShopState {
  const op = OPS_BY_ID[opId];
  const order = findOrderByOp(state, opId);
  const lot = order ? findLot(order, lotId) : undefined;
  if (!op || !order || !lot) return withMessage(state, opId, '找不到工單。', 'error');
  if (order.status === '已結案') return withMessage(state, opId, '工單已結束。', 'info');

  if (lot.runningOpId === opId) {
    return withMessage(state, opId, `本關進行中。作業員：${lot.runningOperator}。開始：${formatClock(lot.runningStartedAt ?? nowIso())}`, 'ok');
  }

  const otherRunningHere = order.lots.some((item) => item.id !== lot.id && item.runningOpId === opId);
  if (otherRunningHere) {
    return withMessage(state, opId, '本站已有批次進行中。', 'warn');
  }

  const shortage = materialShortage(state, opId, lot);
  if (shortage) {
    const paused: OrderState = order.status === '待生產' ? { ...order, status: '暫停（等料）' } : order;
    return withMessage(
      replaceOrder(state, paused),
      opId,
      `還不能開始。料件 ${shortage.code} 可用量 ${shortage.avail.toLocaleString('zh-TW')}，需求 ${shortage.need.toLocaleString('zh-TW')}，短缺 ${shortage.short.toLocaleString('zh-TW')}。`,
      'warn',
    );
  }

  const gate = lot.gates[opId];
  if (gate !== 'ready' && gate !== 'rework') {
    const need = earliestUnfinished(lot, op.lineId);
    const name = need && need.id !== opId ? need.name : (need?.name ?? '上一工序');
    return withMessage(state, opId, `還不能開始。需先完成「${name}」。`, 'warn');
  }

  const startedAt = nowIso();
  const running: LotState = {
    ...lot,
    gates: { ...lot.gates, [opId]: 'running' },
    runningOpId: opId,
    runningOperator: op.operator,
    runningStartedAt: startedAt,
  };
  const nextOrder = startOrder(replaceLot(order, running));
  return withMessage(replaceOrder(state, nextOrder), opId, `本關進行中。作業員：${op.operator}。開始：${formatClock(startedAt)}`, 'ok');
}

function reduceComplete(state: ShopState, opId: string, lotId: string, values: Record<string, FieldValue>): ShopState {
  const op = OPS_BY_ID[opId];
  const order = findOrderByOp(state, opId);
  const lot = order ? findLot(order, lotId) : undefined;
  if (!op || !order || !lot) return state;
  if (op.kind !== 'production' || lot.runningOpId !== opId) return state;

  const issue = validateProductionForm(state, opId, values);
  if (issue) return withMessage(state, opId, issue.message, 'error');

  const snapshot = fieldsForOp(state, opId);
  const record = makeRecord(order, lot, opId, 'done', values, snapshot);
  let nextLot = finishOp(lot, opId);
  let nextOrder: OrderState = { ...replaceLot(order, nextLot), records: [...order.records, record] };
  const closed = closeLotIfLast(nextOrder, nextLot, opId, state);
  nextOrder = closed.order;
  let nextState = closed.state;

  const next = nextAfter(opId);
  const message = next
    ? `本關已完成。下一關是「${next.name}」，由「${next.stationName}」開始。`
    : nextOrder.status === '已結案'
      ? '本關已完成。工單已結束。'
      : '本關已完成。';
  return withMessage(replaceOrder(nextState, nextOrder), opId, message, 'ok');
}

function applyQcPass(lot: LotState, opId: string, passQty: number): LotState {
  return finishOp({ ...lot, qty: passQty }, opId);
}

function applyQcFail(lot: LotState, opId: string, returnOpId: string): LotState {
  const gates = { ...lot.gates, [opId]: 'failed' as const, [returnOpId]: 'rework' as const };
  return clearRun({ ...lot, gates });
}

function reduceQc(state: ShopState, action: Extract<ShopAction, { type: 'qcSubmit' }>): ShopState {
  const op = OPS_BY_ID[action.opId];
  const order = findOrderByOp(state, action.opId);
  const lot = order ? findLot(order, action.lotId) : undefined;
  if (!op || !order || !lot) return state;
  if (op.kind !== 'qc' || lot.runningOpId !== action.opId) return state;

  const issue = validateQcForm(state, action.opId, {
    values: action.values,
    verdict: action.verdict,
    passQty: action.passQty,
    reworkQty: action.reworkQty,
    scrapQty: action.scrapQty,
    inspectedQty: lot.qty,
    defectCodes: action.defectCodes,
    returnOpId: action.returnOpId,
    scrapReason: action.scrapReason,
    overrideReason: action.overrideReason,
  });
  if (issue) return withMessage(state, action.opId, issue.message, 'error');

  const snapshot = fieldsForOp(state, action.opId);
  return applyQcResult(state, order, lot, action, snapshot);
}

function applyQcResult(
  state: ShopState,
  order: OrderState,
  lot: LotState,
  action: Extract<ShopAction, { type: 'qcSubmit' }>,
  snapshot: FieldDef[],
): ShopState {
  const op = OPS_BY_ID[action.opId];
  const extra = {
    passQty: action.passQty,
    reworkQty: action.reworkQty,
    scrapQty: action.scrapQty,
    defectCodes: action.defectCodes,
    returnOpId: action.returnOpId,
    scrapReason: action.scrapReason,
    overrideReason: action.overrideReason,
  };

  if (action.verdict === 'fail' || (action.passQty === 0 && action.reworkQty > 0 && action.scrapQty === 0)) {
    const returnOp = OPS_BY_ID[action.returnOpId ?? ''];
    const record = makeRecord(order, lot, action.opId, 'failed', action.values, snapshot, extra);
    const nextLot = applyQcFail(lot, action.opId, action.returnOpId!);
    const nextOrder = {
      ...replaceLot(order, nextLot),
      records: [...order.records, record],
    };
    const locked = action.opId === 'A_STAMP_QC' ? '焊接尚未開始。' : '';
    return withMessage(
      replaceOrder(state, nextOrder),
      action.opId,
      `判定不合格。工單不能結束。請退回「${returnOp?.name ?? '前站'}」重做。${locked}`.trim(),
      'error',
    );
  }

  const recordResult = action.verdict === 'partial' || action.reworkQty > 0 || action.scrapQty > 0 ? 'partial' : 'passed';
  const record = makeRecord(order, lot, action.opId, recordResult, action.values, snapshot, extra);
  let nextLot = lot;
  let nextOrder: OrderState = { ...order, records: [...order.records, record], scrapQty: order.scrapQty + action.scrapQty };

  if (action.passQty > 0) {
    nextLot = applyQcPass(lot, action.opId, action.passQty);
    nextOrder = replaceLot(nextOrder, nextLot);
  } else {
    nextLot = clearRun({ ...lot, qty: 0, gates: { ...lot.gates, [action.opId]: 'done' } });
    nextOrder = replaceLot(nextOrder, nextLot);
  }

  if (action.reworkQty > 0 && action.returnOpId) {
    const line = opsOf(order.lineId);
    const gates: LotState['gates'] = {};
    for (const item of line) {
      if (item.id === action.returnOpId) gates[item.id] = 'rework';
      else if (item.index < OPS_BY_ID[action.returnOpId].index) gates[item.id] = 'done';
      else gates[item.id] = 'pending';
    }
    nextOrder = {
      ...nextOrder,
      lots: [
        ...nextOrder.lots,
        {
          id: uid(`${order.seq}-rw`),
          kind: 'rework',
          qty: action.reworkQty,
          gates,
          runningOpId: null,
          runningOperator: null,
          runningStartedAt: null,
        },
      ],
    };
  }

  const closed = closeLotIfLast(nextOrder, nextLot, action.opId, state);
  nextOrder = closed.order;

  const next = nextAfter(action.opId);
  let message: string;
  if (nextOrder.status === '已結案' && action.scrapQty > 0 && action.passQty === 0 && action.reworkQty === 0) {
    message = `報廢 ${action.scrapQty.toLocaleString('zh-TW')}。工單 ${nextOrder.seq} 結案，完工數量 ${nextOrder.completedQty.toLocaleString('zh-TW')}，報廢 ${nextOrder.scrapQty.toLocaleString('zh-TW')}。`;
  } else if (action.verdict === 'partial' || action.reworkQty > 0 || action.scrapQty > 0) {
    const bits = [`主批 ${action.passQty.toLocaleString('zh-TW')} 個現在${next ? `可到${next.name}` : '已完成本關'}。`];
    if (action.reworkQty > 0) {
      const back = OPS_BY_ID[action.returnOpId ?? '']?.name ?? '前站';
      bits.push(`重工批 ${action.reworkQty.toLocaleString('zh-TW')} 個現在在${back}，尚未開始。`);
    }
    if (nextOrder.status === '已結案') {
      bits.push(`工單已結束。完工 ${nextOrder.completedQty.toLocaleString('zh-TW')}，報廢 ${nextOrder.scrapQty.toLocaleString('zh-TW')}。`);
    }
    message = bits.join('');
  } else if (!next || nextOrder.status === '已結案') {
    message = `${op.name}合格。工單已結束。`;
  } else {
    message = `${op.name}合格。下一關是「${next.name}」。工單尚未結束。`;
  }

  return withMessage(replaceOrder(closed.state, nextOrder), action.opId, message, action.scrapQty > 0 ? 'warn' : 'ok');
}

export function reduceShop(state: ShopState, action: ShopAction): ShopState {
  switch (action.type) {
    case 'reset':
      return createInitialShopState();
    case 'start':
      return reduceStart(state, action.opId, action.lotId);
    case 'complete':
      return reduceComplete(state, action.opId, action.lotId, action.values);
    case 'qcSubmit':
      return reduceQc(state, action);
    case 'addField': {
      if (state.fieldDefs.some((field) => field.code === action.field.code)) {
        return state;
      }
      return { ...state, fieldDefs: [...state.fieldDefs, { ...action.field, createdAt: action.field.createdAt || nowIso() }] };
    }
    case 'updateField':
      return {
        ...state,
        fieldDefs: state.fieldDefs.map((field) => (field.code === action.code ? { ...field, ...action.patch, code: field.code } : field)),
      };
    case 'setInventory':
      return { ...state, inventory: { ...state.inventory, [action.productCode]: action.qty } };
    case 'addCode': {
      const key = action.kind === 'defect' ? 'defectCodes' : 'scrapReasons';
      if (state[key].some((item) => item.code === action.item.code)) return state;
      return { ...state, [key]: [...state[key], action.item] };
    }
    default:
      return state;
  }
}

export function queueForOp(state: ShopState, opId: string): QueueRow[] {
  const op = OPS_BY_ID[opId];
  if (!op) return [];
  const order = findOrderByOp(state, opId);
  if (!order) return [];

  return order.lots.flatMap((lot) => {
    if (lot.qty <= 0) return [];
    const gate = lot.gates[opId];
    if (gate === 'done') return [];
    let status: QueueRow['status'];
    if (gate === 'running') status = '進行中';
    else if (gate === 'rework') status = '可重做';
    else if (gate === 'ready') {
      status = materialShortage(state, opId, lot) ? '還不能開始' : '可開始';
    } else if (gate === 'failed') {
      return [];
    } else {
      status = '還不能開始';
    }
    return [{
      orderSeq: order.seq,
      lotId: lot.id,
      lotKind: lot.kind,
      product: order.shortName,
      opName: op.name,
      qty: lot.qty,
      unit: order.unit,
      status,
    }];
  });
}

export function cardFor(state: ShopState, opId: string, lotId: string | null): CardView | null {
  const op = OPS_BY_ID[opId];
  const order = findOrderByOp(state, opId);
  if (!op || !order) return null;
  const lot = (lotId && findLot(order, lotId)) || order.lots.find((item) => item.gates[opId] !== 'done') || order.lots[0];
  if (!lot) return null;
  const gate = lot.gates[opId];
  const { prevOp, nextOp } = neighborOps(op);
  const running = lot.runningOpId === opId;
  let opStatusLabel: string;
  if (running) opStatusLabel = '進行中';
  else if (gate === 'rework') opStatusLabel = '可重做';
  else if (gate === 'failed') opStatusLabel = '不合格';
  else if (gate === 'done') opStatusLabel = '已完成';
  else if (gate === 'pending') opStatusLabel = '還不能開始';
  else opStatusLabel = '尚未開始';

  return {
    lotId: lot.id,
    lotKind: lot.kind,
    qty: lot.qty,
    unit: order.unit,
    opName: op.name,
    prevOp,
    nextOp,
    opStatusLabel,
    operator: running ? lot.runningOperator : null,
    startedAt: running ? lot.runningStartedAt : null,
    kind: op.kind,
    reportsQty: op.reportsQty,
    gate,
    startVisible: gate !== 'done' && gate !== 'failed',
    startBlocked: !running && (gate === 'pending' || Boolean(materialShortage(state, opId, lot))),
    completeEnabled: running && op.kind === 'production',
    qcButtons: running && op.kind === 'qc',
  };
}

function lotSentence(order: OrderState, lot: LotState): string {
  const line = opsOf(order.lineId);
  const running = lot.runningOpId ? OPS_BY_ID[lot.runningOpId] : null;
  if (running) {
    return `${lot.kind === 'rework' ? '重工批' : '主批'} ${lot.qty.toLocaleString('zh-TW')} ${order.unit}現在在${running.name}，${running.operator}作業中。`;
  }
  const failed = line.find((op) => lot.gates[op.id] === 'failed');
  const rework = line.find((op) => lot.gates[op.id] === 'rework');
  if (failed && rework) {
    const weldLocked = lot.gates['A_WELD'] === 'pending' ? '焊接尚未開始。' : '';
    return `${failed.name}不合格，退回${rework.name}。${weldLocked}`.trim();
  }
  const ready = line.find((op) => lot.gates[op.id] === 'ready' || lot.gates[op.id] === 'rework');
  if (ready) {
    const prefix = lot.kind === 'rework' ? '重工批' : '這批';
    if (lot.gates[ready.id] === 'rework') return `${prefix} ${lot.qty.toLocaleString('zh-TW')} ${order.unit}現在在${ready.name}，可重做。`;
    if (ready.index === 0) return `${prefix}現在在${ready.name}，尚未開始。`;
    return `${prefix} ${lot.qty.toLocaleString('zh-TW')} ${order.unit}現在可到${ready.name}。`;
  }
  if (line.every((op) => lot.gates[op.id] === 'done')) {
    return `${lot.kind === 'rework' ? '重工批' : '主批'}已完成本線。`;
  }
  return `${order.seq} 進行中。`;
}

export function boardForOrder(state: ShopState, seq: string): BoardView | null {
  const order = state.orders.find((item) => item.seq === seq);
  if (!order) return null;
  const line = opsOf(order.lineId);
  const lots = order.lots.filter((lot) => lot.qty > 0 || order.lots.length === 1);
  const sentences =
    order.status === '已結案'
      ? [`五關完成。工單已結束。完工 ${order.completedQty.toLocaleString('zh-TW')} ${order.unit}，報廢 ${order.scrapQty.toLocaleString('zh-TW')} ${order.unit}。`]
      : lots.map((lot) => lotSentence(order, lot));

  return {
    order,
    chain: line.map((op) => op.name).join(' → '),
    sentences,
    lots: lots.map((lot) => ({
      lot,
      label: lot.kind === 'main' ? `主批 ${lot.qty.toLocaleString('zh-TW')} ${order.unit}` : `重工批 ${lot.qty.toLocaleString('zh-TW')} ${order.unit}`,
      gates: line.map((op) => {
        const boardStatus = lot.gates[op.id];
        return {
          index: op.index + 1,
          id: op.id,
          opName: op.name,
          boardStatus,
          boardLabel: boardLabel(boardStatus),
        } satisfies GateView;
      }),
    })),
  };
}

export function defaultLotId(state: ShopState, opId: string): string | null {
  const rows = queueForOp(state, opId);
  const preferred = rows.find((row) => row.status === '進行中') ?? rows.find((row) => row.status === '可開始' || row.status === '可重做') ?? rows[0];
  return preferred?.lotId ?? null;
}

export { OPERATIONS, fieldsForOp };
export function enabledFieldsForOp(state: ShopState, opId: string): FieldDef[] {
  return fieldsForOp(state, opId);
}
