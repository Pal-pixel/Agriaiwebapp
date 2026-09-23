

// content = r"""/**
//  * i18n.tsx — multilingual language layer for AgriAI.
//  *
//  * UI translations are provided for all 9 supported languages.
//  * The selected language controls both the UI and the language used
//  * for AI answers / speech where supported by the application.
//  */
// import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface Language {
  code: string;
  label: string;
  ai: string | null;
  script: string | null;
  speech: string;
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

export function aiLangInstruction(code: string): string {
  const { ai, script } = langByCode(code);
  if (!ai) return '';
  const guard =
    script === 'Devanagari'
      ? ''
      : ' (not Devanagari, not English transliteration)';
  return ` Write all text values in ${ai} using the ${script} script only${guard}. Keep JSON keys and the treatmentUrgency value in English.`;
}

export function aiChatInstruction(code: string): string {
  const { ai, script } = langByCode(code);
  if (!ai) return '';
  return ` Reply only in ${ai}, written in the ${script} script.`;
}

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
  'nav.history': 'इतिहास', 'nav.home': 'होम',
  'home.subtitle': 'तुरंत एआई-आधारित रोग निदान पाने के लिए फसल की फोटो अपलोड करें या खींचें।',
  'home.m1v': '1 फोटो', 'home.m1l': 'अपलोड या कैप्चर',
  'home.m2v': 'तेज़', 'home.m2l': 'क्लाउड अनुमान',
  'home.m3v': 'स्पष्ट', 'home.m3l': 'व्यावहारिक परिणाम',
  'home.imageInput': 'छवि इनपुट', 'home.imageHint': 'साफ और अच्छी रोशनी वाली फसल फोटो चुनें',
  'home.ready': 'तैयार', 'home.noImage': 'कोई छवि चयनित नहीं',
  'home.noImageText': 'निदान शुरू करने के लिए नई फोटो खींचें या गैलरी से चुनें।',
  'home.capture': 'कैप्चर', 'home.captureSub': 'कैमरा खोलें',
  'home.gallery': 'गैलरी', 'home.gallerySub': 'फोटो चुनें',
  'home.run': 'विश्लेषण करें', 'home.analyzing': 'छवि का विश्लेषण हो रहा है...',
  'home.errPick': 'विश्लेषण से पहले छवि कैप्चर करें या चुनें।',
  'home.errNet': 'कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।',
  'res.back': 'वापस', 'res.title': 'निदान रिपोर्ट', 'res.share': 'साझा करें',
  'res.copied': 'रिपोर्ट क्लिपबोर्ड पर कॉपी हुई', 'res.tabInfo': 'रोग जानकारी', 'res.tabChat': 'एआई से पूछें',
  'res.loading': 'रोग विवरण लोड हो रहा है...', 'res.couldNotLoad': 'पूरा विवरण लोड नहीं हो सका', 'res.retry': 'पुनः प्रयास',
  'res.crop': 'फसल', 'res.confidence': 'विश्वास', 'res.healthScore': 'स्वास्थ्य स्कोर', 'res.severity': 'गंभीरता',
  'res.urgency': 'उपचार तात्कालिकता', 'res.economic': 'आर्थिक प्रभाव', 'res.pestTitle': 'कीटनाशक उपचार',
  'res.pestSub': 'पूरी जानकारी और उपयोग देखने के लिए किसी कीटनाशक पर टैप करें',
  'res.expandAll': 'सभी खोलें', 'res.collapseAll': 'सभी बंद करें', 'res.dosage': 'मात्रा', 'res.frequency': 'आवृत्ति',
  'res.steps': 'चरण-दर-चरण उपयोग', 'res.nonPest': 'गैर-कीटनाशक उपाय', 'res.prevention': 'रोकथाम सुझाव',
  'res.phi': 'कटाई सुरक्षित (इतने दिन बाद)', 'res.reentry': 'खेत में दोबारा जाएं',
  'calc.title': 'मात्रा कैलकुलेटर', 'calc.tankSize': 'स्प्रेयर टंकी (लीटर)', 'calc.numTanks': 'टंकियों की संख्या',
  'calc.area': 'क्षेत्रफल', 'calc.acres': 'एकड़', 'calc.hectares': 'हेक्टेयर', 'calc.plants': 'पौधों की संख्या',
  'calc.youNeed': 'आपको चाहिए', 'calc.basedOn': 'इस आधार पर',
  'sched.title': 'छिड़काव अनुसूची', 'sched.every': 'छिड़काव हर', 'sched.days': 'दिन',
  'sched.startDate': 'पहला छिड़काव', 'sched.applications': 'छिड़काव की संख्या', 'sched.addToCalendar': 'कैलेंडर में जोड़ें',
  'sched.note': 'फसल उपचार के लिए छिड़काव अनुस्मारक',
  'res.expertTitle': 'विशेषज्ञ सलाह चाहिए?', 'res.expertSub': 'मुफ्त कृषि हेल्पलाइन 24/7 उपलब्ध',
  'res.kcc': 'किसान कॉल सेंटर', 'res.kccToll': 'केसीसी टोल फ्री', 'res.listen': 'सुनें', 'res.stop': 'रोकें',
  'res.chatTitle': 'AgriAI से पूछें', 'res.chatText': 'कोई भी खेती सवाल पूछें — कीटनाशक, सिंचाई, बाज़ार भाव, या इसके बारे में',
  'res.thisDisease': 'इस रोग', 'res.chatPlaceholder': 'खेती से जुड़ा सवाल पूछें...', 'res.send': 'भेजें',
  'res.chatErr': 'क्षमा करें, उत्तर नहीं मिल सका। त्रुटि: ', 'res.cached': 'सहेजे गए डेटा से लोड — इंटरनेट उपयोग नहीं हुआ',
  'hist.title': 'स्कैन इतिहास', 'hist.empty': 'अभी कोई सहेजा स्कैन नहीं। आपके निदान यहाँ दिखेंगे।',
  'hist.clear': 'सभी हटाएं', 'hist.open': 'रिपोर्ट खोलें', 'hist.back': 'वापस',
};

