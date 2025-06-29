import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Maximize,
  Minimize
} from 'lucide-react';
import { generateLegalVideo, getVideoStatus, LEGAL_PERSONAS } from '../lib/tavus';
import { useAI } from '../hooks/useAI';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface VideoConsultationProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  jurisdiction: string;
  language: string;
}

export default function VideoConsultation({ 
  isOpen, 
  onClose, 
  initialQuestion = '',
  jurisdiction,
  language 
}: VideoConsultationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(LEGAL_PERSONAS[0]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState(initialQuestion);

  const { generateResponse } = useAI();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && initialQuestion) {
      handleSendMessage();
    }
  }, [isOpen, initialQuestion]);

  const startConsultation = async () => {
    if (!user) {
      toast.error('Please log in to start a video consultation');
      return;
    }

    setIsConnected(true);
    
    // Start user's camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      });
      
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access camera/microphone:', error);
      toast.error('Failed to access camera or microphone');
    }

    // Generate initial AI video response
    if (initialQuestion) {
      await generateAIVideoResponse(initialQuestion);
    }
  };

  const endConsultation = () => {
    setIsConnected(false);
    
    // Stop user's camera
    if (userVideoRef.current?.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    onClose();
  };

  const generateAIVideoResponse = async (message: string) => {
    setIsGeneratingVideo(true);
    try {
      // Generate text response first
      const aiResponse = await generateResponse(message, jurisdiction, language, chatMessages);
      
      // Add to chat
      const newMessages = [
        ...chatMessages,
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: aiResponse.text, timestamp: new Date() }
      ];
      setChatMessages(newMessages);

      // Generate video response
      const videoResult = await generateLegalVideo({
        persona_id: selectedPersona.id,
        script: aiResponse.text,
        language,
        background: 'office',
        voice_settings: {
          speed: 1.0,
          pitch: 1.0,
          emotion: 'professional'
        }
      });

      if (videoResult.video_url) {
        setCurrentVideoUrl(videoResult.video_url);
        
        // Play the video
        if (videoRef.current) {
          videoRef.current.src = videoResult.video_url;
          videoRef.current.play();
        }
      }

    } catch (error) {
      console.error('Failed to generate AI video response:', error);
      toast.error('Failed to generate video response');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected) return;

    await generateAIVideoResponse(inputMessage);
    setInputMessage('');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    if (userVideoRef.current?.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    
    if (userVideoRef.current?.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-neutral-900 rounded-xl overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-5/6'
          }`}
        >
          {/* Header */}
          <div className="bg-neutral-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              
              <select
                value={selectedPersona.id}
                onChange={(e) => {
                  const persona = LEGAL_PERSONAS.find(p => p.id === e.target.value);
                  if (persona) setSelectedPersona(persona);
                }}
                className="bg-neutral-700 text-white px-3 py-1 rounded-lg text-sm"
                disabled={isConnected}
              >
                {LEGAL_PERSONAS.map(persona => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} - {persona.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex h-full">
            {/* Video Area */}
            <div className="flex-1 relative bg-black">
              {/* AI Lawyer Video */}
              <div className="relative w-full h-full">
                {currentVideoUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    controls={false}
                    autoPlay
                    muted={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <img
                        src={selectedPersona.avatar_url}
                        alt={selectedPersona.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold mb-2">{selectedPersona.name}</h3>
                      <p className="text-neutral-400 mb-4">{selectedPersona.description}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {selectedPersona.specialization.map(spec => (
                          <span
                            key={spec}
                            className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isGeneratingVideo && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p>Generating AI response...</p>
                    </div>
                  </div>
                )}

                {/* User Video (Picture-in-Picture) */}
                <div className="absolute bottom-4 right-4 w-48 h-36 bg-neutral-800 rounded-lg overflow-hidden">
                  {isVideoEnabled ? (
                    <video
                      ref={userVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <VideoOff className="w-8 h-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-neutral-800 bg-opacity-90 px-6 py-3 rounded-full">
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled 
                      ? 'bg-neutral-700 text-white hover:bg-neutral-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled 
                      ? 'bg-neutral-700 text-white hover:bg-neutral-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {!isConnected ? (
                  <button
                    onClick={startConsultation}
                    className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Start Consultation</span>
                  </button>
                ) : (
                  <button
                    onClick={endConsultation}
                    className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>End Call</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 bg-neutral-800 flex flex-col">
              <div className="p-4 border-b border-neutral-700">
                <h3 className="text-white font-semibold flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-700 text-neutral-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-neutral-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your legal question..."
                    className="flex-1 px-3 py-2 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}