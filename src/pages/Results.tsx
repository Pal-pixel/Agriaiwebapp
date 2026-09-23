import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { callNim } from '../lib/nim';
import {
  buildDiseaseInfoPrompt,
  buildChatPrompt,
  CHAT_SYSTEM,
  DISEASE_SYSTEM,
  extractJson,
  normalizeDiseaseData,
  parseConfidence,
  parseCropName,
  parseDiseaseName,
  parseHealthScore,
  parseSeverity,
  type ChatMessage,
  type DiseaseData,
} from '../lib/disease';
import { aiChatInstruction, aiLangInstruction, LanguageSelect, useLang } from '../lib/i18n';
import { addHistory, getCachedDetail, setCachedDetail } from '../lib/storage';
import MarkdownBubble from '../components/MarkdownBubble';
import ListenButton from '../components/ListenButton';
import DosageCalculator from '../components/DosageCalculator';
import SprayScheduler from '../components/SprayScheduler';
import './Results.css';

// ── Small presentational helpers ──────────────────────
function SeverityBadge({ text }: { text: string }) {
  const cls = text.includes('Severe') ? 'sev-high' : text.includes('Healthy') ? 'sev-ok' : 'sev-mid';
  return <span className={`badge ${cls}`}>{text}</span>;
}

function UrgencyBadge({ text }: { text: string }) {
  const t = text.toLowerCase();
  const cls = t.includes('immediate') ? 'sev-high' : t.includes('preventive') ? 'sev-ok' : 'sev-mid';
  return <span className={`badge ${cls}`}>{text}</span>;
}

// ── Disease info tab ──────────────────────────────────
interface InfoTabProps {
  loadingInfo: boolean;
  diseaseData: DiseaseData | null;
  infoError: string | null;
  fromCache: boolean;
  onRetry: () => void;
  expanded: number | null;
  setExpanded: (i: number | null) => void;
  allExpanded: boolean;
  onToggleAll: () => void;
}