const MR: Dict = {
  'nav.history': 'इतिहास', 'nav.home': 'मुख्यपृष्ठ',
  'home.subtitle': 'त्वरित AI-आधारित रोग निदान मिळवण्यासाठी पिकाचा फोटो अपलोड करा किंवा काढा.',
  'home.m1v': '1 फोटो', 'home.m1l': 'अपलोड किंवा कॅप्चर',
  'home.m2v': 'जलद', 'home.m2l': 'क्लाउड विश्लेषण',
  'home.m3v': 'स्पष्ट', 'home.m3l': 'उपयुक्त निकाल',
  'home.imageInput': 'प्रतिमा इनपुट', 'home.imageHint': 'स्वच्छ आणि चांगल्या प्रकाशातील पिकाचा फोटो निवडा',
  'home.ready': 'तयार', 'home.noImage': 'कोणतीही प्रतिमा निवडलेली नाही',
  'home.noImageText': 'निदान सुरू करण्यासाठी नवीन फोटो काढा किंवा गॅलरीमधून निवडा.',
  'home.capture': 'कॅप्चर', 'home.captureSub': 'कॅमेरा उघडा', 'home.gallery': 'गॅलरी', 'home.gallerySub': 'फोटो निवडा',
  'home.run': 'विश्लेषण सुरू करा', 'home.analyzing': 'प्रतिमेचे विश्लेषण सुरू आहे...',
  'home.errPick': 'विश्लेषण करण्यापूर्वी प्रतिमा कॅप्चर करा किंवा निवडा.', 'home.errNet': 'कृपया इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.',
  'res.back': 'मागे', 'res.title': 'निदान अहवाल', 'res.share': 'शेअर करा', 'res.copied': 'अहवाल क्लिपबोर्डवर कॉपी केला',
  'res.tabInfo': 'रोगाची माहिती', 'res.tabChat': 'AI ला विचारा', 'res.loading': 'रोगाची माहिती लोड होत आहे...',
  'res.couldNotLoad': 'संपूर्ण माहिती लोड करता आली नाही', 'res.retry': 'पुन्हा प्रयत्न करा',
  'res.crop': 'पीक', 'res.confidence': 'विश्वास', 'res.healthScore': 'आरोग्य गुण', 'res.severity': 'तीव्रता',
  'res.urgency': 'उपचाराची तातडी', 'res.economic': 'आर्थिक परिणाम', 'res.pestTitle': 'कीटकनाशक उपचार',
  'res.pestSub': 'संपूर्ण माहिती आणि वापर पाहण्यासाठी कोणत्याही कीटकनाशकावर टॅप करा',
  'res.expandAll': 'सर्व उघडा', 'res.collapseAll': 'सर्व बंद करा', 'res.dosage': 'मात्रा', 'res.frequency': 'वारंवारिता',
  'res.steps': 'पायरी-पायरीने वापर', 'res.nonPest': 'कीटकनाशक नसलेल्या पद्धती', 'res.prevention': 'प्रतिबंधक उपाय',
  'res.phi': 'इतक्या दिवसांनंतर कापणी सुरक्षित', 'res.reentry': 'इतक्या वेळानंतर शेतात प्रवेश करा',
  'calc.title': 'मात्रा कॅल्क्युलेटर', 'calc.tankSize': 'फवारणी टाकी (लिटर)', 'calc.numTanks': 'टाक्यांची संख्या',
  'calc.area': 'क्षेत्रफळ', 'calc.acres': 'एकर', 'calc.hectares': 'हेक्टर', 'calc.plants': 'झाडांची संख्या',
  'calc.youNeed': 'आपल्याला आवश्यक', 'calc.basedOn': 'यावर आधारित',
  'sched.title': 'फवारणी वेळापत्रक', 'sched.every': 'फवारणी दर', 'sched.days': 'दिवसांनी',
  'sched.startDate': 'पहिली फवारणी', 'sched.applications': 'फवारण्यांची संख्या', 'sched.addToCalendar': 'कॅलेंडरमध्ये जोडा',
  'sched.note': 'पिकाच्या उपचारासाठी फवारणीची आठवण',
  'res.expertTitle': 'तज्ज्ञांचा सल्ला हवा आहे?', 'res.expertSub': 'मोफत कृषी हेल्पलाइन 24/7 उपलब्ध',
  'res.kcc': 'किसान कॉल सेंटर', 'res.kccToll': 'KCC टोल फ्री', 'res.listen': 'ऐका', 'res.stop': 'थांबवा',
  'res.chatTitle': 'AgriAI ला विचारा', 'res.chatText': 'शेतीबद्दल कोणताही प्रश्न विचारा — कीटकनाशके, सिंचन, बाजारभाव किंवा',
  'res.thisDisease': 'या रोगाबद्दल', 'res.chatPlaceholder': 'शेतीबद्दल प्रश्न विचारा...', 'res.send': 'पाठवा',
  'res.chatErr': 'क्षमस्व, उत्तर मिळवता आले नाही. त्रुटी: ', 'res.cached': 'जतन केलेल्या डेटामधून लोड केले — इंटरनेट वापरले नाही',
  'hist.title': 'स्कॅन इतिहास', 'hist.empty': 'अद्याप कोणतेही स्कॅन जतन केलेले नाही. तुमचे निदान येथे दिसेल.',
  'hist.clear': 'सर्व हटवा', 'hist.open': 'अहवाल उघडा', 'hist.back': 'मागे',
};

