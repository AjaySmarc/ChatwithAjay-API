import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import GeminiService from '../utils/geminiService';
import VoiceInput from './VoiceInput';

const ChatInput = ({ 
  onNewQuestion, 
  isGenerating,
  onPauseOrTerminate
}) => {
  const [question, setQuestion] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const fileInputRef = useRef(null);

  // File Validation
  const validateFile = (file) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 
      'application/pdf', 'image/webp', 'image/svg+xml'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 1 * 1024; // 1KB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('File too large (max 10MB)');
      return false;
    }
    if (file.size < minSize) {
      toast.error('File too small');
      return false;
    }

    return true;
  };

  // File Change Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setAttachedFile(file);
    } else {
      e.target.value = '';
    }
  };

  // Remove Attached File
  const handleFileRemove = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert File to Base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Deactivate voice input when text submission occurs
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
        result = await GeminiService.generateAnswerWithFile(
          trimmedQuestion, fileContent
        );
      } else {
        result = await GeminiService.generateAnswer(trimmedQuestion);
      }
      
      if (result.success) {
        onNewQuestion(trimmedQuestion, result.answer);
      } else {
        toast.error(result.error || "Unexpected error occurred.");
        onNewQuestion(trimmedQuestion, result.error || "Error");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setQuestion('');
      handleFileRemove();
    }
  };

  // Handle key press to submit on Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isVoiceInputActive) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md 
                    max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">

          {/* File Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,application/pdf,image/webp,image/svg+xml"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded 
                       hover:bg-gray-300 dark:hover:bg-gray-600 
                       transition-colors flex-shrink-0"
            aria-label="Attach File"
          >
            📎
          </button>

          {/* Attached File Display */}
          {attachedFile && (
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 
                            px-2 py-1 rounded w-full sm:w-auto">
              <span className="text-sm truncate text-gray-600 dark:text-gray-300">
                {attachedFile.name}
              </span>
              <button
                type="button"
                onClick={handleFileRemove}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Voice Input Component */}
          <VoiceInput
            onNewQuestion={onNewQuestion}
            setIsLoading={setIsLoading}
            onPauseOrTerminate={onPauseOrTerminate}
            onActivate={() => setIsVoiceInputActive(true)}
            onDeactivate={() => setIsVoiceInputActive(false)}
          />

          {/* Text Input */}
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question... (max 1000 chars)"
            maxLength={1000}
            className="flex-grow px-4 py-2 border dark:border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       dark:bg-gray-700 rounded-lg w-full"
            disabled={isVoiceInputActive}
          />

          {/* Pause/Terminate Button */}
          {isGenerating && onPauseOrTerminate && (
            <button
              type="button"
              onClick={onPauseOrTerminate}
              className="ml-2 p-2 bg-red-500 hover:bg-red-600 text-white 
                         rounded transition-colors"
            >
              ⏹️ Stop
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || isVoiceInputActive}
            className={`bg-blue-500 hover:bg-blue-600 text-white 
                       px-4 py-2 rounded transition-colors
                       ${(isLoading || isVoiceInputActive) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Send
          </button>
        </div>

        {/* Character Count */}
        {question.length > 0 && (
          <div className="text-xs text-gray-500 self-end">
            {question.length}/1000 characters
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
              
