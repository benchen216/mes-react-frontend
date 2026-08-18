import { useState } from 'react';
import { OPS_BY_ID } from '../../data/shopMock';
import { useShop } from '../../hooks/useShop';
import { formatClock } from '../../lib/shopMachine';
import { OrderRecords } from './TraceView';

export function ScrapReview() {
  const { state, approveScrap, rejectScrap } = useShop();
  const [activeId, setActiveId] = useState<string | null>(state.scrapReviews[0]?.id ?? null);
  const [reason, setReason] = useState('');
  const review = state.scrapReviews.find((item) => item.id === activeId) ?? state.scrapReviews.find((item) => item.status === 'pending') ?? null;

  return (
    <section className="grid h-full min-h-0 grid-cols-1 bg-[#121212] text-[#eaeaea] xl:grid-cols-[320px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-b border-[#2a2a2a] xl:border-b-0 xl:border-r">
        <header className="border-b border-[#2a2a2a] px-4 py-4">
          <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">報廢待審</p>
          <h2 className="font-shop text-2xl font-extrabold">線長審核</h2>
        </header>
        {state.scrapReviews.length === 0 && <p className="px-4 py-6 text-sm text-[#8a8a8a]">目前沒有審核單。</p>}
        <ul>
          {state.scrapReviews.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                  setReason('');
                }}
                className={`w-full border-b border-[#2a2a2a] px-4 py-3 text-left ${item.id === review?.id ? 'bg-[#1c1c1c]' : ''}`}
              >
                <p className="font-shop font-bold">{item.orderSeq}</p>
                <p className="mt-1 font-shop-mono text-[11px] text-[#8a8a8a]">
                  {OPS_BY_ID[item.opId]?.name} · 報廢 {item.scrapQty.toLocaleString('zh-TW')} · {item.status === 'pending' ? '待審' : item.status === 'approved' ? '已核准' : '已駁回'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-h-0 overflow-y-auto">
        {!review && <p className="px-5 py-8 text-[#8a8a8a]">選一筆待審單。</p>}
        {review && (
          <div className="px-5 py-5">
            <p className="font-shop-mono text-[11px] tracking-[0.16em] text-[#8a8a8a]">審核詳情</p>
            <h3 className="mt-1 font-shop text-3xl font-extrabold">{review.orderSeq}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 font-shop-mono text-sm">
              <div>
                <dt className="text-[#8a8a8a]">暫停工序</dt>
                <dd>{OPS_BY_ID[review.opId]?.name}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">報廢數</dt>
                <dd>{review.scrapQty.toLocaleString('zh-TW')}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">允收上限</dt>
                <dd>{review.thresholdPct}%</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">不良代碼</dt>
                <dd>{review.defectCodes.join(', ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">報廢原因</dt>
                <dd>{review.scrapReason || '—'}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">送出</dt>
                <dd>{formatClock(review.createdAt)}</dd>
              </div>
            </dl>
            {review.status === 'pending' && (
              <div className="mt-6 grid gap-3">
                <button type="button" onClick={() => approveScrap(review.id)} className="h-14 bg-[#eaeaea] font-shop text-xl font-extrabold text-[#121212]">
                  核准
                </button>
                <label className="block">
                  <span className="mb-1.5 block font-shop-mono text-[11px] text-[#8a8a8a]">駁回理由</span>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-12 w-full border border-[#3a3a3a] bg-[#161616] px-3 font-shop-mono"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => rejectScrap(review.id, reason)}
                  className="h-14 border border-[#e61919] font-shop text-xl font-extrabold text-[#e61919]"
                >
                  駁回
                </button>
              </div>
            )}
            {review.status !== 'pending' && (
              <p className="mt-6 border border-[#2a2a2a] px-4 py-3">
                {review.status === 'approved' ? '已核准結案。' : `已駁回。${review.rejectReason ?? ''}`}
              </p>
            )}
            <div className="mt-8 border-t border-[#2a2a2a] pt-4">
              <p className="mb-3 font-shop-mono text-[11px] tracking-[0.16em] text-[#8a8a8a]">這張單的追溯</p>
              <OrderRecords seq={review.orderSeq} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
