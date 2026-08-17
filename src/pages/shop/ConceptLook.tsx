import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type SceneId = 'start' | 'form' | 'qc' | 'blocked' | 'board' | 'trace' | 'field';
type MsgKind = 'idle' | 'ok' | 'warn' | 'error';
type GateTone = 'pending' | 'ready' | 'running' | 'done' | 'failed' | 'rework';

const SCENES: { id: SceneId; label: string; hint: string }[] = [
  { id: 'start', label: '工位開工', hint: '情境一 · 王沖壓' },
  { id: 'form', label: '完工表單', hint: '這一站的欄位' },
  { id: 'qc', label: '品檢判定', hint: '合格 / 不合格' },
  { id: 'blocked', label: '搶跑被擋', hint: '情境二' },
  { id: 'board', label: '狀態板', hint: '牆上這張' },
  { id: 'trace', label: '追溯', hint: '出事時三十秒' },
  { id: 'field', label: '加欄位', hint: '管理員三分鐘' },
];

function liveClock() {
  return new Date().toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function ConceptLook() {
  const [scene, setScene] = useState<SceneId>('start');
  const [clock, setClock] = useState(liveClock);

  useEffect(() => {
    const id = window.setInterval(() => setClock(liveClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="shop-floor shop-concept flex min-h-[100dvh] flex-col bg-[#0a0a0a] text-[#eaeaea]">
      <header className="grid grid-cols-[1fr_auto] items-stretch border-b border-[#2a2a2a]">
        <div className="flex min-w-0 items-center gap-4 px-4 py-2">
          <div className="shrink-0">
            <p className="font-shop-mono text-[10px] tracking-[0.22em] text-[#8a8a8a]">MES 現場 · 概念長相</p>
            <p className="font-shop text-sm font-extrabold tracking-tight">金屬前框沖焊線 / MO-FR-27-005</p>
          </div>
          <nav className="flex min-w-0 flex-1 gap-px overflow-x-auto bg-[#2a2a2a]">
            {SCENES.map((item) => {
              const on = item.id === scene;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScene(item.id)}
                  className={`min-w-[7.5rem] px-3 py-2 text-left ${on ? 'bg-[#eaeaea] text-[#0a0a0a]' : 'bg-[#121212] text-[#b5b5b5] hover:bg-[#1c1c1c]'}`}
                >
                  <span className="block font-shop text-sm font-bold leading-none">{item.label}</span>
                  <span className={`mt-1 block font-shop-mono text-[10px] tracking-[0.12em] ${on ? 'text-[#4a4a4a]' : 'text-[#6e6e6e]'}`}>
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4 border-l border-[#2a2a2a] px-4 font-shop-mono text-[11px] tracking-[0.12em] text-[#8a8a8a]">
          <span className="tabular-nums text-[#eaeaea]">{clock}</span>
          <Link className="hover:text-[#eaeaea]" to="/spec">
            規格書
          </Link>
          <Link className="hover:text-[#eaeaea]" to="/shop">
            互動 Demo
          </Link>
          <Link className="hover:text-[#eaeaea]" to="/">
            辦公室
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {scene === 'start' && <StartScene onOpenForm={() => setScene('form')} />}
        {scene === 'form' && <FormScene />}
        {scene === 'qc' && <QcScene />}
        {scene === 'blocked' && <BlockedScene />}
        {scene === 'board' && <BoardScene clock={clock} />}
        {scene === 'trace' && <TraceScene />}
        {scene === 'field' && <FieldScene />}
      </div>
    </div>
  );
}

function StartScene({ onOpenForm }: { onOpenForm: () => void }) {
  const [running, setRunning] = useState(false);

  return (
    <TerminalFrame
      station="沖壓線"
      person="王沖壓 / 作業員"
      op="薄板沖壓"
      message={running ? '本關進行中。作業員：王沖壓。開始：08:12:30' : '等待操作。這一站現在該做哪張單，系統已經排好。'}
      kind={running ? 'ok' : 'idle'}
    >
      <QueueTable
        rows={[
          {
            seq: 'MO-FR-27-005',
            product: '金屬前框',
            op: '薄板沖壓',
            qty: '10,000 個',
            status: running ? '進行中' : '可開始',
            active: true,
          },
        ]}
      />
      <OpCard
        current="薄板沖壓"
        prev="無"
        next="沖壓品檢"
        status={running ? '進行中' : '尚未開始'}
        extra={running ? [['誰在做', '王沖壓'], ['開始', '08:12:30']] : []}
      />
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <BigButton label="開始" enabled={!running} onClick={() => setRunning(true)} />
        <BigButton label="完成" enabled={running} tone="ghost" onClick={onOpenForm} />
      </div>
    </TerminalFrame>
  );
}

function FormScene() {
  const [qty, setQty] = useState('10000');
  const [mold, setMold] = useState('MD-FR27-02');
  const [coil, setCoil] = useState('RC-20260815-A');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const ready = qty !== '' && mold !== '' && coil !== '';

  return (
    <TerminalFrame
      station="沖壓線"
      person="王沖壓 / 作業員"
      op="薄板沖壓 · 回報"
      message={
        sent
          ? '本關已完成。下一關是「沖壓品檢」，由「沖壓品檢站」開始。'
          : '這一站的欄位不是寫死的。沒填完，送不出去。'
      }
      kind={sent ? 'ok' : 'idle'}
    >
      <div className="grid min-h-0 flex-1 gap-px overflow-y-auto bg-[#2a2a2a] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[#161616] px-5 py-5">
          <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">完工回報</p>
          <h3 className="mt-1 font-shop text-3xl font-extrabold">薄板沖壓</h3>
          <div className="mt-6 grid gap-4">
            <Field label="實際沖壓數" required>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </Field>
            <Field label="模具編號" required>
              <div className="grid grid-cols-2 gap-2">
                {['MD-FR27-02', 'MD-FR27-05'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMold(id)}
                    className={`h-14 border font-shop-mono text-sm ${mold === id ? 'border-[#eaeaea] bg-[#eaeaea] text-[#0a0a0a]' : 'border-[#3a3a3a] text-[#eaeaea]'}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="料捲批號" required>
              <input value={coil} onChange={(e) => setCoil(e.target.value)} className={inputClass} />
            </Field>
            <Field label="備註">
              <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="可空白" />
            </Field>
          </div>
        </div>
        <aside className="flex flex-col bg-[#121212] px-5 py-5">
          <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">這一站記得什麼</p>
          <p className="mt-3 max-w-[36ch] font-shop text-lg leading-snug text-[#d4d4d4]">
            產線 B 的組裝站會換成前框批號、面板批號。同一顆完成按鈕，表單內容來自設定。
          </p>
          <dl className="mt-8 grid gap-3 font-shop-mono text-sm">
            <Meta k="工單" v="MO-FR-27-005" />
            <Meta k="產品" v="FR-27-BZ-A 金屬前框" />
            <Meta k="計劃數" v="10,000 個" />
          </dl>
          <button
            type="button"
            disabled={!ready || sent}
            onClick={() => setSent(true)}
            className="mt-auto h-20 bg-[#eaeaea] font-shop text-3xl font-extrabold text-[#0a0a0a] disabled:opacity-35 active:scale-[0.99]"
          >
            {sent ? '已送出' : '送出'}
          </button>
        </aside>
      </div>
    </TerminalFrame>
  );
}

function QcScene() {
  const [verdict, setVerdict] = useState<'none' | 'pass' | 'fail' | 'split'>('none');
  const [flatness, setFlatness] = useState('0.52');
  const [okQty, setOkQty] = useState('0');
  const [reworkQty, setReworkQty] = useState('10000');
  const [scrapQty, setScrapQty] = useState('0');
  const [codes, setCodes] = useState<string[]>(['DEF-FLAT']);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  const sum = Number(okQty || 0) + Number(reworkQty || 0) + Number(scrapQty || 0);
  const sumOk = sum === 10000;
  const failLike = verdict === 'fail' || verdict === 'split';
  const scrapNeed = Number(scrapQty) > 0;
  const canSend =
    verdict !== 'none' &&
    flatness !== '' &&
    sumOk &&
    (!failLike || codes.length > 0) &&
    (!scrapNeed || reason !== '');

  const applyPreset = (kind: 'pass' | 'fail' | 'split') => {
    setSent(false);
    setVerdict(kind);
    if (kind === 'pass') {
      setFlatness('0.21');
      setOkQty('10000');
      setReworkQty('0');
      setScrapQty('0');
      setCodes([]);
      setReason('');
    } else if (kind === 'fail') {
      setFlatness('0.52');
      setOkQty('0');
      setReworkQty('10000');
      setScrapQty('0');
      setCodes(['DEF-FLAT']);
      setReason('');
    } else {
      setFlatness('0.41');
      setOkQty('9200');
      setReworkQty('500');
      setScrapQty('300');
      setCodes(['DEF-BURR']);
      setReason('SCR-UNREPAIRABLE');
    }
  };

  const message = sent
    ? verdict === 'pass'
      ? '沖壓品檢合格。下一關是「雷射焊接」。工單尚未結束。'
      : verdict === 'split'
        ? '主批 9,200 個現在可到雷射焊接。重工批 500 個退回薄板沖壓。報廢 300 個結案。'
        : '判定不合格。工單不能結束。請退回「薄板沖壓」重做。焊接尚未開始。'
    : !sumOk && verdict !== 'none'
      ? `合格 + 重工 + 報廢必須等於 10,000。現在是 ${sum.toLocaleString('zh-TW')}。`
      : '沒有「完成」。品檢這一站只有合格或不合格。';

  return (
    <TerminalFrame
      station="沖壓品檢站"
      person="李檢驗 / 檢驗員"
      op="沖壓品檢 · 判定"
      message={message}
      kind={sent ? (verdict === 'pass' ? 'ok' : 'error') : sumOk || verdict === 'none' ? 'idle' : 'error'}
    >
      <div className="grid min-h-0 flex-1 gap-px overflow-y-auto bg-[#2a2a2a] xl:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-[#161616] px-5 py-5">
          <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">先選這次怎麼判</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PresetChip label="全數合格" on={verdict === 'pass'} onClick={() => applyPreset('pass')} />
            <PresetChip label="退回重做" on={verdict === 'fail'} onClick={() => applyPreset('fail')} />
            <PresetChip label="部分報廢" on={verdict === 'split'} onClick={() => applyPreset('split')} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => applyPreset('pass')}
              className={`h-20 font-shop text-3xl font-extrabold ${verdict === 'pass' ? 'bg-[#4af626] text-[#0a0a0a]' : 'border border-[#3a3a3a] text-[#eaeaea]'}`}
            >
              合格
            </button>
            <button
              type="button"
              onClick={() => applyPreset('fail')}
              className={`h-20 font-shop text-3xl font-extrabold ${failLike ? 'bg-[#e61919] text-[#eaeaea]' : 'border border-[#e61919] text-[#e61919]'}`}
            >
              不合格
            </button>
          </div>
          <p className="mt-6 font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">數量分流 · 加總必須 = 10,000</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <QtyBox label="合格數" value={okQty} onChange={setOkQty} />
            <QtyBox label="重工數" value={reworkQty} onChange={setReworkQty} />
            <QtyBox label="報廢數" value={scrapQty} onChange={setScrapQty} />
          </div>
          <p className={`mt-3 font-shop-mono text-sm ${sumOk ? 'text-[#8a8a8a]' : 'text-[#e61919]'}`}>
            合計 {sum.toLocaleString('zh-TW')} / 10,000
          </p>
        </div>
        <div className="bg-[#121212] px-5 py-5">
          <div className="grid gap-4">
            <Field label="抽檢數" required>
              <input defaultValue="200" className={inputClass} />
            </Field>
            <Field label="平面度 (mm)" required hint="上限 0.35">
              <input
                value={flatness}
                onChange={(e) => setFlatness(e.target.value)}
                className={`${inputClass} ${Number(flatness) > 0.35 ? 'border-[#e61919]' : ''}`}
              />
            </Field>
            {failLike && (
              <Field label="不良代碼" required hint="不合格時必填">
                <div className="flex flex-wrap gap-2">
                  {['DEF-FLAT 平面度超標', 'DEF-BURR 毛邊', 'DEF-COATING 鍍層'].map((item) => {
                    const code = item.split(' ')[0];
                    const on = codes.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))}
                        className={`h-12 px-3 font-shop-mono text-xs ${on ? 'bg-[#eaeaea] text-[#0a0a0a]' : 'border border-[#3a3a3a]'}`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}
            {failLike && (
              <Field label="退回工序" required>
                <div className="h-14 border border-[#eaeaea] bg-[#0a0a0a] px-4 font-shop text-lg leading-[3.5rem]">
                  薄板沖壓
                </div>
              </Field>
            )}
            {scrapNeed && (
              <Field label="報廢原因" required hint="報廢數 > 0 時必填">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="SCR-UNREPAIRABLE"
                  className={inputClass}
                />
              </Field>
            )}
          </div>
          <button
            type="button"
            disabled={!canSend || sent}
            onClick={() => setSent(true)}
            className="mt-6 h-16 w-full bg-[#eaeaea] font-shop text-2xl font-extrabold text-[#0a0a0a] disabled:opacity-35"
          >
            {sent ? '判定已送出' : '送出判定'}
          </button>
        </div>
      </div>
    </TerminalFrame>
  );
}

function BlockedScene() {
  const [hit, setHit] = useState(false);

  return (
    <TerminalFrame
      station="雷射焊接站"
      person="陳焊接 / 作業員"
      op="雷射焊接"
      message={hit ? '還不能開始。需先完成「沖壓品檢」。' : '沖壓剛完，品檢還沒做。他按得下去，但系統不會讓這張單往前。'}
      kind={hit ? 'error' : 'warn'}
    >
      <QueueTable
        rows={[
          {
            seq: 'MO-FR-27-005',
            product: '金屬前框',
            op: '雷射焊接',
            qty: '10,000 個',
            status: '還不能開始',
            active: true,
            muted: true,
          },
        ]}
      />
      <OpCard current="雷射焊接" prev="沖壓品檢" next="清洗" status="還不能開始" extra={[['卡在', '需先完成沖壓品檢']]} />
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <BigButton label="開始" enabled onClick={() => setHit(true)} />
        <BigButton label="完成" enabled={false} tone="ghost" />
      </div>
    </TerminalFrame>
  );
}

function BoardScene({ clock }: { clock: string }) {
  const gates: { name: string; tone: GateTone; label: string }[] = [
    { name: '薄板沖壓', tone: 'rework', label: '可重做' },
    { name: '沖壓品檢', tone: 'failed', label: '不合格' },
    { name: '雷射焊接', tone: 'pending', label: '還不能開始' },
    { name: '清洗', tone: 'pending', label: '還不能開始' },
    { name: '成品品檢', tone: 'pending', label: '還不能開始' },
  ];

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#121212]">
      <header className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-[#2a2a2a] px-6 py-5">
        <div>
          <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a]">狀態板 / 這批現在在哪</p>
          <h2 className="mt-1 font-shop text-5xl font-extrabold tracking-tight">MO-FR-27-005</h2>
          <p className="mt-2 font-shop-mono text-sm text-[#b5b5b5]">FR-27-BZ-A 27 吋監視器用金屬前框</p>
        </div>
        <div className="text-right">
          <p className="font-shop-mono text-[11px] tracking-[0.18em] text-[#8a8a8a]">工單</p>
          <p className="font-shop text-3xl font-extrabold text-[#e61919]">進行中</p>
          <p className="font-shop-mono text-sm text-[#8a8a8a]">{clock}</p>
        </div>
      </header>
      <p className="border-b border-[#2a2a2a] px-6 py-2 font-shop-mono text-[11px] tracking-wide text-[#6e6e6e]">
        薄板沖壓 → 沖壓品檢 → 雷射焊接 → 清洗 → 成品品檢
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-5 gap-px bg-[#2a2a2a]">
        {gates.map((gate, i) => (
          <article key={gate.name} className="flex flex-col bg-[#121212] px-3 py-8">
            <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#6e6e6e]">關 {i + 1}</p>
            <div className={`mt-6 h-3 w-full ${gateBar[gate.tone]}`} />
            <h3 className="mt-6 font-shop text-2xl font-extrabold leading-tight">{gate.name}</h3>
            <p className={`mt-auto pt-8 font-shop-mono text-sm tracking-[0.12em] ${gateText[gate.tone]}`}>{gate.label}</p>
          </article>
        ))}
      </div>
      <footer className="border-t border-[#2a2a2a] bg-[#161616] px-6 py-6">
        <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#6e6e6e]">這批現在在哪</p>
        <p className="mt-2 font-shop text-4xl font-extrabold leading-tight">沖壓品檢不合格，退回薄板沖壓。焊接尚未開始。</p>
        <p className="mt-3 font-shop-mono text-sm text-[#8a8a8a]">10,000 個 · 後段站點從頭到尾沒被解鎖過</p>
      </footer>
    </section>
  );
}

function TraceScene() {
  const rows = [
    ['薄板沖壓', '第 1 次', '08:12–09:40', '王沖壓', '模具 MD-FR27-02 · 料捲 RC-20260815-A', '完成'],
    ['沖壓品檢', '第 1 次', '09:42–09:55', '李檢驗', '平面度 0.52 · DEF-FLAT', '不合格'],
    ['薄板沖壓', '第 2 次', '10:05–11:30', '王沖壓', '模具 MD-FR27-05 · 料捲 RC-20260815-A', '完成'],
    ['沖壓品檢', '第 2 次', '11:32–11:48', '李檢驗', '平面度 0.19', '合格'],
    ['雷射焊接', '第 1 次', '12:04–13:10', '陳焊接', '模具後續焊道 · 氬氣 —', '完成'],
    ['清洗', '第 1 次', '13:18–13:40', '林清洗', '無數量回報', '完成'],
    ['成品品檢', '第 1 次', '13:51–14:06', '李檢驗', '抽檢 200 · 合格 10,000', '合格'],
  ];

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#121212]">
      <header className="grid grid-cols-[1fr_auto] gap-6 border-b border-[#2a2a2a] px-6 py-5">
        <div>
          <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a]">追溯 / 哪一批料、哪一副模具、哪一個人</p>
          <h2 className="mt-1 font-shop text-4xl font-extrabold">MO-FR-27-005</h2>
          <p className="mt-2 max-w-[52ch] font-shop text-lg text-[#b5b5b5]">
            退回不會覆蓋原紀錄。第 1 次沖壓跟第 2 次沖壓是兩筆，差異就是答案。
          </p>
        </div>
        <label className="w-72">
          <span className="mb-2 block font-shop-mono text-[11px] tracking-[0.16em] text-[#8a8a8a]">工單號</span>
          <input readOnly value="MO-FR-27-005" className={inputClass} />
        </label>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-[#0a0a0a] font-shop-mono text-[11px] tracking-[0.16em] text-[#6e6e6e]">
            <tr>
              {['工序', '次數', '時段', '人', '紀錄', '結果'].map((h) => (
                <th key={h} className="border-b border-[#2a2a2a] px-6 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join()} className="border-b border-[#2a2a2a]">
                <td className="px-6 py-4 font-shop text-lg font-bold">{row[0]}</td>
                <td className="px-6 py-4 font-shop-mono text-sm">{row[1]}</td>
                <td className="px-6 py-4 font-shop-mono text-sm tabular-nums">{row[2]}</td>
                <td className="px-6 py-4 font-shop-mono text-sm">{row[3]}</td>
                <td className="px-6 py-4 font-shop-mono text-sm text-[#b5b5b5]">{row[4]}</td>
                <td className={`px-6 py-4 font-shop-mono text-sm ${row[5] === '不合格' ? 'text-[#e61919]' : 'text-[#eaeaea]'}`}>
                  {row[5]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="border-t border-[#2a2a2a] px-6 py-4 font-shop-mono text-sm text-[#8a8a8a]">
        客戶買 MES 要的不是報表好看。是這張表能在三十秒內指到料、模具、人、時段。
      </footer>
    </section>
  );
}

function FieldScene() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('氬氣流量 (L/min)');
  const [code, setCode] = useState('argon_flow');
  const [min, setMin] = useState('12');
  const [max, setMax] = useState('20');
  const [flow, setFlow] = useState('');
  const flowNum = Number(flow);
  const flowBad = flow !== '' && (flowNum < 12 || flowNum > 20);

  return (
    <section className="grid h-full min-h-0 gap-px overflow-y-auto bg-[#2a2a2a] lg:grid-cols-2">
      <div className="flex flex-col bg-[#161616] px-6 py-6">
        <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a]">系統設定 / 記錄欄位 / 雷射焊接</p>
        <h2 className="mt-2 font-shop text-4xl font-extrabold">新增一欄</h2>
        <p className="mt-3 max-w-[42ch] font-shop text-lg text-[#b5b5b5]">
          品保要從下週起記錄氬氣流量。管理員自己加，不開需求單、不重新部署。
        </p>
        <div className="mt-8 grid gap-4">
          <Field label="欄位代碼" required hint="建立後不可改">
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
          </Field>
          <Field label="顯示名稱" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="資料型別">
              <div className="h-14 border border-[#eaeaea] px-4 font-shop-mono text-sm leading-[3.5rem]">數字</div>
            </Field>
            <Field label="下限">
              <input value={min} onChange={(e) => setMin(e.target.value)} className={inputClass} />
            </Field>
            <Field label="上限">
              <input value={max} onChange={(e) => setMax(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="是否必填">
            <div className="h-14 border border-[#eaeaea] bg-[#eaeaea] px-4 font-shop text-lg font-bold leading-[3.5rem] text-[#0a0a0a]">
              是 · 適用工序 雷射焊接
            </div>
          </Field>
        </div>
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="mt-8 h-16 bg-[#eaeaea] font-shop text-2xl font-extrabold text-[#0a0a0a]"
        >
          {saved ? '已儲存' : '儲存'}
        </button>
        {saved && (
          <p className="mt-4 font-shop text-lg text-[#eaeaea]">已寫入製程定義。下一張焊接完工表單會出現此欄。全程約三分鐘。</p>
        )}
      </div>
      <div className="flex flex-col bg-[#121212] px-6 py-6">
        <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a]">陳焊接下一秒看到的表單</p>
        <h3 className="mt-2 font-shop text-3xl font-extrabold">雷射焊接 · 完工</h3>
        <div className="mt-8 grid gap-4">
          <Field label="實際焊接數" required>
            <input defaultValue="10000" className={inputClass} />
          </Field>
          {saved ? (
            <Field label={name} required hint={`${min} ~ ${max}`}>
              <input
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className={`${inputClass} ${flowBad ? 'border-[#e61919]' : ''}`}
              />
              {flowBad && (
                <p className="mt-2 font-shop-mono text-sm text-[#e61919]">
                  {name} {flow} 超出有效範圍 {min} ~ {max}。
                </p>
              )}
            </Field>
          ) : (
            <div className="border border-dashed border-[#3a3a3a] px-4 py-8 font-shop-mono text-sm text-[#6e6e6e]">
              儲存前，這一格不存在。
            </div>
          )}
        </div>
        <p className="mt-auto pt-8 font-shop-mono text-sm leading-relaxed text-[#8a8a8a]">
          新欄位設定前已完成的紀錄顯示「—」，不會被追認為缺漏。欄位只能停用，不能刪除。歷史仍可查。
        </p>
      </div>
    </section>
  );
}

function TerminalFrame({
  station,
  person,
  op,
  message,
  kind,
  children,
}: {
  station: string;
  person: string;
  op: string;
  message: string;
  kind: MsgKind;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-[#161616]">
      <header className="flex items-end justify-between gap-4 border-b border-[#2a2a2a] px-5 py-4">
        <div>
          <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a]">工位終端</p>
          <h2 className="font-shop text-4xl font-extrabold tracking-tight">我在 {station}</h2>
          <p className="mt-1 font-shop-mono text-sm text-[#b5b5b5]">
            {person} / 本關 {op}
          </p>
        </div>
        <div className="border border-[#2a2a2a] px-4 py-2 text-right">
          <p className="font-shop-mono text-[10px] tracking-[0.16em] text-[#6e6e6e]">本機鎖定</p>
          <p className="font-shop text-sm font-bold">{station}</p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-5 py-4">
        <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">系統回話</p>
        <p className={`mt-2 font-shop text-2xl font-extrabold leading-snug ${msgColor[kind]}`}>{message}</p>
      </footer>
    </section>
  );
}

function QueueTable({
  rows,
}: {
  rows: { seq: string; product: string; op: string; qty: string; status: string; active?: boolean; muted?: boolean }[];
}) {
  return (
    <div className="px-5 py-4">
      <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">待辦清單</p>
      <div className="mt-3 grid grid-cols-[1.3fr_1fr_1fr_0.9fr_0.9fr] gap-2 px-3 pb-2 font-shop-mono text-[10px] tracking-[0.12em] text-[#6e6e6e]">
        <span>工單</span>
        <span>產品</span>
        <span>本關</span>
        <span>數量</span>
        <span>狀態</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.seq}
          className={`grid grid-cols-[1.3fr_1fr_1fr_0.9fr_0.9fr] gap-2 border px-3 py-4 font-shop-mono text-sm ${
            row.active ? 'border-[#eaeaea] bg-[#1c1c1c]' : 'border-[#2a2a2a]'
          } ${row.muted ? 'text-[#8a8a8a]' : 'text-[#eaeaea]'}`}
        >
          <span>{row.seq}</span>
          <span>{row.product}</span>
          <span>{row.op}</span>
          <span>{row.qty}</span>
          <span className={row.status === '還不能開始' ? 'text-[#8a8a8a]' : row.status === '進行中' ? 'text-[#eaeaea]' : 'text-[#eaeaea]'}>
            {row.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function OpCard({
  current,
  prev,
  next,
  status,
  extra,
}: {
  current: string;
  prev: string;
  next: string;
  status: string;
  extra: [string, string][];
}) {
  const cells: [string, string][] = [
    ['本關', current],
    ['狀態', status],
    ['上一關', prev],
    ['下一關', next],
    ...extra,
  ];
  return (
    <article className="border-t border-[#2a2a2a] px-5 py-5">
      <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">工序卡</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
        {cells.map(([k, v]) => (
          <div key={k}>
            <dt className="font-shop-mono text-[11px] tracking-[0.16em] text-[#8a8a8a]">{k}</dt>
            <dd className="mt-1 font-shop text-2xl font-extrabold leading-tight">{v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function BigButton({
  label,
  enabled,
  onClick,
  tone = 'solid',
}: {
  label: string;
  enabled: boolean;
  onClick?: () => void;
  tone?: 'solid' | 'ghost';
}) {
  const base = 'h-20 font-shop text-3xl font-extrabold active:scale-[0.99]';
  if (!enabled) {
    return (
      <button type="button" disabled className={`${base} border border-[#2a2a2a] text-[#4a4a4a]`}>
        {label}
      </button>
    );
  }
  if (tone === 'ghost') {
    return (
      <button type="button" onClick={onClick} className={`${base} border border-[#eaeaea] text-[#eaeaea]`}>
        {label}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} bg-[#eaeaea] text-[#0a0a0a]`}>
      {label}
    </button>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-shop-mono text-[11px] tracking-[0.16em] text-[#8a8a8a]">
          {label}
          {required ? ' · 必填' : ''}
        </span>
        {hint && <span className="font-shop-mono text-[11px] text-[#6e6e6e]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#2a2a2a] pb-2">
      <dt className="text-[#8a8a8a]">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function PresetChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 font-shop-mono text-xs tracking-[0.08em] ${on ? 'bg-[#eaeaea] text-[#0a0a0a]' : 'border border-[#3a3a3a] text-[#b5b5b5]'}`}
    >
      {label}
    </button>
  );
}

function QtyBox({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block font-shop-mono text-[10px] tracking-[0.14em] text-[#8a8a8a]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="numeric" className={inputClass} />
    </label>
  );
}

const inputClass =
  'h-14 w-full border border-[#3a3a3a] bg-[#0a0a0a] px-4 font-shop-mono text-xl text-[#eaeaea] outline-none placeholder:text-[#4a4a4a] focus:border-[#eaeaea]';

const msgColor: Record<MsgKind, string> = {
  idle: 'text-[#eaeaea]',
  ok: 'text-[#eaeaea]',
  warn: 'text-[#d4d4d4]',
  error: 'text-[#e61919]',
};

const gateBar: Record<GateTone, string> = {
  pending: 'bg-[#2a2a2a]',
  ready: 'bg-[#8a8a8a]',
  running: 'bg-[#eaeaea]',
  done: 'bg-[#4af626]',
  failed: 'bg-[#e61919]',
  rework: 'bg-[#eaeaea]',
};

const gateText: Record<GateTone, string> = {
  pending: 'text-[#6e6e6e]',
  ready: 'text-[#d4d4d4]',
  running: 'text-[#eaeaea]',
  done: 'text-[#4af626]',
  failed: 'text-[#e61919]',
  rework: 'text-[#eaeaea]',
};
