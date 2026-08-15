import { CheckCircle2, Clock, PauseCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { MoStatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { KpiCard, PageHeader, SectionCard } from '../components/ui';
import { useManufOrders } from '../hooks/useManufOrders';
import { formatDate, formatNumber } from '../utils/status';

export function Dashboard() {
  const { orders } = useManufOrders();

  const planned = orders.filter((o) => o.statusSelect === 3).length;
  const inProgress = orders.filter((o) => o.statusSelect === 4).length;
  const standby = orders.filter((o) => o.statusSelect === 5).length;
  const finishedThisMonth = orders.filter(
    (o) => o.statusSelect === 6 && o.realEndDateT?.startsWith('2026')
  ).length;

  const recent = [...orders].reverse().slice(0, 5);

  return (
    <>
      <PageHeader title="儀表板" subtitle="生產概況與即時工單進度總覽" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="待開工工單數" value={formatNumber(planned)} icon={<Clock className="h-5 w-5" />} accent="blue" />
        <KpiCard label="進行中工單數" value={formatNumber(inProgress)} icon={<PlayCircle className="h-5 w-5" />} accent="green" />
        <KpiCard label="暫停工單數" value={formatNumber(standby)} icon={<PauseCircle className="h-5 w-5" />} accent="yellow" />
        <KpiCard label="本月完工數" value={formatNumber(finishedThisMonth)} icon={<CheckCircle2 className="h-5 w-5" />} accent="purple" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <SectionCard
          title="最近工單"
          action={
            <Link to="/manuf-orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              查看全部 →
            </Link>
          }
        >
          <DataTable
            data={recent}
            getRowId={(o) => String(o.id)}
            columns={[
              {
                header: '工單序號',
                cell: (o) => (
                  <Link to={`/manuf-orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">
                    {o.manufOrderSeq}
                  </Link>
                ),
              },
              { header: '產品', cell: (o) => o.product },
              { header: '數量', cell: (o) => `${formatNumber(o.qty)} ${o.unit}` },
              { header: '優先級', cell: (o) => <PriorityBadge priority={o.prioritySelect} /> },
              { header: '計畫開始', cell: (o) => formatDate(o.plannedStartDateT) },
              { header: '狀態', cell: (o) => <MoStatusBadge status={o.statusSelect} /> },
            ]}
          />
        </SectionCard>
      </div>
    </>
  );
}
