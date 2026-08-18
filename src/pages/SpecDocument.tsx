import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ChapterId =
  | 'cover'
  | 'read'
  | 'lines'
  | 's1'
  | 's2'
  | 's3'
  | 's4'
  | 's5'
  | 's6'
  | 'rules'
  | 'out'
  | 'faq';

const CHAPTERS: { id: ChapterId; no: string; label: string }[] = [
  { id: 'cover', no: '00', label: '封面' },
  { id: 'read', no: '0', label: '怎麼讀' },
  { id: 'lines', no: '1', label: '兩條產線' },
  { id: 's1', no: '2', label: '一次過' },
  { id: 's2', no: '3', label: '搶跑被擋' },
  { id: 's3', no: '4', label: '退回重做' },
  { id: 's4', no: '5', label: '部分報廢' },
  { id: 's5', no: '6', label: '產線 B' },
  { id: 's6', no: '7', label: '加欄位' },
  { id: 'rules', no: '8', label: '規則附錄' },
  { id: 'out', no: '9', label: '範圍外' },
  { id: 'faq', no: '10', label: '五個問題' },
];

export function SpecDocument() {
  const [chapter, setChapter] = useState<ChapterId>('cover');

  return (
    <div className="spec-doc flex min-h-[100dvh] bg-[#f4f4f0] text-[#111]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[#111]">
        <div className="border-b border-[#111] px-4 py-4">
          <p className="font-shop-mono text-[10px] tracking-[0.2em] text-[#666]">SPEC.MD / PRINT</p>
          <p className="mt-1 font-shop text-sm font-extrabold leading-tight">現場執行規格</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto">
          {CHAPTERS.map((item) => {
            const on = item.id === chapter;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setChapter(item.id)}
                className={`grid w-full grid-cols-[2.2rem_1fr] border-b border-[#d8d6d0] px-4 py-2.5 text-left ${
                  on ? 'bg-[#111] text-[#f4f4f0]' : 'hover:bg-[#eceae4]'
                }`}
              >
                <span className="font-shop-mono text-[11px] tracking-[0.08em] opacity-70">{item.no}</span>
                <span className="font-shop text-sm font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="grid gap-px border-t border-[#111] bg-[#111] font-shop-mono text-[11px] tracking-[0.08em]">
          <Link className="bg-[#f4f4f0] px-4 py-3 hover:bg-[#111] hover:text-[#f4f4f0]" to="/shop/concept">
            現場概念頁
          </Link>
          <Link className="bg-[#f4f4f0] px-4 py-3 hover:bg-[#111] hover:text-[#f4f4f0]" to="/shop">
            互動 Demo
          </Link>
        </div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {chapter === 'cover' && <Cover onOpen={() => setChapter('read')} />}
        {chapter === 'read' && <Read />}
        {chapter === 'lines' && <Lines />}
        {chapter === 's1' && <S1 />}
        {chapter === 's2' && <S2 />}
        {chapter === 's3' && <S3 />}
        {chapter === 's4' && <S4 />}
        {chapter === 's5' && <S5 />}
        {chapter === 's6' && <S6 />}
        {chapter === 'rules' && <Rules />}
        {chapter === 'out' && <Out />}
        {chapter === 'faq' && <Faq />}
      </main>
    </div>
  );
}

function Cover({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="flex min-h-full flex-col px-10 py-10">
      <div className="flex items-baseline justify-between font-shop-mono text-[11px] tracking-[0.18em]">
        <span>MES / 現場執行</span>
        <span>REV 0 · 給客戶看的版本</span>
      </div>
      <div className="mt-16 h-2 w-24 bg-[#e61919]" />
      <h1 className="mt-8 max-w-[14ch] font-shop text-[clamp(3.5rem,8vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.04em]">
        現場執行規格
      </h1>
      <p className="mt-8 max-w-[28ch] font-shop text-2xl font-bold leading-tight">
        同一套系統，兩條完全不同的產線。
      </p>
      <p className="mt-6 max-w-[42ch] font-shop text-lg leading-relaxed text-[#333]">
        這份文件不是功能清單。是把現場會發生的六種情況從頭走一遍：誰站在哪台機器前、螢幕上看到什麼、按了什麼、系統回了什麼、以及系統會擋住什麼。
      </p>
      <dl className="mt-16 grid max-w-3xl grid-cols-3 gap-px bg-[#111]">
        <CoverStat k="產線 A" v="沖焊五關" d="MO-FR-27-005 · 10,000 個" />
        <CoverStat k="產線 B" v="組裝五關" d="MO-MON-27-011 · 2,000 台" />
        <CoverStat k="給誰看" v="業務對螢幕" d="附錄留給 IT 主管" />
      </dl>
      <button
        type="button"
        onClick={onOpen}
        className="mt-auto w-max bg-[#111] px-8 py-4 font-shop text-lg font-extrabold text-[#f4f4f0]"
      >
        從怎麼讀開始
      </button>
    </section>
  );
}

function CoverStat({ k, v, d }: { k: string; v: string; d: string }) {
  return (
    <div className="bg-[#f4f4f0] px-5 py-5">
      <dt className="font-shop-mono text-[11px] tracking-[0.16em] text-[#666]">{k}</dt>
      <dd className="mt-2 font-shop text-2xl font-extrabold">{v}</dd>
      <dd className="mt-1 font-shop-mono text-xs text-[#666]">{d}</dd>
    </div>
  );
}

function Read() {
  return (
    <Doc no="0" title="這份文件怎麼讀">
      <p className="max-w-[52ch] text-lg leading-relaxed">
        主體（第 2 章到第 8 章）用敘事，把現場實際會發生的情況從頭走一遍。你可以拿這幾章直接對著螢幕做 demo。
      </p>
      <div className="mt-10 grid gap-px bg-[#111] md:grid-cols-3">
        <ReadCard n="主體" t="第 2 到第 8 章" d="誰、在哪、看到什麼、按了什麼、系統回什麼、擋住什麼。業務端讀完就能懂。" />
        <ReadCard n="附錄" t="第 9 章" d="規則、狀態機、資料模型、權限矩陣。給客戶的技術窗口或 IT 主管查驗。" />
        <ReadCard n="界線" t="第 10 章" d="本版範圍外的項目。避免售前承諾與實際交付出現落差。" />
      </div>
      <Pull>業務端不需要讀附錄也能理解整份文件。</Pull>
    </Doc>
  );
}

function Lines() {
  return (
    <Doc no="1" title="兩條產線與角色">
      <p className="max-w-[54ch] text-lg leading-relaxed">
        用兩條真實存在上下游關係的產線來證明：同一套系統可以承載工序數量不同、檢驗方式不同、記錄欄位完全不同的兩條線，而不需要為第二條線改程式。
      </p>
      <div className="mt-10 grid gap-px bg-[#111] lg:grid-cols-2">
        <LineCard
          tag="產線 A"
          name="金屬前框沖焊線"
          product="FR-27-BZ-A · 27 吋監視器用金屬前框"
          order="MO-FR-27-005 · 10,000 個"
          chain="薄板沖壓 → 沖壓品檢 → 雷射焊接 → 清洗 → 成品品檢"
          note="工序線性、有中間品檢、不合格會退回重做。"
          rows={[
            ['薄板沖壓', '沖壓線', '生產', '王沖壓', '回報數量'],
            ['沖壓品檢', '沖壓品檢站', '品檢', '李檢驗', '回報判定'],
            ['雷射焊接', '雷射焊接站', '生產', '陳焊接', '回報數量'],
            ['清洗', '清洗站', '生產', '林清洗', '不報數量'],
            ['成品品檢', '成品品檢站', '品檢', '李檢驗', '回報判定'],
          ]}
        />
        <LineCard
          tag="產線 B"
          name="監視器整機組裝線"
          product="MON-27-A · 27 吋監視器整機"
          order="MO-MON-27-011 · 2,000 台"
          chain="前框上料組裝 → 電控模組安裝 → 功能測試 → 外觀檢驗 → 包裝入庫"
          note="投入料件來自產線 A、含機台自動測試、檢驗要拍照存證。"
          rows={[
            ['前框上料組裝', '組裝一線', '生產', '張組裝', '投入產線 A 成品'],
            ['電控模組安裝', '組裝二線', '生產', '黃組裝', '—'],
            ['功能測試', '測試房', '品檢', '周測試', '治具自動帶值'],
            ['外觀檢驗', '目檢站', '品檢', '吳目檢', '需拍照存證'],
            ['包裝入庫', '包裝線', '生產', '蔡包裝', '完工即入庫'],
          ]}
        />
      </div>
      <Pull>產線 A 的品檢判定，會直接決定產線 B 能不能開工。</Pull>
      <h3 className="mt-10 font-shop text-xl font-extrabold">角色</h3>
      <GridTable
        head={['角色', '誰', '主要畫面', '能做什麼']}
        rows={[
          ['現場作業員', '王沖壓、陳焊接等', '工位終端', '開始 / 完成自己站點的工序，填寫該站欄位'],
          ['檢驗員', '李檢驗、吳目檢', '工位終端（品檢模式）', '判定合格 / 不合格，分流數量，填不良代碼'],
          ['線長 / 班長', '產線負責人', '狀態板 + 工單詳情', '看全線狀態'],
          ['廠內流程管理員', '製造部或品保部指定人員', '系統設定', '動態新增 / 調整記錄欄位，不需 IT 介入'],
        ]}
      />
    </Doc>
  );
}

function S1() {
  return (
    <Doc no="2" title="情境一：正常一次過">
      <p className="max-w-[52ch] text-lg leading-relaxed">最單純的一條路。先讓客戶建立「一站一站推進」的心智模型。</p>
      <Beat
        who="王沖壓開工"
        where="沖壓線旁的工位終端，畫面預設就停在「沖壓線」。"
        sees={['待辦只有一行：MO-FR-27-005 ｜ 金屬前框 ｜ 薄板沖壓 ｜ 10,000 個 ｜ 可開始', '工序卡：本關薄板沖壓 / 上一關無 / 下一關沖壓品檢 / 尚未開始', '只有「開始」可按。「完成」是灰的。']}
        does="按「開始」。"
        replies="本關進行中。作業員：王沖壓。開始：08:12:30"
      />
      <Screen
        lines={[
          '本關：薄板沖壓',
          '上一關：無',
          '下一關：沖壓品檢',
          '狀態：進行中',
          '牆上狀態板：這批現在在薄板沖壓，王沖壓作業中。',
        ]}
      />
      <Pull>作業員不需要選工單、不需要輸入工號、不需要記今天要做什麼。他只需要按開始。</Pull>
      <Beat
        who="王沖壓完工"
        where="同一台終端"
        sees={['「完成」亮起。系統跳出這一站被設定過的欄位，不是寫死的表單。']}
        does="沖壓完 10,000 個，按「完成」。填實際沖壓數 10,000、模具 MD-FR27-02、料捲 RC-20260815-A。"
        replies="本關已完成。下一關是「沖壓品檢」，由「沖壓品檢站」開始。"
      />
      <p className="mt-6 max-w-[52ch] leading-relaxed">
        這張單從王沖壓的待辦消失。沖壓品檢站終端上自動出現，狀態「可開始」。沒有人需要通知李檢驗。
      </p>
      <Beat
        who="李檢驗判定合格"
        where="沖壓品檢站。工序卡是品檢模式，沒有「完成」，而是合格 / 不合格兩顆。"
        sees={['抽檢數、平面度（上限 0.35）、判定、合格數 / 重工數 / 報廢數']}
        does="按開始，抽檢完按合格。平面度 0.21，合格 10,000。"
        replies="沖壓品檢合格。下一關是「雷射焊接」。工單尚未結束。"
      />
      <p className="mt-8 max-w-[52ch] leading-relaxed">
        雷射焊接、清洗、成品品檢依序推進。成品品檢按合格後：成品品檢合格。工單已結束。狀態板：五關完成。工單已結束。
      </p>
      <Pull>現場作業員全程只按了「開始 / 完成」，沒有人需要理解系統，也沒有人需要維護 Excel。</Pull>
    </Doc>
  );
}

function S2() {
  return (
    <Doc no="3" title="情境二：搶跑被擋">
      <p className="max-w-[52ch] text-lg leading-relaxed">
        這是客戶最在意的「系統到底控不控得住」的第一個證明點。
      </p>
      <Beat
        who="陳焊接想暖機"
        where="沖壓才剛完成，還沒品檢。他跑到雷射焊接站終端按「開始」。"
        sees={['待辦：MO-FR-27-005 ｜ 金屬前框 ｜ 雷射焊接 ｜ 10,000 個 ｜ 還不能開始']}
        does="按「開始」。"
        replies="還不能開始。需先完成「沖壓品檢」。"
      />
      <p className="mt-6 max-w-[52ch] leading-relaxed">工單狀態完全沒有改變。沒有任何紀錄被寫進去，狀態板也沒有跳動。</p>
      <Pull>跳站在這套系統裡不是違規，是不存在的操作。當下就按不下去，不是事後稽核才發現。</Pull>
      <p className="mt-8 max-w-[52ch] leading-relaxed text-[#333]">
        這個順序不是寫死在程式裡。產線 B 可以有完全不同的順序、完全不同的站數，因為順序來自製程定義。
      </p>
    </Doc>
  );
}

function S3() {
  return (
    <Doc no="4" title="情境三：品檢不合格，退回重做">
      <p className="max-w-[52ch] text-lg leading-relaxed">這是整份文件最重要的一段。</p>
      <Beat
        who="李檢驗判定不合格"
        where="沖壓品檢站終端，工序卡「進行中」。"
        sees={['不合格時才出現的欄位：不良代碼、退回工序']}
        does="平面度量到 0.52，按不合格。不良代碼 DEF-FLAT，退回薄板沖壓，重工數 10,000。"
        replies="判定不合格。工單不能結束。請退回「薄板沖壓」重做。焊接尚未開始。"
      />
      <h3 className="mt-10 font-shop text-xl font-extrabold">退回瞬間，整條線發生什麼</h3>
      <GridTable
        head={['位置', '退回前', '退回後']}
        rows={[
          ['薄板沖壓', '已完成', '可重做（回到待辦清單）'],
          ['沖壓品檢', '進行中', '不合格'],
          ['雷射焊接', '還不能開始', '還不能開始（維持鎖住）'],
          ['清洗', '還不能開始', '還不能開始'],
          ['成品品檢', '還不能開始', '還不能開始'],
        ]}
      />
      <Pull>退回不會刪掉原本的紀錄。後段站點沒有被「解鎖再鎖回去」。它們從頭到尾就沒被解鎖過。</Pull>
      <p className="mt-8 max-w-[54ch] leading-relaxed">
        王沖壓換模具 MD-FR27-05 重做。李檢驗這次量到 0.19，判定合格。流程回到正軌。工單完成後，追溯畫面上會看到第 1 次與第 2 次並排。
      </p>
      <Screen
        lines={[
          '薄板沖壓   第 1 次   08:12–09:40   王沖壓   模具 MD-FR27-02   料捲 RC-20260815-A',
          '沖壓品檢   第 1 次   09:42–09:55   李檢驗   平面度 0.52   不合格   DEF-FLAT',
          '薄板沖壓   第 2 次   10:05–11:30   王沖壓   模具 MD-FR27-05   料捲 RC-20260815-A',
          '沖壓品檢   第 2 次   11:32–11:48   李檢驗   平面度 0.19   合格',
        ]}
      />
      <Pull>這張表就是客戶買 MES 真正想要的東西。出事時能在三十秒內指出是哪一批料、哪一副模具、哪一個人、哪一個時段。</Pull>
    </Doc>
  );
}

function S4() {
  return (
    <Doc no="5" title="情境四：部分報廢分流">
      <p className="max-w-[52ch] text-lg leading-relaxed">不是所有不合格都要重做。數量會在品檢站分岔。</p>
      <GridTable
        head={['欄位', '值', '說明']}
        rows={[
          ['判定', '部分不合格', '—'],
          ['合格數', '9,200', '直接往下一站走'],
          ['重工數', '500', '退回薄板沖壓重做'],
          ['報廢數', '300', '就地報廢'],
          ['不良代碼', 'DEF-BURR（毛邊）', '報廢與重工共用'],
          ['報廢原因', 'SCR-UNREPAIRABLE', '報廢數 > 0 時必填'],
        ]}
      />
      <Screen lines={['合格數 + 重工數 + 報廢數 必須等於送檢數（10,000）', '填不對就送不出去，直接在畫面上標紅。']} />
      <pre className="mt-8 overflow-x-auto border border-[#111] bg-[#eceae4] px-5 py-4 font-shop-mono text-sm leading-relaxed">
{`主批  9,200 個  →  雷射焊接  →  清洗  →  成品品檢
重工批  500 個  →  薄板沖壓（第 2 次）→ 沖壓品檢（第 2 次）→ 併回主批
報廢    300 個  →  結案，不再流動`}
      </pre>
      <ul className="mt-8 max-w-[54ch] list-disc space-y-2 pl-5 leading-relaxed">
        <li>主批不需要等重工批，可以直接往下走。這是產能的關鍵，客戶會問。</li>
        <li>重工批完成品檢後，併回主批當時所在的工序之前。</li>
        <li>工單完工數量 = 主批合格數 + 重工批最終合格數。這張單會是 9,700，不是 10,000。</li>
        <li>報廢的 300 個，成本仍掛在這張工單上，不會憑空消失。</li>
      </ul>
      <Pull>若報廢大到只剩 1,800 個前框，產線 B 第一站按開始會被擋：料件 FR-27-BZ-A 可用量 1,800，需求 2,000，短缺 200。這是跨工單的控管。</Pull>
    </Doc>
  );
}

function S5() {
  return (
    <Doc no="6" title="情境五：產線 B">
      <p className="max-w-[52ch] text-lg leading-relaxed">
        前面都在產線 A。換到產線 B，證明系統沒有為金屬沖壓寫死任何東西。
      </p>
      <Pull>張組裝在組裝一線看到的畫面結構，跟王沖壓在沖壓線看到的完全一樣：待辦清單、工序卡、開始 / 完成。他不需要重新學。</Pull>
      <p className="mt-8 max-w-[52ch] leading-relaxed">差別在按下「完成」之後跳出來的表單。</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <FormCard
          title="前框上料組裝"
          rows={[
            ['完成台數', '數字', '必填'],
            ['前框批號', '單選（自動帶入可用批號）', '必填'],
            ['面板批號', '文字', '必填'],
          ]}
        />
        <FormCard
          title="功能測試"
          rows={[
            ['測試報告編號', '治具自動寫入', '必填'],
            ['亮度 (cd/m²)', '350–450', '必填'],
            ['色差 ΔE', '上限 3.0', '必填'],
            ['判定', '治具帶入，人可覆寫', '必填'],
          ]}
        />
        <FormCard
          title="外觀檢驗"
          rows={[
            ['判定', '單選', '必填'],
            ['缺陷代碼', '多選', '不合格時必填'],
            ['缺陷照片', '照片（可多張）', '不合格時必填'],
            ['合格 / 重工 / 報廢', '數字', '必填'],
          ]}
        />
      </div>
      <p className="mt-8 max-w-[52ch] leading-relaxed">
        周測試幾乎不用打字。治具測完把值送進系統，他只需要確認送出。若治具值超出範圍，系統自動帶「不合格」，覆寫成合格必須填理由。
      </p>
      <Pull>產線 A 記模具、料捲、平面度。產線 B 記治具報告、亮度、色差、照片。兩條線用的是同一份程式碼。差別全部來自設定。</Pull>
    </Doc>
  );
}

function S6() {
  return (
    <Doc no="7" title="情境六：管理員動態新增欄位">
      <p className="max-w-[52ch] text-lg leading-relaxed">
        品保部要求：從下週起，雷射焊接站要記錄氬氣流量。沒有 MES 的工廠會印一張新表格。寫死欄位的系統會開需求單等下一版。
      </p>
      <GridTable
        head={['設定項', '他填的值']}
        rows={[
          ['欄位代碼', 'argon_flow'],
          ['顯示名稱', '氬氣流量 (L/min)'],
          ['資料型別', '數字'],
          ['是否必填', '是'],
          ['適用工序', '雷射焊接'],
          ['有效範圍', '12 ~ 20'],
        ]}
      />
      <Pull>按儲存。全程約三分鐘，沒有開需求單，沒有重新部署，沒有系統停機。</Pull>
      <Screen
        lines={['陳焊接按「完成」，表單上多了一格：氬氣流量 (L/min)  必填', '填 25 會被擋：氬氣流量 25 超出有效範圍 12 ~ 20。']}
      />
      <h3 className="mt-10 font-shop text-xl font-extrabold">對既有資料的影響</h3>
      <GridTable
        head={['情況', '系統行為']}
        rows={[
          ['新欄位設定前已完成的工序紀錄', '不受影響，該欄位顯示「—」。不會被追認為缺漏。'],
          ['設定當下正在進行中的工序', '按「完成」時就會看到新欄位，要填。'],
          ['尚未開始的工序', '正常適用。'],
          ['事後把欄位改成非必填', '只影響之後的紀錄，已存的值保留。'],
          ['事後停用欄位', '新表單不再出現，歷史紀錄仍看得到。欄位不會被刪除。'],
        ]}
      />
      <h3 className="mt-10 font-shop text-xl font-extrabold">管理員動得了什麼、動不了什麼</h3>
      <GridTable
        head={['管理員自助可做', '需供應商協助']}
        rows={[
          ['新增 / 修改 / 停用記錄欄位', '欄位之間的計算式（例如良率自動算）'],
          ['調整欄位必填、有效範圍、選項清單', '欄位觸發的自動流程（例如超標自動通知）'],
          ['調整不良代碼、報廢原因代碼的清單', '與外部系統（ERP、治具、量測儀）的介接'],
          ['調整站點與作業員的對應', '新增一種全新的資料型別'],
          ['—', '改變工序推進的基本邏輯'],
        ]}
      />
      <Pull>承諾「什麼都能自己改」是售後糾紛的來源。承諾「這些能自己改，那些要找我們」才是可交付的。</Pull>
    </Doc>
  );
}

function Rules() {
  return (
    <Doc no="8" title="規則附錄">
      <p className="max-w-[52ch] text-lg leading-relaxed">給客戶的技術窗口或 IT 主管查驗。業務端不必從這裡開始。</p>
      <h3 className="mt-10 font-shop text-xl font-extrabold">9.1 工序推進</h3>
      <RuleList
        items={[
          ['R-01', '一張工單在同一時刻，只有一個工序處於「可開始」狀態（分流批次除外）。'],
          ['R-02', '前置工序未完成時，後續工序按「開始」一律被拒絕，並提示需先完成的工序名稱。工單狀態不變。'],
          ['R-03', '未按「開始」不能按「完成」。'],
          ['R-04', '同一站點同一時刻只能有一張工單處於「進行中」。'],
          ['R-05', '不同產線之間互不影響，可同時推進。'],
          ['R-06', '工序推進順序來自「製程定義」，非程式寫死。'],
          ['R-07', '必填欄位未填完，「完成」無法送出。'],
          ['R-08', '數值欄位超出有效範圍時阻擋送出；可覆寫則必須填理由。'],
          ['R-09', '每次「開始」與「完成」都記錄作業員與時間戳，不可事後修改。'],
          ['R-10', '工單所有工序完成且最終品檢合格後，或最終品檢全數報廢後，工單自動結案。'],
        ]}
      />
      <h3 className="mt-10 font-shop text-xl font-extrabold">9.2 退回與報廢</h3>
      <RuleList
        items={[
          ['R-11', '品檢站判定「不合格」時，必須指定退回工序。可選範圍為本站之前的所有生產工序。'],
          ['R-12', '退回時，被退回工序回到「可重做」，後續工序維持鎖定。'],
          ['R-13', '退回不覆蓋原紀錄。系統以「第 N 次」累加。'],
          ['R-14', '不合格時，「不良代碼」為必填。'],
          ['R-15', '合格數 + 重工數 + 報廢數 = 送檢數。不相等則阻擋送出。'],
          ['R-16', '報廢數 > 0 時，「報廢原因」為必填。'],
          ['R-19', '報廢數量的成本仍歸屬於該工單。'],
          ['R-20', '重工批與主批獨立推進，主批不需等待重工批。'],
          ['R-21', '重工批完成後併回主批，起始工序為主批當前工序的前一站。'],
          ['R-22', '工單完工數量 = 主批合格數 + 各重工批最終合格數。'],
        ]}
      />
      <h3 className="mt-10 font-shop text-xl font-extrabold">9.4 狀態機</h3>
      <pre className="mt-4 overflow-x-auto border border-[#111] bg-[#eceae4] px-5 py-4 font-shop-mono text-xs leading-relaxed">
{`工序：尚未開始 ──開始──▶ 進行中 ──完成/合格──▶ 已完成
                         └──不合格──▶ 不合格 ──▶ 前站轉為「可重做」
工單：待生產 ──首站開始──▶ 進行中 ──末站品檢合格──▶ 已結案
                         ├──末站全數報廢──▶ 已結案（報廢）
                         └──料件短缺──▶ 暫停（等料）`}
      </pre>
      <h3 className="mt-10 font-shop text-xl font-extrabold">9.5 權限</h3>
      <GridTable
        head={['操作', '作業員', '檢驗員', '線長', '流程管理員']}
        rows={[
          ['開始 / 完成生產工序', '本站', '—', '全線', '—'],
          ['品檢判定合格 / 不合格', '—', '本站', '全線', '—'],
          ['數量分流', '—', '本站', '全線', '—'],
          ['覆寫超出範圍的量測值', '需填理由', '需填理由', '需填理由', '—'],
          ['查看追溯紀錄', '本站', '全線', '全線', '全線'],
          ['新增 / 修改記錄欄位', '—', '—', '—', '是'],
        ]}
      />
    </Doc>
  );
}

function Out() {
  return (
    <Doc no="9" title="本版範圍外">
      <p className="max-w-[52ch] text-lg leading-relaxed">明確列出，避免售前期待與交付落差。</p>
      <GridTable
        head={['項目', '狀態']}
        rows={[
          ['作業員自行撤銷 / 修正已送出的回報', '未涵蓋。目前修正需由線長操作退回。'],
          ['主管跨站強制退回', '未涵蓋。退回一律由品檢站發起。'],
          ['委外加工流程', '未涵蓋。'],
          ['工序暫停 / 復工（換班、待料中途暫停計時）', '未涵蓋。目前工序一旦開始即持續計時至完成。'],
          ['欄位之間的計算式與自動連動', '需供應商客製。'],
          ['與 ERP / 治具 / 量測儀的實際介接', '需個案評估。文件中的「治具自動帶值」為目標行為。'],
          ['排程與產能負載', '未涵蓋。本文件只談已下達工單的現場執行。'],
        ]}
      />
    </Doc>
  );
}

function Faq() {
  const items = [
    ['作業員要訓練多久？', '現場終端全程只有「開始」和「完成」兩顆主要按鈕，加上一張表單。實際訓練約十五分鐘。真正需要訓練的是檢驗員的數量分流判斷，那是流程問題，不是系統問題。'],
    ['以後要加欄位，要花錢嗎？', '一般記錄欄位由貴廠管理員自己設定，不需付費、不需重新部署。涉及計算式、自動流程、外部介接的才需要客製。'],
    ['現場網路斷了會怎樣？', '本文件不涵蓋離線模式，需個案評估。'],
    ['可以只買一條線先試嗎？', '可以。兩條完全不同的產線用同一份程式碼，差別只在製程定義與欄位設定。先上一條線，第二條線的導入成本主要是設定時間，不是開發時間。'],
    ['出事了要多久查得出原因？', '輸入工單號，所有站點、所有次數、每一次的人 / 時間 / 量測值 / 料號 / 模具都在一頁上。'],
  ];
  return (
    <Doc no="10" title="客戶常問的五個問題">
      <div className="divide-y divide-[#111] border-y border-[#111]">
        {items.map(([q, a]) => (
          <article key={q} className="grid gap-4 py-8 md:grid-cols-[minmax(0,16rem)_1fr]">
            <h3 className="font-shop text-xl font-extrabold leading-tight">{q}</h3>
            <p className="max-w-[52ch] leading-relaxed text-[#333]">{a}</p>
          </article>
        ))}
      </div>
    </Doc>
  );
}

function Doc({ no, title, children }: { no: string; title: string; children: ReactNode }) {
  return (
    <article className="px-8 py-10 lg:px-12">
      <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#666]">CHAPTER {no}</p>
      <h2 className="mt-2 font-shop text-4xl font-extrabold tracking-tight lg:text-5xl">{title}</h2>
      <div className="mt-2 h-1 w-16 bg-[#e61919]" />
      <div className="mt-8">{children}</div>
    </article>
  );
}

function Pull({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 max-w-[46ch] border-l-4 border-[#e61919] pl-5 font-shop text-2xl font-extrabold leading-tight">
      {children}
    </p>
  );
}

function Beat({
  who,
  where,
  sees,
  does,
  replies,
}: {
  who: string;
  where: string;
  sees: string[];
  does: string;
  replies: string;
}) {
  return (
    <section className="mt-10 border-t border-[#111] pt-8">
      <h3 className="font-shop text-2xl font-extrabold">{who}</h3>
      <dl className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <dt className="font-shop-mono text-[11px] tracking-[0.16em] text-[#666]">他在哪</dt>
          <dd className="mt-1 max-w-[42ch] leading-relaxed">{where}</dd>
        </div>
        <div>
          <dt className="font-shop-mono text-[11px] tracking-[0.16em] text-[#666]">他做什麼</dt>
          <dd className="mt-1 max-w-[42ch] leading-relaxed">{does}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="font-shop-mono text-[11px] tracking-[0.16em] text-[#666]">他看到什麼</dt>
          <dd className="mt-2 space-y-1">
            {sees.map((line) => (
              <p key={line} className="max-w-[60ch] leading-relaxed">
                {line}
              </p>
            ))}
          </dd>
        </div>
      </dl>
      <div className="mt-5 bg-[#111] px-5 py-4 text-[#f4f4f0]">
        <p className="font-shop-mono text-[11px] tracking-[0.16em] text-[#b5b5b5]">系統回什麼</p>
        <p className="mt-2 font-shop text-xl font-extrabold leading-snug">{replies}</p>
      </div>
    </section>
  );
}

function Screen({ lines }: { lines: string[] }) {
  return (
    <div className="mt-6 border border-[#111] px-5 py-4">
      <p className="font-shop-mono text-[11px] tracking-[0.16em] text-[#666]">畫面上</p>
      <div className="mt-3 space-y-1 font-shop-mono text-sm leading-relaxed">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function GridTable({ head, rows }: { head: string[]; rows: string[][] }) {
  const cols = head.length;
  return (
    <div className="mt-6 overflow-x-auto">
      <div
        className="grid min-w-[40rem] gap-px bg-[#111]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {head.map((h) => (
          <div key={h} className="bg-[#111] px-3 py-2 font-shop-mono text-[11px] tracking-[0.12em] text-[#f4f4f0]">
            {h}
          </div>
        ))}
        {rows.flatMap((row, i) =>
          row.map((cell, j) => (
            <div key={`${i}-${j}`} className="bg-[#f4f4f0] px-3 py-3 text-sm leading-snug">
              {cell}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function LineCard({
  tag,
  name,
  product,
  order,
  chain,
  note,
  rows,
}: {
  tag: string;
  name: string;
  product: string;
  order: string;
  chain: string;
  note: string;
  rows: string[][];
}) {
  return (
    <article className="bg-[#f4f4f0] p-6">
      <p className="font-shop-mono text-[11px] tracking-[0.16em] text-[#e61919]">{tag}</p>
      <h3 className="mt-1 font-shop text-2xl font-extrabold">{name}</h3>
      <p className="mt-2 font-shop-mono text-xs text-[#666]">{product}</p>
      <p className="font-shop-mono text-xs text-[#666]">{order}</p>
      <p className="mt-4 font-shop text-sm font-bold leading-snug">{chain}</p>
      <p className="mt-3 text-sm leading-relaxed text-[#333]">{note}</p>
      <div className="mt-5 grid grid-cols-[1fr_1fr_4rem_4.5rem_1fr] gap-px bg-[#111] text-[11px]">
        {['工序', '站點', '類型', '人', '回報'].map((h) => (
          <div key={h} className="bg-[#111] px-2 py-1.5 font-shop-mono text-[#f4f4f0]">
            {h}
          </div>
        ))}
        {rows.flatMap((row, i) =>
          row.map((cell, j) => (
            <div key={`${i}-${j}`} className="bg-[#f4f4f0] px-2 py-2 leading-snug">
              {cell}
            </div>
          )),
        )}
      </div>
    </article>
  );
}

function FormCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="border border-[#111] p-5">
      <h3 className="font-shop text-lg font-extrabold">{title}</h3>
      <dl className="mt-4 space-y-3">
        {rows.map(([k, t, r]) => (
          <div key={k} className="border-t border-[#d8d6d0] pt-3">
            <dt className="font-shop font-bold">{k}</dt>
            <dd className="font-shop-mono text-[11px] text-[#666]">
              {t} · {r}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function RuleList({ items }: { items: [string, string][] }) {
  return (
    <ol className="mt-4 divide-y divide-[#d8d6d0] border-y border-[#d8d6d0]">
      {items.map(([id, text]) => (
        <li key={id} className="grid grid-cols-[3.5rem_1fr] gap-3 py-3">
          <span className="font-shop-mono text-xs text-[#e61919]">{id}</span>
          <span className="text-sm leading-relaxed">{text}</span>
        </li>
      ))}
    </ol>
  );
}

function ReadCard({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <article className="bg-[#f4f4f0] p-5">
      <p className="font-shop-mono text-[11px] tracking-[0.16em] text-[#e61919]">{n}</p>
      <h3 className="mt-2 font-shop text-xl font-extrabold">{t}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#333]">{d}</p>
    </article>
  );
}
