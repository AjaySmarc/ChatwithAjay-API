import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import GeminiService from '../utils/geminiService';
import VoiceInput from './VoiceInput';
import { FaMicrophone, FaPaperPlane, FaPaperclip } from 'react-icons/fa';

const ChatInput = ({ onNewQuestion, isGenerating, onPauseOrTerminate }) => {
  const [question, setQuestion] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVoiceInputActive(false);

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion && !attachedFile) return;

    if (trimmedQuestion.length > 1000) {
      toast.error('Question is too long. Maximum 1000 characters.');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (attachedFile) {
        const fileContent = await readFileAsBase64(attachedFile);
        result = await GeminiService.generateAnswerWithFile(trimmedQuestion, fileContent);
      } else {
        result = await GeminiService.generateAnswer(trimmedQuestion);
      }

      if (result.success) {
        onNewQuestion(trimmedQuestion, result.answer);
      } else {
        toast.error(result.error || 'Unexpected error occurred.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setQuestion('');
      setAttachedFile(null);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* File Attach Button */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2">
          <FaPaperclip className="text-gray-500 dark:text-gray-300" />
        </button>

        {/* Voice Input */}
        <VoiceInput
          onNewQuestion={onNewQuestion}
          setIsLoading={setIsLoading}
          onActivate={() => setIsVoiceInputActive(true)}
          onDeactivate={() => setIsVoiceInputActive(false)}
        >
          <button type="button" className="p-2">
            <FaMicrophone className="text-gray-500 dark:text-gray-300" />
          </button>
        </VoiceInput>

        {/* Input Field */}
        <div className="flex-grow relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full px-4 py-2 border rounded-lg text-gray-800 dark:text-white dark:bg-gray-700"
          />
          {/* Send Button Inside Input Field */}
          <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <FaPaperPlane className="text-blue-500 hover:text-blue-600" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
    
