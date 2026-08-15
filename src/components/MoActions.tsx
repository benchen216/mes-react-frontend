import { CalendarCheck, CheckCircle2, Pause, Play, Square } from 'lucide-react';
import type { MoStatus } from '../types';
import { canTransition } from '../utils/status';

export type MoActionId = 'plan' | 'start' | 'pause' | 'finish' | 'cancel';

interface ActionDef {
  id: MoActionId;
  label: string;
  icon: typeof Play;
  target: MoStatus;
  className: string;
}

const ACTIONS: ActionDef[] = [
  { id: 'plan', label: '計畫', icon: CalendarCheck, target: 3, className: 'text-blue-600 hover:text-blue-800' },
  { id: 'start', label: '開工', icon: Play, target: 4, className: 'text-green-600 hover:text-green-800' },
  { id: 'pause', label: '暫停', icon: Pause, target: 5, className: 'text-yellow-600 hover:text-yellow-800' },
  { id: 'finish', label: '完工', icon: CheckCircle2, target: 6, className: 'text-purple-600 hover:text-purple-800' },
  { id: 'cancel', label: '取消', icon: Square, target: 2, className: 'text-red-600 hover:text-red-800' },
];

export type OperationActionId = 'start' | 'pause' | 'finish';

export function OperationActions({
  status,
  onAction,
  variant = 'icon',
}: {
  status: MoStatus;
  onAction: (target: MoStatus) => void;
  variant?: 'icon' | 'full';
}) {
  const startTarget: MoStatus = 4;
  const startEnabled = canTransition(status, startTarget);
  const startLabel = status === 5 ? '恢復' : '開工';

  const pauseEnabled = canTransition(status, 5);
  const finishEnabled = canTransition(status, 6);

  const buttons = [
    { id: 'start', label: startLabel, icon: Play, target: startTarget, enabled: startEnabled, className: 'text-green-600 hover:text-green-800' },
    { id: 'pause', label: '暫停', icon: Pause, target: 5 as MoStatus, enabled: pauseEnabled, className: 'text-yellow-600 hover:text-yellow-800' },
    { id: 'finish', label: '完工', icon: CheckCircle2, target: 6 as MoStatus, enabled: finishEnabled, className: 'text-purple-600 hover:text-purple-800' },
  ];

  if (variant === 'full') {
    return (
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <button
            key={b.id}
            title={b.label}
            disabled={!b.enabled}
            onClick={() => b.enabled && onAction(b.target)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              b.enabled
                ? `border-gray-200 bg-white ${b.className} hover:bg-gray-50`
                : 'cursor-not-allowed border-gray-100 text-gray-300'
            }`}
          >
            <b.icon className="h-4 w-4" />
            {b.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {buttons.map((b) => {
        const Icon = b.icon;
        return (
          <button
            key={b.id}
            title={b.label}
            disabled={!b.enabled}
            onClick={(e) => {
              e.stopPropagation();
              if (b.enabled) onAction(b.target);
            }}
            className={`rounded p-1.5 transition-colors ${
              b.enabled ? `${b.className} hover:bg-gray-100` : 'cursor-not-allowed text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

interface MoActionsProps {
  status: MoStatus;
  onAction: (action: MoActionId, target: MoStatus) => void;
  variant?: 'icon' | 'full';
}

export function MoActions({ status, onAction, variant = 'icon' }: MoActionsProps) {
  return (
    <div className={variant === 'full' ? 'flex flex-wrap gap-2' : 'flex items-center gap-1'}>
      {ACTIONS.map((a) => {
        const enabled = canTransition(status, a.target);
        const Icon = a.icon;
        if (variant === 'icon') {
          return (
            <button
              key={a.id}
              title={a.label}
              disabled={!enabled}
              onClick={(e) => {
                e.stopPropagation();
                if (enabled) onAction(a.id, a.target);
              }}
              className={`rounded p-1.5 transition-colors ${
                enabled
                  ? `${a.className} hover:bg-gray-100`
                  : 'cursor-not-allowed text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        }
        return (
          <button
            key={a.id}
            title={a.label}
            disabled={!enabled}
            onClick={() => enabled && onAction(a.id, a.target)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              enabled
                ? `border-gray-200 bg-white ${a.className} hover:bg-gray-50`
                : 'cursor-not-allowed border-gray-100 text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
