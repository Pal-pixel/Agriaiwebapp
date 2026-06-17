/**
 * i18n.tsx — lightweight language layer.
 *
 *  - `lang` controls BOTH the UI chrome and the language the AI answers in.
 *  - UI chrome is translated for English + Hindi (the majority of users);
 *    other languages fall back to English chrome but still get AI content
 *    and read-aloud in their own language.
 *  - The selected language is persisted in localStorage.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface Language {
  code: string; // app code
  label: string; // native label shown in the picker
  ai: string | null; // English name used in AI prompts (null = English, no instruction)
  script: string | null; // native script name, to steer the AI (null = Latin)
  speech: string; // BCP-47 code for speech synthesis
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', ai: null, script: null, speech: 'en-IN' },
  { code: 'hi', label: 'हिन्दी', ai: 'Hindi', script: 'Devanagari', speech: 'hi-IN' },
  { code: 'mr', label: 'मराठी', ai: 'Marathi', script: 'Devanagari', speech: 'mr-IN' },
  { code: 'gu', label: 'ગુજરાતી', ai: 'Gujarati', script: 'Gujarati', speech: 'gu-IN' },
  { code: 'bn', label: 'বাংলা', ai: 'Bengali', script: 'Bengali', speech: 'bn-IN' },
  { code: 'ta', label: 'தமிழ்', ai: 'Tamil', script: 'Tamil', speech: 'ta-IN' },
  { code: 'te', label: 'తెలుగు', ai: 'Telugu', script: 'Telugu', speech: 'te-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', ai: 'Kannada', script: 'Kannada', speech: 'kn-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', ai: 'Punjabi', script: 'Gurmukhi', speech: 'pa-IN' },
];

export function langByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/** Instruction appended to AI prompts. Empty for English. */
export function aiLangInstruction(code: string): string {
  const { ai, script } = langByCode(code);
  if (!ai) return '';
  // Small models drift toward Devanagari for every Indian language; for the
  // non-Devanagari scripts, call that out explicitly.
  const guard = script === 'Devanagari' ? '' : ' (not Devanagari, not English transliteration)';
  return ` Write all text values in ${ai} using the ${script} script only${guard}. Keep JSON keys and the treatmentUrgency value in English.`;
}

/** Instruction for the chat system prompt. Empty for English. */
export function aiChatInstruction(code: string): string {
  const { ai, script } = langByCode(code);
  if (!ai) return '';
  return ` Reply only in ${ai}, written in the ${script} script.`;
}

// ── UI strings (en + hi). Missing keys/languages fall back to English. ──
type Dict = Record<string, string>;

