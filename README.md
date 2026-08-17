# MES React Frontend

Axelor Open Suite 製造執行系統（MES）前端改造 prototype。

將 Axelor Production 模組的 XML View DSL 前端，轉為獨立 React webapp，以 mock data 驅動完整 user flow，實現真正的前後端分離。

## 交付物

| 交付物 | 路徑 | 說明 |
|---|---|---|
| MES Domain 知識簡報 | `docs/MES-Domain-Knowledge.md` | 什麼是 MES、核心概念字典、Axelor MES 模組地圖、12 大功能領域 |
| Production 模組 PRD | `docs/PRD-Production-Module.md` | 功能需求、user flow 清單、資料模型、狀態機定義、畫面規格 |
| 活動圖 `.activity` | `activities/*.activity` | 5 個 user flow，遵循 aixbdd DSL 格式，全部通過 decoder.py 驗證 |
| React webapp | `src/` | 可點擊導航的 prototype，含狀態機驅動的工單操作 |

## 活動圖清單

| 檔案 | User Flow |
|---|---|
| `01-製造工單生命週期.activity` | Draft → Plan → Start → Pause/Resume → Finish 完整流程 |
| `02-BOM建立與審核.activity` | BOM 建立 → Validate → Make Applicable |
| `03-生產製程建立.activity` | ProdProcess 建立 → 工序定義 → Validate → Applicable |
| `04-工序執行流程.activity` | OperationOrder Start → Pause/Resume → Finish → 自動完工 |
| `05-委外流程.activity` | 委外宣告 → 出庫 → 入庫 |

## 啟動 React Prototype

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

登入頁可輸入任意帳密。主要功能：
- 側選單導覽（現場工位 / 儀表板 / 製造工單 / 工序 / BOM / 製程 / 設定）
- 製造工單列表與詳情，含狀態機驅動的操作按鈕（Plan/Start/Pause/Resume/Finish/Cancel）
- 工序聯動工單狀態（啟動工序 → 工單自動 In Progress；全部工序完工 → 工單自動 Finished）
- localStorage 持久化（重新整理不遺失狀態變更）

## 五工序現場 Demo

不登入也可開：http://localhost:5173/shop

左工位終端、右狀態板。工單預先存在 `MO-FR-27-005`（27 吋監視器用金屬前框，10,000 個）。

```
薄板沖壓 → 沖壓品檢 → 雷射焊接 → 清洗 → 成品品檢
```

演示順序：沖壓線開始/完成 → 焊接站搶跑會被擋 → 沖壓品檢不合格退回沖壓 → 重做後合格 → 焊接、清洗各自開始/完成 → 成品品檢合格，工單結束。

另開狀態板：http://localhost:5173/shop/board （兩個 tab 會跟終端同步）

## 技術堆疊

React 18 + TypeScript + Vite + Tailwind CSS v4 + React Router v6 + lucide-react

## 參考來源

- Axelor Open Suite: `/Users/ben/CodeProject/axelor-open-suite/axelor-production`
- AIBDD 活動圖 DSL: `/Users/ben/CodeProject/aixbdd/.agents/skills/aibdd-form-activity/`
