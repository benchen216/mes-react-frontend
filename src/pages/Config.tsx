import { Cog, Cpu } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/ui';
import { machines, workCenters } from '../data/mockData';
import { formatNumber } from '../utils/status';

const MACHINE_STATUS_STYLE: Record<string, string> = {
  運轉中: 'bg-green-100 text-green-700',
  停機: 'bg-yellow-100 text-yellow-800',
  維修中: 'bg-red-100 text-red-700',
};

export function Config() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'machines' ? 'machines' : 'workcenters';

  const setTab = (t: 'workcenters' | 'machines') => {
    setParams({ tab: t });
  };

  return (
    <>
      <PageHeader title="系統設定" subtitle="管理工作中心與機台主檔" />

      <div className="mb-4 inline-flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        <button
          onClick={() => setTab('workcenters')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'workcenters' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Cog className="h-4 w-4" /> 工作中心
        </button>
        <button
          onClick={() => setTab('machines')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'machines' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Cpu className="h-4 w-4" /> 機台
        </button>
      </div>

      {tab === 'workcenters' ? (
        <DataTable
          data={workCenters}
          getRowId={(w) => String(w.id)}
          columns={[
            { header: '名稱', cell: (w) => <span className="font-medium text-gray-900">{w.name}</span> },
            { header: '代碼', cell: (w) => <span className="font-mono text-xs text-gray-500">{w.code}</span> },
            { header: '類型', cell: (w) => w.type },
            { header: '機台', cell: (w) => w.machine ?? '—' },
            { header: '成本類型', cell: (w) => w.costType },
            {
              header: '成本金額',
              cell: (w) => (w.costType === '每小時' ? `NT$ ${formatNumber(w.costAmount)} / hr` : `NT$ ${formatNumber(w.costAmount)}`),
            },
          ]}
        />
      ) : (
        <DataTable
          data={machines}
          getRowId={(m) => String(m.id)}
          columns={[
            { header: '名稱', cell: (m) => <span className="font-medium text-gray-900">{m.name}</span> },
            { header: '代碼', cell: (m) => <span className="font-mono text-xs text-gray-500">{m.code}</span> },
            { header: '序號', cell: (m) => <span className="text-gray-500">{m.serialNumber}</span> },
            { header: '類型', cell: (m) => m.machineType },
            {
              header: '狀態',
              cell: (m) => (
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${MACHINE_STATUS_STYLE[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {m.status}
                </span>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
