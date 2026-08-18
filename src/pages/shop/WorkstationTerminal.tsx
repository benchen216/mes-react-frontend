import { useEffect, useMemo, useState } from 'react';
import { OPERATIONS, OPS_BY_ID } from '../../data/shopMock';
import { useShop } from '../../hooks/useShop';
import {
  enabledFieldsForOp,
  fixtureOutOfRange,
  fixtureValues,
  formatClock,
  validateProductionForm,
  validateQcForm,
} from '../../lib/shopMachine';
import { productionOpsBefore } from '../../lib/shopProcess';
import type { FieldValue, MessageKind, QcVerdict, QueueRow } from '../../types/shop';
import { DynamicFields } from './DynamicFields';

const SESSION_OP_KEY = 'mes.shop.op';

function loadOpId(): string {
  const raw = sessionStorage.getItem(SESSION_OP_KEY);
  if (raw && raw in OPS_BY_ID) return raw;
  return 'A_STAMP';
}

function statusTone(status: QueueRow['status']) {
  if (status === '可開始' || status === '可重做') return 'text-[#d4d4d4]';
  if (status === '進行中') return 'text-[#e67e22]';
  return 'text-[#8a8a8a]';
}

function parseQty(raw: string): number {
  const n = Number(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export function WorkstationTerminal() {
  const shop = useShop();
  const [opId, setOpId] = useState(loadOpId);
  const [lotId, setLotId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<null | 'complete' | QcVerdict>(null);
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [passQty, setPassQty] = useState('');
  const [reworkQty, setReworkQty] = useState('');
  const [scrapQty, setScrapQty] = useState('');
  const [defectCodes, setDefectCodes] = useState<string[]>([]);
  const [returnOpId, setReturnOpId] = useState('');
  const [scrapReason, setScrapReason] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const op = OPS_BY_ID[opId];
  const rows = useMemo(() => shop.queueFor(opId), [shop, opId, shop.state]);
  const resolvedLot = lotId ?? shop.defaultLot(opId);
  const card = useMemo(() => shop.cardForOp(opId, resolvedLot), [shop, opId, resolvedLot, shop.state]);
  const order = shop.state.orders.find((item) => item.lineId === op.lineId);
  const lot = order?.lots.find((item) => item.id === (card?.lotId ?? resolvedLot));
  const fields = enabledFieldsForOp(shop.state, opId);
  const message = shop.state.messages[opId];

  useEffect(() => {
    setLotId(shop.defaultLot(opId));
    setFormMode(null);
    setErrorFields([]);
    setFormMessage(null);
  }, [opId]);

  const switchOp = (next: string) => {
    setOpId(next);
    sessionStorage.setItem(SESSION_OP_KEY, next);
  };

  const openComplete = () => {
    if (!fields.length) {
      if (card) shop.complete(opId, card.lotId, {});
      return;
    }
    const seed: Record<string, FieldValue> = {};
    for (const field of fields) {
      seed[field.code] = field.type === 'number' && field.code.startsWith('qty') ? (lot?.qty ?? '') : '';
    }
    if (card) {
      for (const field of fields) {
        if (field.code.startsWith('qty')) seed[field.code] = card.qty;
      }
    }
    setValues(seed);
    setErrorFields([]);
    setFormMessage(null);
    setFormMode('complete');
  };

  const openQc = (verdict: QcVerdict) => {
    const qty = card?.qty ?? lot?.qty ?? 0;
    const seed = { ...fixtureValues(opId) };
    for (const field of fields) {
      if (seed[field.code] === undefined) seed[field.code] = field.type === 'photo' || field.type === 'multiselect' ? [] : '';
    }
    const out = fixtureOutOfRange(shop.state, opId, seed);
    setValues(seed);
    if (verdict === 'pass') {
      setPassQty(String(qty));
      setReworkQty('0');
      setScrapQty('0');
    } else if (verdict === 'fail') {
      setPassQty('0');
      setReworkQty(String(qty));
      setScrapQty('0');
    } else {
      setPassQty('');
      setReworkQty('');
      setScrapQty('');
    }
    setDefectCodes([]);
    setReturnOpId(productionOpsBefore(op)[0]?.id ?? '');
    setScrapReason('');
    setOverrideReason('');
    setErrorFields([]);
    setFormMessage(null);
    setFormMode(out && verdict === 'pass' ? 'fail' : verdict);
    if (out && verdict === 'pass') {
      setFormMode('fail');
      setPassQty('0');
      setReworkQty(String(qty));
    }
  };

  const submitComplete = () => {
    if (!card) return;
    const issue = validateProductionForm(shop.state, opId, values);
    if (issue) {
      setErrorFields(issue.fields);
      setFormMessage(issue.message);
      return;
    }
    shop.complete(opId, card.lotId, values);
    setFormMode(null);
  };

  const submitQc = () => {
    if (!card || formMode === 'complete' || !formMode) return;
    const payload = {
      values,
      verdict: formMode,
      passQty: parseQty(passQty),
      reworkQty: parseQty(reworkQty),
      scrapQty: parseQty(scrapQty),
      inspectedQty: card.qty,
      defectCodes,
      returnOpId: returnOpId || undefined,
      scrapReason: scrapReason || undefined,
      overrideReason: overrideReason || undefined,
    };
    const issue = validateQcForm(shop.state, opId, payload);
    if (issue) {
      setErrorFields(issue.fields);
      setFormMessage(issue.message);
      return;
    }
    shop.qcSubmit({
      opId,
      lotId: card.lotId,
      verdict: formMode,
      values,
      passQty: payload.passQty,
      reworkQty: payload.reworkQty,
      scrapQty: payload.scrapQty,
      defectCodes,
      returnOpId: payload.returnOpId,
      scrapReason: payload.scrapReason,
      overrideReason: payload.overrideReason,
    });
    setFormMode(null);
  };

  const qtyError = errorFields.includes('passQty') || errorFields.includes('reworkQty') || errorFields.includes('scrapQty');
  const showFailExtras = formMode === 'fail' || formMode === 'partial' || parseQty(reworkQty) > 0 || parseQty(scrapQty) > 0;
  const lines = {
    A: OPERATIONS.filter((item) => item.lineId === 'A'),
    B: OPERATIONS.filter((item) => item.lineId === 'B'),
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#161616] text-[#eaeaea]">
      <header className="border-b border-[#2a2a2a] px-5 py-4">
        <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">工位終端 · 本機站點</p>
        <h2 className="font-shop text-3xl font-extrabold tracking-tight">我在 {op.stationName}</h2>
        <p className="mt-1 font-shop-mono text-sm text-[#b5b5b5]">
          {op.role} / {op.operator} / 本關 {op.name}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-px bg-[#2a2a2a]">
          {(['A', 'B'] as const).map((lineId) => (
            <div key={lineId} className="grid grid-cols-5 gap-px bg-[#2a2a2a]">
              {lines[lineId].map((item) => {
                const active = item.id === opId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchOp(item.id)}
                    className={`px-2 py-3 text-left ${active ? 'bg-[#eaeaea] text-[#121212]' : 'bg-[#121212] text-[#b5b5b5] hover:bg-[#1c1c1c]'}`}
                  >
                    <span className="block font-shop-mono text-[10px] tracking-[0.12em]">
                      {lineId}-{item.index + 1}
                    </span>
                    <span className="mt-1 block font-shop text-sm font-bold leading-tight">{item.stationName}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <QueueBlock
          rows={rows}
          selectedLotId={card?.lotId ?? null}
          onSelect={(id) => {
            setLotId(id);
            setFormMode(null);
          }}
        />

        {card && order && (
          <article className="border-t border-[#2a2a2a] px-5 py-5">
            <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">工序卡</p>
            <h3 className="mt-1 font-shop text-2xl font-extrabold">
              {order.seq}
              {card.lotKind === 'rework' ? ' · 重工批' : ''}
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 font-shop-mono text-sm">
              <div>
                <dt className="text-[#8a8a8a]">產品</dt>
                <dd>{order.productName}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">數量</dt>
                <dd>
                  {card.qty.toLocaleString('zh-TW')} {card.unit}
                </dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">本關</dt>
                <dd>{card.opName}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">狀態</dt>
                <dd>{card.opStatusLabel}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">上一關</dt>
                <dd>{card.prevOp}</dd>
              </div>
              <div>
                <dt className="text-[#8a8a8a]">下一關</dt>
                <dd>{card.nextOp}</dd>
              </div>
              {card.operator && (
                <div>
                  <dt className="text-[#8a8a8a]">作業員</dt>
                  <dd>{card.operator}</dd>
                </div>
              )}
              {card.startedAt && (
                <div>
                  <dt className="text-[#8a8a8a]">開始時間</dt>
                  <dd>{formatClock(card.startedAt)}</dd>
                </div>
              )}
            </dl>

            {!formMode && (
              <div className="mt-6 space-y-3">
                {card.startVisible && (
                  <button
                    type="button"
                    disabled={card.gate === 'running'}
                    onClick={() => shop.start(opId, card.lotId)}
                    className="h-16 w-full bg-[#eaeaea] font-shop text-2xl font-extrabold text-[#121212] disabled:opacity-35 active:scale-[0.99]"
                  >
                    開始
                  </button>
                )}
                {op.kind === 'production' && (
                  <button
                    type="button"
                    disabled={!card.completeEnabled}
                    onClick={openComplete}
                    className="h-16 w-full border border-[#eaeaea] font-shop text-2xl font-extrabold disabled:opacity-35 active:scale-[0.99]"
                  >
                    完成
                  </button>
                )}
                {card.qcButtons && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => openQc('pass')}
                      className="h-16 bg-[#4af626] font-shop text-xl font-extrabold text-[#121212]"
                    >
                      合格
                    </button>
                    <button
                      type="button"
                      onClick={() => openQc('fail')}
                      className="h-16 border border-[#e61919] font-shop text-xl font-extrabold text-[#e61919]"
                    >
                      不合格
                    </button>
                    <button
                      type="button"
                      onClick={() => openQc('partial')}
                      className="h-16 border border-[#3a3a3a] font-shop text-lg font-extrabold"
                    >
                      部分不合格
                    </button>
                  </div>
                )}
              </div>
            )}

            {formMode && (
              <form
                className="mt-6 border border-[#2a2a2a] p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (formMode === 'complete') submitComplete();
                  else submitQc();
                }}
              >
                <p className="font-shop-mono text-[11px] tracking-[0.16em] text-[#8a8a8a]">
                  {formMode === 'complete' ? '完工回報' : formMode === 'pass' ? '判定 · 合格' : formMode === 'fail' ? '判定 · 不合格' : '判定 · 部分不合格'}
                </p>
                <div className="mt-4">
                  <DynamicFields
                    fields={fields}
                    values={values}
                    onChange={(code, value) => setValues((prev) => ({ ...prev, [code]: value }))}
                    errorFields={errorFields}
                    state={shop.state}
                  />
                </div>

                {formMode !== 'complete' && (
                  <div className="mt-5 grid gap-4">
                    <div className="grid grid-cols-3 gap-3">
                      <NumField label="合格數 *" value={passQty} error={qtyError} onChange={setPassQty} />
                      <NumField label="重工數 *" value={reworkQty} error={qtyError} onChange={setReworkQty} />
                      <NumField label="報廢數 *" value={scrapQty} error={qtyError} onChange={setScrapQty} />
                    </div>
                    {showFailExtras && (
                      <>
                        <CodePicker
                          label="不良代碼"
                          required={formMode !== 'pass'}
                          error={errorFields.includes('defectCodes')}
                          options={shop.state.defectCodes.filter((item) => item.enabled)}
                          values={defectCodes}
                          onChange={setDefectCodes}
                        />
                        {parseQty(reworkQty) > 0 && (
                          <label className="block">
                            <span className="mb-1.5 block font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">退回工序 *</span>
                            <select
                              value={returnOpId}
                              onChange={(e) => setReturnOpId(e.target.value)}
                              className={`h-12 w-full border bg-[#121212] px-3 font-shop-mono ${errorFields.includes('returnOpId') ? 'border-[#e61919]' : 'border-[#3a3a3a]'}`}
                            >
                              {productionOpsBefore(op).map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                        {parseQty(scrapQty) > 0 && (
                          <label className="block">
                            <span className="mb-1.5 block font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">報廢原因 *</span>
                            <select
                              value={scrapReason}
                              onChange={(e) => setScrapReason(e.target.value)}
                              className={`h-12 w-full border bg-[#121212] px-3 font-shop-mono ${errorFields.includes('scrapReason') ? 'border-[#e61919]' : 'border-[#3a3a3a]'}`}
                            >
                              <option value="">請選擇</option>
                              {shop.state.scrapReasons.filter((item) => item.enabled).map((item) => (
                                <option key={item.code} value={item.code}>
                                  {item.code} {item.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </>
                    )}
                    {errorFields.includes('overrideReason') || fixtureOutOfRange(shop.state, opId, values) ? (
                      <label className="block">
                        <span className="mb-1.5 block font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">覆寫理由</span>
                        <input
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          className={`h-12 w-full border bg-[#121212] px-3 font-shop-mono ${errorFields.includes('overrideReason') ? 'border-[#e61919]' : 'border-[#3a3a3a]'}`}
                        />
                      </label>
                    ) : null}
                  </div>
                )}

                {formMessage && <p className="mt-4 font-shop text-[#e61919]">{formMessage}</p>}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormMode(null)} className="h-14 border border-[#3a3a3a] font-shop text-lg">
                    取消
                  </button>
                  <button type="submit" className="h-14 bg-[#eaeaea] font-shop text-lg font-extrabold text-[#121212]">
                    送出
                  </button>
                </div>
              </form>
            )}
          </article>
        )}
      </div>

      <footer className="border-t border-[#2a2a2a] bg-[#121212] px-5 py-4">
        <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">系統回話</p>
        <p className={`mt-2 font-shop text-xl font-bold leading-snug ${messageColor(message?.kind ?? null)}`}>
          {message?.text ?? '等待操作。'}
        </p>
      </footer>
    </section>
  );
}

function messageColor(kind: MessageKind | null) {
  if (kind === 'error') return 'text-[#e61919]';
  if (kind === 'warn') return 'text-[#e67e22]';
  if (kind === 'ok') return 'text-[#eaeaea]';
  return 'text-[#b5b5b5]';
}

function NumField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        className={`h-12 w-full border bg-[#121212] px-3 font-shop-mono text-lg ${error ? 'border-[#e61919] text-[#e61919]' : 'border-[#3a3a3a]'}`}
      />
    </label>
  );
}

function CodePicker({
  label,
  required,
  error,
  options,
  values,
  onChange,
}: {
  label: string;
  required: boolean;
  error: boolean;
  options: { code: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <p className={`mb-1.5 font-shop-mono text-[11px] tracking-[0.14em] ${error ? 'text-[#e61919]' : 'text-[#8a8a8a]'}`}>
        {label}
        {required ? ' *' : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = values.includes(opt.code);
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onChange(on ? values.filter((item) => item !== opt.code) : [...values, opt.code])}
              className={`border px-3 py-2 font-shop-mono text-xs ${on ? 'border-[#eaeaea] bg-[#eaeaea] text-[#121212]' : error ? 'border-[#e61919]' : 'border-[#3a3a3a]'}`}
            >
              {opt.code} {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QueueBlock({
  rows,
  selectedLotId,
  onSelect,
}: {
  rows: QueueRow[];
  selectedLotId: string | null;
  onSelect: (lotId: string) => void;
}) {
  return (
    <div className="px-5 py-4">
      <p className="font-shop-mono text-[11px] tracking-[0.2em] text-[#8a8a8a]">待辦清單</p>
      {rows.length === 0 ? (
        <p className="mt-3 font-shop text-sm text-[#6e6e6e]">這一站現在沒有工單。</p>
      ) : (
        <ul className="mt-3">
          <li className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_0.8fr] gap-2 px-3 pb-2 font-shop-mono text-[10px] tracking-[0.12em] text-[#6e6e6e]">
            <span>工單</span>
            <span>產品</span>
            <span>本關</span>
            <span>數量</span>
            <span>狀態</span>
          </li>
          {rows.map((row) => (
            <li key={`${row.orderSeq}-${row.lotId}`}>
              <button
                type="button"
                onClick={() => onSelect(row.lotId)}
                className={`grid w-full grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_0.8fr] gap-2 border px-3 py-3 text-left font-shop-mono text-xs ${
                  selectedLotId === row.lotId ? 'border-[#eaeaea] bg-[#1c1c1c]' : 'border-[#2a2a2a]'
                } ${row.status === '還不能開始' ? 'text-[#8a8a8a]' : 'text-[#eaeaea]'}`}
              >
                <span>
                  {row.orderSeq}
                  {row.lotKind === 'rework' ? ' 重工' : ''}
                </span>
                <span>{row.product}</span>
                <span>{row.opName}</span>
                <span>{row.qty.toLocaleString('zh-TW')}</span>
                <span className={statusTone(row.status)}>{row.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
