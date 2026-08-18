import { Link } from 'react-router-dom';
import { useShop } from '../../hooks/useShop';
import { FieldSettings } from './FieldSettings';
import { StatusBoard } from './StatusBoard';
import { TraceView } from './TraceView';
import { WorkstationTerminal } from './WorkstationTerminal';

export type ShopMode = 'split' | 'terminal' | 'board' | 'trace' | 'settings';

const NAV: { to: string; label: string; mode: ShopMode | 'concept' }[] = [
  { to: '/shop', label: '工位 + 狀態板', mode: 'split' },
  { to: '/shop/terminal', label: '工位終端', mode: 'terminal' },
  { to: '/shop/board', label: '狀態板', mode: 'board' },
  { to: '/shop/trace', label: '追溯', mode: 'trace' },
  { to: '/shop/settings', label: '欄位設定', mode: 'settings' },
];

export function ShopFloor({ mode }: { mode: ShopMode }) {
  const { reset } = useShop();

  return (
    <div className="shop-floor flex min-h-[100dvh] flex-col bg-[#0a0a0a] text-[#eaeaea]">
      <div className="flex items-center justify-between gap-3 border-b border-[#2a2a2a] px-4 py-2 font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">
        <div className="flex min-w-0 items-center gap-4">
          <span className="shrink-0 text-[#eaeaea]">MES 現場執行</span>
          <nav className="flex min-w-0 items-center gap-3 overflow-x-auto">
            {NAV.map((item) => (
              <Link key={item.to} className={mode === item.mode ? 'text-[#eaeaea]' : 'hover:text-[#eaeaea]'} to={item.to}>
                {item.label}
              </Link>
            ))}
            <Link className="hover:text-[#eaeaea]" to="/shop/concept">
              概念稿
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link className="hover:text-[#eaeaea]" to="/">
            辦公室
          </Link>
          <button type="button" onClick={reset} className="border border-[#3a3a3a] px-2 py-1 hover:border-[#eaeaea] hover:text-[#eaeaea]">
            重設現場
          </button>
        </div>
      </div>

      {mode === 'split' && (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-[#2a2a2a] xl:grid-cols-2">
          <WorkstationTerminal />
          <StatusBoard size="pane" />
        </div>
      )}
      {mode === 'terminal' && (
        <div className="min-h-0 flex-1">
          <WorkstationTerminal />
        </div>
      )}
      {mode === 'board' && (
        <div className="min-h-0 flex-1">
          <StatusBoard size="wall" />
        </div>
      )}
      {mode === 'trace' && (
        <div className="min-h-0 flex-1">
          <TraceView />
        </div>
      )}
      {mode === 'settings' && (
        <div className="min-h-0 flex-1">
          <FieldSettings />
        </div>
      )}
    </div>
  );
}