const GU: Dict = {
  'nav.history': 'ઇતિહાસ', 'nav.home': 'હોમ',
  'home.subtitle': 'તાત્કાલિક AI આધારિત રોગ નિદાન મેળવવા માટે પાકનો ફોટો અપલોડ કરો અથવા લો.',
  'home.m1v': '1 ફોટો', 'home.m1l': 'અપલોડ અથવા કેપ્ચર',
  'home.m2v': 'ઝડપી', 'home.m2l': 'ક્લાઉડ વિશ્લેષણ',
  'home.m3v': 'સ્પષ્ટ', 'home.m3l': 'ઉપયોગી પરિણામ',
  'home.imageInput': 'છબી ઇનપુટ', 'home.imageHint': 'સ્વચ્છ અને સારી રોશનીવાળો પાકનો ફોટો પસંદ કરો',
  'home.ready': 'તૈયાર', 'home.noImage': 'કોઈ છબી પસંદ કરેલી નથી',
  'home.noImageText': 'નિદાન શરૂ કરવા માટે નવો ફોટો લો અથવા ગેલેરીમાંથી પસંદ કરો.',
  'home.capture': 'ફોટો લો', 'home.captureSub': 'કેમેરા ખોલો', 'home.gallery': 'ગેલેરી', 'home.gallerySub': 'ફોટો પસંદ કરો',
  'home.run': 'વિશ્લેષણ કરો', 'home.analyzing': 'છબીનું વિશ્લેષણ થઈ રહ્યું છે...',
  'home.errPick': 'વિશ્લેષણ પહેલાં છબી લો અથવા પસંદ કરો.', 'home.errNet': 'કૃપા કરીને ઇન્ટરનેટ તપાસો અને ફરી પ્રયાસ કરો.',
  'res.back': 'પાછા', 'res.title': 'નિદાન અહેવાલ', 'res.share': 'શેર કરો', 'res.copied': 'અહેવાલ ક્લિપબોર્ડમાં કૉપિ થયો',
  'res.tabInfo': 'રોગની માહિતી', 'res.tabChat': 'AI ને પૂછો', 'res.loading': 'રોગની વિગતો લોડ થઈ રહી છે...',
  'res.couldNotLoad': 'સંપૂર્ણ વિગતો લોડ થઈ શકી નથી', 'res.retry': 'ફરી પ્રયાસ કરો',
  'res.crop': 'પાક', 'res.confidence': 'વિશ્વાસ', 'res.healthScore': 'આરોગ્ય સ્કોર', 'res.severity': 'તીવ્રતા',
  'res.urgency': 'સારવારની તાત્કાલિકતા', 'res.economic': 'આર્થિક અસર', 'res.pestTitle': 'જંતુનાશક સારવાર',
  'res.pestSub': 'સંપૂર્ણ વિગતો અને ઉપયોગ જોવા માટે કોઈપણ જંતુનાશક પર ટેપ કરો',
  'res.expandAll': 'બધું ખોલો', 'res.collapseAll': 'બધું બંધ કરો', 'res.dosage': 'માત્રા', 'res.frequency': 'આવર્તન',
  'res.steps': 'પગલું-દર-પગલું ઉપયોગ', 'res.nonPest': 'જંતુનાશક વિનાની પદ્ધતિઓ', 'res.prevention': 'બચાવના ઉપાયો',
  'res.phi': 'આટલા સમય પછી લણણી સુરક્ષિત', 'res.reentry': 'આટલા સમય પછી ખેતરમાં પ્રવેશ કરો',
  'calc.title': 'માત્રા કેલ્ક્યુલેટર', 'calc.tankSize': 'સ્પ્રેયર ટાંકી (લિટર)', 'calc.numTanks': 'ટાંકીની સંખ્યા',
  'calc.area': 'વિસ્તાર', 'calc.acres': 'એકર', 'calc.hectares': 'હેક્ટર', 'calc.plants': 'છોડોની સંખ્યા',
  'calc.youNeed': 'તમને જરૂરી', 'calc.basedOn': 'આધારે',
  'sched.title': 'છંટકાવનું સમયપત્રક', 'sched.every': 'દર', 'sched.days': 'દિવસે છંટકાવ',
  'sched.startDate': 'પ્રથમ છંટકાવ', 'sched.applications': 'છંટકાવની સંખ્યા', 'sched.addToCalendar': 'કૅલેન્ડરમાં ઉમેરો',
  'sched.note': 'પાકની સારવાર માટે છંટકાવની યાદ અપાવણી',
  'res.expertTitle': 'નિષ્ણાતની સલાહ જોઈએ?', 'res.expertSub': 'મફત કૃષિ હેલ્પલાઇન 24/7 ઉપલબ્ધ',
  'res.kcc': 'કિસાન કોલ સેન્ટર', 'res.kccToll': 'KCC ટોલ ફ્રી', 'res.listen': 'સાંભળો', 'res.stop': 'બંધ કરો',
  'res.chatTitle': 'AgriAI ને પૂછો', 'res.chatText': 'ખેતી વિશે કોઈપણ પ્રશ્ન પૂછો — જંતુનાશક, સિંચાઈ, બજાર ભાવ અથવા',
  'res.thisDisease': 'આ રોગ વિશે', 'res.chatPlaceholder': 'ખેતી વિશે પ્રશ્ન પૂછો...', 'res.send': 'મોકલો',
  'res.chatErr': 'માફ કરશો, જવાબ મેળવી શકાયો નથી. ભૂલ: ', 'res.cached': 'સાચવેલા ડેટામાંથી લોડ થયું — ઇન્ટરનેટનો ઉપયોગ થયો નથી',
  'hist.title': 'સ્કેન ઇતિહાસ', 'hist.empty': 'હજુ કોઈ સ્કેન સાચવાયેલ નથી. તમારા નિદાન અહીં દેખાશે.',
  'hist.clear': 'બધું સાફ કરો', 'hist.open': 'અહેવાલ ખોલો', 'hist.back': 'પાછા',
};

