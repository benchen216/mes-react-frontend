import { Bell, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const TITLE_MAP: Record<string, string> = {
  '/': '儀表板',
  '/manuf-orders': '製造工單',
  '/operations': '工序工單',
  '/bom': '物料清單',
  '/prod-process': '生產製程',
  '/config': '系統設定',
};

function resolveTitle(pathname: string): string {
  const segment = '/' + pathname.split('/')[1];
  return TITLE_MAP[segment] ?? 'MES 製造執行系統';
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-8 backdrop-blur">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="搜尋..."
                className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                王
              </div>
              <div className="hidden text-sm leading-tight md:block">
                <div className="font-medium text-gray-800">王小明</div>
                <div className="text-xs text-gray-400">現場主管</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
