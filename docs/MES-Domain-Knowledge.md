# MES 系統 Domain 知識簡報

> 本文件為「製造執行系統（MES）」的 domain 知識入門簡報，協助團隊在進入 Axelor Production 模組前端改造前，建立對 MES 領域的共同理解。

---

## 一、什麼是 MES？

### 1.1 定義

MES（Manufacturing Execution System，製造執行系統）是介於 ERP（企業資源規劃）與現場設備之間的**生產執行層資訊系統**。它的核心使命是：

> **把「計畫」變成「執行」，把「執行」變成「可追蹤的資料」。**

ERP 告訴你「要做什麼、做多少、什麼時候交」，MES 則管理「**怎麼做、誰在做、做到哪裡、花了多少時間、消耗了多少原料、出了什麼問題**」。

### 1.2 MES 在企業系統堆疊中的位置

```
┌─────────────────────────────────────────────┐
│           Level 4: 企業經營層                 │
│         ERP（訂單 / 財務 / 採購 / 銷售）       │
│         Axelor: Sale, Purchase, Stock, HR    │
└──────────────────┬──────────────────────────┘
                   │ 生產訂單下達
┌──────────────────▼──────────────────────────┐
│           Level 3: 製造執行層 ← MES           │
│         工單管理 / 工序排程 / 現場派工         │
│         Axelor: Production, Quality,         │
│         Maintenance, Supplychain             │
└──────────────────┬──────────────────────────┘
                   │ 作業指令下發
┌──────────────────▼──────────────────────────┐
│      Level 2: 監控控制層 (SCADA / HMI)       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      Level 1: 設備感測層 (PLC / Sensor)       │
└─────────────────────────────────────────────┘
```

此分層模型源自 **ISA-95** 國際標準（IEC 62264）。Axelor 的 Production 模組對應 Level 3。

### 1.3 為什麼需要 MES？

| 沒有 MES 的痛點 | MES 解決什麼 |
|---|---|
| ERP 開了生產訂單，現場不知道做到哪 | 即時工單進度追蹤（狀態機驅動） |
| BOM 只知道用料清單，不知道工序順序 | 整合 BOM + 製程（ProdProcess） |
| 機台和人工的產能靠口頭回報 | WorkCenter 排程 + 工時記錄 |
| 原料消耗對不上實際領料 | 待消耗 / 已消耗 / 差異三方比對 |
| 成本只能月結事後算 | 完工即時結算 CostSheet |
| 品質異常靠紙本記錄 | 品質模組整合（QualityAlert） |
| 設備壞了才修 | 設備保養排程（Maintenance） |

---

## 二、MES 核心概念字典

### 2.1 基礎概念

| 中文 | 英文 | 縮寫 | 說明 |
|---|---|---|---|
| 物料清單 | Bill of Materials | **BOM** | 產品的「配方」或「食譜」——做一個成品需要哪些原料、各多少量。支援多層（半成品有子 BOM）。 |
| 生產製程 | Production Process | ProdProcess | 產品的「做法」——做一個成品需要經過哪些工序、每道工序用什麼設備。 |
| 工序 / 製程階段 | Production Process Line | ProdProcessLine | 製程中的單一步驟（如：切削 → 組裝 → 測試），綁定 WorkCenter。 |
| 工作中心 | Work Center | WC | 一個可排程的生產資源單位（人 / 機器 / 或兩者），帶有產能和成本。 |
| 製造工單 | Manufacturing Order | **MO** | 「我要做 100 個產品 A」的實際生產單據，是 MES 的核心執行單元。 |
| 工序工單 | Operation Order | **OO** | 工單內每道工序的執行記錄，追蹤工時、消耗、狀態。 |
| 生產訂單 | Production Order | PO | 工單的上層容器，通常由銷售訂單觸發，可含多張工單。 |

### 2.2 庫存與物料概念