const EN: Dict = {
  'nav.history': 'History',
  'nav.home': 'Home',
  'home.subtitle': 'Upload or capture a crop photo to get an instant AI-powered disease diagnosis.',
  'home.m1v': '1 Photo', 'home.m1l': 'Upload or capture',
  'home.m2v': 'Fast', 'home.m2l': 'Cloud inference',
  'home.m3v': 'Clear', 'home.m3l': 'Actionable result',
  'home.imageInput': 'Image Input',
  'home.imageHint': 'Choose a clean, well-lit crop photo',
  'home.ready': 'Ready',
  'home.noImage': 'No image selected',
  'home.noImageText': 'Capture a fresh photo or select one from your gallery to begin the diagnosis.',
  'home.capture': 'Capture', 'home.captureSub': 'Open camera',
  'home.gallery': 'Gallery', 'home.gallerySub': 'Choose photo',
  'home.run': 'Run Analysis',
  'home.analyzing': 'Analyzing image...',
  'home.errPick': 'Capture or choose an image before running analysis.',
  'home.errNet': 'Please check your internet and try again.',
  'res.back': 'Back',
  'res.title': 'Diagnosis Report',
  'res.share': 'Share',
  'res.copied': 'Report copied to clipboard',
  'res.tabInfo': 'Disease Info',
  'res.tabChat': 'Ask AI',
  'res.loading': 'Loading disease details...',
  'res.couldNotLoad': 'Could not load full details',
  'res.retry': 'Retry',
  'res.crop': 'Crop',
  'res.confidence': 'Confidence',
  'res.healthScore': 'Health Score',
  'res.severity': 'Severity',
  'res.urgency': 'Treatment Urgency',
  'res.economic': 'Economic Impact',
  'res.pestTitle': 'Pesticide Treatments',
  'res.pestSub': 'Tap any pesticide to see full details & how to use it',
  'res.expandAll': 'Expand All',
  'res.collapseAll': 'Collapse All',
  'res.dosage': 'Dosage',
  'res.frequency': 'Frequency',
  'res.steps': 'Step-by-Step Usage',
  'res.nonPest': 'Non-Pesticide Methods',
  'res.prevention': 'Prevention Tips',
  'res.phi': 'Safe to harvest after',
  'res.reentry': 'Re-enter field after',
  'calc.title': 'Dosage Calculator',
  'calc.tankSize': 'Sprayer tank (litres)',
  'calc.numTanks': 'No. of tanks',
  'calc.area': 'Area',
  'calc.acres': 'acres',
  'calc.hectares': 'hectares',
  'calc.plants': 'No. of plants',
  'calc.youNeed': 'You need',
  'calc.basedOn': 'Based on',
  'sched.title': 'Spray Schedule',
  'sched.every': 'Spray every',
  'sched.days': 'days',
  'sched.startDate': 'First spray',
  'sched.applications': 'No. of sprays',
  'sched.addToCalendar': 'Add to Calendar',
  'sched.note': 'Spray reminder for crop treatment',
  'res.expertTitle': 'Need Expert Advice?',
  'res.expertSub': 'Free agricultural helplines available 24/7',
  'res.kcc': 'Kisan Call Center',
  'res.kccToll': 'KCC Toll Free',
  'res.listen': 'Listen',
  'res.stop': 'Stop',
  'res.chatTitle': 'Ask AgriAI',
  'res.chatText': 'Ask any farming question — pesticides, irrigation, market prices, or anything about',
  'res.thisDisease': 'this disease',
  'res.chatPlaceholder': 'Ask a farming question...',
  'res.send': 'Send',
  'res.chatErr': "Sorry, I couldn't fetch an answer. Error: ",
  'res.cached': 'Loaded from saved data — no internet used',
  'hist.title': 'Scan History',
  'hist.empty': 'No saved scans yet. Your diagnoses will appear here.',
  'hist.clear': 'Clear All',
  'hist.open': 'Open report',
  'hist.back': 'Back',
};

