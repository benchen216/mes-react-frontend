import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { MoActions, OperationActions, type MoActionId } from '../components/MoActions';
import { MoStatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { InfoField, SectionCard } from '../components/ui';
import { useManufOrders } from '../hooks/useManufOrders';
import type { ManufOrder, MoStatus, OperationOrder } from '../types';
import { formatCurrency, formatDate, formatNumber, MO_STATUS_LABEL } from '../utils/status';

type Tab = 'basic' | 'operations' | 'consume' | 'produce' | 'cost';

const TABS: { value: Tab; label: string }[] = [
  { value: 'basic', label: '基本資料' },
  { value: 'operations', label: '工序' },
  { value: 'consume', label: '待消耗 / 已消耗' },
  { value: 'produce', label: '成品' },
  { value: 'cost', label: '成本' },
];

const ACTION_LABEL: Record<MoActionId, string> = {
  plan: '計畫',
  start: '開工',
  pause: '暫停',
  finish: '完工',
  cancel: '取消',
};

interface PendingMo {
  action: MoActionId;
  target: MoStatus;
}

export function ManufOrderDetail() {
  const { id } = useParams();
  const { getOrder, transitionOrder, transitionOperation } = useManufOrders();
  const [tab, setTab] = useState<Tab>('basic');
  const [pendingMo, setPendingMo] = useState<PendingMo | null>(null);
  const [pendingOp, setPendingOp] = useState<{ op: OperationOrder; target: MoStatus } | null>(null);

  const order = id ? getOrder(Number(id)) : undefined;

  if (!order) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
        找不到此工單。<Link to="/manuf-orders" className="text-indigo-600 hover:underline">返回列表</Link>
      </div>
    );
  }

  const allOpsFinished =
    order.operationOrders.length > 0 && order.operationOrders.every((op) => op.statusSelect === 6);

  const confirmMo = () => {
    if (pendingMo) transitionOrder(order.id, pendingMo.target);
    setPendingMo(null);
  };

  const confirmOp = () => {
    if (pendingOp) transitionOperation(order.id, pendingOp.op.id, pendingOp.target);
    setPendingOp(null);
  };

  return (
    <>
      <Link
        to="/manuf-orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> 返回製造工單列表
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* 主內容 */}
        <div>
          {/* 標題列 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{order.manufOrderSeq}</h2>
            <MoStatusBadge status={order.statusSelect} />
            <PriorityBadge priority={order.prioritySelect} />
            <span className="text-sm text-gray-500">{order.product}</span>
          </div>

          {allOpsFinished && order.statusSelect !== 6 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
              <CheckCircle2 className="h-5 w-5" />
              全部工序完成，工單已自動完工
            </div>
          )}
          {allOpsFinished && order.statusSelect === 6 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              全部工序已完成，工單已完工
            </div>
          )}

          {/* Tabs */}
          <div className="mb-4 flex gap-1 border-b border-gray-200">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.value
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {tab === t.value && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-600" />
                )}
              </button>
            ))}
          </div>

          {tab === 'basic' && <BasicTab order={order} />}
          {tab === 'operations' && (
            <OperationsTab
              order={order}
              onAction={(op, target) => setPendingOp({ op, target })}
            />
          )}
          {tab === 'consume' && <ConsumeTab order={order} />}
          {tab === 'produce' && <ProduceTab order={order} />}
          {tab === 'cost' && <CostTab order={order} />}
        </div>

        {/* 右側動作面板 */}
        <div>
          <SectionCard title="工單操作">
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">目前狀態</div>
                <div className="mt-1 flex justify-center">
                  <MoStatusBadge status={order.statusSelect} />
                </div>
              </div>
              <MoActions
                status={order.statusSelect}
                variant="full"
                onAction={(action, target) => setPendingMo({ action, target })}
              />
              <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                可執行的操作依目前狀態而定，變更前需確認。
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingMo}
        title={`${pendingMo ? ACTION_LABEL[pendingMo.action] : ''}工單`}
        message={
          pendingMo ? (
            <>
              確定要將工單 <span className="font-semibold">{order.manufOrderSeq}</span> 狀態變更為
              「<span className="font-semibold text-indigo-600">{MO_STATUS_LABEL[pendingMo.target]}</span>」嗎？
            </>
          ) : (
            ''
          )
        }
        tone={pendingMo?.action === 'cancel' ? 'danger' : 'default'}
        confirmLabel={pendingMo ? ACTION_LABEL[pendingMo.action] : '確定'}
        onConfirm={confirmMo}
        onCancel={() => setPendingMo(null)}
      />

      <ConfirmDialog
        open={!!pendingOp}
        title="工序狀態變更"
        message={
          pendingOp ? (
            <>
              確定要將工序「<span className="font-semibold">{pendingOp.op.operationName}</span>」變更為
              「<span className="font-semibold text-indigo-600">{MO_STATUS_LABEL[pendingOp.target]}</span>」嗎？
              <br />
              <span className="text-gray-400">工序啟動時工單將自動轉為進行中；全部工序完工時工單將自動完工。</span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel={pendingOp ? MO_STATUS_LABEL[pendingOp.target] : '確定'}
        onConfirm={confirmOp}
        onCancel={() => setPendingOp(null)}
      />
    </>
  );
}

