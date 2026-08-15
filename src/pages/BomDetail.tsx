import { ArrowLeft, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { BomStatusBadge } from '../components/StatusBadge';
import { InfoField, SectionCard } from '../components/ui';
import { billOfMaterials } from '../data/mockData';
import type { BillOfMaterial, BomStatus } from '../types';
import {
  BOM_STATUS_LABEL,
  canTransitionBom,
  formatCurrency,
  formatNumber,
} from '../utils/status';

const WORKFLOW: { target: BomStatus; label: string }[] = [
  { target: 2, label: '核可' },
  { target: 3, label: '設為適用' },
  { target: 4, label: '停用' },
];

export function BomDetail() {
  const { id } = useParams();
  const [boms, setBoms] = useState<BillOfMaterial[]>(billOfMaterials);
  const [pending, setPending] = useState<{ target: BomStatus } | null>(null);

  const bom = boms.find((b) => b.id === Number(id));

  if (!bom) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
        找不到此 BOM。<Link to="/bom" className="text-indigo-600 hover:underline">返回列表</Link>
      </div>
    );
  }

  const confirm = () => {
    if (pending) {
      setBoms((prev) =>
        prev.map((b) => (b.id === bom.id ? { ...b, statusSelect: pending.target } : b))
      );
    }
    setPending(null);
  };

  const availableActions = WORKFLOW.filter((w) => canTransitionBom(bom.statusSelect, w.target));

  return (
    <>
      <Link to="/bom" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> 返回物料清單列表
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{bom.name}</h2>
            <BomStatusBadge status={bom.statusSelect} />
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              v{bom.versionNumber}
            </span>
          </div>

          <SectionCard title="基本資料" className="mb-6">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
              <InfoField label="產品" value={bom.product} />
              <InfoField label="數量" value={`${formatNumber(bom.qty)} ${bom.unit}`} />
              <InfoField label="生產製程" value={bom.prodProcess} />
              <InfoField label="版本" value={`v${bom.versionNumber}`} />
              <InfoField label="成本價" value={formatCurrency(bom.costPrice)} />
              <InfoField label="狀態" value={<BomStatusBadge status={bom.statusSelect} />} />
            </dl>
          </SectionCard>

          <SectionCard title="組件明細 (BOM Lines)">
            <DataTable
              data={[...bom.lines].sort((a, b) => a.priority - b.priority)}
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
                { header: '組件產品', cell: (l) => <span className="font-medium text-gray-900">{l.product}</span> },
                { header: '數量', cell: (l) => `${formatNumber(l.qty)} ${l.unit}` },
                {
                  header: '報廢率',
                  cell: (l) => (l.wasteRate ? `${(l.wasteRate * 100).toFixed(0)}%` : '—'),
                },
                {
                  header: '子 BOM',
                  cell: (l) =>
                    l.subBomName ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        <GitBranch className="h-3 w-3" /> {l.subBomName}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    ),
                },
              ]}
            />
            {bom.lines.some((l) => l.subBomName) && (
              <p className="mt-3 text-xs text-gray-400">
                * 標示「子 BOM」之組件為半成品，點擊可查看其多層展開結構。
              </p>
            )}
          </SectionCard>
        </div>

        <div>
          <SectionCard title="狀態流轉">
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">目前狀態</div>
                <div className="mt-1 flex justify-center">
                  <BomStatusBadge status={bom.statusSelect} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {availableActions.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">此狀態無可執行的流轉操作</p>
                ) : (
                  availableActions.map((w) => (
                    <button
                      key={w.target}
                      onClick={() => setPending({ target: w.target })}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      {w.label}
                    </button>
                  ))
                )}
              </div>
              <ol className="space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
                <li className={bom.statusSelect >= 1 ? 'text-gray-700' : ''}>1. 草稿 — 建立 BOM 內容</li>
                <li className={bom.statusSelect >= 2 ? 'text-gray-700' : ''}>2. 已核可 — 審核通過</li>
                <li className={bom.statusSelect >= 3 ? 'text-gray-700' : ''}>3. 適用中 — 可建立工單</li>
                <li className={bom.statusSelect >= 4 ? 'text-gray-700' : ''}>4. 已停用 — 不再使用</li>
              </ol>
            </div>
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        title="BOM 狀態流轉"
        message={
          pending ? (
            <>
              確定要將 BOM「<span className="font-semibold">{bom.name}</span>」狀態變更為
              「<span className="font-semibold text-indigo-600">{BOM_STATUS_LABEL[pending.target]}</span>」嗎？
            </>
          ) : (
            ''
          )
        }
        confirmLabel={pending ? BOM_STATUS_LABEL[pending.target] : '確定'}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
