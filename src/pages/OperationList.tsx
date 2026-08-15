import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { OperationActions } from '../components/MoActions';
import { MoStatusBadge } from '../components/StatusBadge';
import { FilterTabs, PageHeader } from '../components/ui';
import { useManufOrders } from '../hooks/useManufOrders';
import type { MoStatus, OperationOrder } from '../types';
import { formatDate, formatNumber, MO_STATUS_LABEL } from '../utils/status';

type Filter = MoStatus | 0;

const TABS: { value: Filter; label: string }[] = [
  { value: 0, label: '全部' },
  { value: 3, label: '已計畫' },
  { value: 4, label: '進行中' },
  { value: 5, label: '暫停' },
  { value: 6, label: '已完工' },
  { value: 2, label: '已取消' },
];

interface FlatOp extends OperationOrder {
  orderId: number;
  manufOrderSeq: string;
}

export function OperationList() {
  const { orders, transitionOperation } = useManufOrders();
  const [filter, setFilter] = useState<Filter>(0);
  const [pending, setPending] = useState<{ orderId: number; op: OperationOrder; target: MoStatus } | null>(null);

  const flatOps: FlatOp[] = orders.flatMap((o) =>
    o.operationOrders.map((op) => ({ ...op, orderId: o.id, manufOrderSeq: o.manufOrderSeq }))
  );

  const filtered = filter === 0 ? flatOps : flatOps.filter((o) => o.statusSelect === filter);

  const confirm = () => {
    if (pending) transitionOperation(pending.orderId, pending.op.id, pending.target);
    setPending(null);
  };

  return (
    <>
      <PageHeader title="工序工單" subtitle={`共 ${formatNumber(flatOps.length)} 筆工序`} />

      <FilterTabs options={TABS} value={filter} onChange={setFilter} />

      <DataTable
        data={filtered}
        getRowId={(o) => `${o.orderId}-${o.id}`}
        columns={[
          { header: '序號', cell: (o) => <span className="font-medium text-gray-900">{o.name}</span> },
          { header: '工序名稱', cell: (o) => o.operationName },
          { header: '工作中心', cell: (o) => o.workCenter },
          { header: '機台', cell: (o) => o.machine ?? '—' },
          { header: '工單序號', cell: (o) => <span className="text-indigo-600">{o.manufOrderSeq}</span> },
          { header: '計畫開始', cell: (o) => formatDate(o.plannedStartDateT) },
          { header: '計畫結束', cell: (o) => formatDate(o.plannedEndDateT) },
          { header: '實際開始', cell: (o) => formatDate(o.realStartDateT) },
          { header: '實際結束', cell: (o) => formatDate(o.realEndDateT) },
          { header: '狀態', cell: (o) => <MoStatusBadge status={o.statusSelect} /> },
          {
            header: '操作',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (o) => (
              <OperationActions status={o.statusSelect} onAction={(t) => setPending({ orderId: o.orderId, op: o, target: t })} />
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={!!pending}
        title="工序狀態變更"
        message={
          pending ? (
            <>
              確定要將工序「<span className="font-semibold">{pending.op.operationName}</span>」（{pending.op.name}）變更為
              「<span className="font-semibold text-indigo-600">{MO_STATUS_LABEL[pending.target]}</span>」嗎？
            </>
          ) : (
            ''
          )
        }
        confirmLabel={pending ? MO_STATUS_LABEL[pending.target] : '確定'}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
