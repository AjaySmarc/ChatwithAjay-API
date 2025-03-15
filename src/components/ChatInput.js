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

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('File too large (max 10MB)');
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setAttachedFile(file);
    } else {
      e.target.value = '';
    }
  };

  // Remove file
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

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVoiceInputActive(false);
    
    if (!question.trim() && !attachedFile) return;
    if (question.length > 1000) {
      toast.error('Question too long. Max 1000 characters.');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (attachedFile) {
        const fileContent = await readFileAsBase64(attachedFile);
        result = await GeminiService.generateAnswerWithFile(question, fileContent);
      } else {
        result = await GeminiService.generateAnswer(question);
      }

      if (result.success) {
        onNewQuestion(question, result.answer);
      } else {
        toast.error(result.error || "Unexpected error.");
      }
    } catch (error) {
      toast.error("Error occurred. Try again.");
    } finally {
      setIsLoading(false);
      setQuestion('');
      handleFileRemove();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 p-4 shadow-md border-t">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attach File Button */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf"/>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-200 dark:bg-gray-700 rounded">
          📎
        </button>

        {/* File Preview */}
        {attachedFile && (
          <div className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded flex items-center">
            <span className="text-sm">{attachedFile.name}</span>
            <button type="button" onClick={handleFileRemove} className="ml-2 text-red-500">✕</button>
          </div>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          maxLength={1000}
          className="flex-grow px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
          disabled={isVoiceInputActive}
        />

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={() => setIsVoiceInputActive(!isVoiceInputActive)}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          🎤
        </button>

        {/* Send Button */}
        <button type="submit" disabled={isLoading || isVoiceInputActive} className="p-2 bg-blue-500 text-white rounded">
          📤
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
