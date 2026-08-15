import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { MoActions, type MoActionId } from '../components/MoActions';
import { PriorityBadge } from '../components/PriorityBadge';
import { MoStatusBadge } from '../components/StatusBadge';
import { FilterTabs, PageHeader } from '../components/ui';
import { useManufOrders } from '../hooks/useManufOrders';
import type { ManufOrder, MoStatus } from '../types';
import { formatDate, formatNumber, MO_STATUS_LABEL } from '../utils/status';

type Filter = MoStatus | 0; // 0 = 全部

const TABS: { value: Filter; label: string }[] = [
  { value: 0, label: '全部' },
  { value: 1, label: '草稿' },
  { value: 3, label: '已計畫' },
  { value: 4, label: '進行中' },
  { value: 5, label: '暫停' },
  { value: 6, label: '已完工' },
  { value: 2, label: '已取消' },
];

const ACTION_LABEL: Record<MoActionId, string> = {
  plan: '計畫',
  start: '開工',
  pause: '暫停',
  finish: '完工',
  cancel: '取消',
};

export function ManufOrderList() {
  const navigate = useNavigate();
  const { orders, transitionOrder } = useManufOrders();
  const [filter, setFilter] = useState<Filter>(0);
  const [pending, setPending] = useState<{ order: ManufOrder; action: MoActionId; target: MoStatus } | null>(null);

  const filtered = filter === 0 ? orders : orders.filter((o) => o.statusSelect === filter);

  const handleAction = (order: ManufOrder, action: MoActionId, target: MoStatus) => {
    setPending({ order, action, target });
  };

  const confirmAction = () => {
    if (!pending) return;
    transitionOrder(pending.order.id, pending.target);
    setPending(null);
  };

  return (
    <>
      <PageHeader title="製造工單" subtitle={`共 ${formatNumber(orders.length)} 筆工單`} />

      <FilterTabs options={TABS} value={filter} onChange={setFilter} />

      <DataTable
        data={filtered}
        getRowId={(o) => String(o.id)}
        onRowClick={(o) => navigate(`/manuf-orders/${o.id}`)}
        columns={[
          {
            header: '工單序號',
            cell: (o) => <span className="font-medium text-indigo-600">{o.manufOrderSeq}</span>,
          },
          { header: '產品', cell: (o) => o.product },
          { header: '數量', cell: (o) => `${formatNumber(o.qty)} ${o.unit}` },
          { header: '優先級', cell: (o) => <PriorityBadge priority={o.prioritySelect} /> },
          { header: 'BOM', cell: (o) => <span className="text-gray-500">{o.billOfMaterial}</span> },
          { header: '製程', cell: (o) => <span className="text-gray-500">{o.prodProcess}</span> },
          {
            header: '委外',
            cell: (o) =>
              o.outsourcing ? (
                <span className="text-orange-600">是</span>
              ) : (
                <span className="text-gray-400">否</span>
              ),
          },
          { header: '計畫開始', cell: (o) => formatDate(o.plannedStartDateT) },
          { header: '計畫結束', cell: (o) => formatDate(o.plannedEndDateT) },
          { header: '狀態', cell: (o) => <MoStatusBadge status={o.statusSelect} /> },
          {
            header: '操作',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (o) => <MoActions status={o.statusSelect} onAction={(a, t) => handleAction(o, a, t)} />,
          },
        ]}
      />

      <ConfirmDialog
        open={!!pending}
        title={`${ACTION_LABEL[pending?.action ?? 'plan']}工單`}
        message={
          pending ? (
            <>
              確定要將工單 <span className="font-semibold text-gray-900">{pending.order.manufOrderSeq}</span>{' '}
              （{pending.order.product}）狀態變更為
              「<span className="font-semibold text-indigo-600">{MO_STATUS_LABEL[pending.target]}</span>」嗎？
            </>
          ) : (
            ''
          )
        }
        tone={pending?.action === 'cancel' ? 'danger' : 'default'}
        confirmLabel={pending ? ACTION_LABEL[pending.action] : '確定'}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
