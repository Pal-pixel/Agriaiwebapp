/**
 * SprayScheduler.tsx — turns a "frequency" string into concrete spray dates a
 * farmer can follow, and exports the whole plan to their phone calendar as an
 * .ics file with reminders. Runs fully offline (no AI tokens).
 */
import { useMemo, useState } from 'react';

import { buildSprayIcs, downloadIcs, parseIntervalDays, sprayDates } from '../lib/agro';
import { useLang } from '../lib/i18n';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SprayScheduler({
  pesticide,
  frequency,
  crop,
}: {
  pesticide: string;
  frequency: string;
  crop: string;
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(todayIso());
  const [count, setCount] = useState('3');

  const interval = useMemo(() => parseIntervalDays(frequency), [frequency]);
  const n = Math.min(12, Math.max(1, parseInt(count, 10) || 1));

  const dates = useMemo(() => {
    const startDate = new Date(`${start}T00:00:00`);
    if (Number.isNaN(startDate.getTime())) return [];
    return sprayDates(startDate, interval, n);
  }, [start, interval, n]);

  const fmt = (d: Date) =>
    d.toLocaleDateString(lang === 'en' ? 'en-IN' : `${lang}-IN`, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const onDownload = () => {
    const title = `${pesticide} — ${crop}`;
    const note = `${t('sched.note')} (${frequency})`;
    downloadIcs(`spray-schedule-${pesticide.replace(/\s+/g, '-').toLowerCase()}.ics`, buildSprayIcs(title, dates, note));
  };

  return (
    <div className="sched-box">
      <button type="button" className="sched-toggle" onClick={() => setOpen((o) => !o)}>
        <span>🗓️ {t('sched.title')}</span>
        <span className="sched-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="sched-body">
          <p className="sched-interval">
            ⏲️ {t('sched.every')} {interval} {t('sched.days')}
          </p>
          <div className="sched-fields">
            <label className="calc-field">
              <span className="calc-label">{t('sched.startDate')}</span>
              <input className="calc-input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="calc-field">
              <span className="calc-label">{t('sched.applications')}</span>
              <input
                className="calc-input"
                type="number"
                inputMode="numeric"
                min="1"
                max="12"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </label>
          </div>

          {dates.length > 0 && (
            <ol className="sched-list">
              {dates.map((d, i) => (
                <li key={i} className="sched-item">
                  <span className="sched-num">{i + 1}</span>
                  <span className="sched-date">{fmt(d)}</span>
                </li>
              ))}
            </ol>
          )}

          <button type="button" className="sched-download" onClick={onDownload} disabled={dates.length === 0}>
            📅 {t('sched.addToCalendar')}
          </button>
        </div>
      )}
    </div>
  );
}
