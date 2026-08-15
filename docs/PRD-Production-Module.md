# Production 模組產品需求文件（PRD）

> 本文件描述 Axelor Production 模組前端 React 化改造的產品需求。涵蓋範圍：製造工單生命週期的關鍵 user flow。

---

## 一、產品定位

將 Axelor Open Suite 的 Production 模組（製造執行系統核心），從 XML View DSL + 動態渲染架構，改造為獨立的 React webapp，以 mock data 驅動完整 user flow，實現真正的前後端分離 prototype。

**不包含**：實際後端串接、品質 / 維修 / 供應鏈模組（後續 phase）。

---

## 二、使用者角色

| Actor | 說明 | 權限範圍 |
|---|---|---|
| 生產管理師 | 建立與維護 BOM、製程，排程工單 | BOM CRUD、ProdProcess CRUD、ManufOrder 全操作 |
| 現場主管 | 監控工單進度，派工 | ManufOrder 列表與詳情、OperationOrder 操作 |
| 作業員 | 執行工序操作 | OperationOrder Start/Pause/Finish |

---

## 三、功能需求

### 3.1 P0 — 必須完成

| # | 功能 | 說明 |
|---|---|---|
| F-01 | 製造工單列表（Grid） | 支援按狀態篩選（Draft/Planned/In Progress/Standby/Finished/Cancelled）、優先級顏色標示、排序 |
| F-02 | 製造工單詳情（Form） | 展示工單完整資訊：基本資料、工序清單、日期、庫存異動、消耗/生產產品、成本 |
| F-03 | 工單狀態機操作 | Plan / Start / Pause / Resume / Finish / Cancel 按鈕，依當前狀態動態顯示 |
| F-04 | 工序工單操作 | 工序列表中可 Start / Pause / Resume / Finish 各工序 |
| F-05 | 側選單導覽 | Manufacturing 選單樹：Dashboard / Manufacturing orders / Operations / BOM / ProdProcess / Configuration |
| F-06 | BOM 列表與詳情 | 檢視 BOM 及其組件明細、多層子 BOM |
| F-07 | 製造 Dashboard | 即時看板：待工單 / 進行中工單 / 暫停工單 / 報廢量 |

### 3.2 P1 — 應該完成

| # | 功能 | 說明 |
|---|---|---|
| F-08 | 製程列表與詳情 | ProdProcess + ProdProcessLine 展示 |
| F-09 | 工單建立精靈 | 選擇 BOM + ProdProcess + Qty → 建立 Draft 工單 |
| F-10 | 委外流程展示 | Outsourcing 標記、委外廠商、採購單連結 |
| F-11 | 成本表檢視 | CostSheet 列表與明細 |

### 3.3 P2 — 可選

| # | 功能 | 說明 |
|---|---|---|
| F-12 | 日曆檢視 | 工序排程日曆 |
| F-13 | 圖表分析 | 機台負載、報廢量、工時分析 |
| F-14 | 多公司切換 | company 篩選 |

---

## 四、User Flow 清單

以下 user flow 以 `.activity` 活動圖描述，對應 React prototype 中的可導航路徑：

| Flow | 活動圖檔案 | 說明 |
|---|---|---|
| UF-01 製造工單完整生命週期 | `01-製造工單生命週期.activity` | 從建立到完工的全流程 |
| UF-02 BOM 建立與審核 | `02-BOM建立與審核.activity` | BOM 從 Draft 到 Applicable |
| UF-03 生產製程建立 | `03-生產製程建立.activity` | ProdProcess 從建立到 Applicable |
| UF-04 工序執行流程 | `04-工序執行流程.activity` | OperationOrder 的 Start→Finish |
| UF-05 委外流程 | `05-委外流程.activity` | 委外宣告與採購 |

---

## 五、資料模型摘要

### 5.1 核心實體

```
ManufOrder (製造工單)
├── manufOrderSeq: string (唯一序號)
├── statusSelect: int (1=Draft, 2=Cancelled, 3=Planned, 4=In Progress, 5=Standby, 6=Finished)
├── prioritySelect: int (1=Low, 2=Normal, 3=High, 4=Urgent)
├── typeSelect: int (1=Production, 2=Permanent)
├── company, product, unit, billOfMaterial, prodProcess
├── qty: decimal
├── plannedStartDateT, plannedEndDateT, realStartDateT, realEndDateT
├── outsourcing: boolean, outsourcingPartner
├── operationOrderList: [OperationOrder]
├── toConsumeProdProductList, consumedStockMoveLineList (消耗追蹤)
├── toProduceProdProductList, producedStockMoveLineList (生產追蹤)
├── costSheetList: [CostSheet]
└── costPrice: decimal
```

