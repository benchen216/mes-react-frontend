# MES 必要流程活動圖（P0）

對應 `docs/mes-schema-slim.dbml`。完整五條見 `docs/Activity-Diagrams-Mermaid.md`。

本檔只保留走通工單生命週期的四條 user flow：BOM → 製程 → 開工單 → 執行工序 → 完工入庫。

拿掉：委外（UF-05）、CostSheet、工序 Partial Finish、製程層消耗品／委外設定、BOM 預估成本。

主路徑：

```
Applicable BOM + Applicable 製程
  → 建立工單 Draft
  → Plan（產生工序與待消耗）
  → Start
  → 工序 Start / Pause / Resume / Finish
  → 工單 Finished + 成品入庫
```

---

## 01-製造工單生命週期

角色：生產管理師、現場主管、系統

```mermaid
flowchart TD
    Start((●)) --> S1[生產管理師：<br/>進入製造工單列表]
    S1 --> S2[點擊新增工單]
    S2 --> S3[選擇產品、BOM、製程並填數量]
    S3 --> D1{BOM 與製程<br/>皆為 Applicable？}
    D1 -->|否| E1[提示尚未生效]
    E1 --> End1((■))
    D1 -->|是| S4[存檔 狀態=Draft]
    S4 --> S5[點擊 Plan]
    S5 --> S6[系統：產生工序工單<br/>與待消耗清單]
    S6 --> S7[狀態=Planned]
    S7 --> S8[現場主管：點擊 Start]
    S8 --> S9[系統：記錄實際開始時間<br/>狀態=In Progress]
    S9 --> S10[在工序列表執行各工序]
    S10 --> D2{需要暫停？}
    D2 -->|需要| P1[Pause → Standby]
    P1 --> P2[Resume → In Progress]
    P2 --> S11
    D2 -->|不需要| S11[確認工序進度]
    S11 --> D3{所有工序<br/>皆 Finished？}
    D3 -->|是| S12[系統：工單自動完工<br/>狀態=Finished]
    D3 -->|否| S13[現場主管：手動 Finish]
    S13 --> S14[系統：結算未完成工序<br/>狀態=Finished]
    S12 --> S15[系統：成品入庫 StockMove]
    S14 --> S15
    S15 --> End2((■))

    style Start fill:#4CAF50,color:#fff
    style End1 fill:#f44336,color:#fff
    style End2 fill:#4CAF50,color:#fff
    style S12 fill:#84429f,color:#fff
    style S14 fill:#84429f,color:#fff
    style S15 fill:#84429f,color:#fff
```

---

## 02-BOM 建立與審核

角色：生產管理師、系統

```mermaid
flowchart TD
    Start((●)) --> S1[進入 BOM 列表]
    S1 --> S2[新增 BOM]
    S2 --> S3[選擇產品、名稱、基準數量]
    S3 --> S4[加入 BOM 明細行]
    S4 --> S5[設定組件產品、數量、單位]
    S5 --> D1{組件是半成品？}
    D1 -->|是| S5a[指定子 BOM<br/>且子 BOM 為 Applicable]
    S5a --> S6
    D1 -->|否| S6[綁定 ProdProcess]
    S6 --> S7[存檔 狀態=Draft]
    S7 --> S8[Validate → Validated]
    S8 --> S9[Make it applicable<br/>狀態=Applicable]
    S9 --> End((■))

    style Start fill:#4CAF50,color:#fff
    style End fill:#4CAF50,color:#fff
    style S9 fill:#4CAF50,color:#fff
```

---

## 03-生產製程建立

角色：生產管理師、系統

```mermaid
flowchart TD
    Start((●)) --> S1[進入製程列表]
    S1 --> S2[新增製程]
    S2 --> S3[填入名稱、代碼、公司、產品]
    S3 --> S4[加入工序 ProdProcessLine]
    S4 --> S5[選擇 WorkCenter]
    S5 --> S6[帶入並調整機器／人工工時]
    S6 --> D1{工序必須依序執行？}
    D1 -->|是| S6a[勾選 operationContinuity]
    S6a --> S7
    D1 -->|否| S7[設定庫存移動時機<br/>On Start / On Finish]
    S7 --> S8[存檔 狀態=Draft]
    S8 --> S9[Validate → Validated]
    S9 --> S10[Make it applicable<br/>狀態=Applicable]
    S10 --> End((■))

    style Start fill:#4CAF50,color:#fff
    style End fill:#4CAF50,color:#fff
    style S10 fill:#4CAF50,color:#fff
```

---

## 04-工序執行

角色：作業員、現場主管、系統

```mermaid
flowchart TD
    Start((●)) --> S1[現場主管：<br/>進入工單詳情查看工序列表]
    S1 --> S2[確認工單為 Planned 或 In Progress]
    S2 --> S3[作業員：選擇待執行工序]
    S3 --> D1{工序可開始？}
    D1 -->|不可| E1[工序連續性限制提示]
    E1 --> End1((■))
    D1 -->|可| S4[點擊 Start]
    S4 --> S5[系統：記錄開始時間與啟動者<br/>建立 Duration]
    S5 --> S6[執行工序作業]
    S6 --> D2{需要暫停？}
    D2 -->|需要| P1[Pause：記錄停止時間]
    P1 --> P2[Resume：建立新 Duration]
    P2 --> S7
    D2 -->|不需要| S7[點擊 Finish]
    S7 --> S8[系統：記錄結束時間<br/>工序狀態=Finished]
    S8 --> D3{還有下一道工序？}
    D3 -->|有| S3
    D3 -->|沒有| S9[系統：所有工序 Finished<br/>觸發工單完工]
    S9 --> End2((■))

    style Start fill:#4CAF50,color:#fff
    style End1 fill:#f44336,color:#fff
    style End2 fill:#4CAF50,color:#fff
    style S9 fill:#84429f,color:#fff
```