const HI: Dict = {
  'nav.history': 'इतिहास',
  'nav.home': 'होम',
  'home.subtitle': 'तुरंत एआई-आधारित रोग निदान पाने के लिए फसल की फोटो अपलोड करें या खींचें।',
  'home.m1v': '1 फोटो', 'home.m1l': 'अपलोड या कैप्चर',
  'home.m2v': 'तेज़', 'home.m2l': 'क्लाउड अनुमान',
  'home.m3v': 'स्पष्ट', 'home.m3l': 'व्यावहारिक परिणाम',
  'home.imageInput': 'छवि इनपुट',
  'home.imageHint': 'साफ और अच्छी रोशनी वाली फसल फोटो चुनें',
  'home.ready': 'तैयार',
  'home.noImage': 'कोई छवि चयनित नहीं',
  'home.noImageText': 'निदान शुरू करने के लिए नई फोटो खींचें या गैलरी से चुनें।',
  'home.capture': 'कैप्चर', 'home.captureSub': 'कैमरा खोलें',
  'home.gallery': 'गैलरी', 'home.gallerySub': 'फोटो चुनें',
  'home.run': 'विश्लेषण करें',
  'home.analyzing': 'छवि का विश्लेषण हो रहा है...',
  'home.errPick': 'विश्लेषण से पहले छवि कैप्चर करें या चुनें।',
  'home.errNet': 'कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।',
  'res.back': 'वापस',
  'res.title': 'निदान रिपोर्ट',
  'res.share': 'साझा करें',
  'res.copied': 'रिपोर्ट क्लिपबोर्ड पर कॉपी हुई',
  'res.tabInfo': 'रोग जानकारी',
  'res.tabChat': 'एआई से पूछें',
  'res.loading': 'रोग विवरण लोड हो रहा है...',
  'res.couldNotLoad': 'पूरा विवरण लोड नहीं हो सका',
  'res.retry': 'पुनः प्रयास',
  'res.crop': 'फसल',
  'res.confidence': 'विश्वास',
  'res.healthScore': 'स्वास्थ्य स्कोर',
  'res.severity': 'गंभीरता',
  'res.urgency': 'उपचार तात्कालिकता',
  'res.economic': 'आर्थिक प्रभाव',
  'res.pestTitle': 'कीटनाशक उपचार',
  'res.pestSub': 'पूरी जानकारी और उपयोग देखने के लिए किसी कीटनाशक पर टैप करें',
  'res.expandAll': 'सभी खोलें',
  'res.collapseAll': 'सभी बंद करें',
  'res.dosage': 'मात्रा',
  'res.frequency': 'आवृत्ति',
  'res.steps': 'चरण-दर-चरण उपयोग',
  'res.nonPest': 'गैर-कीटनाशक उपाय',
  'res.prevention': 'रोकथाम सुझाव',
  'res.phi': 'कटाई सुरक्षित (इतने दिन बाद)',
  'res.reentry': 'खेत में दोबारा जाएं',
  'calc.title': 'मात्रा कैलकुलेटर',
  'calc.tankSize': 'स्प्रेयर टंकी (लीटर)',
  'calc.numTanks': 'टंकियों की संख्या',
  'calc.area': 'क्षेत्रफल',
  'calc.acres': 'एकड़',
  'calc.hectares': 'हेक्टेयर',
  'calc.plants': 'पौधों की संख्या',
  'calc.youNeed': 'आपको चाहिए',
  'calc.basedOn': 'इस आधार पर',
  'sched.title': 'छिड़काव अनुसूची',
  'sched.every': 'छिड़काव हर',
  'sched.days': 'दिन',
  'sched.startDate': 'पहला छिड़काव',
  'sched.applications': 'छिड़काव की संख्या',
  'sched.addToCalendar': 'कैलेंडर में जोड़ें',
  'sched.note': 'फसल उपचार के लिए छिड़काव अनुस्मारक',
  'res.expertTitle': 'विशेषज्ञ सलाह चाहिए?',
  'res.expertSub': 'मुफ्त कृषि हेल्पलाइन 24/7 उपलब्ध',
  'res.kcc': 'किसान कॉल सेंटर',
  'res.kccToll': 'केसीसी टोल फ्री',
  'res.listen': 'सुनें',
  'res.stop': 'रोकें',
  'res.chatTitle': 'AgriAI से पूछें',
  'res.chatText': 'कोई भी खेती सवाल पूछें — कीटनाशक, सिंचाई, बाज़ार भाव, या इसके बारे में',
  'res.thisDisease': 'इस रोग',
  'res.chatPlaceholder': 'खेती से जुड़ा सवाल पूछें...',
  'res.send': 'भेजें',
  'res.chatErr': 'क्षमा करें, उत्तर नहीं मिल सका। त्रुटि: ',
  'res.cached': 'सहेजे गए डेटा से लोड — इंटरनेट उपयोग नहीं हुआ',
  'hist.title': 'स्कैन इतिहास',
  'hist.empty': 'अभी कोई सहेजा स्कैन नहीं। आपके निदान यहाँ दिखेंगे।',
  'hist.clear': 'सभी हटाएं',
  'hist.open': 'रिपोर्ट खोलें',
  'hist.back': 'वापस',
};

const DICTS: Record<string, Dict> = { en: EN, hi: HI };

const STORAGE_KEY = 'agri_lang';

interface LangCtx {
  lang: string;
  setLang: (code: string) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((code: string) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string) => DICTS[lang]?.[key] ?? EN[key] ?? key,
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}

/** Compact language picker used in page headers. */
export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <select
      className={className ?? 'lang-select'}
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Language">
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          🌐 {l.label}
        </option>
      ))}
    </select>
  );
}