```
OperationOrder (工序工單)
├── priority, name, operationName
├── manufOrder, prodProcessLine, workCenter, machine
├── statusSelect: int (同 ManufOrder 狀態)
├── plannedStartDateT, plannedEndDateT, realStartDateT, realEndDateT
├── plannedDuration, realDuration
├── operationOrderDurationList: [OperationOrderDuration]
└── outsourcing, outsourcingPartner
```

```
BillOfMaterial (物料清單)
├── name, product, qty, unit, company
├── prodProcess
├── statusSelect: int (1=Draft, 2=Validated, 3=Applicable, 4=Obsolete)
├── versionNumber, originalBillOfMaterial
├── billOfMaterialLineList: [BillOfMaterialLine]
├── costPrice, calculationQty
└── personalized, defineSubBillOfMaterial
```

```
ProdProcess (生產製程)
├── name, code, company, product
├── statusSelect: int (1=Draft, 2=Validated, 3=Applicable, 4=Obsolete)
├── prodProcessLineList: [ProdProcessLine]
├── operationContinuity, isConsProOnOperation
├── outsourcing, outsourcable, subcontractor
├── stockMoveRealizeOrderSelect (On Start / On Finish)
└── launchQty
```

### 5.2 狀態機定義

**ManufOrder / OperationOrder 狀態：**
| 值 | 狀態 | 可用動作 |
|---|---|---|
| 1 | Draft | → Plan(3), → Cancel(2) |
| 2 | Cancelled | → Plan(3), → Return to Draft(1) |
| 3 | Planned | → Start(4), → Cancel(2) |
| 4 | In Progress | → Pause(5), → Finish(6), → Cancel(2), → Partial Finish |
| 5 | Standby | → Resume(4), → Cancel(2) |
| 6 | Finished | (終態) |
| 7 | Merged | (終態，合併來源) |

**BOM / ProdProcess 狀態：**
| 值 | 狀態 | 可用動作 |
|---|---|---|
| 1 | Draft | → Validate(2) |
| 2 | Validated | → Make Applicable(3) |
| 3 | Applicable | → Make Obsolete(4) |
| 4 | Obsolete | → Back to Draft(1) |

---

## 六、畫面規格

### 6.1 畫面清單

| Route | 畫面 | 對應 Axelor View |
|---|---|---|
| `/` | Dashboard | manufacturing.dashboard.sample |
| `/manuf-orders` | 製造工單列表 | manuf-order-grid |
| `/manuf-orders/:id` | 製造工單詳情 | manuf-order-form |
| `/operations` | 工序工單列表 | operation-order-group-grid |
| `/bom` | BOM 列表 | bill-of-material-grid |
| `/bom/:id` | BOM 詳情 | bill-of-material-form |
| `/prod-process` | 製程列表 | prod-process-grid |
| `/prod-process/:id` | 製程詳情 | prod-process-form |
| `/config/work-centers` | 工作中心 | work-center-grid |
| `/config/machines` | 機台 | machine-grid |

### 6.2 工單列表頁規格

- 欄位：序號 / 產品 / 數量 / BOM / 製程 / 委外 / 計畫開始 / 計畫結束 / 實際開始 / 實際結束 / 狀態
- 優先級顏色：Urgent=紅, High=橘, Normal=藍, Low=灰
- 篩選器：Draft / Planned / In Progress / Standby / Finished / Cancelled / Late Planned / Finished Late
- 列上操作按鈕：Plan / Start / Pause / Finish / Cancel（依狀態顯示）

### 6.3 工單詳情頁規格

- 左側（8/12）：基本資料面板（序號、優先級、公司、產品、數量、BOM、製程）
- 右側（4/12）：動作面板（Plan/Start/Pause/Resume/Finish/Cancel 按鈕）
- 分頁：
  - Operations（工序列表，可操作）
  - Dates（計畫與實際日期）
  - Consumed Products（待消耗 / 已消耗 / 差異）
  - Produced Products（待生產 / 已生產）
  - Stock Moves（入出庫異動）
  - Cost（成本表）
  - Notes

---

## 七、非功能需求

| 項目 | 要求 |
|---|---|
| 技術堆疊 | React 18+ / TypeScript / Vite |
| UI 框架 | Tailwind CSS（或 Ant Design） |
| 路由 | React Router v6 |
| 狀態管理 | React Context + useReducer（狀態機驅動） |
| 資料 | Mock JSON，不接後端 |
| 響應式 | 支援桌面優先（1280px+） |
| 語言 | 繁體中文介面 |
