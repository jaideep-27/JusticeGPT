import axios from 'axios';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different languages and personas
export const VOICE_CONFIGS = {
  'en': {
    'professional': 'pNInz6obpgDQGcFmaJgB', // Adam
    'friendly': '21m00Tcm4TlvDq8ikWAM',    // Rachel
    'authoritative': 'AZnzlk1XvdvUeBnXmlld'  // Domi
  },
  'es': {
    'professional': 'VR6AewLTigWG4xSOukaG', // Arnold
    'friendly': 'pqHfZKP75CvOlQylNhV4'     // Bill
  },
  'fr': {
    'professional': 'ErXwobaYiN019PkySvjV', // Antoni
    'friendly': 'VR6AewLTigWG4xSOukaG'
  },
  'de': {
    'professional': 'ErXwobaYiN019PkySvjV',
    'friendly': 'pNInz6obpgDQGcFmaJgB'
  },
  'pt': {
    'professional': 'yoZ06aMxZJJ28mfd3POQ', // Sam
    'friendly': 'AZnzlk1XvdvUeBnXmlld'
  },
  'hi': {
    'professional': 'pNInz6obpgDQGcFmaJgB',
    'friendly': '21m00Tcm4TlvDq8ikWAM'
  }
};

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
};

export const textToSpeech = async (
  text: string,
  language: string = 'en',
  persona: string = 'professional',
  voiceSettings: VoiceSettings = DEFAULT_VOICE_SETTINGS
): Promise<Blob> => {
  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Get voice ID for language and persona
    const voiceId = VOICE_CONFIGS[language as keyof typeof VOICE_CONFIGS]?.[persona as keyof typeof VOICE_CONFIGS['en']] 
                   || VOICE_CONFIGS.en.professional;

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'blob'
      }
    );

    return response.data;
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error);
    throw new Error('Failed to generate speech. Please try again.');
  }
};

export const getAvailableVoices = async () => {
  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    return response.data.voices;
  } catch (error) {
    console.error('ElevenLabs Voices Error:', error);
    throw new Error('Failed to fetch available voices.');
  }
};

export const playAudio = (audioBlob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Failed to play audio'));
    };
    
    audio.play().catch(reject);
  });
};

// Speech Recognition (using Web Speech API)
export class SpeechRecognition {
  private recognition: any;
  private isListening: boolean = false;

  constructor(language: string = 'en-US') {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    } else {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.getLanguageCode(language);
  }

  private getLanguageCode(language: string): string {
    const languageCodes: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'yo': 'yo-NG'
    };
    return languageCodes[language] || 'en-US';
  }

  public startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}