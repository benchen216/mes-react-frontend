import type { FiveOpsOrder, FiveOpsState, StationDef, StationId } from '../types/fiveOps';

export const FIVE_OPS_ORDER: FiveOpsOrder = {
  seq: 'MO-FR-27-005',
  productCode: 'FR-27-BZ-A',
  productName: '27 吋監視器用金屬前框',
  shortName: '金屬前框',
  qty: 10000,
  unit: '個',
};

export const STATIONS: StationDef[] = [
  {
    id: 'STAMP',
    index: 0,
    opName: '薄板沖壓',
    hereLabel: '沖壓線',
    role: '沖壓作業員',
    kind: 'production',
    operator: '王沖壓',
    reportsQty: true,
  },
  {
    id: 'STAMP_QC',
    index: 1,
    opName: '沖壓品檢',
    hereLabel: '沖壓品檢站',
    role: '檢驗員',
    kind: 'qc',
    operator: '李檢驗',
    reportsQty: false,
  },
  {
    id: 'WELD',
    index: 2,
    opName: '雷射焊接',
    hereLabel: '雷射焊接站',
    role: '焊接作業員',
    kind: 'production',
    operator: '陳焊接',
    reportsQty: true,
  },
  {
    id: 'WASH',
    index: 3,
    opName: '清洗',
    hereLabel: '清洗站',
    role: '清洗作業員',
    kind: 'production',
    operator: '林清洗',
    reportsQty: false,
  },
  {
    id: 'FINAL_QC',
    index: 4,
    opName: '成品品檢',
    hereLabel: '成品品檢站',
    role: '檢驗員',
    kind: 'qc',
    operator: '李檢驗',
    reportsQty: false,
  },
];

export const STATION_BY_ID: Record<StationId, StationDef> = STATIONS.reduce(
  (acc, station) => {
    acc[station.id] = station;
    return acc;
  },
  {} as Record<StationId, StationDef>,
);

export const PROCESS_CHAIN = STATIONS.map((s) => s.opName).join(' → ');

export const INITIAL_FIVE_OPS_STATE: FiveOpsState = {
  stampDone: false,
  stampQcPassed: false,
  stampQcFailed: false,
  weldDone: false,
  washDone: false,
  finalQcPassed: false,
  runningStation: null,
  runningOperator: null,
  runningStartedAt: null,
  reportedQty: null,
  lastMessage: null,
  lastMessageKind: null,
  orderFinished: false,
};

export const FINAL_QC_FAIL_HINT = '本 demo 成品品檢只走合格';
