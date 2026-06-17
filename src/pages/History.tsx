import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LanguageSelect, useLang } from '../lib/i18n';
import { clearHistory, getHistory, type HistoryEntry } from '../lib/storage';
import './History.css';

function severityClass(text: string): string {
  return text.includes('Severe') ? 'sev-high' : text.includes('Healthy') ? 'sev-ok' : 'sev-mid';
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function History() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory());

  const onClear = () => {
    clearHistory();
    setEntries([]);
  };

  const open = (e: HistoryEntry) => {
    // Re-opens the report; the detail cache makes this load instantly + free.
    navigate('/results', { state: { rawResult: e.rawResult } });
  };

  return (
    <div className="screen history">
      <div className="top-bar">
        <button type="button" className="back-btn" onClick={() => navigate('/')}>
          ← {t('hist.back')}
        </button>
        <p className="top-bar-title">{t('hist.title')}</p>
        <div className="top-bar-actions">
          <LanguageSelect />
          {entries.length > 0 && (
            <button type="button" className="clear-btn" onClick={onClear}>
              🗑 {t('hist.clear')}
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">🗂️</span>
          <p className="history-empty-text">{t('hist.empty')}</p>
        </div>
      ) : (
        <div className="history-list">
          {entries.map((e) => (
            <button key={e.id} type="button" className="history-card" onClick={() => open(e)}>
              <div className="history-card-main">
                <p className="history-disease">{e.disease.replace(/_/g, ' ')}</p>
                <p className="history-crop">
                  {t('res.crop')}: {e.crop} · {formatDate(e.date)}
                </p>
                <div className="history-meta">
                  <span className={`badge ${severityClass(e.severity)}`}>{e.severity}</span>
                  <span className="history-stat">{t('res.confidence')}: {e.confidence}</span>
                  <span className="history-stat">{t('res.healthScore')}: {e.healthScore}</span>
                </div>
              </div>
              <span className="history-open">{t('hist.open')} →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
