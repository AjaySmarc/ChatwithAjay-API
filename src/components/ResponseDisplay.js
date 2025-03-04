// src/components/ResponseDisplay.js
import React, { useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight, materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ResponseDisplay = ({ conversation, isLoading, isDarkMode }) => {
  const containerRef = useRef(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);


    // eslint-disable-next-line no-restricted-globals
    const copyButton = event.target;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  };

  const parseCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(codeBlockRegex, (match, lang, code, offset) => {


      if (offset > lastIndex) {
        parts.push({ 
          type: 'text', 
          content: text.slice(lastIndex, offset) 
        });
      }


      parts.push({ 
        type: 'code', 
        language: lang || 'javascript', 
        content: code 
      });

      lastIndex = offset + match.length;
    });

 
    if (lastIndex < text.length) {
      parts.push({ 
        type: 'text', 
        content: text.slice(lastIndex) 
      });
    }

    return parts;
  };

  const renderContent = (text) => {
    const parts = parseCodeBlocks(text);

    return parts.map((part, index) => {
      if (part.type === 'text') {
        return (
          <p 
            key={index} 
            className="text-gray-700 dark:text-gray-200 leading-relaxed mb-2"
          >
            {part.content}
          </p>
        );
      }

      return (
        <div key={index} className="my-2">
          <SyntaxHighlighter
            language={part.language}
            style={isDarkMode ? materialDark : materialLight}
            className="rounded-lg text-sm"
            customStyle={{
              padding: '1rem',
              borderRadius: '0.5rem',
              margin: '0.5rem 0'
            }}
          >
            {part.content.trim()}
          </SyntaxHighlighter>
        </div>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar"
    >
      {conversation.map((entry, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
        >
          {/* Question Section */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800 dark:text-white">
                🤔 {entry.question}
              </p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="p-4 relative group">
            <div className="prose dark:prose-invert max-w-none">
              {renderContent(entry.answer)}
            </div>

            {/* Copy Button */}
            <button 
              onClick={(e) => copyToClipboard(entry.answer, e)}
              className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 
                         hover:bg-blue-100 dark:hover:bg-blue-900 
                         p-2 rounded-full opacity-0 group-hover:opacity-100 
                         transition-all duration-300 ease-in-out"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          Generating response...
        </div>
      )}

      {conversation.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          🤖 Ask your first question!
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;