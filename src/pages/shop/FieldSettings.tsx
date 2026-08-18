import { useState, type ReactNode } from 'react';
import { OPERATIONS } from '../../data/shopMock';
import { useShop } from '../../hooks/useShop';
import { nowIso } from '../../lib/shopMachine';
import type { FieldType } from '../../types/shop';

const TYPES: FieldType[] = ['number', 'text', 'select', 'multiselect', 'boolean', 'date', 'photo'];

export function FieldSettings() {
  const shop = useShop();
  const [code, setCode] = useState('argon_flow');
  const [label, setLabel] = useState('氬氣流量 (L/min)');
  const [type, setType] = useState<FieldType>('number');
  const [required, setRequired] = useState(true);
  const [opIds, setOpIds] = useState<string[]>(['A_WELD']);
  const [min, setMin] = useState('12');
  const [max, setMax] = useState('20');
  const [optionsText, setOptionsText] = useState('');
  const [invCode, setInvCode] = useState('FR-27-BZ-A');
  const [invQty, setInvQty] = useState(String(shop.state.inventory['FR-27-BZ-A'] ?? 0));
  const [defCode, setDefCode] = useState('');
  const [defLabel, setDefLabel] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  const toggleOp = (id: string) => {
    setOpIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const saveField = () => {
    if (!code.trim() || !label.trim() || !opIds.length) {
      setSaved('欄位代碼、顯示名稱、適用工序都要填。');
      return;
    }
    if (shop.state.fieldDefs.some((field) => field.code === code.trim())) {
      setSaved('欄位代碼已存在，建立後不可改。');
      return;
    }
    shop.addField({
      code: code.trim(),
      label: label.trim(),
      type,
      required,
      opIds,
      enabled: true,
      min: min === '' ? undefined : Number(min),
      max: max === '' ? undefined : Number(max),
      options: optionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ value: line, label: line })),
      createdAt: nowIso(),
    });
    setSaved('已儲存。下一張該站完工表單會出現此欄。');
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#121212] text-[#eaeaea]">
      <header className="border-b border-[#2a2a2a] px-5 py-4">
        <p className="font-shop-mono text-[11px] tracking-[0.22em] text-[#8a8a8a] uppercase">系統設定 / 記錄欄位</p>
        <h2 className="font-shop text-3xl font-extrabold tracking-tight">廠內流程管理員</h2>
        <p className="mt-2 max-w-3xl text-sm text-[#8a8a8a]">新增欄位寫入製程定義，不停機。設定前已完成的紀錄該欄顯示為 —。</p>
      </header>

      <div className="grid gap-px bg-[#2a2a2a] xl:grid-cols-2">
        <div className="bg-[#121212] p-5">
          <h3 className="font-shop text-xl font-extrabold">新增欄位</h3>
          <div className="mt-4 grid gap-4">
            <Field label="欄位代碼">
              <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
            </Field>
            <Field label="顯示名稱">
              <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} />
            </Field>
            <Field label="資料型別">
              <select value={type} onChange={(e) => setType(e.target.value as FieldType)} className={inputClass}>
                {TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 font-shop-mono text-sm">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              必填
            </label>
            <div>
              <p className="mb-2 font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">適用工序</p>
              <div className="flex flex-wrap gap-2">
                {OPERATIONS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => toggleOp(op.id)}
                    className={`border px-2 py-1 font-shop-mono text-[11px] ${opIds.includes(op.id) ? 'border-[#eaeaea] bg-[#eaeaea] text-[#121212]' : 'border-[#3a3a3a]'}`}
                  >
                    {op.name}
                  </button>
                ))}
              </div>
            </div>
            {type === 'number' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="下限">
                  <input value={min} onChange={(e) => setMin(e.target.value)} className={inputClass} />
                </Field>
                <Field label="上限">
                  <input value={max} onChange={(e) => setMax(e.target.value)} className={inputClass} />
                </Field>
              </div>
            )}
            {(type === 'select' || type === 'multiselect') && (
              <Field label="選項（一行一個）">
                <textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} className={`${inputClass} h-24 py-2`} />
              </Field>
            )}
            <button type="button" onClick={saveField} className="h-14 bg-[#eaeaea] font-shop text-lg font-extrabold text-[#121212]">
              儲存
            </button>
            {saved && <p className="text-[#d4d4d4]">{saved}</p>}
          </div>
        </div>

        <div className="bg-[#121212] p-5">
          <h3 className="font-shop text-xl font-extrabold">已設定欄位</h3>
          <ul className="mt-4 divide-y divide-[#2a2a2a] font-shop-mono text-sm">
            {shop.state.fieldDefs.map((field) => (
              <li key={field.code} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-shop font-bold">{field.label}</p>
                  <p className="text-[11px] text-[#8a8a8a]">
                    {field.code} · {field.type} · {field.opIds.map((id) => OPERATIONS.find((op) => op.id === id)?.name).join(' / ')}
                    {field.enabled ? '' : ' · 已停用'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => shop.updateField(field.code, { enabled: !field.enabled })}
                  className="border border-[#3a3a3a] px-3 py-1 text-[11px]"
                >
                  {field.enabled ? '停用' : '啟用'}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 font-shop text-xl font-extrabold">庫存 / 代碼</h3>
          <div className="mt-4 grid gap-4">
            <Field label="料件可用量">
              <div className="flex gap-2">
                <select value={invCode} onChange={(e) => setInvCode(e.target.value)} className={inputClass}>
                  {Object.keys(shop.state.inventory).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input value={invQty} onChange={(e) => setInvQty(e.target.value)} className={inputClass} />
                <button
                  type="button"
                  onClick={() => shop.setInventory(invCode, Number(invQty))}
                  className="border border-[#3a3a3a] px-4 font-shop-mono text-xs"
                >
                  套用
                </button>
              </div>
            </Field>
            <Field label="新增不良代碼">
              <div className="flex gap-2">
                <input value={defCode} onChange={(e) => setDefCode(e.target.value)} placeholder="代碼" className={inputClass} />
                <input value={defLabel} onChange={(e) => setDefLabel(e.target.value)} placeholder="名稱" className={inputClass} />
                <button
                  type="button"
                  onClick={() => {
                    if (!defCode.trim()) return;
                    shop.addCode('defect', { code: defCode.trim(), label: defLabel.trim() || defCode.trim(), enabled: true });
                    setDefCode('');
                    setDefLabel('');
                  }}
                  className="border border-[#3a3a3a] px-4 font-shop-mono text-xs"
                >
                  新增
                </button>
              </div>
            </Field>
            <p className="text-[11px] text-[#8a8a8a]">
              不良代碼 {shop.state.defectCodes.map((item) => item.code).join(', ')} · 報廢原因 {shop.state.scrapReasons.map((item) => item.code).join(', ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const inputClass = 'h-12 w-full border border-[#3a3a3a] bg-[#161616] px-3 font-shop-mono outline-none focus:border-[#eaeaea]';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">{label}</span>
      {children}
    </label>
  );
}