| 中文 | 英文 | 說明 |
|---|---|---|
| 待消耗產品 | Products to Consume | BOM 展開後，計畫要消耗的原料清單（計畫量）。 |
| 已消耗產品 | Consumed Products | 實際消耗掉的原料（透過 StockMove 記錄）。 |
| 消耗差異 | Consumption Difference | 計畫量 vs 實際量的差值，用於成本分析和異常追蹤。 |
| 待生產產品 | Products to Produce | 計畫要產出的成品。 |
| 已生產產品 | Produced Products | 實際產出的成品（透過 StockMove 入庫）。 |
| 報廢 | Waste | 生產過程中損耗的原料或不良品。 |
| 副產物 / 殘餘物 | Residual Product | 生產過程中附帶產生的非主產品（如邊角料）。 |

### 2.3 排程與產能概念

| 中文 | 英文 | 說明 |
|---|---|---|
| 主生產排程 | Master Production Schedule | **MPS** — 中期（週 / 月）的生產計畫。 |
| 物料需求規劃 | Material Requirements Planning | **MRP** — 依 MPS 和 BOM 展算原料需求。 |
| 銷售與營運計畫 | Sales & Operations Planning | **S&OP** — 長期的供需平衡計畫。 |
| 產能負荷 | MPS Charge | 機台 / 工作中心在特定時段的排程負載率。 |
| 前置時間 | Lead Time | 從投料到完工的預估時間。 |

### 2.4 成本概念

| 中文 | 英文 | 說明 |
|---|---|---|
| 成本表 | Cost Sheet | 每次完工或部分完工時自動計算的成本單。 |
| 成本類型 | Cost Calculation Type | 4 種：部分完工 / 完工結算 / 在製品 WIP / 依 BOM 預估。 |
| 成本價 | Cost Price | 單位產品的製造成本（原料 + 人工 + 機器 + 加成）。 |

---

## 三、Axelor 的 MES 模組地圖

Axelor Open Suite 沒有一個叫「MES」的單一模組，而是由以下模組組合而成：

```
┌─────────────────────────────────────────────────────┐
│                    MES 能力地圖                       │
├──────────────┬──────────┬────────────────────────────┤
│ 模組          │ App Code │ 在 MES 中的角色              │
├──────────────┼──────────┼────────────────────────────┤
│ Production   │ production│ 製造核心：工單/BOM/工序/成本  │
│ Quality      │ quality   │ 品質管制：檢驗/異常/QI 改善   │
│ Maintenance  │ maintenance│ 設備保養：維修請求/保養排程   │
│ Supplychain  │ supplychain│ 供應鏈：MRP/S&OP/採購整合   │
│ Stock        │ stock     │ 庫存基礎：庫位/批號/庫存異動   │
│ Purchase     │ purchase  │ 採購：委外採購/原料採購       │
│ Base         │ base      │ 共通主檔：產品/公司/單位      │
└──────────────┴──────────┴────────────────────────────┘
```

### 依賴關係

```
production (Manufacturing)
    └── dependsOn: quality
                     └── dependsOn: supplychain
                                  └── dependsOn: stock, purchase
                                              └── dependsOn: base
```

安裝 `production` App 會自動連帶啟用 quality → supplychain → stock → base。

---

## 四、Production 模組核心架構

### 4.1 三層架構：定義層 → 計畫層 → 執行層

