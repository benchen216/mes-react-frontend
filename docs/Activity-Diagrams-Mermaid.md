# MES 活動圖 Mermaid 版本

> 以下為 `activities/*.activity` 的 Mermaid 渲染版，方便直接在 Markdown 預覽器中查看。

---

## 01-製造工單完整生命週期

角色：生產管理師、現場主管、系統

```mermaid
flowchart TD
    Start((●)) --> S1[生產管理師：<br/>進入製造工單列表頁]
    S1 --> S2[生產管理師：<br/>點擊新增製造工單]
    S2 --> S3[生產管理師：<br/>選擇產品、BOM、製程並填入數量]
    S3 --> D1{BOM 與製程是否<br/>皆為 Applicable？}
    D1 -->|是| S4[生產管理師：<br/>存檔建立工單<br/>狀態=Draft]
    D1 -->|否| S3a[生產管理師：<br/>收到BOM或製程未生效提示]
    S3a --> End1((■))
    S4 --> S5[生產管理師：<br/>點擊 Plan 按鈕排程]
    S5 --> S6[系統：<br/>自動產生工序工單與待消耗清單]
    S6 --> S7[生產管理師：<br/>確認工單狀態=Planned]
    S7 --> S8[現場主管：<br/>點擊 Start 按鈕開工]
    S8 --> S9[系統：<br/>設定實際開始時間<br/>狀態=In Progress]
    S9 --> S10[現場主管：<br/>在工序列表依次執行各工序]
    S10 --> D2{需要暫停？}
    D2 -->|需要| P1[現場主管：Pause]
    P1 --> P2[系統：狀態=Standby]
    P2 --> P3[現場主管：Resume]
    P3 --> P4[系統：狀態=In Progress]
    P4 --> S11
    D2 -->|不需要| S11[現場主管：<br/>確認所有工序完成]
    S11 --> D3{所有工序<br/>皆 Finished？}
    D3 -->|是| S12[系統：<br/>自動完工 狀態=Finished]
    S12 --> S13[系統：<br/>生成 CostSheet 成本表]
    S13 --> S14[系統：<br/>成品入庫 StockMove]
    S14 --> S15[現場主管：<br/>查看成本表與入庫結果]
    S15 --> End2((■))
    D3 -->|否| S11a[現場主管：<br/>手動點擊 Finish]
    S11a --> S11b[系統：<br/>完成未完成工序並結算]
    S11b --> End3((■))

    style Start fill:#4CAF50,color:#fff
    style End1 fill:#f44336,color:#fff
    style End2 fill:#4CAF50,color:#fff
    style End3 fill:#4CAF50,color:#fff
    style S12 fill:#84429f,color:#fff
    style S13 fill:#84429f,color:#fff
    style S14 fill:#84429f,color:#fff
```

---

## 02-BOM 建立與審核

角色：生產管理師、系統

```mermaid
flowchart TD
    Start((●)) --> S1[進入 BOM 列表頁]
    S1 --> S2[點擊新增 BOM]
    S2 --> S3[選擇產品並填入名稱與基準數量]
    S3 --> S4[加入 BOM 明細行]
    S4 --> S5[設定組件產品、數量與單位]
    S5 --> D1{組件是半成品？}
    D1 -->|是| S5a[指定子 BOM]
    S5a --> S5b[確認子 BOM 為 Applicable]
    S5b --> S6
    D1 -->|否| S6[綁定 ProdProcess 製程]
    S6 --> D2{需要預估成本？}
    D2 -->|是| S6a[點擊 Compute cost price]
    S6a --> S6b[系統計算預估成本價]
    S6b --> S7
    D2 -->|否| S7[存檔<br/>狀態=Draft]
    S7 --> S8[點擊 Validate<br/>狀態=Validated]
    S8 --> S9[點擊 Make it applicable<br/>狀態=Applicable ✅]
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
    Start((●)) --> S1[進入 Production processes 列表]
    S1 --> S2[新增製程]
    S2 --> S3[填入名稱、代碼、公司、產品]
    S3 --> S4[加入工序 ProdProcessLine]
    S4 --> S5[選擇 WorkCenter]
    S5 --> S6[系統帶入工時與成本預設值]
    S6 --> S7[調整每循環時間、人工時間、產能]
    S7 --> D1{啟用工序連續性？}
    D1 -->|是| S7a[勾選 operationContinuity]
    S7a --> D2
    D1 -->|否| D2{工序層級管理消耗品？}
    D2 -->|是| S7b1[勾選 isConsProOnOperation]
    S7b1 --> S7b2[為每道工序設定消耗品]
    S7b2 --> D3
    D2 -->|否| D3{支援委外？}
    D3 -->|是| S7c1[勾選 outsourcable]
    S7c1 --> S7c2[設定委外廠商與工期]
    S7c2 --> S8
    D3 -->|否| S8[設定庫存移動時機<br/>On Start / On Finish]
    S8 --> S9[存檔 Draft]
    S9 --> S10[Validate]
    S10 --> S11[Make it applicable ✅]
    S11 --> End((■))

    style Start fill:#4CAF50,color:#fff
    style End fill:#4CAF50,color:#fff
    style S11 fill:#4CAF50,color:#fff
```

