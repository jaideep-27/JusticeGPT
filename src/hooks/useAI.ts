import { useState, useCallback } from 'react';
import { generateLegalResponse, analyzeLegalDocument, generateLegalDocument, isGeminiConfigured } from '../lib/gemini';
import { textToSpeech, playAudio } from '../lib/elevenlabs';
import { generateLegalVideo, getVideoStatus } from '../lib/tavus';
import { subscriptionManager } from '../lib/revenuecat';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface AIResponse {
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  confidence: number;
  sources?: string[];
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const { user } = useAuth();

  const generateResponse = useCallback(async (
    message: string,
    jurisdiction: string,
    language: string,
    chatHistory: any[] = [],
    includeAudio: boolean = false,
    includeVideo: boolean = false
  ): Promise<AIResponse> => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      throw new Error('AI service is not configured. Please check your API keys.');
    }

    // Check usage limits (skip for local development)
    if (user.plan === 'free' && !user.id.startsWith('local_')) {
      const canUseAI = await subscriptionManager.checkUsageLimit(user.id, 'aiConsultations');
      if (!canUseAI) {
        throw new Error('AI consultation limit reached. Please upgrade your plan.');
      }
    }

    setIsLoading(true);
    try {
      // Generate text response using Gemini
      const textResponse = await generateLegalResponse(message, jurisdiction, language, chatHistory);
      
      // Track usage (skip for local development)
      if (!user.id.startsWith('local_')) {
        await subscriptionManager.trackUsage(user.id, 'aiConsultations');
      }

      const response: AIResponse = {
        text: textResponse,
        confidence: 0.85 // Mock confidence score
      };

      // Generate audio if requested
      if (includeAudio) {
        setIsGeneratingAudio(true);
        try {
          const audioBlob = await textToSpeech(textResponse, language, 'professional');
          response.audioUrl = URL.createObjectURL(audioBlob);
          
          // Track voice usage (skip for local development)
          if (!user.id.startsWith('local_')) {
            const wordCount = textResponse.split(' ').length;
            const estimatedMinutes = Math.ceil(wordCount / 150); // ~150 words per minute
            await subscriptionManager.trackUsage(user.id, 'voiceMinutes', estimatedMinutes);
          }
        } catch (error) {
          console.error('Audio generation failed:', error);
          toast.error('Audio generation failed, but text response is available');
        }
        setIsGeneratingAudio(false);
      }

      // Generate video if requested
      if (includeVideo) {
        setIsGeneratingVideo(true);
        try {
          // Check video limits (skip for local development)
          if (!user.id.startsWith('local_')) {
            const canUseVideo = await subscriptionManager.checkUsageLimit(user.id, 'videoConsultations');
            if (!canUseVideo) {
              toast.error('Video consultation limit reached. Please upgrade your plan.');
            } else {
              const videoResult = await generateLegalVideo({
                persona_id: 'corporate_lawyer',
                script: textResponse,
                language,
                background: 'office'
              });
              
              if (videoResult.status === 'completed') {
                response.videoUrl = videoResult.video_url;
              }
              
              await subscriptionManager.trackUsage(user.id, 'videoConsultations');
            }
          } else {
            // Mock video for local development
            response.videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          }
        } catch (error) {
          console.error('Video generation failed:', error);
          toast.error('Video generation failed, but text response is available');
        }
        setIsGeneratingVideo(false);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const analyzeDocument = useCallback(async (
    content: string,
    jurisdiction: string,
    language: string,
    documentType?: string
  ) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    if (!isGeminiConfigured()) {
      throw new Error('AI service is not configured. Please check your API keys.');
    }

    // Check usage limits (skip for local development)
    if (user.plan === 'free' && !user.id.startsWith('local_')) {
      const canAnalyze = await subscriptionManager.checkUsageLimit(user.id, 'documentAnalysis');
      if (!canAnalyze) {
        throw new Error('Document analysis limit reached. Please upgrade your plan.');
      }
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeLegalDocument({
        content,
        jurisdiction,
        language,
        documentType
      });

      // Track usage (skip for local development)
      if (!user.id.startsWith('local_')) {
        await subscriptionManager.trackUsage(user.id, 'documentAnalysis');
      }
      
      return analysis;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const generateDocument = useCallback(async (
    documentType: string,
    parameters: any,
    jurisdiction: string,
    language: string
  ) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    if (!isGeminiConfigured()) {
      throw new Error('AI service is not configured. Please check your API keys.');
    }

    setIsLoading(true);
    try {
      const document = await generateLegalDocument(documentType, parameters, jurisdiction, language);
      return document;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const playResponseAudio = useCallback(async (audioUrl: string) => {
    try {
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      await playAudio(audioBlob);
    } catch (error) {
      console.error('Audio playback failed:', error);
      toast.error('Failed to play audio');
    }
  }, []);

  return {
    generateResponse,
    analyzeDocument,
    generateDocument,
    playResponseAudio,
    isLoading,
    isGeneratingAudio,
    isGeneratingVideo
  };
};