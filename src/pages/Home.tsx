import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { analyzeLeafImage } from '../lib/predict';
import { LanguageSelect, useLang } from '../lib/i18n';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const METRICS = [
    { val: t('home.m1v'), lbl: t('home.m1l') },
    { val: t('home.m2v'), lbl: t('home.m2l') },
    { val: t('home.m3v'), lbl: t('home.m3l') },
  ];
  const [file, setFile] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  // Revoke the object URL when it changes / unmounts to avoid leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setError(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(picked);
    });
    setFile(picked);
    e.target.value = ''; // allow re-picking the same file
  };

  const analyze = async () => {
    if (!file) {
      setError(t('home.errPick'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rawResult = await analyzeLeafImage(file);
      if (rawResult.includes('Invalid Image') || rawResult.includes('not a crop leaf')) {
        throw new Error(t('home.errInvalidImage'));
      }
      navigate('/results', { state: { rawResult } });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('home.errNet');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen home">
      <div className="backdrop-top" />
      <div className="backdrop-bottom" />

      <div className="shell">
        <div className="home-nav">
          <button type="button" className="nav-link" onClick={() => navigate('/history')}>
            🗂️ {t('nav.history')}
          </button>
          <LanguageSelect />
        </div>

        <header className="header">
          <div className="brand-row">
            <div className="brand-mark">A</div>
            <div className="brand-copy">
              <p className="kicker">AI Crop Analysis</p>
              <h1 className="app-title">AgriAI</h1>
            </div>
          </div>
          <p className="subtitle">{t('home.subtitle')}</p>
        </header>

        <div className="metric-row">
          {METRICS.map((m) => (
            <div key={m.lbl} className="metric-card">
              <p className="metric-value">{m.val}</p>
              <p className="metric-label">{m.lbl}</p>
            </div>
          ))}
        </div>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">{t('home.imageInput')}</h2>
            <p className="panel-hint">{t('home.imageHint')}</p>
          </div>

          <div className="preview-frame">
            {previewUrl ? (
              <img src={previewUrl} alt="Selected crop" className="preview-image" />
            ) : (
              <div className="placeholder">
                <span className="placeholder-badge">{t('home.ready')}</span>
                <p className="placeholder-title">{t('home.noImage')}</p>
                <p className="placeholder-text">{t('home.noImageText')}</p>
              </div>
            )}
          </div>

          {/* Hidden inputs drive the two buttons. capture hints the camera on mobile. */}
          <input
            ref={cameraInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={onFilePicked}
          />
          <input ref={galleryInput} type="file" accept="image/*" hidden onChange={onFilePicked} />

          <div className="action-grid">
            <button type="button" className="primary-button" onClick={() => cameraInput.current?.click()}>
              <span className="btn-title">📸&nbsp;&nbsp;{t('home.capture')}</span>
              <span className="btn-subtitle">{t('home.captureSub')}</span>
            </button>
            <button type="button" className="secondary-button" onClick={() => galleryInput.current?.click()}>
              <span className="btn-title dark">🖼️&nbsp;&nbsp;{t('home.gallery')}</span>
              <span className="btn-subtitle muted">{t('home.gallerySub')}</span>
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="button"
            className="analyze-button"
            onClick={analyze}
            disabled={!file || loading}>
            {loading ? (
              <span className="loading-row">
                <span className="spinner" /> {t('home.analyzing')}
              </span>
            ) : (
              `🔍  ${t('home.run')}`
            )}
          </button>
        </section>
      </div>
    </div>
  );
}
