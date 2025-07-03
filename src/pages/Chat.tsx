import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  FileText,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Video,
  Loader,
  Zap,
  Globe,
  Shield,
  Trash2,
  RefreshCw,
  Menu,
  X,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAI } from '../hooks/useAI';
import { useSubscription } from '../hooks/useSubscription';
import { useScrollToTopFunction } from '../hooks/useScrollToTop';
import { SpeechRecognition } from '../lib/elevenlabs';
import VideoConsultation from '../components/VideoConsultation';
import { detectUserLocation } from '../lib/location';
import { supabase, saveChatSession, updateChatSession, isSupabaseConfigured } from '../lib/supabase';
import { isGeminiConfigured } from '../lib/gemini';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; size: string; type: string; content?: string }[];
  audioUrl?: string;
  videoUrl?: string;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

// Component to format AI responses with proper markdown-like formatting
const FormattedMessage = ({ content }: { content: string }) => {
  const formatContent = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle different types of content
      if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
        // Bold headers
        const headerText = paragraph.replace(/\*\*/g, '');
        return (
          <h3 key={index} className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 mt-4 first:mt-0">
            {headerText}
          </h3>
        );
      } else if (paragraph.includes('**')) {
        // Inline bold text
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-3 leading-relaxed">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} className="font-semibold text-neutral-900 dark:text-white">
                    {part.replace(/\*\*/g, '')}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      } else if (paragraph.includes('•') || paragraph.includes('-')) {
        // List items
        const lines = paragraph.split('\n');
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
            {lines.map((line, lineIndex) => {
              const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
              if (cleanLine) {
                return (
                  <li key={lineIndex} className="leading-relaxed">
                    {cleanLine}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        );
      } else if (paragraph.includes('✅') || paragraph.includes('⚠️') || paragraph.includes('❌')) {
        // Status items with emojis
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="space-y-2 mb-4">
            {lines.map((line, lineIndex) => {
              if (line.trim()) {
                return (
                  <div key={lineIndex} className="flex items-start space-x-2 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5">
                      {line.includes('✅') && '✅'}
                      {line.includes('⚠️') && '⚠️'}
                      {line.includes('❌') && '❌'}
                    </span>
                    <span>{line.replace(/[✅⚠️❌]\s*/, '')}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      } else if (paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*')) {
        // Italic disclaimer text
        const italicText = paragraph.replace(/\*/g, '');
        return (
          <p key={index} className="text-sm italic text-neutral-500 dark:text-neutral-400 mb-3 p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
            {italicText}
          </p>
        );
      } else {
        // Regular paragraphs
        return (
          <p key={index} className="mb-3 leading-relaxed">
            {paragraph}
          </p>
        );
      }
    });
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {formatContent(content)}
    </div>
  );
};

export default function Chat() {
  const { user } = useAuth();
  const { translate, currentLanguage } = useLanguage();
  const { generateResponse, analyzeDocument, isLoading, isGeneratingAudio, isGeneratingVideo } = useAI();
  const { subscription, checkUsageLimit, getUsagePercentage } = useSubscription();
  const { scrollToTop } = useScrollToTopFunction();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [showVideoConsultation, setShowVideoConsultation] = useState(false);
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    scrollToTop();
  }, []);

  // Initialize chat session and detect location
  useEffect(() => {
    if (user) {
      initializeChat();
      detectLocation();
      loadChatSessions();
    }
  }, [user]);

  // Initialize speech recognition
  useEffect(() => {
    try {
      const recognition = new SpeechRecognition(currentLanguage.code);
      setSpeechRecognition(recognition);
    } catch (error) {
      console.error('Speech recognition not supported:', error);
    }
  }, [currentLanguage]);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToTop(!isNearBottom && scrollTop > 300);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadChatSessions = () => {
    // Load from localStorage for demo
    const savedSessions = localStorage.getItem(`chat_sessions_${user?.id}`);
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setChatSessions(sessions);
    }
  };

  const saveChatSessions = (sessions: ChatSession[]) => {
    localStorage.setItem(`chat_sessions_${user?.id}`, JSON.stringify(sessions));
  };

  const createNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      timestamp: new Date()
    };
    
    const updatedSessions = [newSession, ...chatSessions];
    setChatSessions(updatedSessions);
    saveChatSessions(updatedSessions);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    // Add welcome message with user's jurisdiction
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: `Hello ${user?.name}! I'm your AI legal assistant. I can help you with legal questions, document analysis, and provide guidance based on your jurisdiction.

**Current Plan:** ${subscription?.tierId || user?.plan || 'Free'}
**Jurisdiction:** ${user?.jurisdiction || jurisdiction}
**Language:** ${currentLanguage.nativeName}
**AI Service:** ${isGeminiConfigured() ? 'Gemini AI ✅' : 'Not Configured ❌'}

How can I assist you today?

*Please note: I provide general legal information and should not be considered as legal advice. For specific legal matters, please consult with a qualified attorney.*`,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    newSession.messages = [welcomeMessage];
    newSession.title = 'Legal Consultation';
    
    const finalSessions = [newSession, ...chatSessions];
    setChatSessions(finalSessions);
    saveChatSessions(finalSessions);
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowSidebar(false); // Close sidebar on mobile after selection
      // Scroll to top when loading a new session
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
        }
      }, 100);
    }
  };

  const deleteChatSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    saveChatSessions(updatedSessions);
    
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        loadChatSession(updatedSessions[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    if (!currentSessionId) return;
    
    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        const title = newMessages.length > 1 ? 
          newMessages[1].content.substring(0, 50) + '...' : 
          'New Chat';
        return {
          ...session,
          messages: newMessages,
          title,
          timestamp: new Date()
        };
      }
      return session;
    });
    
    setChatSessions(updatedSessions);
    saveChatSessions(updatedSessions);
  };

  const initializeChat = async () => {
    if (!user) return;

    // Create initial chat if none exists
    if (chatSessions.length === 0) {
      createNewChat();
    }
  };

  const detectLocation = async () => {
    try {
      // Pass the user's jurisdiction preference to prioritize it
      const location = await detectUserLocation(user?.jurisdiction);
      setJurisdiction(location.jurisdiction);
    } catch (error) {
      console.warn('Failed to detect location, using user jurisdiction or default:', error);
      // Fallback to user's jurisdiction or default
      setJurisdiction(user?.jurisdiction || 'United States');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollMessagesToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    // Check if AI service is configured
    if (!isGeminiConfigured()) {
      toast.error('AI service is not configured. Please check your API keys.');
      return;
    }

    // Check usage limits (skip for local development)
    if (user.plan === 'free' && !user.id.startsWith('local_')) {
      const canUseAI = await checkUsageLimit('aiConsultations');
      if (!canUseAI) {
        toast.error('AI consultation limit reached. Please upgrade your plan.');
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Generate AI response with optional audio/video
      const aiResponse = await generateResponse(
        inputMessage,
        user?.jurisdiction || jurisdiction,
        currentLanguage.code,
        messages.slice(-10), // Last 10 messages for context
        includeAudio,
        includeVideo
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.text,
        timestamp: new Date(),
        audioUrl: aiResponse.audioUrl,
        videoUrl: aiResponse.videoUrl
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);

    } catch (error) {
      console.error('Failed to generate response:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };
      
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    const file = files[0];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Check if AI service is configured
    if (!isGeminiConfigured()) {
      toast.error('AI service is not configured. Please check your API keys.');
      return;
    }

    try {
      // Read file content
      const fileContent = await readFileContent(file);
      
      const attachment = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type || 'Unknown',
        content: fileContent
      };

      const messageWithAttachment: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `I've uploaded a document for analysis: ${file.name}`,
        timestamp: new Date(),
        attachments: [attachment],
      };

      const newMessages = [...messages, messageWithAttachment];
      setMessages(newMessages);
      setIsTyping(true);

      // Analyze document
      const analysis = await analyzeDocument(
        fileContent,
        user?.jurisdiction || jurisdiction,
        currentLanguage.code,
        file.type
      );

      const analysisResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I've analyzed your document "${file.name}". Here's my assessment:

**Document Analysis Summary:**
${analysis.summary}

**Key Legal Points:**
${analysis.keyPoints.map(point => `• ${point}`).join('\n')}

**Potential Risks:**
${analysis.risks.map(risk => `⚠️ ${risk}`).join('\n')}

**Recommendations:**
${analysis.recommendations.map(rec => `✅ ${rec}`).join('\n')}

**Compliance Assessment (${analysis.compliance.jurisdiction}):**
${analysis.compliance.compliant ? '✅ Appears compliant' : '❌ Potential compliance issues'}
${analysis.compliance.issues.length > 0 ? '\n\nIssues identified:\n' + analysis.compliance.issues.map(issue => `• ${issue}`).join('\n') : ''}

**Confidence Level:** ${analysis.confidence}%

*Note: This is an AI analysis for informational purposes only. For legal document review, please consult with a qualified attorney.*`,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, analysisResponse];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);

    } catch (error) {
      console.error('Document analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze document');
    } finally {
      setIsTyping(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      reader.readAsText(file);
    });
  };

  const toggleRecording = async () => {
    if (!speechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      speechRecognition.stopListening();
      setIsRecording(false);
    } else {
      try {
        setIsRecording(true);
        const transcript = await speechRecognition.startListening();
        setInputMessage(transcript);
        setIsRecording(false);
        toast.success('Speech recognized successfully!');
      } catch (error) {
        console.error('Speech recognition failed:', error);
        toast.error('Speech recognition failed');
        setIsRecording(false);
      }
    }
  };

  const copyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
    toast.success('Message copied to clipboard');
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
      toast.error('Failed to play audio');
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center space-y-4">
          <Bot className="w-16 h-16 text-primary-500 mx-auto" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Please log in to access the AI legal assistant
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Sign in to start getting personalized legal guidance and document analysis.
          </p>
        </div>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage('aiConsultations');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-16">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-80' : 'w-0'} lg:w-80 transition-all duration-300 overflow-hidden bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700`}>
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <button
              onClick={createNewChat}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
          
          <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                onClick={() => loadChatSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {session.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    JusticeGPT Assistant
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{user?.jurisdiction || jurisdiction}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>{subscription?.tierId || user.plan || 'Free'} Plan</span>
                    </div>
                    {!isSupabaseConfigured() && (
                      <div className="flex items-center space-x-1 text-warning-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Local Mode</span>
                      </div>
                    )}
                    {!isGeminiConfigured() && (
                      <div className="flex items-center space-x-1 text-error-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span>AI Not Configured</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Usage Indicator */}
                {(subscription?.tierId === 'free' || user.plan === 'free') && !user.id.startsWith('local_') && (
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      AI Usage: {Math.round(usagePercentage)}%
                    </div>
                    <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Audio Toggle */}
                <button
                  onClick={() => setIncludeAudio(!includeAudio)}
                  className={`p-2 rounded-lg transition-colors ${
                    includeAudio
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                  title="Include audio response"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                {/* Video Toggle */}
                <button
                  onClick={() => setIncludeVideo(!includeVideo)}
                  className={`p-2 rounded-lg transition-colors ${
                    includeVideo
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                  title="Include video response"
                >
                  <Video className="w-5 h-5" />
                </button>

                {/* Video Consultation Button */}
                <button
                  onClick={() => setShowVideoConsultation(true)}
                  className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Video Call</span>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 relative"
          >
            {/* Scroll to Top Button for Messages */}
            <AnimatePresence>
              {showScrollToTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollMessagesToTop}
                  className="fixed top-24 right-8 z-40 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
                  title="Scroll to top of messages"
                >
                  <ArrowUp className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-primary-500'
                        : 'bg-gradient-to-br from-secondary-500 to-primary-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                    }`}>
                      <div className="space-y-3">
                        {message.type === 'user' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap leading-relaxed text-white">
                              {message.content}
                            </p>
                          </div>
                        ) : (
                          <FormattedMessage content={message.content} />
                        )}
                        
                        {message.attachments && (
                          <div className="space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-2"
                              >
                                <FileText className="w-4 h-4 text-neutral-500" />
                                <span className="text-sm font-medium">{attachment.name}</span>
                                <span className="text-xs text-neutral-500">({attachment.size})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Audio Player */}
                        {message.audioUrl && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => playAudio(message.audioUrl!)}
                              className="flex items-center space-x-2 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span className="text-sm">Play Audio</span>
                            </button>
                          </div>
                        )}

                        {/* Video Player */}
                        {message.videoUrl && (
                          <div className="mt-3">
                            <video
                              src={message.videoUrl}
                              controls
                              className="w-full max-w-md rounded-lg"
                              poster="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        
                        {message.type === 'assistant' && (
                          <button
                            onClick={() => copyMessage(message.id, message.content)}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex space-x-3 max-w-4xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      {(isGeneratingAudio || isGeneratingVideo) && (
                        <div className="flex items-center space-x-2 text-xs text-neutral-500">
                          <Loader className="w-3 h-3 animate-spin" />
                          <span>
                            {isGeneratingAudio && isGeneratingVideo ? 'Generating audio & video...' :
                             isGeneratingAudio ? 'Generating audio...' : 'Generating video...'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-warning-50 dark:bg-warning-900/20 border-l-4 border-warning-500 p-4 mx-4 lg:mx-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
              <p className="text-sm text-warning-700 dark:text-warning-400">
                This AI provides general legal information only and does not constitute legal advice. Please consult with a qualified attorney for specific legal matters.
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 lg:p-6">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={isGeminiConfigured() ? "Ask me anything about legal matters..." : "AI service not configured. Please check your API keys."}
                    className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
                    rows={3}
                    disabled={isLoading || !isGeminiConfigured()}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                      title="Upload document"
                      disabled={!isGeminiConfigured()}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleRecording}
                      className={`p-1 transition-colors ${
                        isRecording
                          ? 'text-red-500'
                          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                      }`}
                      title="Voice input"
                      disabled={!isGeminiConfigured()}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !isGeminiConfigured()}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{isLoading ? 'Processing...' : 'Send'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Consultation Modal */}
      <VideoConsultation
        isOpen={showVideoConsultation}
        onClose={() => setShowVideoConsultation(false)}
        initialQuestion={inputMessage}
        jurisdiction={user?.jurisdiction || jurisdiction}
        language={currentLanguage.code}
      />
    </div>
  );
}