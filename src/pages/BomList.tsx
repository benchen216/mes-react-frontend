import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { BomStatusBadge } from '../components/StatusBadge';
import { PageHeader } from '../components/ui';
import { billOfMaterials } from '../data/mockData';
import { formatNumber } from '../utils/status';

export function BomList() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="物料清單" subtitle={`共 ${billOfMaterials.length} 筆 BOM`} />
      <DataTable
        data={billOfMaterials}
        getRowId={(b) => String(b.id)}
        onRowClick={(b) => navigate(`/bom/${b.id}`)}
        columns={[
          { header: '名稱', cell: (b) => <span className="font-medium text-indigo-600">{b.name}</span> },
          { header: '產品', cell: (b) => b.product },
          { header: '數量', cell: (b) => `${formatNumber(b.qty)} ${b.unit}` },
          { header: '製程', cell: (b) => <span className="text-gray-500">{b.prodProcess}</span> },
          { header: '版本', cell: (b) => `v${b.versionNumber}` },
          { header: '成本價', cell: (b) => (b.costPrice ? `NT$ ${formatNumber(b.costPrice)}` : '—') },
          { header: '狀態', cell: (b) => <BomStatusBadge status={b.statusSelect} /> },
        ]}
      />
    </>
  );
}
