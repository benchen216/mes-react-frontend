import { FINAL_QC_FAIL_HINT, FIVE_OPS_ORDER, INITIAL_FIVE_OPS_STATE, STATION_BY_ID, STATIONS } from '../data/fiveOpsMock';
import type {
  CardView,
  FiveOpsAction,
  FiveOpsDerived,
  FiveOpsState,
  GateBoardStatus,
  GateView,
  QueueRow,
  StationId,
} from '../types/fiveOps';

export function createInitialFiveOpsState(): FiveOpsState {
  return { ...INITIAL_FIVE_OPS_STATE };
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function getActionableStation(state: FiveOpsState): StationId | null {
  if (state.orderFinished) return null;
  if (!state.stampDone || state.stampQcFailed) return 'STAMP';
  if (!state.stampQcPassed) return 'STAMP_QC';
  if (!state.weldDone) return 'WELD';
  if (!state.washDone) return 'WASH';
  if (!state.finalQcPassed) return 'FINAL_QC';
  return null;
}

function requiredPrevOp(state: FiveOpsState, station: StationId): string | null {
  switch (station) {
    case 'STAMP':
      return null;
    case 'STAMP_QC':
      return state.stampDone ? null : '薄板沖壓';
    case 'WELD':
      if (!state.stampDone) return '薄板沖壓';
      if (!state.stampQcPassed) return '沖壓品檢';
      return null;
    case 'WASH':
      return state.weldDone ? null : '雷射焊接';
    case 'FINAL_QC':
      return state.washDone ? null : '清洗';
  }
}

function nextAfter(station: StationId, passed = true): { op: string; here: string } | null {
  if (station === 'STAMP') return { op: '沖壓品檢', here: '沖壓品檢站' };
  if (station === 'STAMP_QC') return passed ? { op: '雷射焊接', here: '雷射焊接站' } : { op: '薄板沖壓', here: '沖壓線' };
  if (station === 'WELD') return { op: '清洗', here: '清洗站' };
  if (station === 'WASH') return { op: '成品品檢', here: '成品品檢站' };
  return null;
}

function neighborOps(station: StationId): { prevOp: string; nextOp: string } {
  const index = STATION_BY_ID[station].index;
  return {
    prevOp: index === 0 ? '無' : STATIONS[index - 1].opName,
    nextOp: index === 4 ? '無（工單結束）' : STATIONS[index + 1].opName,
  };
}

function withMessage(state: FiveOpsState, lastMessage: string, lastMessageKind: FiveOpsState['lastMessageKind']): FiveOpsState {
  return { ...state, lastMessage, lastMessageKind };
}

function clearRun(state: FiveOpsState): FiveOpsState {
  return {
    ...state,
    runningStation: null,
    runningOperator: null,
    runningStartedAt: null,
  };
}

export function reduceFiveOps(state: FiveOpsState, action: FiveOpsAction): FiveOpsState {
  if (action.type === 'reset') {
    return createInitialFiveOpsState();
  }

  const station = action.station;
  const def = STATION_BY_ID[station];
  const actionable = getActionableStation(state);

  if (action.type === 'start') {
    if (state.orderFinished) {
      return withMessage(state, '工單已結束。', 'info');
    }
    if (state.runningStation === station) {
      return withMessage(
        state,
        `本關進行中。作業員：${state.runningOperator}。開始：${formatClock(state.runningStartedAt ?? nowIso())}`,
        'ok',
      );
    }
    if (state.runningStation && state.runningStation !== station) {
      const prev = requiredPrevOp(state, station) ?? STATION_BY_ID[state.runningStation].opName;
      return withMessage(state, `還不能開始。需先完成「${prev}」。`, 'warn');
    }
    if (actionable !== station) {
      const prev = requiredPrevOp(state, station) ?? '上一工序';
      return withMessage(state, `還不能開始。需先完成「${prev}」。`, 'warn');
    }
    const startedAt = nowIso();
    return {
      ...state,
      runningStation: station,
      runningOperator: def.operator,
      runningStartedAt: startedAt,
      lastMessage: `本關進行中。作業員：${def.operator}。開始：${formatClock(startedAt)}`,
      lastMessageKind: 'ok',
    };
  }

  if (action.type === 'complete') {
    if (state.runningStation !== station || def.kind !== 'production') {
      return state;
    }
    const qty = action.qty ?? FIVE_OPS_ORDER.qty;
    const next = nextAfter(station);
    const nextLine = next ? `下一關是「${next.op}」，由「${next.here}」開始。` : '';
    const base = clearRun({
      ...state,
      reportedQty: qty,
      lastMessage: `本關已完成。${nextLine}`.trim(),
      lastMessageKind: 'ok',
    });
    if (station === 'STAMP') {
      return { ...base, stampDone: true, stampQcFailed: false };
    }
    if (station === 'WELD') {
      return { ...base, weldDone: true };
    }
    return { ...base, washDone: true };
  }

  if (action.type === 'pass') {
    if (state.runningStation !== station || def.kind !== 'qc') {
      return state;
    }
    if (station === 'STAMP_QC') {
      return clearRun({
        ...state,
        stampQcPassed: true,
        stampQcFailed: false,
        lastMessage: '沖壓品檢合格。下一關是「雷射焊接」。工單尚未結束。',
        lastMessageKind: 'ok',
      });
    }
    return clearRun({
      ...state,
      finalQcPassed: true,
      orderFinished: true,
      lastMessage: '成品品檢合格。工單已結束。',
      lastMessageKind: 'ok',
    });
  }

  if (action.type === 'fail') {
    if (station === 'FINAL_QC') {
      return withMessage(state, FINAL_QC_FAIL_HINT, 'info');
    }
    if (state.runningStation !== 'STAMP_QC' || station !== 'STAMP_QC') {
      return state;
    }
    return clearRun({
      ...state,
      stampDone: false,
      stampQcPassed: false,
      stampQcFailed: true,
      lastMessage: '判定不合格。工單不能結束。請退回「薄板沖壓」重做。焊接尚未開始。',
      lastMessageKind: 'error',
    });
  }

  return state;
}

function boardLabel(status: GateBoardStatus): string {
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

function stampBoardStatus(state: FiveOpsState, actionable: StationId | null): GateBoardStatus {
  if (state.runningStation === 'STAMP') return 'running';
  if (state.stampQcFailed && !state.stampDone) return 'rework';
  if (state.stampDone) return 'done';
  if (actionable === 'STAMP') return 'ready';
  return 'pending';
}

function stampQcBoardStatus(state: FiveOpsState, actionable: StationId | null): GateBoardStatus {
  if (state.runningStation === 'STAMP_QC') return 'running';
  if (state.stampQcFailed) return 'failed';
  if (state.stampQcPassed) return 'done';
  if (actionable === 'STAMP_QC') return 'ready';
  return 'pending';
}

function simpleBoardStatus(
  running: boolean,
  done: boolean,
  ready: boolean,
): GateBoardStatus {
  if (running) return 'running';
  if (done) return 'done';
  if (ready) return 'ready';
  return 'pending';
}

export function boardSentence(state: FiveOpsState): string {
  const actionable = getActionableStation(state);
  if (state.orderFinished) return '五關完成。工單已結束。';
  if (state.runningStation === 'STAMP') return '這批現在在薄板沖壓，王沖壓作業中。';
  if (state.runningStation === 'STAMP_QC') return '這批現在在沖壓品檢。';
  if (state.runningStation === 'WELD') return '這批現在在雷射焊接，陳焊接作業中。';
  if (state.runningStation === 'WASH') return '這批現在在清洗。';
  if (state.runningStation === 'FINAL_QC') return '這批現在在成品品檢。';
  if (state.stampQcFailed && !state.stampDone) {
    return '沖壓品檢不合格，退回薄板沖壓。焊接尚未開始。';
  }
  if (actionable === 'STAMP') return '這批現在在薄板沖壓，尚未開始。';
  if (actionable === 'STAMP_QC') return '這批現在可到沖壓品檢。';
  if (actionable === 'WELD') return '這批現在可到雷射焊接。工單尚未結束。';
  if (actionable === 'WASH') return '這批現在可到清洗。工單尚未結束。';
  if (actionable === 'FINAL_QC') return '這批現在可到成品品檢。工單尚未結束。';
  return '這批現在在薄板沖壓，尚未開始。';
}

export function deriveFiveOps(state: FiveOpsState): FiveOpsDerived {
  const actionable = getActionableStation(state);
  const gates: GateView[] = STATIONS.map((station) => {
    let status: GateBoardStatus;
    if (station.id === 'STAMP') status = stampBoardStatus(state, actionable);
    else if (station.id === 'STAMP_QC') status = stampQcBoardStatus(state, actionable);
    else if (station.id === 'WELD') {
      status = simpleBoardStatus(state.runningStation === 'WELD', state.weldDone, actionable === 'WELD');
    } else if (station.id === 'WASH') {
      status = simpleBoardStatus(state.runningStation === 'WASH', state.washDone, actionable === 'WASH');
    } else {
      status = simpleBoardStatus(
        state.runningStation === 'FINAL_QC',
        state.finalQcPassed,
        actionable === 'FINAL_QC',
      );
    }
    return {
      index: station.index + 1,
      id: station.id,
      opName: station.opName,
      boardStatus: status,
      boardLabel: boardLabel(status),
    };
  });

  return {
    actionableStation: actionable,
    gates,
    boardSentence: boardSentence(state),
    orderStatusLabel: state.orderFinished ? '已結束' : '進行中',
  };
}

export function queueForStation(state: FiveOpsState, station: StationId): { todo: QueueRow[]; other: QueueRow[] } {
  if (state.orderFinished) {
    return { todo: [], other: [] };
  }

  const def = STATION_BY_ID[station];
  const actionable = getActionableStation(state);
  const row = (status: QueueRow['status']): QueueRow => ({
    seq: FIVE_OPS_ORDER.seq,
    product: FIVE_OPS_ORDER.shortName,
    opName: def.opName,
    qty: FIVE_OPS_ORDER.qty,
    status,
  });

  if (state.runningStation === station) {
    return { todo: [row('進行中')], other: [] };
  }
  if (actionable === station) {
    return { todo: [row('可開始')], other: [] };
  }

  const doneHere =
    (station === 'STAMP' && state.stampDone && !state.stampQcFailed) ||
    (station === 'STAMP_QC' && state.stampQcPassed) ||
    (station === 'WELD' && state.weldDone) ||
    (station === 'WASH' && state.washDone) ||
    (station === 'FINAL_QC' && state.finalQcPassed);

  if (doneHere) {
    return { todo: [], other: [] };
  }

  return { todo: [], other: [row('還不能開始')] };
}

export function cardForStation(state: FiveOpsState, station: StationId): CardView {
  const def = STATION_BY_ID[station];
  const { prevOp, nextOp } = neighborOps(station);
  const actionable = getActionableStation(state);
  const runningHere = state.runningStation === station;

  let cardState: CardView['state'];
  let opStatusLabel: string;

  if (runningHere) {
    cardState = def.kind === 'qc' ? 'judging' : 'running';
    opStatusLabel = '進行中';
  } else if (station === 'STAMP' && state.stampQcFailed && !state.stampDone) {
    cardState = 'idle';
    opStatusLabel = '可重做';
  } else if (station === 'STAMP_QC' && state.stampQcFailed) {
    cardState = 'failed';
    opStatusLabel = '不合格';
  } else if (station === 'STAMP' && state.stampDone) {
    cardState = 'done';
    opStatusLabel = '已完成';
  } else if (station === 'STAMP_QC' && state.stampQcPassed) {
    cardState = 'passed';
    opStatusLabel = '已完成';
  } else if (station === 'WELD' && state.weldDone) {
    cardState = 'done';
    opStatusLabel = '已完成';
  } else if (station === 'WASH' && state.washDone) {
    cardState = 'done';
    opStatusLabel = '已完成';
  } else if (station === 'FINAL_QC' && state.finalQcPassed) {
    cardState = 'passed';
    opStatusLabel = '已完成';
  } else if (actionable === station) {
    cardState = 'idle';
    opStatusLabel = '尚未開始';
  } else {
    cardState = 'blocked';
    opStatusLabel = '尚未開始';
  }

  return {
    state: cardState,
    opName: def.opName,
    prevOp,
    nextOp,
    opStatusLabel,
    operator: runningHere ? state.runningOperator : null,
    startedAt: runningHere ? state.runningStartedAt : null,
    kind: def.kind,
    reportsQty: def.reportsQty,
    finalQcFailDisabled: station === 'FINAL_QC',
  };
}
