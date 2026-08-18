import { useMemo } from 'react';
import { frameLotOptions } from '../../lib/shopMachine';
import type { FieldDef, FieldValue, ShopState } from '../../types/shop';

function inputClass(error: boolean) {
  return `h-12 w-full border bg-[#121212] px-3 font-shop-mono text-base outline-none ${
    error ? 'border-[#e61919] text-[#e61919]' : 'border-[#3a3a3a] focus:border-[#eaeaea]'
  }`;
}

export function DynamicFields({
  fields,
  values,
  onChange,
  errorFields,
  state,
}: {
  fields: FieldDef[];
  values: Record<string, FieldValue>;
  onChange: (code: string, value: FieldValue) => void;
  errorFields: string[];
  state: ShopState;
}) {
  const frameLots = useMemo(() => frameLotOptions(state), [state]);

  return (
    <div className="grid gap-4">
      {fields.map((field) => {
        const error = errorFields.includes(field.code);
        const options = field.optionsSource === 'frameLots' ? frameLots : field.options ?? [];
        return (
          <label key={field.code} className="block">
            <span className="mb-1.5 flex items-baseline justify-between font-shop-mono text-[11px] tracking-[0.14em] text-[#8a8a8a]">
              <span>
                {field.label}
                {field.required || field.requiredWhen ? ' *' : ''}
                {field.source === 'fixture' ? ' · 治具帶入' : ''}
              </span>
              {field.min !== undefined || field.max !== undefined ? (
                <span>
                  {field.min ?? '—'} ~ {field.max ?? '—'}
                </span>
              ) : null}
            </span>
            {field.type === 'select' && (
              <select
                value={String(values[field.code] ?? '')}
                onChange={(e) => onChange(field.code, e.target.value)}
                className={inputClass(error)}
              >
                <option value="">請選擇</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'text' && (
              <input
                value={String(values[field.code] ?? '')}
                onChange={(e) => onChange(field.code, e.target.value)}
                className={inputClass(error)}
              />
            )}
            {field.type === 'number' && (
              <input
                inputMode="decimal"
                value={values[field.code] === null || values[field.code] === undefined ? '' : String(values[field.code])}
                onChange={(e) => onChange(field.code, e.target.value)}
                className={inputClass(error)}
              />
            )}
            {field.type === 'boolean' && (
              <input
                type="checkbox"
                checked={Boolean(values[field.code])}
                onChange={(e) => onChange(field.code, e.target.checked)}
                className="h-5 w-5 accent-[#eaeaea]"
              />
            )}
            {field.type === 'date' && (
              <input
                type="date"
                value={String(values[field.code] ?? '')}
                onChange={(e) => onChange(field.code, e.target.value)}
                className={inputClass(error)}
              />
            )}
            {field.type === 'photo' && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (!files.length) {
                    onChange(field.code, []);
                    return;
                  }
                  Promise.all(
                    files.map(
                      (file) =>
                        new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(String(reader.result));
                          reader.readAsDataURL(file);
                        }),
                    ),
                  ).then((urls) => onChange(field.code, urls));
                }}
                className="font-shop-mono text-xs text-[#b5b5b5]"
              />
            )}
            {field.type === 'multiselect' && (
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                  const selected = Array.isArray(values[field.code]) && (values[field.code] as string[]).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(values[field.code]) ? [...(values[field.code] as string[])] : [];
                        onChange(field.code, selected ? current.filter((item) => item !== opt.value) : [...current, opt.value]);
                      }}
                      className={`border px-3 py-2 font-shop-mono text-xs ${selected ? 'border-[#eaeaea] bg-[#eaeaea] text-[#121212]' : 'border-[#3a3a3a]'}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
            {Array.isArray(values[field.code]) && field.type === 'photo' && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {(values[field.code] as string[]).map((src) => (
                  <img key={src.slice(0, 24)} src={src} alt="" className="h-16 w-16 object-cover" />
                ))}
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
}