```
╔═══════════════════════════════════════════════════════════╗
║                    定義層 (Definition)                      ║
║  ┌──────────────┐         ┌──────────────────┐             ║
║  │ BillOfMaterial│────────→│   ProdProcess     │             ║
║  │   (做什麼)    │  prod   │   (怎麼做)        │             ║
║  │   Process    │ Process │                   │             ║
║  └──────┬───────┘         └────────┬──────────┘             ║
║         │ lines                     │ lines                  ║
║  ┌──────▼───────┐         ┌────────▼──────────┐             ║
║  │ BOMLine      │         │ ProdProcessLine    │            ║
║  │ (組件明細)    │         │ (工序定義)         │             ║
║  │  product     │         │  workCenter        │             ║
║  │  qty         │         │  durationPerCycle   │            ║
║  │  sub-BOM     │         │  humanDuration      │            ║
║  └──────────────┘         └────────────────────┘             ║
╚═══════════════════════════════════════════════════════════╝
                          ↓ 建立工單時引用
╔═══════════════════════════════════════════════════════════╗
║                    執行層 (Execution)                       ║
║  ┌───────────────────────────────────────────────┐         ║
║  │              ManufOrder (製造工單)               │         ║
║  │  billOfMaterial + prodProcess + qty             │         ║
║  │  statusSelect: 1→3→4→6 (Draft→Plan→Start→Finish)│        ║
║  └───────────────────┬───────────────────────────┘         ║
║                      │ 1:N (Plan 時自動產生)                  ║
║  ┌───────────────────▼───────────────────────────┐         ║
║  │           OperationOrder (工序工單)              │         ║
║  │  每道工序一張，按 priority 排序                    │         ║
║  │  追蹤: 工時 / 消耗 / 狀態                          │         ║
║  └───────────────────┬───────────────────────────┘         ║
║                      │ 1:N                                   ║
║  ┌───────────────────▼───────────────────────────┐         ║
║  │      OperationOrderDuration (工時記錄)           │         ║
║  │  每次 Start/Pause/Resume/Finish 留下一筆          │         ║
║  └───────────────────────────────────────────────┘         ║
╚═══════════════════════════════════════════════════════════╝
```

### 4.2 製造工單狀態機（核心流程）

```
                          ┌─────────┐
                 plan     │ DRAFT   │
            ┌────────────►│   (1)   │
            │             └────┬────┘
            │                  │ plan
            │                  ▼
            │             ┌─────────┐    start     ┌─────────────┐
            │             │ PLANNED │ ──────────► │ IN_PROGRESS │
            │             │   (3)   │             │     (4)     │
            │             └─────────┘             └──────┬──────┘
            │                  │                         │
            │              cancel                     pause│finish
            │                  │                    ┌─────┘└─────┐
            │                  ▼                    ▼            ▼
            │             ┌─────────┐         ┌─────────┐  ┌─────────┐
            │             │CANCELED │◄────────│ STANDBY │  │FINISHED │
            │             │   (2)   │ resume  │  (5)    │  │  (6)    │
            │             └────┬────┘────────►└─────────┘  └─────────┘
            │                  │
            └──────────────────┘ (draftBtn 回到草稿)
```

### 4.3 資源模型

```
WorkCenterGroup (工作中心群組)
    └──< WorkCenter (工作中心: Human / Machine / Both)
              │          ├── type: 1=Human, 2=Machine, 3=Both
              │          ├── capacity: min/max per cycle
              │          ├── cost: per hour / per cycle / per piece
              │          └── machine → Machine
              │                          ├── machineType
              │                          ├── weeklyPlanning (排程)
              │                          └── machineToolLineList
              │                                        └── MachineTool (刀具/治具)
              │
ProdProcessLine (工序) ─── 引用 ───► WorkCenter
```

### 4.4 BOM 多層結構

```
BillOfMaterial (成品 A)
├── BOMLine: 原料 X, qty=2
├── BOMLine: 原料 Y, qty=1
└── BOMLine: 半成品 B, qty=1
        └── billOfMaterial → BillOfMaterial (半成品 B)  ← 子 BOM
            ├── BOMLine: 原料 Z, qty=3
            └── BOMLine: 原料 W, qty=0.5
```

### 4.5 成本計算

完工時自動生成 CostSheet，包含：

```
CostSheet
├── calculationType: 1=部分完工 / 2=完工結算 / 3=WIP / 4=BOM預估
├── costPrice (單位成本)
└── CostSheetLine (成本明細，樹狀結構)
    ├── type 1/2: 原料成本 (依 BOM 展開)
    ├── type 3: 工作中心成本 (機器工時 + 人工工時)
    └── type 4: 加成 / 費率 (CostSheetGroup)
```

---

## 五、MES 的 12 大功能領域（Axelor Production 模組）

