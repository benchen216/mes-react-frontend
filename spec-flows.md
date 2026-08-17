# 現場執行規格：情境流程

對應 `spec.md` 第 2 到第 8 章。每張圖只畫會改變工單或畫面的步驟。

---

## 總覽

七個情境不是七條互不相關的路。前五條都在產線 A 的同一張單上分岔，第六條換產線證明骨架可重用，第七條證明欄位可設定。

```mermaid
flowchart TD
  S1[情境一 正常一次過] --> S2[情境二 搶跑被擋]
  S1 --> S3[情境三 退回重做]
  S3 --> S4[情境四 部分報廢分流]
  S4 --> S5[情境五 整單報廢]
  S1 --> S6[情境六 換成產線 B]
  S6 --> S7[情境七 管理員加欄位]
```

---

## 情境一：正常一次過

王沖壓開工到成品品檢合格。單會自己推到下一站待辦，沒有人需要通知下一個站。

```mermaid
flowchart TD
  idle[待生產] --> stampStart[沖壓線 開始]
  stampStart --> stampRun[薄板沖壓 進行中]
  stampRun --> stampDone[沖壓完成 填欄位]
  stampDone --> qcReady[品檢站待辦出現 可開始]
  qcReady --> qcStart[沖壓品檢 開始]
  qcStart --> qcPass[判定合格]
  qcPass --> weld[雷射焊接 開始到完成]
  weld --> wash[清洗 開始到完成]
  wash --> finalStart[成品品檢 開始]
  finalStart --> finalPass[判定合格]
  finalPass --> closed[工單已結束]
```

---

## 情境二：搶跑被擋

沖壓剛完、品檢還沒做。陳焊接在焊接站按開始。系統拒絕，工單狀態不變。

```mermaid
flowchart TD
  stampDone[薄板沖壓 已完成] --> weldQueue[焊接站待辦顯示 還不能開始]
  weldQueue --> pressStart[陳焊接按 開始]
  pressStart --> reject[拒絕：需先完成沖壓品檢]
  reject --> unchanged[工單狀態不變 狀態板不跳動]
  stampDone --> qcTodo[品檢站待辦：可開始]
```

---

## 情境三：品檢不合格，退回重做

退回不覆蓋原紀錄。後段站從頭到尾沒被解鎖過。

```mermaid
flowchart TD
  qcRun[沖壓品檢 進行中] --> fail[判定不合格]
  fail --> form[填不良代碼 退回薄板沖壓]
  form --> stampRework[薄板沖壓 可重做]
  form --> qcFailed[沖壓品檢 不合格]
  form --> weldLock[焊接與後段 維持還不能開始]
  stampRework --> stamp2[第 2 次沖壓 開始到完成]
  stamp2 --> qc2[第 2 次品檢]
  qc2 --> pass[判定合格]
  pass --> weld[雷射焊接 才解鎖]
```

退回當下各站：

```mermaid
flowchart LR
  subgraph before [退回前]
    B1[沖壓 已完成]
    B2[品檢 進行中]
    B3[焊接 還不能開始]
  end
  subgraph after [退回後]
    A1[沖壓 可重做]
    A2[品檢 不合格]
    A3[焊接 還不能開始]
  end
  before --> after
```

---

## 情境四：部分報廢分流

合格 + 重工 + 報廢必須等於送檢數。主批不需要等重工批。

```mermaid
flowchart TD
  qc[沖壓品檢 部分不合格] --> check{合格 + 重工 + 報廢 = 10000}
  check -->|否| block[畫面標紅 送不出]
  check -->|是 9200 / 500 / 300| split[拆成三條]
  split --> main[主批 9200 可到雷射焊接]
  split --> rework[重工批 500 退回薄板沖壓]
  split --> scrap[報廢 300 結案 成本仍掛這張單]
  main --> weld[雷射焊接 清洗 成品品檢]
  rework --> stamp2[沖壓第 2 次]
  stamp2 --> qc2[品檢第 2 次]
  qc2 --> join[併回主批當時所在工序的前一站]
  weld --> closed[完工數 = 主批合格 + 重工最終合格]
  join --> closed
```

若報廢大到前框只剩 1800，產線 B 第一站會被擋：

```mermaid
flowchart TD
  startB[產線 B 前框上料組裝 按開始] --> inv{FR-27-BZ-A 可用量 對 需求 2000}
  inv -->|9700 足夠| go[照常開工]
  inv -->|1800 短缺 200| stop[還不能開始 工單暫停等料]
```

---

## 情境五：整單報廢

報廢佔比超過門檻（預設 5%）走線長審核，不直接結案。

```mermaid
flowchart TD
  finalQc[成品品檢 不合格] --> qty[合格 0 重工 0 報廢 9700]
  qty --> gate{報廢佔比 是否超過 5%}
  gate -->|否| apply[當場報廢生效]
  gate -->|是| review[送出報廢審核 工單暫停於成品品檢]
  review --> lead[線長看追溯後決定]
  lead --> approve[核准：工單結案 完工 0 報廢 9700]
  lead --> reject[駁回：退回成品品檢 重新判定]
  reject --> finalQc
```

---

## 情境六：產線 B

操作骨架相同，完成後的表單不同。系統沒有為金屬沖壓寫死欄位。

```mermaid
flowchart TD
  subgraph skeleton [同一套操作骨架]
    todo[待辦清單] --> card[工序卡]
    card --> startBtn[開始]
    startBtn --> doneBtn[完成 或 合格不合格]
  end
  doneBtn --> form{這一站的欄位設定}
  form --> a[產線 A：模具 料捲 平面度]
  form --> b1[組裝：前框批號 面板批號]
  form --> b2[測試：治具帶入亮度與色差]
  form --> b3[目檢：缺陷代碼與照片]
```

---

## 情境七：管理員動態新增欄位

設定寫入製程定義，下一張焊接完工表單立刻出現新欄。已完成的紀錄不會被追認為缺漏。

```mermaid
flowchart TD
  need[品保要記錄氬氣流量] --> admin[管理員新增欄位 argon_flow]
  admin --> save[儲存 約三分鐘 不停機]
  save --> nextForm[陳焊接下一張完工表單多一格]
  nextForm --> empty[沒填：送不出]
  nextForm --> over[填 25：超出 12 到 20 被擋]
  nextForm --> ok[填 12 到 20：可送出]
  save --> old[設定前已完成的紀錄 該欄顯示為無]
```
