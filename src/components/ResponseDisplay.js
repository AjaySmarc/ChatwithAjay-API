import React, { useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight, materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ResponseDisplay = ({ conversation, isLoading, isDarkMode }) => {
  const containerRef = useRef(null);

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    const copyButton = event.target;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  };

  // Parse text for code blocks
  const parseCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(codeBlockRegex, (match, lang, code, offset) => {
      if (offset > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, offset) });
      }

      parts.push({ type: 'code', language: lang || 'javascript', content: code });
      lastIndex = offset + match.length;
    });

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  };

  return (
    <div ref={containerRef} className="pt-4 pb-16 px-4 overflow-y-auto max-h-screen">
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
                <SyntaxHighlighter key={i} language={part.language} style={isDarkMode ? materialDark : materialLight} className="rounded-lg">
                  {part.content.trim()}
                </SyntaxHighlighter>
              )
            )}
            <button onClick={(e) => copyToClipboard(entry.answer, e)} className="text-blue-500 text-sm mt-2">
              Copy
            </button>
          </div>
        </div>
      ))}

      {isLoading && <div className="text-center text-gray-500">Generating response...</div>}
      {!conversation.length && <div className="text-center text-gray-500">🤖 Ask your first question!</div>}
    </div>
  );
};

export default ResponseDisplay;
       
