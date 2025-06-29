import React, { createContext, useContext, useState } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', rtl: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'nav.documents': 'Documents',
    'nav.profile': 'Profile',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Home page
    'home.hero.title': 'AI-Powered Legal Assistant for Everyone',
    'home.hero.subtitle': 'Get instant legal guidance, document analysis, and multilingual support from our advanced AI platform.',
    'home.hero.cta': 'Start Free Consultation',
    'home.features.title': 'Comprehensive Legal Solutions',
    'home.features.subtitle': 'Everything you need for legal assistance in one platform',
    
    // Features
    'features.ai.title': 'Advanced AI Legal Assistant',
    'features.ai.description': 'Powered by cutting-edge AI technology trained on comprehensive legal databases from multiple jurisdictions worldwide.',
    'features.documents.title': 'Intelligent Document Analysis',
    'features.documents.description': 'Upload and analyze contracts, agreements, and legal documents with AI-powered insights and risk assessment.',
    'features.multilingual.title': 'Multilingual Legal Support',
    'features.multilingual.description': 'Access legal assistance in 6+ languages with region-specific expertise and cultural understanding.',
    'features.jurisdiction.title': 'Jurisdiction-Specific Guidance',
    'features.jurisdiction.description': 'Receive legal guidance tailored to your specific location with applicable laws and regulations.',
    'features.voice.title': 'Real-time Voice & Video',
    'features.voice.description': 'Engage with AI legal avatars through voice and video interactions for immersive consultations.',
    'features.blockchain.title': 'Blockchain Document Security',
    'features.blockchain.description': 'Secure document verification and notarization using blockchain technology for legal validity.',
    
    // Footer
    'footer.quicklinks': 'Quick Links',
    'footer.legal': 'Legal',
    'footer.support': 'Support',
    'footer.contact': 'Contact',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    'footer.location': 'Location',
    'footer.copyright': '© 2024 JusticeGPT. All rights reserved.',
    'footer.madewith': 'Built with',
    'footer.forjustice': 'Bolt.new',
    
    // Legal
    'legal.disclaimer': 'This AI provides general legal information only and does not constitute legal advice. Please consult with a qualified attorney for specific legal matters.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
  },
  hi: {
    // Navigation
    'nav.home': 'मुख्य',
    'nav.chat': 'चैट',
    'nav.documents': 'दस्तावेज़',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.pricing': 'मूल्य निर्धारण',
    'nav.login': 'लॉगिन',
    'nav.logout': 'लॉगआउट',
    
    // Home page
    'home.hero.title': 'सभी के लिए AI-संचालित कानूनी सहायक',
    'home.hero.subtitle': 'हमारे उन्नत AI प्लेटफॉर्म से तुरंत कानूनी मार्गदर्शन, दस्तावेज़ विश्लेषण और बहुभाषी सहायता प्राप्त करें।',
    'home.hero.cta': 'मुफ्त परामर्श शुरू करें',
    'home.features.title': 'व्यापक कानूनी समाधान',
    'home.features.subtitle': 'एक मंच में कानूनी सहायता के लिए आवश्यक सब कुछ',
    
    // Features
    'features.ai.title': 'उन्नत AI कानूनी सहायक',
    'features.ai.description': 'दुनिया भर के कई न्यायक्षेत्रों से व्यापक कानूनी डेटाबेस पर प्रशिक्षित अत्याधुनिक AI तकनीक द्वारा संचालित।',
    'features.documents.title': 'बुद्धिमान दस्तावेज़ विश्लेषण',
    'features.documents.description': 'AI-संचालित अंतर्दृष्टि और जोखिम मूल्यांकन के साथ अनुबंध, समझौते और कानूनी दस्तावेज़ अपलोड और विश्लेषण करें।',
    'features.multilingual.title': 'बहुभाषी कानूनी सहायता',
    'features.multilingual.description': 'क्षेत्रीय विशेषज्ञता और सांस्कृतिक समझ के साथ 6+ भाषाओं में कानूनी सहायता प्राप्त करें।',
    'features.jurisdiction.title': 'न्यायक्षेत्र-विशिष्ट मार्गदर्शन',
    'features.jurisdiction.description': 'लागू कानूनों और नियमों के साथ अपने विशिष्ट स्थान के अनुकूल कानूनी मार्गदर्शन प्राप्त करें।',
    'features.voice.title': 'वास्तविक समय आवाज़ और वीडियो',
    'features.voice.description': 'इमर्सिव परामर्श के लिए आवाज़ और वीडियो इंटरैक्शन के माध्यम से AI कानूनी अवतारों के साथ जुड़ें।',
    'features.blockchain.title': 'ब्लॉकचेन दस्तावेज़ सुरक्षा',
    'features.blockchain.description': 'कानूनी वैधता के लिए ब्लॉकचेन तकनीक का उपयोग करके सुरक्षित दस्तावेज़ सत्यापन और नोटरीकरण।',
    
    // Footer
    'footer.quicklinks': 'त्वरित लिंक',
    'footer.legal': 'कानूनी',
    'footer.support': 'सहायता',
    'footer.contact': 'संपर्क',
    'footer.email': 'ईमेल',
    'footer.phone': 'फोन',
    'footer.location': 'स्थान',
    'footer.copyright': '© 2024 JusticeGPT। सभी अधिकार सुरक्षित।',
    'footer.madewith': 'के साथ बनाया गया',
    'footer.forjustice': 'न्याय के लिए',
    
    // Legal
    'legal.disclaimer': 'यह AI केवल सामान्य कानूनी जानकारी प्रदान करता है और यह कानूनी सलाह नहीं है। विशिष्ट कानूनी मामलों के लिए कृपया एक योग्य वकील से परामर्श करें।',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.download': 'डाउनलोड',
    'common.upload': 'अपलोड',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.sort': 'क्रमबद्ध करें',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.chat': 'Chat',
    'nav.documents': 'Documentos',
    'nav.profile': 'Perfil',
    'nav.pricing': 'Preços',
    'nav.login': 'Entrar',
    'nav.logout': 'Sair',
    
    // Home page
    'home.hero.title': 'Assistente Jurídico com IA para Todos',
    'home.hero.subtitle': 'Obtenha orientação jurídica instantânea, análise de documentos e suporte multilíngue da nossa plataforma de IA avançada.',
    'home.hero.cta': 'Iniciar Consulta Gratuita',
    'home.features.title': 'Soluções Jurídicas Abrangentes',
    'home.features.subtitle': 'Tudo que você precisa para assistência jurídica em uma plataforma',
    
    // Features
    'features.ai.title': 'Assistente Jurídico IA Avançado',
    'features.ai.description': 'Alimentado por tecnologia de IA de ponta treinada em bancos de dados jurídicos abrangentes de múltiplas jurisdições mundiais.',
    'features.documents.title': 'Análise Inteligente de Documentos',
    'features.documents.description': 'Carregue e analise contratos, acordos e documentos legais com insights alimentados por IA e avaliação de riscos.',
    'features.multilingual.title': 'Suporte Jurídico Multilíngue',
    'features.multilingual.description': 'Acesse assistência jurídica em mais de 6 idiomas com expertise regional e compreensão cultural.',
    'features.jurisdiction.title': 'Orientação Específica por Jurisdição',
    'features.jurisdiction.description': 'Receba orientação jurídica adaptada à sua localização específica com leis e regulamentos aplicáveis.',
    'features.voice.title': 'Voz e Vídeo em Tempo Real',
    'features.voice.description': 'Interaja com avatares jurídicos de IA através de interações de voz e vídeo para consultas imersivas.',
    'features.blockchain.title': 'Segurança de Documentos Blockchain',
    'features.blockchain.description': 'Verificação segura de documentos e cartório usando tecnologia blockchain para validade legal.',
    
    // Footer
    'footer.quicklinks': 'Links Rápidos',
    'footer.legal': 'Legal',
    'footer.support': 'Suporte',
    'footer.contact': 'Contato',
    'footer.email': 'Email',
    'footer.phone': 'Telefone',
    'footer.location': 'Localização',
    'footer.copyright': '© 2024 JusticeGPT. Todos os direitos reservados.',
    'footer.madewith': 'Feito com',
    'footer.forjustice': 'para a justiça',
    
    // Legal
    'legal.disclaimer': 'Esta IA fornece apenas informações jurídicas gerais e não constitui aconselhamento jurídico. Consulte um advogado qualificado para questões jurídicas específicas.',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.view': 'Visualizar',
    'common.download': 'Baixar',
    'common.upload': 'Carregar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.chat': 'Chat',
    'nav.documents': 'Documents',
    'nav.profile': 'Profil',
    'nav.pricing': 'Tarifs',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    
    // Home page
    'home.hero.title': 'Assistant Juridique IA pour Tous',
    'home.hero.subtitle': 'Obtenez des conseils juridiques instantanés, une analyse de documents et un support multilingue de notre plateforme IA avancée.',
    'home.hero.cta': 'Commencer la Consultation Gratuite',
    'home.features.title': 'Solutions Juridiques Complètes',
    'home.features.subtitle': 'Tout ce dont vous avez besoin pour l\'assistance juridique sur une plateforme',
    
    // Features
    'features.ai.title': 'Assistant Juridique IA Avancé',
    'features.ai.description': 'Alimenté par une technologie IA de pointe formée sur des bases de données juridiques complètes de multiples juridictions mondiales.',
    'features.documents.title': 'Analyse Intelligente de Documents',
    'features.documents.description': 'Téléchargez et analysez des contrats, accords et documents légaux avec des insights alimentés par IA et évaluation des risques.',
    'features.multilingual.title': 'Support Juridique Multilingue',
    'features.multilingual.description': 'Accédez à l\'assistance juridique dans plus de 6 langues avec expertise régionale et compréhension culturelle.',
    'features.jurisdiction.title': 'Guidance Spécifique par Juridiction',
    'features.jurisdiction.description': 'Recevez des conseils juridiques adaptés à votre localisation spécifique avec les lois et règlements applicables.',
    'features.voice.title': 'Voix et Vidéo en Temps Réel',
    'features.voice.description': 'Interagissez avec des avatars juridiques IA à travers des interactions vocales et vidéo pour des consultations immersives.',
    'features.blockchain.title': 'Sécurité de Documents Blockchain',
    'features.blockchain.description': 'Vérification sécurisée de documents et notarisation utilisant la technologie blockchain pour la validité légale.',
    
    // Footer
    'footer.quicklinks': 'Liens Rapides',
    'footer.legal': 'Légal',
    'footer.support': 'Support',
    'footer.contact': 'Contact',
    'footer.email': 'Email',
    'footer.phone': 'Téléphone',
    'footer.location': 'Localisation',
    'footer.copyright': '© 2024 JusticeGPT. Tous droits réservés.',
    'footer.madewith': 'Fait avec',
    'footer.forjustice': 'pour la justice',
    
    // Legal
    'legal.disclaimer': 'Cette IA fournit uniquement des informations juridiques générales et ne constitue pas un conseil juridique. Veuillez consulter un avocat qualifié pour des questions juridiques spécifiques.',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.upload': 'Charger',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
  },
  yo: {
    // Navigation
    'nav.home': 'Ile',
    'nav.chat': 'Ibaraẹnisọrọ',
    'nav.documents': 'Awọn iwe',
    'nav.profile': 'Profaili',
    'nav.pricing': 'Idiyele',
    'nav.login': 'Wọle',
    'nav.logout': 'Jade',
    
    // Home page
    'home.hero.title': 'Iranṣẹ Ofin ti AI fun Gbogbo Eniyan',
    'home.hero.subtitle': 'Gba itọnisọna ofin lẹsẹkẹsẹ, itupalẹ iwe ati atilẹyin ede pupọ lati ọdọ pẹpẹ AI to ti ni ilọsiwaju.',
    'home.hero.cta': 'Bẹrẹ Ibaraẹnisọrọ Ọfẹ',
    'home.features.title': 'Awọn Ojutu Ofin to Ni Kikun',
    'home.features.subtitle': 'Gbogbo ohun ti o nilo fun iranṣẹ ofin ni ẹyọkan',
    
    // Features
    'features.ai.title': 'Iranṣẹ Ofin AI to Ni Ilọsiwaju',
    'features.ai.description': 'Ti a fi agbara AI to ni ilọsiwaju ti a kọ lori awọn data ofin to ni kikun lati awọn agbegbe ofin ni agbaye.',
    'features.documents.title': 'Itupalẹ Iwe to Ni Ọgbọn',
    'features.documents.description': 'Gbe ati ṣe itupalẹ awọn adehun, adehun ati awọn iwe ofin pẹlu awọn oye AI ati igbelewọn ewu.',
    'features.multilingual.title': 'Atilẹyin Ofin Ede Pupọ',
    'features.multilingual.description': 'Wọle si iranṣẹ ofin ni ede 6+ pẹlu imọ agbegbe ati oye aṣa.',
    'features.jurisdiction.title': 'Itọnisọna Pato fun Agbegbe',
    'features.jurisdiction.description': 'Gba itọnisọna ofin ti a ṣe fun ibi pato rẹ pẹlu awọn ofin ati ilana ti o wulo.',
    'features.voice.title': 'Ohun ati Fidio Akoko Gidi',
    'features.voice.description': 'Ṣe ajọṣepọ pẹlu awọn avatar ofin AI nipasẹ awọn ibaraẹnisọrọ ohun ati fidio fun awọn ibaraẹnisọrọ immersive.',
    'features.blockchain.title': 'Aabo Iwe Blockchain',
    'features.blockchain.description': 'Ijẹrisi iwe to ni aabo ati notarization nipa lilo imọ-ẹrọ blockchain fun otitọ ofin.',
    
    // Footer
    'footer.quicklinks': 'Awọn Ọna Iyara',
    'footer.legal': 'Ofin',
    'footer.support': 'Atilẹyin',
    'footer.contact': 'Olubasọrọ',
    'footer.email': 'Imeeli',
    'footer.phone': 'Foonu',
    'footer.location': 'Ipo',
    'footer.copyright': '© 2024 JusticeGPT. Gbogbo ẹtọ ni a daabobo.',
    'footer.madewith': 'Ti a ṣe pẹlu',
    'footer.forjustice': 'fun idajọ',
    
    // Legal
    'legal.disclaimer': 'AI yii n pese alaye ofin gbogbogbo nikan ko si iye si imọran ofin. Jọwọ ba agbẹjọro ti o ni ẹtọ sọrọ fun awọn ọrọ ofin pato.',
    
    // Common
    'common.loading': 'N gbe...',
    'common.error': 'Aṣiṣe',
    'common.success': 'Aṣeyọri',
    'common.cancel': 'Fagilee',
    'common.save': 'Fipamọ',
    'common.delete': 'Paarẹ',
    'common.edit': 'Ṣatunkọ',
    'common.view': 'Wo',
    'common.download': 'Gba',
    'common.upload': 'Gbe soke',
    'common.search': 'Wa',
    'common.filter': 'Ṣe ayẹwo',
    'common.sort': 'Ṣeto',
  },
  te: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.chat': 'చాట్',
    'nav.documents': 'పత్రాలు',
    'nav.profile': 'ప్రొఫైల్',
    'nav.pricing': 'ధర',
    'nav.login': 'లాగిన్',
    'nav.logout': 'లాగౌట్',
    
    // Home page
    'home.hero.title': 'అందరికోసం AI-ఆధారిత న్యాయ సహాయకుడు',
    'home.hero.subtitle': 'మా అధునాతన AI ప్లాట్‌ఫారమ్ నుండి తక్షణ న్యాయ మార్గదర్శనం, పత్రాల విశ్లేషణ మరియు బహుభాషా మద్దతు పొందండి.',
    'home.hero.cta': 'ఉచిత సంప్రదింపులను ప్రారంభించండి',
    'home.features.title': 'సమగ్ర న్యాయ పరిష్కారాలు',
    'home.features.subtitle': 'ఒకే ప్లాట్‌ఫారమ్‌లో న్యాయ సహాయం కోసం అవసరమైన ప్రతిదీ',
    
    // Features
    'features.ai.title': 'అధునాతన AI న్యాయ సహాయకుడు',
    'features.ai.description': 'ప్రపంచవ్యాప్తంగా అనేక న్యాయ పరిధుల నుండి సమగ్ర న్యాయ డేటాబేస్‌లపై శిక్షణ పొందిన అత్యాధునిక AI సాంకేతికతతో శక్తివంతం.',
    'features.documents.title': 'తెలివైన పత్రాల విశ్లేషణ',
    'features.documents.description': 'AI-శక్తితో కూడిన అంతర్దృష్టులు మరియు రిస్క్ అసెస్‌మెంట్‌తో ఒప్పందాలు, ఒప్పందాలు మరియు న్యాయ పత్రాలను అప్‌లోడ్ చేసి విశ్లేషించండి.',
    'features.multilingual.title': 'బహుభాషా న్యాయ మద్దతు',
    'features.multilingual.description': 'ప్రాంతీయ నైపుణ్యం మరియు సాంస్కృతిక అవగాహనతో 6+ భాషలలో న్యాయ సహాయాన్ని పొందండి.',
    'features.jurisdiction.title': 'న్యాయ పరిధి-నిర్దిష్ట మార్గదర్శకత్వం',
    'features.jurisdiction.description': 'వర్తించే చట్టాలు మరియు నిబంధనలతో మీ నిర్దిష్ట స్థానానికి అనుకూలమైన న్యాయ మార్గదర్శకత్వాన్ని పొందండి.',
    'features.voice.title': 'రియల్-టైమ్ వాయిస్ & వీడియో',
    'features.voice.description': 'ఇమ్మర్సివ్ కన్సల్టేషన్‌ల కోసం వాయిస్ మరియు వీడియో ఇంటరాక్షన్‌ల ద్వారా AI న్యాయ అవతార్‌లతో నిమగ్నమవ్వండి.',
    'features.blockchain.title': 'బ్లాక్‌చెయిన్ పత్రాల భద్రత',
    'features.blockchain.description': 'న్యాయ చెల్లుబాటు కోసం బ్లాక్‌చెయిన్ సాంకేతికతను ఉపయోగించి సురక్షిత పత్రాల ధృవీకరణ మరియు నోటరీకరణ.',
    
    // Footer
    'footer.quicklinks': 'త్వరిత లింక్‌లు',
    'footer.legal': 'న్యాయపరమైన',
    'footer.support': 'మద్దతు',
    'footer.contact': 'సంప్రదించండి',
    'footer.email': 'ఇమెయిల్',
    'footer.phone': 'ఫోన్',
    'footer.location': 'స్థానం',
    'footer.copyright': '© 2024 JusticeGPT. అన్ని హక్కులు రక్షించబడ్డాయి.',
    'footer.madewith': 'తో తయారు చేయబడింది',
    'footer.forjustice': 'న్యాయం కోసం',
    
    // Legal
    'legal.disclaimer': 'ఈ AI సాధారణ న్యాయ సమాచారాన్ని మాత్రమే అందిస్తుంది మరియు న్యాయ సలహాను కలిగి ఉండదు. నిర్దిష్ట న్యాయ విషయాల కోసం దయచేసి అర్హత కలిగిన న్యాయవాదిని సంప్రదించండి.',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
    'common.cancel': 'రద్దు చేయండి',
    'common.save': 'సేవ్ చేయండి',
    'common.delete': 'తొలగించండి',
    'common.edit': 'సవరించండి',
    'common.view': 'చూడండి',
    'common.download': 'డౌన్‌లోడ్',
    'common.upload': 'అప్‌లోడ్',
    'common.search': 'వెతకండి',
    'common.filter': 'ఫిల్టర్',
    'common.sort': 'క్రమబద్ధీకరించండి',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(supportedLanguages[0]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
    
    // Save language preference
    localStorage.setItem('justicegpt_language', language.code);
  };

  // Load saved language preference on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('justicegpt_language');
    if (savedLanguage) {
      const language = supportedLanguages.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
        document.documentElement.lang = language.code;
        document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
      }
    }
  }, []);

  const translate = (key: string): string => {
    return translations[currentLanguage.code]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}