import { useState } from 'react';
import { OPS_BY_ID } from '../../data/shopMock';
import { useShop } from '../../hooks/useShop';
import { formatSpan } from '../../lib/shopMachine';

function resultLabel(result: string) {
  if (result === 'passed') return '合格';
  if (result === 'failed') return '不合格';
  if (result === 'partial') return '部分不合格';
  return '完成';
}

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? `${value.length} 項` : '—';
  return String(value);
}

export function OrderRecords({ seq }: { seq: string }) {
  const { state } = useShop();
  const order = state.orders.find((item) => item.seq === seq);
  const records = order?.records ?? [];
  if (!order) return <p className="text-[#8a8a8a]">查無此工單。</p>;
  if (!records.length) return <p className="text-[#8a8a8a]">這張單還沒有工序紀錄。</p>;
  const laterCodes = state.fieldDefs.filter((field) => field.enabled);
  return (
    <table className="w-full min-w-[720px] border-collapse text-left font-shop-mono text-xs">
      <thead>
        <tr className="border-b border-[#2a2a2a] text-[#8a8a8a]">
          <th className="py-2 pr-3 font-medium">工序</th>
          <th className="py-2 pr-3 font-medium">次數</th>
          <th className="py-2 pr-3 font-medium">時段</th>
          <th className="py-2 pr-3 font-medium">人</th>
          <th className="py-2 pr-3 font-medium">結果</th>
          <th className="py-2 font-medium">紀錄</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => {
          const op = OPS_BY_ID[record.opId];
          const extra = [
            record.passQty !== undefined ? `合格 ${record.passQty}` : null,
            record.reworkQty ? `重工 ${record.reworkQty}` : null,
            record.scrapQty ? `報廢 ${record.scrapQty}` : null,
            record.defectCodes?.length ? record.defectCodes.join(',') : null,
            record.returnOpId ? `退回 ${OPS_BY_ID[record.returnOpId]?.name}` : null,
          ].filter(Boolean);
          return (
            <tr key={record.id} className="border-b border-[#2a2a2a] align-top">
              <td className="py-3 pr-3 font-shop text-sm font-bold">
                {op?.name}
                {record.lotKind === 'rework' ? ' · 重工批' : ''}
              </td>
              <td className="py-3 pr-3">第 {record.attempt} 次</td>
              <td className="py-3 pr-3">{formatSpan(record.startedAt, record.endedAt)}</td>
              <td className="py-3 pr-3">{record.operator}</td>
              <td className={`py-3 pr-3 ${record.result === 'failed' ? 'text-[#e61919]' : ''}`}>{resultLabel(record.result)}</td>
              <td className="py-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {record.fieldSnapshot.map((field) => (
                    <span key={field.code}>
                      {field.label} {valueText(record.values[field.code])}
                    </span>
                  ))}
                  {laterCodes
                    .filter((field) => field.opIds.includes(record.opId) && !record.fieldSnapshot.some((item) => item.code === field.code))
                    .map((field) => (
                      <span key={field.code} className="text-[#6e6e6e]">
                        {field.label} —
                      </span>
                    ))}
                  {extra.map((item) => (
                    <span key={String(item)}>{item}</span>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function TraceView() {
  const { state } = useShop();
  const [seq, setSeq] = useState(state.orders[0]?.seq ?? '');

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#121212] text-[#eaeaea]">
      <header className="border-b border-[#2a2a2a] px-5 py-4">
        <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">追溯</p>
        <h2 className="font-shop text-3xl font-extrabold tracking-tight">哪一批、哪副模具、哪個人、哪個時段</h2>
        <div className="mt-4 flex gap-3">
          <input
            value={seq}
            onChange={(e) => setSeq(e.target.value.trim())}
            placeholder="工單號"
            className="h-12 flex-1 border border-[#3a3a3a] bg-[#161616] px-3 font-shop-mono outline-none focus:border-[#eaeaea]"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-px bg-[#2a2a2a]">
          {state.orders.map((item) => (
            <button
              key={item.seq}
              type="button"
              onClick={() => setSeq(item.seq)}
              className={`px-3 py-2 font-shop-mono text-xs ${item.seq === seq ? 'bg-[#eaeaea] text-[#121212]' : 'bg-[#161616]'}`}
            >
              {item.seq}
            </button>
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
        <OrderRecords seq={seq} />
      </div>
    </section>
  );
}