function InfoTab({
  loadingInfo,
  diseaseData,
  infoError,
  fromCache,
  onRetry,
  expanded,
  setExpanded,
  allExpanded,
  onToggleAll,
}: InfoTabProps) {
  const { t } = useLang();

  if (loadingInfo) {
    return (
      <div className="centered-loader">
        <span className="spinner blue lg" />
        <p className="loader-text">{t('res.loading')}</p>
      </div>
    );
  }
  if (!diseaseData) return null;

  // What gets read aloud for the summary card.
  const speakText = [
    diseaseData.disease.replace(/_/g, ' '),
    diseaseData.summary,
    diseaseData.economicImpact,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <div className="tab-content">
      {infoError && (
        <div className="error-banner">
          <div className="error-banner-copy">
            <p className="error-banner-title">{t('res.couldNotLoad')}</p>
            <p className="error-banner-msg">{infoError}</p>
          </div>
          <button type="button" className="retry-btn" onClick={onRetry}>
            {t('res.retry')}
          </button>
        </div>
      )}

      {fromCache && !infoError && <div className="cache-note">💾 {t('res.cached')}</div>}

      <div className="summary-card">
        <div className="summary-head">
          <h2 className="disease-name">{diseaseData.disease.replace(/_/g, ' ')}</h2>
          <ListenButton text={speakText} />
        </div>
        <p className="crop-label">
          {t('res.crop')}: {diseaseData.crop}
        </p>
        <div className="stats-row">
          <div className="stat-box">
            <p className="stat-val">{diseaseData.confidence}</p>
            <p className="stat-lbl">{t('res.confidence')}</p>
          </div>
          <div className="stat-box">
            <p className="stat-val">{diseaseData.healthScore}</p>
            <p className="stat-lbl">{t('res.healthScore')}</p>
          </div>
          <div className="stat-box wide">
            <SeverityBadge text={diseaseData.severity} />
            <p className="stat-lbl">{t('res.severity')}</p>
          </div>
        </div>
        {diseaseData.summary && <p className="summary-text">{diseaseData.summary}</p>}
      </div>

      {(diseaseData.treatmentUrgency || diseaseData.economicImpact) && (
        <div className="impact-row">
          {diseaseData.treatmentUrgency && (
            <div className="impact-card">
              <span className="impact-icon">⏱️</span>
              <p className="impact-label">{t('res.urgency')}</p>
              <UrgencyBadge text={diseaseData.treatmentUrgency} />
            </div>
          )}
          {diseaseData.economicImpact && (
            <div className="impact-card wide">
              <span className="impact-icon">📉</span>
              <p className="impact-label">{t('res.economic')}</p>
              <p className="impact-value">{diseaseData.economicImpact}</p>
            </div>
          )}
        </div>
      )}

      {diseaseData.pesticides.length > 0 && (
        <section className="section">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">🧪 {t('res.pestTitle')}</h3>
              <p className="section-subtitle">{t('res.pestSub')}</p>
            </div>
            <button type="button" className="expand-all-btn" onClick={onToggleAll}>
              {allExpanded ? t('res.collapseAll') : t('res.expandAll')}
            </button>
          </div>

          {diseaseData.pesticides.map((p, i) => {
            const isOpen = allExpanded || expanded === i;
            return (
              <div key={i} className="accordion-card">
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div className="accordion-heading">
                    <p className="accordion-title">{p.name}</p>
                    {p.type && <p className="accordion-type">{p.type}</p>}
                  </div>
                  <span className="accordion-chevron">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="accordion-body">
                    {p.description && (
                      <div className="description-box">
                        <p className="description-text">{p.description}</p>
                      </div>
                    )}
                    <div className="quick-stats-row">
                      <div className="quick-stat">
                        <span className="quick-stat-icon">📏</span>
                        <p className="quick-stat-label">{t('res.dosage')}</p>
                        <p className="quick-stat-value">{p.dosage}</p>
                      </div>
                      <div className="quick-stat-divider" />
                      <div className="quick-stat">
                        <span className="quick-stat-icon">🔄</span>
                        <p className="quick-stat-label">{t('res.frequency')}</p>
                        <p className="quick-stat-value">{p.frequency}</p>
                      </div>
                    </div>
                    {Array.isArray(p.howToUse) && p.howToUse.length > 0 && (
                      <div className="steps-section">
                        <p className="steps-title">📋 {t('res.steps')}</p>
                        {p.howToUse.map((step, si) => (
                          <div key={si} className="step-row">
                            <span className="step-number">{si + 1}</span>
                            <p className="step-text">{step.replace(/^Step \d+:\s*/i, '')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {(p.preHarvestInterval || p.reEntryPeriod) && (
                      <div className="safety-timeline">
                        {p.preHarvestInterval && (
                          <div className="timeline-chip">
                            <span className="timeline-icon">🌾</span>
                            <p className="timeline-label">{t('res.phi')}</p>
                            <p className="timeline-value">{p.preHarvestInterval}</p>
                          </div>
                        )}
                        {p.reEntryPeriod && (
                          <div className="timeline-chip">
                            <span className="timeline-icon">🚷</span>
                            <p className="timeline-label">{t('res.reentry')}</p>
                            <p className="timeline-value">{p.reEntryPeriod}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <DosageCalculator dosage={p.dosage} />
                    {p.frequency && (
                      <SprayScheduler pesticide={p.name} frequency={p.frequency} crop={diseaseData.crop} />
                    )}

                    {p.safetyNote && (
                      <div className="safety-box">
                        <span className="safety-icon">⚠️</span>
                        <p className="safety-text">{p.safetyNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {diseaseData.nonPesticideMethods.length > 0 && (
        <section className="section">
          <h3 className="section-title">🌿 {t('res.nonPest')}</h3>
          {diseaseData.nonPesticideMethods.map((m, i) => (
            <div key={i} className="list-item">
              <span className="list-bullet">✓</span>
              <p className="list-text">{m}</p>
            </div>
          ))}
        </section>
      )}

      {diseaseData.preventionTips.length > 0 && (
        <section className="section">
          <h3 className="section-title">🛡️ {t('res.prevention')}</h3>
          {diseaseData.preventionTips.map((tip, i) => (
            <div key={i} className="list-item">
              <span className="list-bullet">→</span>
              <p className="list-text">{tip}</p>
            </div>
          ))}
        </section>
      )}

      <div className="helpline-card">
        <div className="helpline-header">
          <span className="helpline-icon">📞</span>
          <div>
            <p className="helpline-title">{t('res.expertTitle')}</p>
            <p className="helpline-subtitle">{t('res.expertSub')}</p>
          </div>
        </div>
        <div className="helpline-numbers">
          <a className="helpline-btn" href="tel:1551">
            <span className="helpline-btn-number">1551</span>
            <span className="helpline-btn-label">{t('res.kcc')}</span>
          </a>
          <a className="helpline-btn" href="tel:18001801551">
            <span className="helpline-btn-number">1800-180-1551</span>
            <span className="helpline-btn-label">{t('res.kccToll')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Ask AI chat tab ───────────────────────────────────
interface ChatTabProps {
  messages: ChatMessage[];
  userInput: string;
  setUserInput: (t: string) => void;
  chatLoading: boolean;
  sendChatMessage: () => void;
  diseaseData: DiseaseData | null;
}

function ChatTab({ messages, userInput, setUserInput, chatLoading, sendChatMessage, diseaseData }: ChatTabProps) {
  const { t } = useLang();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="chat-wrap">
      <div className="chat-scroll">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span className="chat-empty-icon">🤖</span>
            <p className="chat-empty-title">{t('res.chatTitle')}</p>
            <p className="chat-empty-text">
              {t('res.chatText')} {diseaseData?.disease?.replace(/_/g, ' ') || t('res.thisDisease')}.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble-wrap ${m.role === 'user' ? 'wrap-user' : 'wrap-ai'}`}>
            <div className={`bubble ${m.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
              <MarkdownBubble text={m.text} />
            </div>
            {m.role === 'ai' && <ListenButton text={m.text} className="listen-btn small" />}
          </div>
        ))}
        {chatLoading && (
          <div className="bubble ai-bubble">
            <span className="spinner blue" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="input-bar">
        <textarea
          className="chat-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('res.chatPlaceholder')}
          rows={1}
        />
        <button
          type="button"
          className="send-btn"
          onClick={sendChatMessage}
          disabled={!userInput.trim() || chatLoading}>
          {t('res.send')}
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────
export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useLang();
  const rawResult = (location.state as { rawResult?: string } | null)?.rawResult ?? '';

  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
  const [diseaseData, setDiseaseData] = useState<DiseaseData | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const [expanded, setExpanded] = useState<number | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  // No diagnosis to show (e.g. user opened /results directly) — go home.
  useEffect(() => {
    if (!rawResult) navigate('/', { replace: true });
  }, [rawResult, navigate]);

  // Load details on mount and whenever the language changes (cache makes the
  // re-fetch free if that disease/crop/lang was seen before).
  useEffect(() => {
    if (rawResult) fetchDiseaseInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const fetchDiseaseInfo = async () => {
    if (!rawResult) {
      setLoadingInfo(false);
      return;
    }
    setLoadingInfo(true);
    setInfoError(null);
    setFromCache(false);

    const diseaseName = parseDiseaseName(rawResult);
    const cropName = parseCropName(rawResult);
    const base = {
      disease: diseaseName,
      crop: cropName,
      confidence: parseConfidence(rawResult),
      severity: parseSeverity(rawResult),
      healthScore: parseHealthScore(rawResult),
    };

    // Record the scan (deduped) so it shows in History.
    addHistory({ ...base, rawResult, lang });

    // Token saver: serve from cache if we've fetched this disease/crop/lang.
    const cached = getCachedDetail(diseaseName, cropName, lang);
    if (cached) {
      setDiseaseData(normalizeDiseaseData(cached, base));
      setFromCache(true);
      setLoadingInfo(false);
      return;
    }

    try {
      // Indic scripts (Devanagari etc.) cost ~2× tokens, so give non-English
      // a higher cap to avoid truncated JSON. The result is cached, so this
      // larger spend happens only once per disease/crop/language.
      const rawJson = await callNim(buildDiseaseInfoPrompt(diseaseName, cropName, aiLangInstruction(lang)), {
        system: DISEASE_SYSTEM,
        maxTokens: lang === 'en' ? 600 : 1000,
        // A little randomness + the disease-specific prompt stops the model
        // collapsing to the same generic Mancozeb/Copper for every disease.
        temperature: 0.4,
        json: true,
      });
      const parsed = extractJson(rawJson);
      setDiseaseData(normalizeDiseaseData(parsed, base));
      setCachedDetail(diseaseName, cropName, lang, parsed);
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : 'Failed to load disease details.');
      setDiseaseData({
        ...base,
        summary: '',
        pesticides: [],
        nonPesticideMethods: [],
        preventionTips: [],
        economicImpact: '',
        treatmentUrgency: '',
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  const sendChatMessage = async () => {
    const text = userInput.trim();
    if (!text || chatLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setUserInput('');
    setChatLoading(true);

    try {
      const aiReply = await callNim(buildChatPrompt(text, diseaseData), {
        system: CHAT_SYSTEM + aiChatInstruction(lang),
        maxTokens: lang === 'en' ? 90 : 160,
      });
      setMessages([...newMessages, { role: 'ai', text: aiReply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages([...newMessages, { role: 'ai', text: `${t('res.chatErr')}${message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const shareReport = async () => {
    if (!diseaseData) return;
    const text = [
      '🌱 AgriAI Diagnosis Report',
      '',
      `Disease: ${diseaseData.disease.replace(/_/g, ' ')}`,
      `Crop: ${diseaseData.crop}`,
      `Severity: ${diseaseData.severity}`,
      `Confidence: ${diseaseData.confidence}`,
      `Health Score: ${diseaseData.healthScore}`,
      diseaseData.treatmentUrgency ? `Urgency: ${diseaseData.treatmentUrgency}` : '',
      '',
      diseaseData.summary,
      diseaseData.economicImpact ? `\nEconomic Impact: ${diseaseData.economicImpact}` : '',
      '\nGenerated by AgriAI — AI-Powered Crop Disease Diagnosis',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'AgriAI Disease Report', text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareNote(t('res.copied'));
        setTimeout(() => setShareNote(null), 2500);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const handleToggleAll = () => {
    setAllExpanded((prev) => !prev);
    setExpanded(null);
  };

  return (
    <div className="screen results">
      <div className="top-bar">
        <button type="button" className="back-btn" onClick={() => navigate('/')}>
          ← {t('res.back')}
        </button>
        <p className="top-bar-title">{t('res.title')}</p>
        <div className="top-bar-actions">
          <LanguageSelect />
          <button type="button" className="share-btn" onClick={shareReport} disabled={!diseaseData}>
            ↑ {t('res.share')}
          </button>
        </div>
      </div>

      {shareNote && <div className="share-note">{shareNote}</div>}

      <div className="tab-bar">
        <button
          type="button"
          className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('info')}>
          🌱 {t('res.tabInfo')}
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'chat' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('chat')}>
          🤖 {t('res.tabChat')}
        </button>
      </div>

      <div className="tab-host">
        {activeTab === 'info' ? (
          <InfoTab
            loadingInfo={loadingInfo}
            diseaseData={diseaseData}
            infoError={infoError}
            fromCache={fromCache}
            onRetry={fetchDiseaseInfo}
            expanded={expanded}
            setExpanded={setExpanded}
            allExpanded={allExpanded}
            onToggleAll={handleToggleAll}
          />
        ) : (
          <ChatTab
            messages={messages}
            userInput={userInput}
            setUserInput={setUserInput}
            chatLoading={chatLoading}
            sendChatMessage={sendChatMessage}
            diseaseData={diseaseData}
          />
        )}
      </div>
    </div>
  );
}
