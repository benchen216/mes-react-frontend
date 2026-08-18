import type { CodeItem, FieldDef, GateBoardStatus, OpDef, OrderState, ShopState } from '../types/shop';

function seedGates(ops: OpDef[]): Record<string, GateBoardStatus> {
  const gates: Record<string, GateBoardStatus> = {};
  for (const op of ops) {
    gates[op.id] = op.index === 0 ? 'ready' : 'pending';
  }
  return gates;
}

export const OPERATIONS: OpDef[] = [
  { id: 'A_STAMP', lineId: 'A', index: 0, name: '薄板沖壓', stationName: '沖壓線', kind: 'production', operator: '王沖壓', role: '沖壓作業員', reportsQty: true },
  { id: 'A_STAMP_QC', lineId: 'A', index: 1, name: '沖壓品檢', stationName: '沖壓品檢站', kind: 'qc', operator: '李檢驗', role: '檢驗員', reportsQty: false },
  { id: 'A_WELD', lineId: 'A', index: 2, name: '雷射焊接', stationName: '雷射焊接站', kind: 'production', operator: '陳焊接', role: '焊接作業員', reportsQty: true },
  { id: 'A_WASH', lineId: 'A', index: 3, name: '清洗', stationName: '清洗站', kind: 'production', operator: '林清洗', role: '清洗作業員', reportsQty: false },
  { id: 'A_FINAL_QC', lineId: 'A', index: 4, name: '成品品檢', stationName: '成品品檢站', kind: 'qc', operator: '李檢驗', role: '檢驗員', reportsQty: false },
  { id: 'B_ASM', lineId: 'B', index: 0, name: '前框上料組裝', stationName: '組裝一線', kind: 'production', operator: '張組裝', role: '組裝作業員', reportsQty: true, inputMaterial: { productCode: 'FR-27-BZ-A', perUnit: 1 } },
  { id: 'B_ELEC', lineId: 'B', index: 1, name: '電控模組安裝', stationName: '組裝二線', kind: 'production', operator: '黃組裝', role: '組裝作業員', reportsQty: false },
  { id: 'B_TEST', lineId: 'B', index: 2, name: '功能測試', stationName: '測試房', kind: 'qc', operator: '周測試', role: '測試員', reportsQty: false },
  { id: 'B_VISUAL', lineId: 'B', index: 3, name: '外觀檢驗', stationName: '目檢站', kind: 'qc', operator: '吳目檢', role: '目檢員', reportsQty: false },
  { id: 'B_PACK', lineId: 'B', index: 4, name: '包裝入庫', stationName: '包裝線', kind: 'production', operator: '蔡包裝', role: '包裝作業員', reportsQty: false },
];

export const OPS_BY_ID: Record<string, OpDef> = Object.fromEntries(OPERATIONS.map((op) => [op.id, op]));

export const LINE_META = {
  A: { id: 'A' as const, name: '金屬前框沖焊線', productCode: 'FR-27-BZ-A' },
  B: { id: 'B' as const, name: '監視器整機組裝線', productCode: 'MON-27-A' },
};

const CREATED = '2026-08-01T00:00:00.000Z';

