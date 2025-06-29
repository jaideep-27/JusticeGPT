import axios from 'axios';

const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export interface VideoPersona {
  id: string;
  name: string;
  description: string;
  specialization: string[];
  language: string;
  avatar_url: string;
}

export const LEGAL_PERSONAS: VideoPersona[] = [
  {
    id: 'corporate_lawyer',
    name: 'Sarah Chen',
    description: 'Corporate Law Specialist',
    specialization: ['Corporate Law', 'Business Contracts', 'Mergers & Acquisitions'],
    language: 'en',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
  },
  {
    id: 'family_lawyer',
    name: 'Maria Rodriguez',
    description: 'Family Law Expert',
    specialization: ['Family Law', 'Divorce', 'Child Custody'],
    language: 'es',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
  },
  {
    id: 'criminal_lawyer',
    name: 'James Wilson',
    description: 'Criminal Defense Attorney',
    specialization: ['Criminal Law', 'Defense', 'Civil Rights'],
    language: 'en',
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
  },
  {
    id: 'immigration_lawyer',
    name: 'Priya Patel',
    description: 'Immigration Law Specialist',
    specialization: ['Immigration', 'Visa Applications', 'Citizenship'],
    language: 'hi',
    avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  }
];

export interface VideoGenerationRequest {
  persona_id: string;
  script: string;
  language: string;
  background?: string;
  voice_settings?: {
    speed: number;
    pitch: number;
    emotion: string;
  };
}

export interface VideoGenerationResponse {
  video_id: string;
  status: 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  created_at: string;
}

export const generateLegalVideo = async (request: VideoGenerationRequest): Promise<VideoGenerationResponse> => {
  try {
    if (!TAVUS_API_KEY) {
      // Mock response for development
      return {
        video_id: `mock_${Date.now()}`,
        status: 'completed',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        duration: 30,
        created_at: new Date().toISOString()
      };
    }

    const response = await axios.post(
      `${TAVUS_BASE_URL}/videos`,
      {
        replica_id: request.persona_id,
        script: request.script,
        background: request.background || 'office',
        voice_settings: request.voice_settings || {
          speed: 1.0,
          pitch: 1.0,
          emotion: 'professional'
        }
      },
      {
        headers: {
          'x-api-key': TAVUS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Tavus API Error:', error);
    throw new Error('Failed to generate video. Please try again.');
  }
};

export const getVideoStatus = async (videoId: string): Promise<VideoGenerationResponse> => {
  try {
    if (!TAVUS_API_KEY) {
      // Mock response for development
      return {
        video_id: videoId,
        status: 'completed',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        duration: 30,
        created_at: new Date().toISOString()
      };
    }

    const response = await axios.get(`${TAVUS_BASE_URL}/videos/${videoId}`, {
      headers: {
        'x-api-key': TAVUS_API_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('Tavus Status Error:', error);
    throw new Error('Failed to get video status.');
  }
};

export const getPersonaBySpecialization = (specialization: string): VideoPersona | null => {
  return LEGAL_PERSONAS.find(persona => 
    persona.specialization.some(spec => 
      spec.toLowerCase().includes(specialization.toLowerCase())
    )
  ) || LEGAL_PERSONAS[0]; // Default to first persona
};

export const getPersonaByLanguage = (language: string): VideoPersona[] => {
  return LEGAL_PERSONAS.filter(persona => persona.language === language);
};

export const generateLegalConsultationScript = (
  question: string,
  analysis: string,
  jurisdiction: string,
  language: string
): string => {
  const scripts = {
    en: `Hello! I'm here to help you with your legal question about ${jurisdiction} law.

Based on your inquiry: "${question}"

Here's my analysis: ${analysis}

Please remember that this is general legal information and not specific legal advice. For your particular situation, I recommend consulting with a qualified attorney in ${jurisdiction} who can provide personalized guidance.

Is there anything specific about this analysis you'd like me to clarify?`,

    es: `¡Hola! Estoy aquí para ayudarte con tu pregunta legal sobre las leyes de ${jurisdiction}.

Basado en tu consulta: "${question}"

Aquí está mi análisis: ${analysis}

Por favor recuerda que esta es información legal general y no consejo legal específico. Para tu situación particular, recomiendo consultar con un abogado calificado en ${jurisdiction} que pueda proporcionar orientación personalizada.

¿Hay algo específico sobre este análisis que te gustaría que aclare?`,

    hi: `नमस्ते! मैं ${jurisdiction} कानून के बारे में आपके कानूनी प्रश्न में आपकी सहायता के लिए यहाँ हूँ।

आपकी पूछताछ के आधार पर: "${question}"

यहाँ मेरा विश्लेषण है: ${analysis}

कृपया याद रखें कि यह सामान्य कानूनी जानकारी है और विशिष्ट कानूनी सलाह नहीं है। आपकी विशेष स्थिति के लिए, मैं ${jurisdiction} में एक योग्य वकील से सलाह लेने की सिफारिश करता हूँ जो व्यक्तिगत मार्गदर्शन प्रदान कर सकता है।

क्या इस विश्लेषण के बारे में कुछ विशिष्ट है जिसे आप चाहते हैं कि मैं स्पष्ट करूँ?`
  };

  return scripts[language as keyof typeof scripts] || scripts.en;
};