| # | 功能領域 | 核心實體 | 說明 |
|---|---|---|---|
| 1 | 產品主檔 | Product | 生產用的 storable 產品定義 |
| 2 | 物料清單 BOM | BillOfMaterial, BOMLine | 產品配方，支援多層、版本管理、狀態流轉 |
| 3 | 生產製程 | ProdProcess, ProdProcessLine | 工序定義，綁定 WorkCenter，帶工時與成本 |
| 4 | 生產訂單 | ProductionOrder | 銷售驅動的上層生產單 |
| 5 | 製造工單 | ManufOrder | **核心執行單據**，狀態機驅動 |
| 6 | 工序工單 | OperationOrder, OperationOrderDuration | 工序級排程、工時追蹤 |
| 7 | 委外 | Outsourcing (StockMove + PurchaseOrder) | 委外廠商管理、出入庫、採購 |
| 8 | 原料需求 | RawMaterialRequirement | 原料缺口估算 |
| 9 | 主排程 S&OP/MPS | Sop, Mrp, MrpForecast, MpsCharge | 中長期供需規劃 |
| 10 | 成本計算 | CostSheet, CostSheetLine, CostSheetGroup | 4 種計算類型 |
| 11 | 資源管理 | WorkCenter, Machine, MachineTool | 設備與工作中心 |
| 12 | 報表分析 | Dashboard, Charts | 即時看板、機台負載、工時分析 |

---

## 六、典型使用者角色與動線

### 6.1 角色

| 角色 | 職責 | 主要操作畫面 |
|---|---|---|
| 生產管理師 | 建立 BOM / 製程、排程 | BOM 管理列表、製程列表、MPS |
| 現場主管 | 派工、監控進度 | 製造工單列表、Dashboard |
| 作業員 | 執行工序、回報工時 | 工序工單（Start/Pause/Finish） |
| 品管員 | 檢驗、異常處理 | Quality 模組 |
| 成本會計 | 成本分析 | CostSheet 報表 |
| 採購員 | 委外採購 | Outsourcing 採購單 |

### 6.2 典型日操作動線

```
登入
  → Manufacturing Dashboard（查看今日待工單 / 異常 / 延遲）
    → Manufacturing orders（篩選 In Progress / Late Planned）
      → 進入工單詳情
        → 檢視工序進度
        → Start / Pause / Resume / Finish 操作
        → 查看消耗差異
      → 完工後查看 CostSheet
    → 回到 Dashboard 確認
登出
```

---

## 七、前端改造方向：XML View → React

### 7.1 現狀

Axelor 的前端是「**伺服器描述 + 客戶端渲染**」架構：
- 後端用 XML DSL 定義畫面（grid / form / dashboard）
- 前端 React SPA 在 runtime 讀取 XML 並動態渲染
- 業務邏輯在 Java action controller 中

### 7.2 目標：真正的前後端分離

```
現狀:  XML View DSL → Axelor React SPA → 動態渲染
                       ↑ runtime 讀取 metadata

目標:  獨立 React App → Mock Data（模擬 user flow）
       （不串接後端，用 mock 走完整 user flow）
```

### 7.3 改造策略

1. **活動圖先行**：用 `.activity` DSL 描述每個 user flow，作為前端的「需求規格」
2. **Mock Data 驅動**：以 domain 分析為基礎，建立 mock 資料集
3. **狀態機對應**：把 ManufOrder / OperationOrder 的狀態機直接對應到前端 UI 邏輯
4. **可導航 prototype**：側選單 → 列表 → 詳情 → 動作按鈕，可完整點擊走通

---

## 八、名詞對照速查（Axelor ↔ 通用 MES / ERP）

| Axelor 實體 | 通用 MES/ERP 概念 | SAP 對應 | Oracle 對應 |
|---|---|---|---|
| ManufOrder | 製造工單 / Production Order | Production Order | Work Order |
| OperationOrder | 工序 / Operation | Routing Operation | Operation |
| BillOfMaterial | BOM | BOM | BOM |
| ProdProcess | 製程 / Routing | Routing | Routing |
| ProdProcessLine | 工序步驟 | Routing Operation | Routing Operation |
| WorkCenter | 工作中心 | Work Center | Work Center |
| Machine | 機台 | PRT/Resource | Resource |
| CostSheet | 成本表 | Product Costing | Cost Roll-up |
| ProductionOrder | 生產訂單 | Planned Order | Production Schedule |
| StockMove | 庫存異動 | Goods Movement | Material Transaction |
