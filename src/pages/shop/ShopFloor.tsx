import { Link } from 'react-router-dom';
import { useFiveOps } from '../../hooks/useFiveOps';
import { StatusBoard } from './StatusBoard';
import { WorkstationTerminal } from './WorkstationTerminal';

export type ShopMode = 'split' | 'terminal' | 'board';

export function ShopFloor({ mode }: { mode: ShopMode }) {
  const { reset } = useFiveOps();

  return (
    <div className="shop-floor flex min-h-[100dvh] flex-col bg-[#0a0a0a] text-[#eaeaea]">
      <div className="flex items-center justify-between gap-3 border-b border-[#2a2a2a] px-4 py-2 font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">
        <div className="flex items-center gap-4">
          <span>MES 現場 / 五工序 Demo</span>
          <nav className="flex items-center gap-3">
            <Link className={mode === 'split' ? 'text-[#eaeaea]' : 'hover:text-[#eaeaea]'} to="/shop">
              左右分欄
            </Link>
            <Link className={mode === 'terminal' ? 'text-[#eaeaea]' : 'hover:text-[#eaeaea]'} to="/shop/terminal">
              只開工位
            </Link>
            <Link className="hover:text-[#eaeaea]" to="/shop/concept">
              概念長相
            </Link>
            <Link className="hover:text-[#eaeaea]" to="/spec">
              規格書
            </Link>
            <a
              className={mode === 'board' ? 'text-[#eaeaea]' : 'hover:text-[#eaeaea]'}
              href="/shop/board"
              target={mode === 'split' ? '_blank' : undefined}
              rel={mode === 'split' ? 'noreferrer' : undefined}
            >
              {mode === 'split' ? '另開狀態板' : '只開狀態板'}
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link className="hover:text-[#eaeaea]" to="/">
            辦公室
          </Link>
          <button type="button" onClick={reset} className="border border-[#3a3a3a] px-2 py-1 hover:border-[#eaeaea] hover:text-[#eaeaea]">
            重設演示
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
    </div>
  );
}
