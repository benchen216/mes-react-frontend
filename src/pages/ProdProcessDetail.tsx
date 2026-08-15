import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { BomStatusBadge } from '../components/StatusBadge';
import { InfoField, SectionCard } from '../components/ui';
import { prodProcesses } from '../data/mockData';
import { formatNumber } from '../utils/status';

export function ProdProcessDetail() {
  const { id } = useParams();
  const pp = prodProcesses.find((p) => p.id === Number(id));

  if (!pp) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
        找不到此製程。<Link to="/prod-process" className="text-indigo-600 hover:underline">返回列表</Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/prod-process" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> 返回生產製程列表
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">{pp.name}</h2>
        <BomStatusBadge status={pp.statusSelect} />
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-xs font-medium text-gray-600">
          {pp.code}
        </span>
      </div>

      <SectionCard title="製程基本資料" className="mb-6">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
          <InfoField label="製程名稱" value={pp.name} />
          <InfoField label="製程代碼" value={pp.code} />
          <InfoField label="產品" value={pp.product} />
          <InfoField label="投產量" value={formatNumber(pp.launchQty)} />
          <InfoField label="工序連續性" value={pp.operationContinuity ? '是（連續生產）' : '否'} />
          <InfoField label="依工序消耗" value={pp.isConsProOnOperation ? '是' : '否'} />
          <InfoField label="允許委外" value={pp.outsourcing ? <span className="text-orange-600">是</span> : '否'} />
          <InfoField label="狀態" value={<BomStatusBadge status={pp.statusSelect} />} />
        </dl>
      </SectionCard>

      <SectionCard title="製程階段 (工序定義)">
        <DataTable
          data={[...pp.lines].sort((a, b) => a.priority - b.priority)}
          getRowId={(l) => String(l.id)}
          columns={[
            {
              header: '優先順序',
              cell: (l) => (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                  {l.priority}
                </span>
              ),
            },
            { header: '工序名稱', cell: (l) => <span className="font-medium text-gray-900">{l.name}</span> },
            { header: '工作中心', cell: (l) => l.workCenter },
            { header: '類型', cell: (l) => <span className="text-gray-500">{l.workCenterType}</span> },
            { header: '每循環時間', cell: (l) => `${formatNumber(l.durationPerCycle)} 分鐘` },
            { header: '人工時間', cell: (l) => `${formatNumber(l.humanDuration)} 分鐘` },
            {
              header: '產能',
              cell: (l) => `${l.minCapacity} ~ ${l.maxCapacity}`,
            },
            { header: '委外', cell: (l) => (l.outsourcing ? <span className="text-orange-600">是</span> : <span className="text-gray-400">否</span>) },
          ]}
        />
      </SectionCard>
    </>
  );
}
