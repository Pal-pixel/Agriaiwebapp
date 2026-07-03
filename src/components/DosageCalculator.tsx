/**
 * DosageCalculator.tsx — turns a per-litre / per-acre dosage string into the
 * exact amount of product a farmer must measure out for their own sprayer or
 * field. Runs fully offline (no AI tokens).
 */
import { useMemo, useState } from 'react';

import { mixForArea, mixForPlants, mixForTank, parseDoseRate, type MixResult } from '../lib/agro';
import { useLang } from '../lib/i18n';

export default function DosageCalculator({ dosage }: { dosage: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [tank, setTank] = useState('15');
  const [tanks, setTanks] = useState('1');
  const [area, setArea] = useState('1');
  const [plants, setPlants] = useState('100');

  const rate = useMemo(() => parseDoseRate(dosage), [dosage]);

  if (!rate) return null; // dosage wasn't machine-readable — skip the widget

  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  let result: MixResult | null = null;
  if (rate.basis === 'litre') {
    const tk = num(tank);
    if (tk) result = mixForTank(rate, tk, Math.max(1, num(tanks) || 1));
  } else if (rate.basis === 'acre' || rate.basis === 'hectare') {
    const a = num(area);
    if (a) result = mixForArea(rate, a);
  } else if (rate.basis === 'plant') {
    const p = num(plants);
    if (p) result = mixForPlants(rate, p);
  }

  const areaUnitLabel = rate.basis === 'hectare' ? t('calc.hectares') : t('calc.acres');

  return (
    <div className="calc-box">
      <button type="button" className="calc-toggle" onClick={() => setOpen((o) => !o)}>
        <span>🧮 {t('calc.title')}</span>
        <span className="calc-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="calc-body">
          {rate.basis === 'litre' && (
            <div className="calc-fields">
              <label className="calc-field">
                <span className="calc-label">{t('calc.tankSize')}</span>
                <input
                  className="calc-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={tank}
                  onChange={(e) => setTank(e.target.value)}
                />
              </label>
              <label className="calc-field">
                <span className="calc-label">{t('calc.numTanks')}</span>
                <input
                  className="calc-input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={tanks}
                  onChange={(e) => setTanks(e.target.value)}
                />
              </label>
            </div>
          )}

          {(rate.basis === 'acre' || rate.basis === 'hectare') && (
            <label className="calc-field">
              <span className="calc-label">
                {t('calc.area')} ({areaUnitLabel})
              </span>
              <input
                className="calc-input"
                type="number"
                inputMode="decimal"
                min="0"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </label>
          )}

          {rate.basis === 'plant' && (
            <label className="calc-field">
              <span className="calc-label">{t('calc.plants')}</span>
              <input
                className="calc-input"
                type="number"
                inputMode="numeric"
                min="0"
                value={plants}
                onChange={(e) => setPlants(e.target.value)}
              />
            </label>
          )}

          {result && (
            <div className="calc-result">
              <span className="calc-result-label">{t('calc.youNeed')}</span>
              <span className="calc-result-value">{result.product}</span>
              {result.detail && <span className="calc-result-detail">{result.detail}</span>}
            </div>
          )}
          <p className="calc-rate-note">
            {t('calc.basedOn')}: {dosage}
          </p>
        </div>
      )}
    </div>
  );
}