const BN: Dict = {
  'nav.history': 'ইতিহাস', 'nav.home': 'হোম',
  'home.subtitle': 'তাৎক্ষণিক AI-ভিত্তিক রোগ নির্ণয়ের জন্য ফসলের ছবি আপলোড করুন বা তুলুন।',
  'home.m1v': '১ ছবি', 'home.m1l': 'আপলোড বা ক্যাপচার',
  'home.m2v': 'দ্রুত', 'home.m2l': 'ক্লাউড বিশ্লেষণ', 'home.m3v': 'স্পষ্ট', 'home.m3l': 'কার্যকর ফলাফল',
  'home.imageInput': 'ছবির ইনপুট', 'home.imageHint': 'পরিষ্কার ও ভালো আলোতে তোলা ফসলের ছবি বেছে নিন',
  'home.ready': 'প্রস্তুত', 'home.noImage': 'কোনো ছবি নির্বাচিত নয়',
  'home.noImageText': 'নির্ণয় শুরু করতে নতুন ছবি তুলুন অথবা গ্যালারি থেকে বেছে নিন।',
  'home.capture': 'ক্যাপচার', 'home.captureSub': 'ক্যামেরা খুলুন', 'home.gallery': 'গ্যালারি', 'home.gallerySub': 'ছবি বেছে নিন',
  'home.run': 'বিশ্লেষণ চালান', 'home.analyzing': 'ছবি বিশ্লেষণ করা হচ্ছে...',
  'home.errPick': 'বিশ্লেষণ চালানোর আগে একটি ছবি তুলুন বা বেছে নিন।', 'home.errNet': 'ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন।',
  'res.back': 'পিছনে', 'res.title': 'রোগ নির্ণয় প্রতিবেদন', 'res.share': 'শেয়ার করুন', 'res.copied': 'প্রতিবেদন ক্লিপবোর্ডে কপি হয়েছে',
  'res.tabInfo': 'রোগের তথ্য', 'res.tabChat': 'AI-কে জিজ্ঞাসা করুন', 'res.loading': 'রোগের বিবরণ লোড হচ্ছে...',
  'res.couldNotLoad': 'সম্পূর্ণ বিবরণ লোড করা যায়নি', 'res.retry': 'আবার চেষ্টা করুন',
  'res.crop': 'ফসল', 'res.confidence': 'নির্ভরযোগ্যতা', 'res.healthScore': 'স্বাস্থ্য স্কোর', 'res.severity': 'তীব্রতা',
  'res.urgency': 'চিকিৎসার জরুরি অবস্থা', 'res.economic': 'অর্থনৈতিক প্রভাব', 'res.pestTitle': 'কীটনাশক চিকিৎসা',
  'res.pestSub': 'সম্পূর্ণ বিবরণ ও ব্যবহার দেখতে যেকোনো কীটনাশকে ট্যাপ করুন',
  'res.expandAll': 'সব খুলুন', 'res.collapseAll': 'সব বন্ধ করুন', 'res.dosage': 'মাত্রা', 'res.frequency': 'ব্যবহারের হার',
  'res.steps': 'ধাপে ধাপে ব্যবহার', 'res.nonPest': 'কীটনাশক-বিহীন পদ্ধতি', 'res.prevention': 'প্রতিরোধের টিপস',
  'res.phi': 'এরপর ফসল কাটা নিরাপদ', 'res.reentry': 'এরপর জমিতে প্রবেশ করুন',
  'calc.title': 'মাত্রা ক্যালকুলেটর', 'calc.tankSize': 'স্প্রেয়ার ট্যাঙ্ক (লিটার)', 'calc.numTanks': 'ট্যাঙ্কের সংখ্যা',
  'calc.area': 'জমির পরিমাণ', 'calc.acres': 'একর', 'calc.hectares': 'হেক্টর', 'calc.plants': 'গাছের সংখ্যা',
  'calc.youNeed': 'আপনার প্রয়োজন', 'calc.basedOn': 'ভিত্তি করে',
  'sched.title': 'স্প্রে করার সময়সূচি', 'sched.every': 'স্প্রে প্রতি', 'sched.days': 'দিন',
  'sched.startDate': 'প্রথম স্প্রে', 'sched.applications': 'স্প্রের সংখ্যা', 'sched.addToCalendar': 'ক্যালেন্ডারে যোগ করুন',
  'sched.note': 'ফসলের চিকিৎসার জন্য স্প্রে করার অনুস্মারক',
  'res.expertTitle': 'বিশেষজ্ঞের পরামর্শ দরকার?', 'res.expertSub': 'বিনামূল্যে কৃষি হেল্পলাইন ২৪/৭ উপলব্ধ',
  'res.kcc': 'কিষান কল সেন্টার', 'res.kccToll': 'KCC টোল ফ্রি', 'res.listen': 'শুনুন', 'res.stop': 'থামান',
  'res.chatTitle': 'AgriAI-কে জিজ্ঞাসা করুন', 'res.chatText': 'কৃষি সম্পর্কে যেকোনো প্রশ্ন করুন — কীটনাশক, সেচ, বাজারদর বা',
  'res.thisDisease': 'এই রোগ সম্পর্কে', 'res.chatPlaceholder': 'কৃষি সম্পর্কে প্রশ্ন করুন...', 'res.send': 'পাঠান',
  'res.chatErr': 'দুঃখিত, উত্তর আনা যায়নি। ত্রুটি: ', 'res.cached': 'সংরক্ষিত ডেটা থেকে লোড হয়েছে — ইন্টারনেট ব্যবহার হয়নি',
  'hist.title': 'স্ক্যান ইতিহাস', 'hist.empty': 'এখনও কোনো স্ক্যান সংরক্ষিত নেই। আপনার রোগ নির্ণয় এখানে দেখা যাবে।',
  'hist.clear': 'সব মুছুন', 'hist.open': 'প্রতিবেদন খুলুন', 'hist.back': 'পিছনে',
};

const TA: Dict = {
  'nav.history': 'வரலாறு', 'nav.home': 'முகப்பு',
  'home.subtitle': 'உடனடி AI அடிப்படையிலான நோய் கண்டறிதலுக்கு பயிரின் புகைப்படத்தை பதிவேற்றவும் அல்லது எடுக்கவும்.',
  'home.m1v': '1 புகைப்படம்', 'home.m1l': 'பதிவேற்றவும் அல்லது எடுக்கவும்',
  'home.m2v': 'வேகமானது', 'home.m2l': 'கிளவுட் பகுப்பாய்வு', 'home.m3v': 'தெளிவானது', 'home.m3l': 'பயனுள்ள முடிவு',
  'home.imageInput': 'பட உள்ளீடு', 'home.imageHint': 'தெளிவான, நல்ல வெளிச்சமுள்ள பயிர் புகைப்படத்தைத் தேர்ந்தெடுக்கவும்',
  'home.ready': 'தயார்', 'home.noImage': 'படம் தேர்ந்தெடுக்கப்படவில்லை',
  'home.noImageText': 'நோய் கண்டறிதலைத் தொடங்க புதிய புகைப்படம் எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்ந்தெடுக்கவும்.',
  'home.capture': 'படம் எடுக்கவும்', 'home.captureSub': 'கேமராவைத் திறக்கவும்',
  'home.gallery': 'கேலரி', 'home.gallerySub': 'புகைப்படத்தைத் தேர்ந்தெடுக்கவும்',
  'home.run': 'பகுப்பாய்வு செய்யவும்', 'home.analyzing': 'படம் பகுப்பாய்வு செய்யப்படுகிறது...',
  'home.errPick': 'பகுப்பாய்வு செய்வதற்கு முன் ஒரு படத்தை எடுக்கவும் அல்லது தேர்ந்தெடுக்கவும்.',
  'home.errNet': 'இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  'res.back': 'பின்', 'res.title': 'நோய் கண்டறிதல் அறிக்கை', 'res.share': 'பகிரவும்', 'res.copied': 'அறிக்கை கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது',
  'res.tabInfo': 'நோய் தகவல்', 'res.tabChat': 'AI-யிடம் கேளுங்கள்', 'res.loading': 'நோய் விவரங்கள் ஏற்றப்படுகின்றன...',
  'res.couldNotLoad': 'முழு விவரங்களை ஏற்ற முடியவில்லை', 'res.retry': 'மீண்டும் முயற்சிக்கவும்',
  'res.crop': 'பயிர்', 'res.confidence': 'நம்பகத்தன்மை', 'res.healthScore': 'ஆரோக்கிய மதிப்பெண்', 'res.severity': 'தீவிரம்',
  'res.urgency': 'சிகிச்சையின் அவசரம்', 'res.economic': 'பொருளாதார தாக்கம்', 'res.pestTitle': 'பூச்சிக்கொல்லி சிகிச்சைகள்',
  'res.pestSub': 'முழு விவரங்களையும் பயன்படுத்தும் முறையையும் பார்க்க எந்த பூச்சிக்கொல்லியையும் தட்டவும்',
  'res.expandAll': 'அனைத்தையும் விரிக்கவும்', 'res.collapseAll': 'அனைத்தையும் சுருக்கவும்',
  'res.dosage': 'அளவு', 'res.frequency': 'அடிக்கடி பயன்பாடு', 'res.steps': 'படிப்படியான பயன்பாடு',
  'res.nonPest': 'பூச்சிக்கொல்லி அல்லாத முறைகள்', 'res.prevention': 'தடுப்பு குறிப்புகள்',
  'res.phi': 'இதற்குப் பிறகு அறுவடை பாதுகாப்பானது', 'res.reentry': 'இதற்குப் பிறகு வயலுக்குள் செல்லலாம்',
  'calc.title': 'அளவு கணிப்பான்', 'calc.tankSize': 'தெளிப்பான் தொட்டி (லிட்டர்)', 'calc.numTanks': 'தொட்டிகளின் எண்ணிக்கை',
  'calc.area': 'பரப்பளவு', 'calc.acres': 'ஏக்கர்', 'calc.hectares': 'ஹெக்டேர்', 'calc.plants': 'செடிகளின் எண்ணிக்கை',
  'calc.youNeed': 'தேவைப்படும் அளவு', 'calc.basedOn': 'இதன் அடிப்படையில்',
  'sched.title': 'தெளிப்பு அட்டவணை', 'sched.every': 'ஒவ்வொரு', 'sched.days': 'நாட்களுக்கும் தெளிக்கவும்',
  'sched.startDate': 'முதல் தெளிப்பு', 'sched.applications': 'தெளிப்புகளின் எண்ணிக்கை', 'sched.addToCalendar': 'காலெண்டரில் சேர்க்கவும்',
  'sched.note': 'பயிர் சிகிச்சைக்கான தெளிப்பு நினைவூட்டல்',
  'res.expertTitle': 'நிபுணர் ஆலோசனை வேண்டுமா?', 'res.expertSub': 'இலவச வேளாண் உதவி எண்கள் 24/7 கிடைக்கும்',
  'res.kcc': 'கிசான் கால் சென்டர்', 'res.kccToll': 'KCC கட்டணமில்லா எண்', 'res.listen': 'கேட்கவும்', 'res.stop': 'நிறுத்தவும்',
  'res.chatTitle': 'AgriAI-யிடம் கேளுங்கள்', 'res.chatText': 'விவசாயம் தொடர்பான எந்தக் கேள்வியையும் கேளுங்கள் — பூச்சிக்கொல்லிகள், பாசனம், சந்தை விலைகள் அல்லது',
  'res.thisDisease': 'இந்த நோய் பற்றி', 'res.chatPlaceholder': 'விவசாயக் கேள்வியைக் கேளுங்கள்...', 'res.send': 'அனுப்பவும்',
  'res.chatErr': 'மன்னிக்கவும், பதிலைப் பெற முடியவில்லை. பிழை: ', 'res.cached': 'சேமித்த தரவிலிருந்து ஏற்றப்பட்டது — இணையம் பயன்படுத்தப்படவில்லை',
  'hist.title': 'ஸ்கேன் வரலாறு', 'hist.empty': 'இதுவரை ஸ்கேன் எதுவும் சேமிக்கப்படவில்லை. உங்கள் நோய் கண்டறிதல்கள் இங்கே தோன்றும்.',
  'hist.clear': 'அனைத்தையும் அழிக்கவும்', 'hist.open': 'அறிக்கையைத் திறக்கவும்', 'hist.back': 'பின்',
};

