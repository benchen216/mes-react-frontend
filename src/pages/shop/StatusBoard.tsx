import { FIVE_OPS_ORDER, PROCESS_CHAIN } from '../../data/fiveOpsMock';
import { useFiveOps } from '../../hooks/useFiveOps';
import type { GateBoardStatus } from '../../types/fiveOps';
import { useEffect, useState } from 'react';

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
  const { derived } = useFiveOps();
  const [clock, setClock] = useState(liveClock);
  const wall = size === 'wall';

  useEffect(() => {
    const id = window.setInterval(() => setClock(liveClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#121212] text-[#eaeaea]">
      <header className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-[#2a2a2a] px-5 py-4">
        <div>
          <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">
            狀態板 / 這批現在在哪
          </p>
          <h2 className={`font-shop font-extrabold tracking-tight ${wall ? 'text-5xl' : 'text-3xl'}`}>
            {FIVE_OPS_ORDER.seq}
          </h2>
          <p className="mt-1 font-shop-mono text-sm text-[#b5b5b5]">
            {FIVE_OPS_ORDER.productCode} {FIVE_OPS_ORDER.productName}
          </p>
        </div>
        <div className="text-right">
          <p className="font-shop-mono text-[11px] tracking-[0.18em] text-[#8a8a8a]">工單</p>
          <p className={`font-shop font-extrabold ${derived.orderStatusLabel === '已結束' ? 'text-[#4af626]' : 'text-[#e67e22]'}`}>
            {derived.orderStatusLabel}
          </p>
          <p className="font-shop-mono text-sm text-[#8a8a8a]">{clock}</p>
        </div>
      </header>

      <p className="border-b border-[#2a2a2a] px-5 py-2 font-shop-mono text-[11px] tracking-wide text-[#6e6e6e]">
        {PROCESS_CHAIN}
      </p>

      <div className="grid min-h-0 flex-1 grid-cols-5 gap-px bg-[#2a2a2a]">
        {derived.gates.map((gate) => (
          <article key={gate.id} className="flex flex-col items-center justify-center bg-[#121212] px-2 py-6 text-center">
            <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#6e6e6e]">
              關 {gate.index}
            </p>
            <div className={`my-4 h-10 w-10 rounded-full ${LIGHT[gate.boardStatus]}`} />
            <h3 className={`font-shop font-extrabold leading-tight ${wall ? 'text-2xl' : 'text-lg'}`}>
              {gate.opName}
            </h3>
            <p className={`mt-2 font-shop-mono text-sm tracking-[0.12em] ${LABEL_COLOR[gate.boardStatus]}`}>
              {gate.boardLabel}
            </p>
          </article>
        ))}
      </div>

      <footer className="border-t border-[#2a2a2a] bg-[#161616] px-5 py-5">
        <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#6e6e6e]">這批現在在哪</p>
        <p className={`mt-2 font-shop font-extrabold leading-tight ${wall ? 'text-4xl' : 'text-2xl'}`}>
          {derived.boardSentence}
        </p>
        <p className="mt-3 font-shop-mono text-sm text-[#8a8a8a]">
          {FIVE_OPS_ORDER.qty.toLocaleString('zh-TW')} {FIVE_OPS_ORDER.unit}
        </p>
      </footer>
    </section>
  );
}
