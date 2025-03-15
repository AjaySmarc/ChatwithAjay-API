import React, { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight, materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ResponseDisplay = ({ conversation, isLoading, isDarkMode }) => {
  const containerRef = useRef(null);

  // Auto-scroll to top when new response is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [conversation.length]); // Depend only on conversation length to optimize re-renders

  const parseCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;

    for (const match of text.matchAll(codeBlockRegex)) {
      const [fullMatch, lang, code] = match;
      const offset = match.index;

      if (offset > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, offset) });
      }
      parts.push({ type: 'code', language: lang || 'javascript', content: code.trim() });
      lastIndex = offset + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  };

  return (
    <div ref={containerRef} className="pt-4 pb-20 px-4 overflow-y-auto max-h-screen">
      {conversation.map((entry, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 border-b">
            <p className="font-semibold text-gray-800 dark:text-white">🤔 {entry.question}</p>
          </div>
          <div className="p-4">
            {parseCodeBlocks(entry.answer).map((part, i) =>
              part.type === 'text' ? (
                <p key={i} className="text-gray-700 dark:text-gray-200">{part.content}</p>
              ) : (
                <SyntaxHighlighter
                  key={i}
                  language={part.language}
                  style={isDarkMode ? materialDark : materialLight}
                  className="rounded-lg"
                >
                  {part.content}
                </SyntaxHighlighter>
              )
            )}
          </div>
        </div>
      ))}

      {isLoading && <div className="text-center text-gray-500">Generating response...</div>}
      {!conversation.length && <div className="text-center text-gray-500">🤖 Ask your first question!</div>}
    </div>
  );
};

export default ResponseDisplay;