const TE: Dict = {
  'nav.history': 'చరిత్ర', 'nav.home': 'హోమ్',
  'home.subtitle': 'తక్షణ AI ఆధారిత వ్యాధి నిర్ధారణ కోసం పంట ఫోటోను అప్‌లోడ్ చేయండి లేదా తీయండి.',
  'home.m1v': '1 ఫోటో', 'home.m1l': 'అప్‌లోడ్ లేదా క్యాప్చర్',
  'home.m2v': 'వేగవంతం', 'home.m2l': 'క్లౌడ్ విశ్లేషణ', 'home.m3v': 'స్పష్టమైన', 'home.m3l': 'ఉపయోగకరమైన ఫలితం',
  'home.imageInput': 'చిత్ర ఇన్‌పుట్', 'home.imageHint': 'శుభ్రమైన, మంచి వెలుతురు ఉన్న పంట ఫోటోను ఎంచుకోండి',
  'home.ready': 'సిద్ధంగా ఉంది', 'home.noImage': 'చిత్రం ఎంచుకోలేదు',
  'home.noImageText': 'నిర్ధారణ ప్రారంభించడానికి కొత్త ఫోటో తీయండి లేదా గ్యాలరీ నుంచి ఎంచుకోండి.',
  'home.capture': 'ఫోటో తీయండి', 'home.captureSub': 'కెమెరా తెరవండి', 'home.gallery': 'గ్యాలరీ', 'home.gallerySub': 'ఫోటో ఎంచుకోండి',
  'home.run': 'విశ్లేషణ చేయండి', 'home.analyzing': 'చిత్రాన్ని విశ్లేషిస్తోంది...',
  'home.errPick': 'విశ్లేషణకు ముందు చిత్రాన్ని తీయండి లేదా ఎంచుకోండి.', 'home.errNet': 'ఇంటర్నెట్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
  'res.back': 'వెనుకకు', 'res.title': 'వ్యాధి నిర్ధారణ నివేదిక', 'res.share': 'పంచుకోండి', 'res.copied': 'నివేదిక క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది',
  'res.tabInfo': 'వ్యాధి సమాచారం', 'res.tabChat': 'AIని అడగండి', 'res.loading': 'వ్యాధి వివరాలు లోడ్ అవుతున్నాయి...',
  'res.couldNotLoad': 'పూర్తి వివరాలను లోడ్ చేయలేకపోయాము', 'res.retry': 'మళ్లీ ప్రయత్నించండి',
  'res.crop': 'పంట', 'res.confidence': 'నమ్మక స్థాయి', 'res.healthScore': 'ఆరోగ్య స్కోర్', 'res.severity': 'తీవ్రత',
  'res.urgency': 'చికిత్స అత్యవసరం', 'res.economic': 'ఆర్థిక ప్రభావం', 'res.pestTitle': 'పురుగుమందు చికిత్సలు',
  'res.pestSub': 'పూర్తి వివరాలు మరియు ఉపయోగించే విధానం చూడటానికి ఏదైనా పురుగుమందును నొక్కండి',
  'res.expandAll': 'అన్నీ విప్పండి', 'res.collapseAll': 'అన్నీ మూసివేయండి', 'res.dosage': 'మోతాదు', 'res.frequency': 'తరచుదనం',
  'res.steps': 'దశలవారీ ఉపయోగం', 'res.nonPest': 'పురుగుమందు లేని పద్ధతులు', 'res.prevention': 'నివారణ సూచనలు',
  'res.phi': 'దీని తర్వాత కోత సురక్షితం', 'res.reentry': 'దీని తర్వాత పొలంలోకి వెళ్లండి',
  'calc.title': 'మోతాదు కాలిక్యులేటర్', 'calc.tankSize': 'స్ప్రేయర్ ట్యాంక్ (లీటర్లు)', 'calc.numTanks': 'ట్యాంకుల సంఖ్య',
  'calc.area': 'విస్తీర్ణం', 'calc.acres': 'ఎకరాలు', 'calc.hectares': 'హెక్టార్లు', 'calc.plants': 'మొక్కల సంఖ్య',
  'calc.youNeed': 'మీకు అవసరం', 'calc.basedOn': 'ఆధారంగా',
  'sched.title': 'స్ప్రే షెడ్యూల్', 'sched.every': 'ప్రతి', 'sched.days': 'రోజులకు స్ప్రే చేయండి',
  'sched.startDate': 'మొదటి స్ప్రే', 'sched.applications': 'స్ప్రేల సంఖ్య', 'sched.addToCalendar': 'క్యాలెండర్‌కు జోడించండి',
  'sched.note': 'పంట చికిత్స కోసం స్ప్రే రిమైండర్',
  'res.expertTitle': 'నిపుణుల సలహా కావాలా?', 'res.expertSub': 'ఉచిత వ్యవసాయ హెల్ప్‌లైన్ 24/7 అందుబాటులో ఉంది',
  'res.kcc': 'కిసాన్ కాల్ సెంటర్', 'res.kccToll': 'KCC టోల్ ఫ్రీ', 'res.listen': 'వినండి', 'res.stop': 'ఆపండి',
  'res.chatTitle': 'AgriAIని అడగండి', 'res.chatText': 'వ్యవసాయం గురించి ఏదైనా ప్రశ్న అడగండి — పురుగుమందులు, నీటిపారుదల, మార్కెట్ ధరలు లేదా',
  'res.thisDisease': 'ఈ వ్యాధి గురించి', 'res.chatPlaceholder': 'వ్యవసాయ ప్రశ్న అడగండి...', 'res.send': 'పంపండి',
  'res.chatErr': 'క్షమించండి, సమాధానం పొందలేకపోయాము. లోపం: ', 'res.cached': 'సేవ్ చేసిన డేటా నుంచి లోడ్ చేయబడింది — ఇంటర్నెట్ ఉపయోగించలేదు',
  'hist.title': 'స్కాన్ చరిత్ర', 'hist.empty': 'ఇంకా స్కాన్‌లు సేవ్ కాలేదు. మీ నిర్ధారణలు ఇక్కడ కనిపిస్తాయి.',
  'hist.clear': 'అన్నీ తొలగించండి', 'hist.open': 'నివేదికను తెరవండి', 'hist.back': 'వెనుకకు',
};

