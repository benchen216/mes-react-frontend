import { useMemo, useState } from 'react';
import { FIVE_OPS_ORDER, STATION_BY_ID, STATIONS } from '../../data/fiveOpsMock';
import { useFiveOps } from '../../hooks/useFiveOps';
import { formatClock } from '../../lib/fiveOpsMachine';
import type { MessageKind, QueueRow, StationId } from '../../types/fiveOps';

const SESSION_STATION_KEY = 'mes.fiveOps.station';

function loadStation(): StationId {
  const raw = sessionStorage.getItem(SESSION_STATION_KEY);
  if (raw && raw in STATION_BY_ID) return raw as StationId;
  return 'STAMP';
}

function statusTone(status: QueueRow['status']) {
  if (status === '可開始') return 'text-[#d4d4d4]';
  if (status === '進行中') return 'text-[#e67e22]';
  return 'text-[#8a8a8a]';
}

export function WorkstationTerminal() {
  const { state, start, complete, pass, fail, queueFor, cardFor } = useFiveOps();
  const [station, setStation] = useState<StationId>(loadStation);
  const [selected, setSelected] = useState(true);
  const [qty, setQty] = useState(String(FIVE_OPS_ORDER.qty));

  const def = STATION_BY_ID[station];
  const queues = useMemo(() => queueFor(station), [queueFor, station, state]);
  const card = useMemo(() => cardFor(station), [cardFor, station, state]);

  const switchStation = (next: StationId) => {
    setStation(next);
    sessionStorage.setItem(SESSION_STATION_KEY, next);
    setSelected(true);
  };

  const scanOrder = () => {
    setSelected(true);
  };

  const parsedQty = Number(qty);
  const qtyOk = Number.isFinite(parsedQty) && parsedQty > 0;

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#161616] text-[#eaeaea]">
      <header className="border-b border-[#2a2a2a] px-5 py-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">
              工位終端
            </p>
            <h2 className="font-shop text-3xl font-extrabold tracking-tight">
              我在 {def.hereLabel}
            </h2>
            <p className="mt-1 font-shop-mono text-sm text-[#b5b5b5]">
              {def.role} / {def.operator} / 本關 {def.opName}
            </p>
          </div>
          <button
            type="button"
            onClick={scanOrder}
            className="border border-[#eaeaea] px-4 py-2 font-shop-mono text-xs tracking-[0.16em] uppercase hover:bg-[#eaeaea] hover:text-[#121212]"
          >
            掃工單
          </button>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-px bg-[#2a2a2a]">
          {STATIONS.map((item) => {
            const active = item.id === station;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchStation(item.id)}
                className={`px-2 py-3 text-left ${active ? 'bg-[#eaeaea] text-[#121212]' : 'bg-[#121212] text-[#b5b5b5] hover:bg-[#1c1c1c]'}`}
              >
                <span className="block font-shop-mono text-[10px] tracking-[0.16em]">{item.id}</span>
                <span className="mt-1 block font-shop text-sm font-bold leading-tight">{item.hereLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <QueueBlock title="待做清單" rows={queues.todo} empty="這個工位現在沒有可開始的工單。" selected={selected} onSelect={() => setSelected(true)} />
        <QueueBlock title="其他工單" rows={queues.other} empty="沒有其他工單。" selected={selected} onSelect={() => setSelected(true)} muted />

        {selected && (
          <article className="border-t border-[#2a2a2a] px-5 py-5">
            <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">這張單</p>
            <h3 className="mt-1 font-shop text-2xl font-extrabold">{FIVE_OPS_ORDER.seq}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 font-shop-mono text-sm">
              <div>
                <dt className="text-[#8a8a8a]">產品</dt>
                <dd>{FIVE_OPS_ORDER.productName}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">數量</dt>
                <dd>{FIVE_OPS_ORDER.qty.toLocaleString('zh-TW')} {FIVE_OPS_ORDER.unit}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">本關</dt>
                <dd>{card.opName}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">本關狀態</dt>
                <dd>{card.opStatusLabel}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">上一關</dt>
                <dd>{card.prevOp}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">下一關</dt>
                <dd>{card.nextOp}</dd>
              </div>
              {card.operator && (
                <div>
                  <dt className="text-[#8a8a8a]">誰在做</dt>
                  <dd>{card.operator}</dd>
                </div>
              )}
              {card.startedAt && (
                <div>
                  <dt className="text-[#8a8a8a]">開始時間</dt>
                  <dd>{formatClock(card.startedAt)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 space-y-3">
              {(card.state === 'idle' || card.state === 'blocked') && (
                <button
                  type="button"
                  onClick={() => start(station)}
                  className="h-16 w-full bg-[#eaeaea] font-shop text-2xl font-extrabold text-[#121212] active:scale-[0.99]"
                >
                  開始
                </button>
              )}

              {card.state === 'running' && (
                <div className="grid gap-3">
                  {card.reportsQty && (
                    <label className="block">
                      <span className="mb-2 block font-shop-mono text-xs tracking-[0.16em] text-[#8a8a8a]">報數量</span>
                      <input
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        inputMode="numeric"
                        className="h-14 w-full border border-[#3a3a3a] bg-[#121212] px-4 font-shop-mono text-2xl outline-none focus:border-[#eaeaea]"
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    disabled={card.reportsQty && !qtyOk}
                    onClick={() => complete(station, qtyOk ? parsedQty : FIVE_OPS_ORDER.qty)}
                    className="h-16 w-full bg-[#eaeaea] font-shop text-2xl font-extrabold text-[#121212] disabled:opacity-40 active:scale-[0.99]"
                  >
                    完成
                  </button>
                </div>
              )}

              {card.state === 'judging' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => pass(station)}
                    className="h-16 border border-[#4af626] bg-[#4af626] font-shop text-2xl font-extrabold text-[#121212] active:scale-[0.99]"
                  >
                    合格
                  </button>
                  <button
                    type="button"
                    disabled={card.finalQcFailDisabled}
                    onClick={() => fail(station)}
                    className="h-16 border border-[#e61919] font-shop text-2xl font-extrabold text-[#e61919] disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.99]"
                  >
                    不合格
                  </button>
                </div>
              )}

              {card.state === 'done' && (
                <p className="border border-[#2a2a2a] px-4 py-3 font-shop text-lg">
                  下一關是 {card.nextOp}
                </p>
              )}

              {card.state === 'passed' && (
                <p className="border border-[#2a2a2a] px-4 py-3 font-shop text-lg">
                  {station === 'FINAL_QC' ? '工單已結束。' : `下一關是 ${card.nextOp}`}
                </p>
              )}

              {card.state === 'failed' && (
                <p className="border border-[#e61919] px-4 py-3 font-shop text-lg text-[#e61919]">
                  判定不合格。請退回薄板沖壓重做。
                </p>
              )}

              {card.finalQcFailDisabled && card.state === 'judging' && (
                <p className="font-shop-mono text-xs text-[#8a8a8a]">本 demo 成品品檢只走合格</p>
              )}
            </div>
          </article>
        )}
      </div>

      <footer className="border-t border-[#2a2a2a] bg-[#121212] px-5 py-4">
        <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">系統回話</p>
        <p className={`mt-2 font-shop text-xl font-bold leading-snug ${messageColor(state.lastMessageKind)}`}>
          {state.lastMessage ?? '等待操作。'}
        </p>
      </footer>
    </section>
  );
}

function messageColor(kind: MessageKind | null) {
  if (kind === 'error') return 'text-[#e61919]';
  if (kind === 'warn') return 'text-[#e67e22]';
  if (kind === 'ok') return 'text-[#eaeaea]';
  return 'text-[#b5b5b5]';
}

function QueueBlock({
  title,
  rows,
  empty,
  selected,
  onSelect,
  muted = false,
}: {
  title: string;
  rows: QueueRow[];
  empty: string;
  selected: boolean;
  onSelect: () => void;
  muted?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${muted ? 'opacity-80' : ''}`}>
      <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 font-shop text-sm text-[#6e6e6e]">{empty}</p>
      ) : (
        <ul className="mt-3 overflow-x-auto">
          <li className="grid grid-cols-[1.2fr_1fr_0.8fr_0.7fr_0.8fr] gap-2 px-3 pb-2 font-shop-mono text-[10px] tracking-[0.12em] text-[#6e6e6e]">
            <span>工單</span>
            <span>產品</span>
            <span>本關</span>
            <span>數量</span>
            <span>狀態</span>
          </li>
          {rows.map((row) => (
            <li key={`${title}-${row.seq}`}>
              <button
                type="button"
                onClick={onSelect}
                className={`grid w-full grid-cols-[1.2fr_1fr_0.8fr_0.7fr_0.8fr] gap-2 border px-3 py-3 text-left font-shop-mono text-xs ${
                  selected ? 'border-[#eaeaea] bg-[#1c1c1c]' : 'border-[#2a2a2a]'
                } ${row.status === '還不能開始' ? 'text-[#8a8a8a]' : 'text-[#eaeaea]'}`}
              >
                <span>{row.seq}</span>
                <span>{row.product}</span>
                <span>{row.opName}</span>
                <span>{row.qty.toLocaleString('zh-TW')}</span>
                <span className={statusTone(row.status)}>{row.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