export const INITIAL_FIELD_DEFS: FieldDef[] = [
  { code: 'qty_stamp', label: '實際沖壓數', type: 'number', required: true, opIds: ['A_STAMP'], enabled: true, createdAt: CREATED },
  {
    code: 'mold_id',
    label: '模具編號',
    type: 'select',
    required: true,
    opIds: ['A_STAMP'],
    enabled: true,
    options: [
      { value: 'MD-FR27-02', label: 'MD-FR27-02' },
      { value: 'MD-FR27-05', label: 'MD-FR27-05' },
    ],
    createdAt: CREATED,
  },
  { code: 'coil_lot', label: '料捲批號', type: 'text', required: true, opIds: ['A_STAMP'], enabled: true, createdAt: CREATED },
  { code: 'remark', label: '備註', type: 'text', required: false, opIds: ['A_STAMP'], enabled: true, createdAt: CREATED },
  { code: 'sample_qty', label: '抽檢數', type: 'number', required: true, opIds: ['A_STAMP_QC'], enabled: true, createdAt: CREATED },
  { code: 'flatness', label: '平面度 (mm)', type: 'number', required: true, opIds: ['A_STAMP_QC'], enabled: true, max: 0.35, createdAt: CREATED },
  { code: 'qty_weld', label: '數量回報', type: 'number', required: true, opIds: ['A_WELD'], enabled: true, createdAt: CREATED },
  { code: 'qty_asm', label: '完成台數', type: 'number', required: true, opIds: ['B_ASM'], enabled: true, createdAt: CREATED },
  { code: 'frame_lot', label: '前框批號', type: 'select', required: true, opIds: ['B_ASM'], enabled: true, optionsSource: 'frameLots', createdAt: CREATED },
  { code: 'panel_lot', label: '面板批號', type: 'text', required: true, opIds: ['B_ASM'], enabled: true, createdAt: CREATED },
  { code: 'test_report', label: '測試報告編號', type: 'text', required: true, opIds: ['B_TEST'], enabled: true, source: 'fixture', createdAt: CREATED },
  { code: 'brightness', label: '亮度 (cd/m²)', type: 'number', required: true, opIds: ['B_TEST'], enabled: true, min: 350, max: 450, source: 'fixture', overridable: true, createdAt: CREATED },
  { code: 'delta_e', label: '色差 ΔE', type: 'number', required: true, opIds: ['B_TEST'], enabled: true, max: 3, source: 'fixture', overridable: true, createdAt: CREATED },
  { code: 'defect_photos', label: '缺陷照片', type: 'photo', required: false, requiredWhen: 'fail', opIds: ['B_VISUAL'], enabled: true, createdAt: CREATED },
];

export const FIXTURE_READINGS: Record<string, Record<string, string | number>> = {
  B_TEST: {
    test_report: 'FT-20260818-011',
    brightness: 412,
    delta_e: 1.4,
  },
};

export const INITIAL_DEFECT_CODES: CodeItem[] = [
  { code: 'DEF-FLAT', label: '平面度超標', enabled: true },
  { code: 'DEF-BURR', label: '毛邊', enabled: true },
  { code: 'DEF-COATING', label: '鍍層附著力不合格', enabled: true },
];

export const INITIAL_SCRAP_REASONS: CodeItem[] = [
  { code: 'SCR-UNREPAIRABLE', label: '無法重工', enabled: true },
];

function seedOrder(seq: string, lineId: 'A' | 'B', productCode: string, productName: string, shortName: string, plannedQty: number, unit: string): OrderState {
  const ops = OPERATIONS.filter((op) => op.lineId === lineId);
  return {
    seq,
    lineId,
    productCode,
    productName,
    shortName,
    plannedQty,
    unit,
    status: '待生產',
    lots: [
      {
        id: `${seq}-main`,
        kind: 'main',
        qty: plannedQty,
        gates: seedGates(ops),
        runningOpId: null,
        runningOperator: null,
        runningStartedAt: null,
      },
    ],
    records: [],
    completedQty: 0,
    scrapQty: 0,
  };
}

export function createInitialShopState(): ShopState {
  return {
    orders: [
      seedOrder('MO-FR-27-005', 'A', 'FR-27-BZ-A', '27 吋監視器用金屬前框', '金屬前框', 10000, '個'),
      seedOrder('MO-MON-27-011', 'B', 'MON-27-A', '27 吋監視器整機', '監視器整機', 2000, '台'),
    ],
    inventory: { 'FR-27-BZ-A': 0, 'MON-27-A': 0 },
    fieldDefs: INITIAL_FIELD_DEFS.map((field) => ({ ...field, options: field.options?.map((opt) => ({ ...opt })) })),
    defectCodes: INITIAL_DEFECT_CODES.map((item) => ({ ...item })),
    scrapReasons: INITIAL_SCRAP_REASONS.map((item) => ({ ...item })),
    messages: {},
  };
}
