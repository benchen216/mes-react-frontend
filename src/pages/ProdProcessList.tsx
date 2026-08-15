import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { BomStatusBadge } from '../components/StatusBadge';
import { PageHeader } from '../components/ui';
import { prodProcesses } from '../data/mockData';

export function ProdProcessList() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="生產製程" subtitle={`共 ${prodProcesses.length} 套製程`} />
      <DataTable
        data={prodProcesses}
        getRowId={(p) => String(p.id)}
        onRowClick={(p) => navigate(`/prod-process/${p.id}`)}
        columns={[
          { header: '名稱', cell: (p) => <span className="font-medium text-indigo-600">{p.name}</span> },
          { header: '代碼', cell: (p) => <span className="font-mono text-xs text-gray-500">{p.code}</span> },
          { header: '產品', cell: (p) => p.product },
          { header: '投產量', cell: (p) => p.launchQty },
          { header: '委外', cell: (p) => (p.outsourcing ? <span className="text-orange-600">是</span> : <span className="text-gray-400">否</span>) },
          { header: '狀態', cell: (p) => <BomStatusBadge status={p.statusSelect} /> },
        ]}
      />
    </>
  );
}
