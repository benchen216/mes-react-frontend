import { ChevronDown, ChevronRight, Cog, ClipboardList, Factory, LayoutDashboard, Package, Settings, Wrench } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Factory;
}

interface NavChild {
  to: string;
  label: string;
}

interface NavGroup {
  label: string;
  icon: typeof Factory;
  children: NavChild[];
}

const navItems: (NavItem | NavGroup)[] = [
  { to: '/', label: '儀表板', icon: LayoutDashboard },
  { to: '/manuf-orders', label: '製造工單', icon: ClipboardList },
  { to: '/operations', label: '工序工單', icon: Factory },
  { to: '/bom', label: '物料清單', icon: Package },
  { to: '/prod-process', label: '生產製程', icon: Wrench },
  {
    label: '設定',
    icon: Settings,
    children: [
      { to: '/config?tab=workcenters', label: '工作中心' },
      { to: '/config?tab=machines', label: '機台' },
    ],
  },
];

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return (item as NavGroup).children !== undefined;
}

export function Sidebar() {
  const location = useLocation();
  const configActive = location.pathname === '/config';
  const [configOpen, setConfigOpen] = useState(configActive);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Factory className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-gray-900">MES 製造執行系統</div>
          <div className="text-xs text-gray-400">Production Module</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          if (isGroup(item)) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setConfigOpen((v) => !v)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    configActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {configOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {configOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-indigo-50 font-medium text-indigo-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            王
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-gray-800">王小明</div>
            <div className="text-xs text-gray-400">現場主管</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