const KN: Dict = {
  'nav.history': 'ಇತಿಹಾಸ', 'nav.home': 'ಮುಖಪುಟ',
  'home.subtitle': 'ತಕ್ಷಣದ AI ಆಧಾರಿತ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಬೆಳೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ತೆಗೆದುಕೊಳ್ಳಿ.',
  'home.m1v': '1 ಫೋಟೋ', 'home.m1l': 'ಅಪ್‌ಲೋಡ್ ಅಥವಾ ಕ್ಯಾಪ್ಚರ್',
  'home.m2v': 'ವೇಗವಾದ', 'home.m2l': 'ಕ್ಲೌಡ್ ವಿಶ್ಲೇಷಣೆ', 'home.m3v': 'ಸ್ಪಷ್ಟ', 'home.m3l': 'ಉಪಯುಕ್ತ ಫಲಿತಾಂಶ',
  'home.imageInput': 'ಚಿತ್ರ ಇನ್‌ಪುಟ್', 'home.imageHint': 'ಸ್ವಚ್ಛವಾದ, ಉತ್ತಮ ಬೆಳಕಿನ ಬೆಳೆಯ ಫೋಟೋವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  'home.ready': 'ಸಿದ್ಧ', 'home.noImage': 'ಯಾವುದೇ ಚಿತ್ರ ಆಯ್ಕೆಯಾಗಿಲ್ಲ',
  'home.noImageText': 'ರೋಗನಿರ್ಣಯ ಪ್ರಾರಂಭಿಸಲು ಹೊಸ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ.',
  'home.capture': 'ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ', 'home.captureSub': 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ',
  'home.gallery': 'ಗ್ಯಾಲರಿ', 'home.gallerySub': 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ',
  'home.run': 'ವಿಶ್ಲೇಷಿಸಿ', 'home.analyzing': 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
  'home.errPick': 'ವಿಶ್ಲೇಷಣೆ ನಡೆಸುವ ಮೊದಲು ಚಿತ್ರವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ.', 'home.errNet': 'ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  'res.back': 'ಹಿಂದಕ್ಕೆ', 'res.title': 'ರೋಗನಿರ್ಣಯ ವರದಿ', 'res.share': 'ಹಂಚಿಕೊಳ್ಳಿ', 'res.copied': 'ವರದಿ ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ',
  'res.tabInfo': 'ರೋಗದ ಮಾಹಿತಿ', 'res.tabChat': 'AIಗೆ ಕೇಳಿ', 'res.loading': 'ರೋಗದ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
  'res.couldNotLoad': 'ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ', 'res.retry': 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  'res.crop': 'ಬೆಳೆ', 'res.confidence': 'ವಿಶ್ವಾಸಾರ್ಹತೆ', 'res.healthScore': 'ಆರೋಗ್ಯ ಸ್ಕೋರ್', 'res.severity': 'ತೀವ್ರತೆ',
  'res.urgency': 'ಚಿಕಿತ್ಸೆಯ ತುರ್ತು', 'res.economic': 'ಆರ್ಥಿಕ ಪರಿಣಾಮ', 'res.pestTitle': 'ಕೀಟನಾಶಕ ಚಿಕಿತ್ಸೆಗಳು',
  'res.pestSub': 'ಪೂರ್ಣ ವಿವರಗಳು ಮತ್ತು ಬಳಸುವ ವಿಧಾನ ನೋಡಲು ಯಾವುದೇ ಕೀಟನಾಶಕವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ',
  'res.expandAll': 'ಎಲ್ಲವನ್ನೂ ತೆರೆಯಿರಿ', 'res.collapseAll': 'ಎಲ್ಲವನ್ನೂ ಮುಚ್ಚಿರಿ', 'res.dosage': 'ಪ್ರಮಾಣ', 'res.frequency': 'ಆವರ್ತನೆ',
  'res.steps': 'ಹಂತ ಹಂತದ ಬಳಕೆ', 'res.nonPest': 'ಕೀಟನಾಶಕವಲ್ಲದ ವಿಧಾನಗಳು', 'res.prevention': 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು',
  'res.phi': 'ಇದರ ನಂತರ ಕೊಯ್ಲು ಸುರಕ್ಷಿತ', 'res.reentry': 'ಇದರ ನಂತರ ಹೊಲಕ್ಕೆ ಪ್ರವೇಶಿಸಿ',
  'calc.title': 'ಪ್ರಮಾಣ ಕ್ಯಾಲ್ಕುಲೇಟರ್', 'calc.tankSize': 'ಸ್ಪ್ರೇಯರ್ ಟ್ಯಾಂಕ್ (ಲೀಟರ್)', 'calc.numTanks': 'ಟ್ಯಾಂಕ್‌ಗಳ ಸಂಖ್ಯೆ',
  'calc.area': 'ವಿಸ್ತೀರ್ಣ', 'calc.acres': 'ಎಕರೆ', 'calc.hectares': 'ಹೆಕ್ಟೇರ್', 'calc.plants': 'ಸಸ್ಯಗಳ ಸಂಖ್ಯೆ',
  'calc.youNeed': 'ನಿಮಗೆ ಬೇಕಾಗಿರುವುದು', 'calc.basedOn': 'ಇದರ ಆಧಾರದ ಮೇಲೆ',
  'sched.title': 'ಸಿಂಪಡಣೆ ವೇಳಾಪಟ್ಟಿ', 'sched.every': 'ಪ್ರತಿ', 'sched.days': 'ದಿನಗಳಿಗೊಮ್ಮೆ ಸಿಂಪಡಿಸಿ',
  'sched.startDate': 'ಮೊದಲ ಸಿಂಪಡಣೆ', 'sched.applications': 'ಸಿಂಪಡಣೆಗಳ ಸಂಖ್ಯೆ', 'sched.addToCalendar': 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ',
  'sched.note': 'ಬೆಳೆ ಚಿಕಿತ್ಸೆಗೆ ಸಿಂಪಡಣೆ ನೆನಪಿನ ಸೂಚನೆ',
  'res.expertTitle': 'ತಜ್ಞರ ಸಲಹೆ ಬೇಕೇ?', 'res.expertSub': 'ಉಚಿತ ಕೃಷಿ ಸಹಾಯವಾಣಿ 24/7 ಲಭ್ಯವಿದೆ',
  'res.kcc': 'ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್', 'res.kccToll': 'KCC ಟೋಲ್ ಫ್ರೀ', 'res.listen': 'ಕೇಳಿ', 'res.stop': 'ನಿಲ್ಲಿಸಿ',
  'res.chatTitle': 'AgriAIಗೆ ಕೇಳಿ', 'res.chatText': 'ಕೃಷಿ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ — ಕೀಟನಾಶಕಗಳು, ನೀರಾವರಿ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಅಥವಾ',
  'res.thisDisease': 'ಈ ರೋಗದ ಕುರಿತು', 'res.chatPlaceholder': 'ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ...', 'res.send': 'ಕಳುಹಿಸಿ',
  'res.chatErr': 'ಕ್ಷಮಿಸಿ, ಉತ್ತರ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದೋಷ: ', 'res.cached': 'ಉಳಿಸಿದ ಡೇಟಾದಿಂದ ಲೋಡ್ ಮಾಡಲಾಗಿದೆ — ಇಂಟರ್ನೆಟ್ ಬಳಸಲಾಗಿಲ್ಲ',
  'hist.title': 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ', 'hist.empty': 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ಉಳಿಸಲಾಗಿಲ್ಲ. ನಿಮ್ಮ ರೋಗನಿರ್ಣಯಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
  'hist.clear': 'ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ', 'hist.open': 'ವರದಿ ತೆರೆಯಿರಿ', 'hist.back': 'ಹಿಂದಕ್ಕೆ',
};

