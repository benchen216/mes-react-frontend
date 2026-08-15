import type { BomStatus, MoStatus } from '../types';
import {
  BOM_STATUS_LABEL,
  BOM_STATUS_STYLE,
  MO_STATUS_DOT,
  MO_STATUS_LABEL,
  MO_STATUS_STYLE,
} from '../utils/status';

export function MoStatusBadge({ status }: { status: MoStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${MO_STATUS_STYLE[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${MO_STATUS_DOT[status]}`} />
      {MO_STATUS_LABEL[status]}
    </span>
  );
}

export function BomStatusBadge({ status }: { status: BomStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BOM_STATUS_STYLE[status]}`}
    >
      {BOM_STATUS_LABEL[status]}
    </span>
  );
}
