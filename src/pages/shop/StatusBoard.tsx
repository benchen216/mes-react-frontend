import { useEffect, useState } from 'react';
import { LINE_META } from '../../data/shopMock';
import { useShop } from '../../hooks/useShop';
import type { GateBoardStatus } from '../../types/shop';

const LIGHT: Record<GateBoardStatus, string> = {
  pending: 'bg-[#3a3a3a] shadow-none',
  ready: 'bg-[#6b6b6b] shadow-[0_0_16px_#8a8a8a]',
  running: 'bg-[#e67e22] shadow-[0_0_22px_#e67e22]',
  done: 'bg-[#4af626] shadow-[0_0_22px_#4af626]',
  failed: 'bg-[#e61919] shadow-[0_0_22px_#e61919]',
  rework: 'bg-[#3b82f6] shadow-[0_0_22px_#3b82f6]',
};

const LABEL_COLOR: Record<GateBoardStatus, string> = {
  pending: 'text-[#8a8a8a]',
  ready: 'text-[#d4d4d4]',
  running: 'text-[#e67e22]',
  done: 'text-[#4af626]',
  failed: 'text-[#e61919]',
  rework: 'text-[#60a5fa]',
};

function liveClock() {
  return new Date().toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function StatusBoard({ size = 'pane' }: { size?: 'pane' | 'wall' }) {
  const { state, boardFor } = useShop();
  const [seq, setSeq] = useState(state.orders[0]?.seq ?? '');
  const [clock, setClock] = useState(liveClock);
  const wall = size === 'wall';
  const board = boardFor(seq);

  useEffect(() => {
    const id = window.setInterval(() => setClock(liveClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state.orders.some((order) => order.seq === seq) && state.orders[0]) {
      setSeq(state.orders[0].seq);
    }
  }, [state.orders, seq]);

  if (!board) return null;
  const { order } = board;

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#121212] text-[#eaeaea]">
      <header className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-[#2a2a2a] px-5 py-4">
        <div>
          <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">狀態板 / 這批現在在哪</p>
          <div className="mt-2 flex flex-wrap gap-px bg-[#2a2a2a]">
            {state.orders.map((item) => (
              <button
                key={item.seq}
                type="button"
                onClick={() => setSeq(item.seq)}
                className={`px-3 py-2 font-shop-mono text-xs ${item.seq === seq ? 'bg-[#eaeaea] text-[#121212]' : 'bg-[#161616] text-[#b5b5b5]'}`}
              >
                {item.seq}
              </button>
            ))}
          </div>
          <h2 className={`mt-3 font-shop font-extrabold tracking-tight ${wall ? 'text-5xl' : 'text-3xl'}`}>{order.seq}</h2>
          <p className="mt-1 font-shop-mono text-sm text-[#b5b5b5]">
            {order.productCode} {order.productName} · {LINE_META[order.lineId].name}
          </p>
        </div>
        <div className="text-right">
          <p className="font-shop-mono text-[11px] tracking-[0.18em] text-[#8a8a8a]">工單</p>
          <p className={`font-shop font-extrabold ${order.status === '已結案' ? 'text-[#4af626]' : 'text-[#e67e22]'}`}>
            {order.status}
          </p>
          <p className="font-shop-mono text-sm text-[#8a8a8a]">{clock}</p>
        </div>
      </header>

      <p className="border-b border-[#2a2a2a] px-5 py-2 font-shop-mono text-[11px] tracking-wide text-[#6e6e6e]">{board.chain}</p>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {board.lots.map((row) => (
          <div key={row.lot.id} className="border-b border-[#2a2a2a]">
            {board.lots.length > 1 && (
              <p className="px-5 pt-3 font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">{row.label}</p>
            )}
            <div className="grid grid-cols-5 gap-px bg-[#2a2a2a]">
              {row.gates.map((gate) => (
                <article key={gate.id} className="flex flex-col items-center justify-center bg-[#121212] px-2 py-6 text-center">
                  <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#6e6e6e]">關 {gate.index}</p>
                  <div className={`my-4 h-10 w-10 rounded-full ${LIGHT[gate.boardStatus]}`} />
                  <h3 className={`font-shop font-extrabold leading-tight ${wall ? 'text-2xl' : 'text-lg'}`}>{gate.opName}</h3>
                  <p className={`mt-2 font-shop-mono text-sm tracking-[0.12em] ${LABEL_COLOR[gate.boardStatus]}`}>{gate.boardLabel}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-[#2a2a2a] bg-[#161616] px-5 py-5">
        <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#6e6e6e]">這批現在在哪</p>
        {board.sentences.map((sentence) => (
          <p key={sentence} className={`mt-2 font-shop font-extrabold leading-tight ${wall ? 'text-4xl' : 'text-2xl'}`}>
            {sentence}
          </p>
        ))}
        <p className="mt-3 font-shop-mono text-sm text-[#8a8a8a]">
          計畫 {order.plannedQty.toLocaleString('zh-TW')} {order.unit} · 完工 {order.completedQty.toLocaleString('zh-TW')} · 報廢 {order.scrapQty.toLocaleString('zh-TW')}
          {order.productCode === 'MON-27-A' ? ` · 前框可用 ${state.inventory['FR-27-BZ-A']?.toLocaleString('zh-TW') ?? 0}` : ''}
        </p>
      </footer>
    </section>
  );
}