const PA: Dict = {
  'nav.history': 'ਇਤਿਹਾਸ', 'nav.home': 'ਹੋਮ',
  'home.subtitle': 'ਤੁਰੰਤ AI-ਅਧਾਰਿਤ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਲਈ ਫਸਲ ਦੀ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ ਜਾਂ ਖਿੱਚੋ।',
  'home.m1v': '1 ਫੋਟੋ', 'home.m1l': 'ਅੱਪਲੋਡ ਜਾਂ ਕੈਪਚਰ',
  'home.m2v': 'ਤੇਜ਼', 'home.m2l': 'ਕਲਾਊਡ ਵਿਸ਼ਲੇਸ਼ਣ', 'home.m3v': 'ਸਪਸ਼ਟ', 'home.m3l': 'ਕਾਰਗਰ ਨਤੀਜਾ',
  'home.imageInput': 'ਤਸਵੀਰ ਇਨਪੁੱਟ', 'home.imageHint': 'ਸਾਫ਼ ਅਤੇ ਚੰਗੀ ਰੌਸ਼ਨੀ ਵਾਲੀ ਫਸਲ ਦੀ ਤਸਵੀਰ ਚੁਣੋ',
  'home.ready': 'ਤਿਆਰ', 'home.noImage': 'ਕੋਈ ਤਸਵੀਰ ਨਹੀਂ ਚੁਣੀ ਗਈ',
  'home.noImageText': 'ਨਿਦਾਨ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਨਵੀਂ ਫੋਟੋ ਖਿੱਚੋ ਜਾਂ ਗੈਲਰੀ ਵਿੱਚੋਂ ਚੁਣੋ।',
  'home.capture': 'ਫੋਟੋ ਖਿੱਚੋ', 'home.captureSub': 'ਕੈਮਰਾ ਖੋਲ੍ਹੋ', 'home.gallery': 'ਗੈਲਰੀ', 'home.gallerySub': 'ਫੋਟੋ ਚੁਣੋ',
  'home.run': 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', 'home.analyzing': 'ਤਸਵੀਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...',
  'home.errPick': 'ਵਿਸ਼ਲੇਸ਼ਣ ਤੋਂ ਪਹਿਲਾਂ ਤਸਵੀਰ ਖਿੱਚੋ ਜਾਂ ਚੁਣੋ.', 'home.errNet': 'ਕਿਰਪਾ ਕਰਕੇ ਇੰਟਰਨੈੱਟ ਜਾਂਚੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  'res.back': 'ਵਾਪਸ', 'res.title': 'ਨਿਦਾਨ ਰਿਪੋਰਟ', 'res.share': 'ਸਾਂਝਾ ਕਰੋ', 'res.copied': 'ਰਿਪੋਰਟ ਕਲਿੱਪਬੋਰਡ ਵਿੱਚ ਕਾਪੀ ਹੋ ਗਈ',
  'res.tabInfo': 'ਬਿਮਾਰੀ ਦੀ ਜਾਣਕਾਰੀ', 'res.tabChat': 'AI ਨੂੰ ਪੁੱਛੋ', 'res.loading': 'ਬਿਮਾਰੀ ਦੇ ਵੇਰਵੇ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
  'res.couldNotLoad': 'ਪੂਰੇ ਵੇਰਵੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ', 'res.retry': 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
  'res.crop': 'ਫਸਲ', 'res.confidence': 'ਭਰੋਸੇਯੋਗਤਾ', 'res.healthScore': 'ਸਿਹਤ ਸਕੋਰ', 'res.severity': 'ਗੰਭੀਰਤਾ',
  'res.urgency': 'ਇਲਾਜ ਦੀ ਤੁਰੰਤਤਾ', 'res.economic': 'ਆਰਥਿਕ ਪ੍ਰਭਾਵ', 'res.pestTitle': 'ਕੀਟਨਾਸ਼ਕ ਇਲਾਜ',
  'res.pestSub': 'ਪੂਰੇ ਵੇਰਵੇ ਅਤੇ ਵਰਤੋਂ ਦਾ ਤਰੀਕਾ ਦੇਖਣ ਲਈ ਕਿਸੇ ਵੀ ਕੀਟਨਾਸ਼ਕ ਨੂੰ ਟੈਪ ਕਰੋ',
  'res.expandAll': 'ਸਾਰੇ ਖੋਲ੍ਹੋ', 'res.collapseAll': 'ਸਾਰੇ ਬੰਦ ਕਰੋ', 'res.dosage': 'ਮਾਤਰਾ', 'res.frequency': 'ਵਾਰਵਾਰਤਾ',
  'res.steps': 'ਕਦਮ-ਦਰ-ਕਦਮ ਵਰਤੋਂ', 'res.nonPest': 'ਕੀਟਨਾਸ਼ਕ ਤੋਂ ਬਿਨਾਂ ਤਰੀਕੇ', 'res.prevention': 'ਬਚਾਅ ਲਈ ਸੁਝਾਅ',
  'res.phi': 'ਇਸ ਤੋਂ ਬਾਅਦ ਵਾਢੀ ਸੁਰੱਖਿਅਤ ਹੈ', 'res.reentry': 'ਇਸ ਤੋਂ ਬਾਅਦ ਖੇਤ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ',
  'calc.title': 'ਮਾਤਰਾ ਕੈਲਕੁਲੇਟਰ', 'calc.tankSize': 'ਸਪਰੇਅ ਟੈਂਕ (ਲੀਟਰ)', 'calc.numTanks': 'ਟੈਂਕਾਂ ਦੀ ਗਿਣਤੀ',
  'calc.area': 'ਖੇਤਰ', 'calc.acres': 'ਏਕੜ', 'calc.hectares': 'ਹੈਕਟੇਅਰ', 'calc.plants': 'ਪੌਦਿਆਂ ਦੀ ਗਿਣਤੀ',
  'calc.youNeed': 'ਤੁਹਾਨੂੰ ਚਾਹੀਦਾ ਹੈ', 'calc.basedOn': 'ਇਸ ਦੇ ਆਧਾਰ ਤੇ',
  'sched.title': 'ਸਪਰੇਅ ਸ਼ਡਿਊਲ', 'sched.every': 'ਹਰ', 'sched.days': 'ਦਿਨਾਂ ਬਾਅਦ ਸਪਰੇਅ',
  'sched.startDate': 'ਪਹਿਲੀ ਸਪਰੇਅ', 'sched.applications': 'ਸਪਰੇਅ ਦੀ ਗਿਣਤੀ', 'sched.addToCalendar': 'ਕੈਲੰਡਰ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ',
  'sched.note': 'ਫਸਲ ਦੇ ਇਲਾਜ ਲਈ ਸਪਰੇਅ ਰਿਮਾਈਂਡਰ',
  'res.expertTitle': 'ਮਾਹਰ ਦੀ ਸਲਾਹ ਚਾਹੀਦੀ ਹੈ?', 'res.expertSub': 'ਮੁਫ਼ਤ ਖੇਤੀਬਾੜੀ ਹੈਲਪਲਾਈਨ 24/7 ਉਪਲਬਧ',
  'res.kcc': 'ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ', 'res.kccToll': 'KCC ਟੋਲ ਫ੍ਰੀ', 'res.listen': 'ਸੁਣੋ', 'res.stop': 'ਰੋਕੋ',
  'res.chatTitle': 'AgriAI ਨੂੰ ਪੁੱਛੋ', 'res.chatText': 'ਖੇਤੀਬਾੜੀ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ — ਕੀਟਨਾਸ਼ਕ, ਸਿੰਚਾਈ, ਮੰਡੀ ਭਾਅ ਜਾਂ',
  'res.thisDisease': 'ਇਸ ਬਿਮਾਰੀ ਬਾਰੇ', 'res.chatPlaceholder': 'ਖੇਤੀਬਾੜੀ ਬਾਰੇ ਸਵਾਲ ਪੁੱਛੋ...', 'res.send': 'ਭੇਜੋ',
  'res.chatErr': 'ਮਾਫ਼ ਕਰਨਾ, ਜਵਾਬ ਨਹੀਂ ਮਿਲ ਸਕਿਆ। ਗਲਤੀ: ', 'res.cached': 'ਸੇਵ ਕੀਤੇ ਡੇਟਾ ਤੋਂ ਲੋਡ ਕੀਤਾ ਗਿਆ — ਇੰਟਰਨੈੱਟ ਨਹੀਂ ਵਰਤਿਆ ਗਿਆ',
  'hist.title': 'ਸਕੈਨ ਇਤਿਹਾਸ', 'hist.empty': 'ਅਜੇ ਕੋਈ ਸਕੈਨ ਸੇਵ ਨਹੀਂ ਹੋਇਆ। ਤੁਹਾਡੇ ਨਿਦਾਨ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ।',
  'hist.clear': 'ਸਭ ਮਿਟਾਓ', 'hist.open': 'ਰਿਪੋਰਟ ਖੋਲ੍ਹੋ', 'hist.back': 'ਵਾਪਸ',
};

const DICTS: Record<string, Dict> = {
  en: EN,
  hi: HI,
  mr: MR,
  gu: GU,
  bn: BN,
  ta: TA,
  te: TE,
  kn: KN,
  pa: PA,
};

const STORAGE_KEY = 'agri_lang';

interface LangCtx {
  lang: string;
  setLang: (code: string) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
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

export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <select
      className={className ?? 'lang-select'}
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          🌐 {l.label}
        </option>
      ))}
    </select>
  );
}
