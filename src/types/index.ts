// 製造工單狀態：1=草稿, 2=已取消, 3=已計畫, 4=進行中, 5=暫停, 6=已完工
export type MoStatus = 1 | 2 | 3 | 4 | 5 | 6;

// BOM / 製程狀態：1=草稿, 2=已核可, 3=適用中, 4=已停用
export type BomStatus = 1 | 2 | 3 | 4;

// 優先級：1=低, 2=一般, 3=高, 4=緊急
export type Priority = 1 | 2 | 3 | 4;

// 工單類型：1=生產, 2=常備
export type MoType = 1 | 2;

export interface ManufOrder {
  id: number;
  manufOrderSeq: string;
  statusSelect: MoStatus;
  prioritySelect: Priority;
  typeSelect: MoType;
  company: string;
  product: string;
  qty: number;
  unit: string;
  billOfMaterial: string;
  prodProcess: string;
  outsourcing: boolean;
  outsourcingPartner?: string;
  plannedStartDateT?: string;
  plannedEndDateT?: string;
  realStartDateT?: string;
  realEndDateT?: string;
  costPrice?: number;
  operationOrders: OperationOrder[];
  toConsumeProducts: ProdProduct[];
  consumedProducts: ProdProduct[];
  toProduceProducts: ProdProduct[];
  producedProducts: ProdProduct[];
  costSheets: CostSheet[];
}

export interface OperationOrder {
  id: number;
  priority: number;
  name: string;
  operationName: string;
  statusSelect: MoStatus;
  workCenter: string;
  machine?: string;
  plannedStartDateT?: string;
  plannedEndDateT?: string;
  realStartDateT?: string;
  realEndDateT?: string;
  plannedDuration?: number;
  realDuration?: number;
  outsourcing: boolean;
}

export interface ProdProduct {
  id: number;
  product: string;
  plannedQty: number;
  realQty?: number;
  unit: string;
}

export interface CostSheet {
  id: number;
  calculationType: string; // "部分完工" | "完工結算" | "在製品 WIP" | "依 BOM 預估"
  costPrice: number;
  calculationDate: string;
}

export interface BillOfMaterial {
  id: number;
  name: string;
  product: string;
  qty: number;
  unit: string;
  statusSelect: BomStatus;
  versionNumber: number;
  prodProcess: string;
  costPrice?: number;
  lines: BomLine[];
}

export interface BomLine {
  id: number;
  product: string;
  qty: number;
  unit: string;
  priority: number;
  subBomName?: string;
  wasteRate?: number;
}

export interface ProdProcess {
  id: number;
  name: string;
  code: string;
  product: string;
  statusSelect: BomStatus;
  operationContinuity: boolean;
  isConsProOnOperation: boolean;
  outsourcing: boolean;
  launchQty: number;
  lines: ProdProcessLine[];
}

export interface ProdProcessLine {
  id: number;
  name: string;
  priority: number;
  workCenter: string;
  workCenterType: string; // "人工" | "機器" | "人工與機器"
  durationPerCycle: number;
  humanDuration: number;
  minCapacity: number;
  maxCapacity: number;
  outsourcing: boolean;
}

export interface WorkCenter {
  id: number;
  name: string;
  code: string;
  type: string; // "人工" | "機器" | "人工與機器"
  machine?: string;
  costType: string; // "每小時" | "每循環" | "每件"
  costAmount: number;
}

export interface Machine {
  id: number;
  name: string;
  code: string;
  serialNumber: string;
  machineType: string;
  status: string; // "運轉中" | "停機" | "維修中"
}
