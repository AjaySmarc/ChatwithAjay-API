import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import GeminiService from '../utils/geminiService';

const VoiceInput = ({ 
  onNewQuestion, 
  setIsLoading, 
  onPauseOrTerminate,
  supportedLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE']
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Browser Compatibility Check
  const isSpeechSupported = useCallback(() => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isSpeechSupported()) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      setError(null);
      setTranscript('');
      setIsListening(true);
      toast.info('Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      handleVoiceSubmit(speechResult);
    };

    recognitionRef.current.onerror = (event) => {
      handleSpeechError(event.error);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      stopAllOperations();
    };
  }, [language, isSpeechSupported]);

  // Error Handling
  const handleSpeechError = useCallback((errorType) => {
    const errorMessages = {
      'no-speech': 'No speech detected. Please speak clearly.',
      'audio-capture': 'Audio capture failed. Check microphone permissions.',
      'not-allowed': 'Microphone access denied. Please allow microphone.',
      'network': 'Network error during speech recognition.',
      'default': 'An unexpected speech recognition error occurred.'
    };

    const message = errorMessages[errorType] || errorMessages['default'];
    setError(message);
    toast.error(message);
    setIsListening(false);
  }, []);

  // Stop All Speech Operations
  const stopAllOperations = useCallback(() => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    setError(null);
  }, []);

  // Voice Submission Handler
  const handleVoiceSubmit = async (question) => {
    if (!question) return;

    setIsLoading(true);
    try {
      const result = await GeminiService.generateAnswer(question);
      
      if (result.success) {
        onNewQuestion(question, result.answer);
        await speakAnswer(result.answer);
      } else {
        toast.error(result.error || "Processing error");
        onNewQuestion(question, result.error || "Processing error");
      }
    } catch (error) {
      toast.error("Network or service error");
      onNewQuestion(question, "Network or service error");
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech 
  const speakAnswer = async (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      synthesisRef.current = utterance;

      setIsSpeaking(true);
      toast.info('Speaking response...');

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (error) => {
        setIsSpeaking(false);
        toast.error('Speech synthesis failed');
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // Start Listening
  const startListening = () => {
    recognitionRef.current?.start();
  };

  // Language Change
  const changeLanguage = useCallback((newLanguage) => {
    if (supportedLanguages.includes(newLanguage)) {
      setLanguage(newLanguage);
      if (recognitionRef.current) {
        recognitionRef.current.lang = newLanguage;
      }
      toast.success(`Language changed to ${newLanguage}`);
    } else {
      toast.error('Unsupported language');
    }
  }, [supportedLanguages]);

  return (
    <div className="flex items-center space-x-2">
      {/* Language Selector */}
      <select 
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="p-2 border rounded-md"
      >
        {supportedLanguages.map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>

      {/* Voice Button */}
      <button
        onClick={isListening || isSpeaking ? stopAllOperations : startListening}
        className={`p-2 rounded-md transition-colors 
          ${(isListening || isSpeaking)
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
      >
        {isListening ? '🛑 Stop' : isSpeaking ? '🔊 Speaking' : '🎤 Voice'}
      </button>

      {/* Pause/Terminate Button */}
      {(isListening || isSpeaking) && onPauseOrTerminate && (
        <button
          onClick={onPauseOrTerminate}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          ⏹️ Terminate
        </button>
      )}

      {/* Status Display */}
      {(isListening || isSpeaking || error) && (
        <div className={`
          p-2 rounded-md text-sm flex-grow
          ${isListening ? 'bg-blue-50 text-blue-600' : 
            isSpeaking ? 'bg-green-50 text-green-600' : 
            'bg-red-50 text-red-500'}
        `}>
          {isListening && `Listening: ${transcript || ''}`}
          {isSpeaking && 'Speaking response...'}
          {error && `Error: ${error}`}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;