---

## 04-工序執行流程

角色：作業員、現場主管、系統

```mermaid
flowchart TD
    Start((●)) --> S1[現場主管：<br/>進入工單詳情查看工序列表]
    S1 --> S2[確認工單為 Planned / In Progress]
    S2 --> S3[作業員：<br/>選擇第一道待執行工序]
    S3 --> D1{工序可開始？}
    D1 -->|不可開始| S3a[收到工序連續性限制提示]
    S3a --> End1((■))
    D1 -->|可開始| S4[作業員：<br/>點擊 Start 啟動工序]
    S4 --> S5[系統：<br/>記錄實際開始時間與啟動者]
    S5 --> S6[系統：<br/>建立工時記錄 Duration]
    S6 --> S7[作業員：<br/>執行工序作業]
    S7 --> D2{需要暫停？}
    D2 -->|需要| P1[作業員：Pause]
    P1 --> P2[系統：記錄停止時間]
    P2 --> P3[作業員：Resume]
    P3 --> P4[系統：建立新 Duration 記錄]
    P4 --> D3
    D2 -->|不需要| D3{需要部分完工？}
    D3 -->|需要| PF1[作業員：Partial Finish]
    PF1 --> PF2[系統：生成部分成本表<br/>不改變狀態]
    PF2 --> S8
    D3 -->|不需要| S8[作業員：<br/>點擊 Finish 完成工序]
    S8 --> S9[系統：<br/>記錄結束時間 狀態=Finished]
    S9 --> D4{還有下一道工序？}
    D4 -->|有| S4
    D4 -->|沒有| S10[系統：<br/>檢查所有工序 Finished]
    S10 --> S11[系統：<br/>自動觸發工單完工流程]
    S11 --> End2((■))

    style Start fill:#4CAF50,color:#fff
    style End1 fill:#f44336,color:#fff
    style End2 fill:#4CAF50,color:#fff
    style S11 fill:#84429f,color:#fff
```

---

## 05-委外流程

角色：生產管理師、現場主管、系統、委外廠商

```mermaid
flowchart TD
    Start((●)) --> S1[生產管理師：<br/>製程勾選 outsourcable<br/>設定委外廠商]
    S1 --> S2[建立工單時自動帶入<br/>outsourcing 標記]
    S2 --> S3[點擊 Plan 排程工單]
    S3 --> D1{製程設定排程時<br/>自動生採購單？}
    D1 -->|是| S3a[系統：自動建立採購單 PO]
    S3a --> S3b[在委外採購單列表查看 PO]
    S3b --> S4
    D1 -->|否| S4[現場主管：<br/>點擊委外宣告按鈕]
    S4 --> S5[在委外宣告精靈中<br/>選擇委外產品與廠商]
    S5 --> S6[系統：<br/>建立委外出庫 StockMove<br/>原料發送到廠商]
    S6 --> S7[委外廠商：<br/>執行委外加工]
    S7 --> S8[現場主管：<br/>在 Arrivals 建立委外入庫]
    S8 --> S9[系統：<br/>半成品入庫]
    S9 --> S10[現場主管：<br/>回到工單繼續工序或完工]
    S10 --> End((■))

    style Start fill:#4CAF50,color:#fff
    style End fill:#4CAF50,color:#fff
```