function BasicTab({ order }: { order: ManufOrder }) {
  return (
    <SectionCard>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
        <InfoField label="公司" value={order.company} />
        <InfoField label="產品" value={order.product} />
        <InfoField label="數量" value={`${formatNumber(order.qty)} ${order.unit}`} />
        <InfoField label="工單類型" value={order.typeSelect === 1 ? '生產' : '常備'} />
        <InfoField label="物料清單 (BOM)" value={order.billOfMaterial} />
        <InfoField label="生產製程" value={order.prodProcess} />
        <InfoField label="計畫開始時間" value={formatDate(order.plannedStartDateT)} />
        <InfoField label="計畫結束時間" value={formatDate(order.plannedEndDateT)} />
        <InfoField label="實際開始時間" value={formatDate(order.realStartDateT)} />
        <InfoField label="實際結束時間" value={formatDate(order.realEndDateT)} />
        <InfoField label="預估成本價" value={formatCurrency(order.costPrice)} />
        <InfoField
          label="委外"
          value={
            order.outsourcing ? (
              <span className="text-orange-600">是（{order.outsourcingPartner}）</span>
            ) : (
              '否'
            )
          }
        />
      </dl>
    </SectionCard>
  );
}

function OperationsTab({
  order,
  onAction,
}: {
  order: ManufOrder;
  onAction: (op: OperationOrder, target: MoStatus) => void;
}) {
  if (order.operationOrders.length === 0) {
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <Layers className="mb-2 h-8 w-8" />
          此工單尚無工序資料
        </div>
      </SectionCard>
    );
  }
  return (
    <DataTable
      data={[...order.operationOrders].sort((a, b) => a.priority - b.priority)}
      getRowId={(o) => String(o.id)}
      columns={[
        { header: '序號', cell: (o) => <span className="font-medium text-gray-900">{o.name}</span> },
        { header: '工序', cell: (o) => o.operationName },
        { header: '工作中心', cell: (o) => o.workCenter },
        { header: '機台', cell: (o) => o.machine ?? '—' },
        { header: '計畫開始', cell: (o) => formatDate(o.plannedStartDateT) },
        { header: '計畫結束', cell: (o) => formatDate(o.plannedEndDateT) },
        { header: '實際開始', cell: (o) => formatDate(o.realStartDateT) },
        { header: '實際結束', cell: (o) => formatDate(o.realEndDateT) },
        {
          header: '計畫工時',
          cell: (o) => (o.plannedDuration ? `${formatNumber(o.plannedDuration)} h` : '—'),
        },
        { header: '狀態', cell: (o) => <MoStatusBadge status={o.statusSelect} /> },
        {
          header: '操作',
          headerClassName: 'text-right',
          className: 'text-right',
          cell: (o) => <OperationActions status={o.statusSelect} onAction={(t) => onAction(o, t)} />,
        },
      ]}
    />
  );
}

function ConsumeTab({ order }: { order: ManufOrder }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="待消耗產品">
        <DataTable
          data={order.toConsumeProducts}
          getRowId={(p) => String(p.id)}
          emptyMessage="無待消耗資料"
          columns={[
            { header: '產品', cell: (p) => p.product },
            { header: '計畫量', cell: (p) => `${formatNumber(p.plannedQty)} ${p.unit}` },
          ]}
        />
      </SectionCard>
      <SectionCard title="已消耗產品">
        <DataTable
          data={order.consumedProducts}
          getRowId={(p) => String(p.id)}
          emptyMessage="尚無消耗紀錄"
          columns={[
            { header: '產品', cell: (p) => p.product },
            { header: '計畫量', cell: (p) => `${formatNumber(p.plannedQty)} ${p.unit}` },
            { header: '實際量', cell: (p) => `${formatNumber(p.realQty)} ${p.unit}` },
            {
              header: '差異',
              cell: (p) => {
                const diff = (p.realQty ?? 0) - p.plannedQty;
                return (
                  <span className={diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-500'}>
                    {diff > 0 ? '+' : ''}
                    {formatNumber(diff)}
                  </span>
                );
              },
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function ProduceTab({ order }: { order: ManufOrder }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="待生產成品">
        <DataTable
          data={order.toProduceProducts}
          getRowId={(p) => String(p.id)}
          emptyMessage="無待生產資料"
          columns={[
            { header: '產品', cell: (p) => p.product },
            { header: '計畫量', cell: (p) => `${formatNumber(p.plannedQty)} ${p.unit}` },
          ]}
        />
      </SectionCard>
      <SectionCard title="已生產成品">
        <DataTable
          data={order.producedProducts}
          getRowId={(p) => String(p.id)}
          emptyMessage="尚無入庫紀錄"
          columns={[
            { header: '產品', cell: (p) => p.product },
            { header: '計畫量', cell: (p) => `${formatNumber(p.plannedQty)} ${p.unit}` },
            { header: '實際量', cell: (p) => `${formatNumber(p.realQty)} ${p.unit}` },
            {
              header: '達成率',
              cell: (p) => {
                const rate = p.realQty && p.plannedQty ? Math.round((p.realQty / p.plannedQty) * 100) : 0;
                return <span className="font-medium">{rate}%</span>;
              },
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function CostTab({ order }: { order: ManufOrder }) {
  return (
    <SectionCard title="成本表 (Cost Sheet)">
      <DataTable
        data={order.costSheets}
        getRowId={(c) => String(c.id)}
        emptyMessage="尚無成本計算紀錄"
        columns={[
          { header: '計算類型', cell: (c) => c.calculationType },
          { header: '成本價', cell: (c) => formatCurrency(c.costPrice) },
          { header: '計算日期', cell: (c) => formatDate(c.calculationDate) },
        ]}
      />
    </SectionCard>
  );
}
