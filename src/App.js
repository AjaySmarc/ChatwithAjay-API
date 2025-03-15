// src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ChatInput from './components/ChatInput';
import ResponseDisplay from './components/ResponseDisplay';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewQuestion = (question, answer) => {
    setConversation(prev => [...prev, { question, answer }]);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Navbar />
       // <div className="flex justify-center">
          //<img src="/Email Marketing.gif" alt="My GIF" width="300" />
       // </div>

        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <ResponseDisplay 
              conversation={conversation}
              isLoading={isLoading}
            />
            <ChatInput 
              onNewQuestion={handleNewQuestion}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
