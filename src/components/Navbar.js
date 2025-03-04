import React from 'react';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-white hover:text-blue-200 transition-colors duration-300" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h1 className="text-2xl font-bold text-white dark:text-gray-100 hover:text-blue-200 transition-colors duration-300">
            ChatwithAjay
          </h1>
        </div>
    
        <div className="flex items-center space-x-4">
          

          {/* GitHub Button */}
          <a 
            href="https://github.com/AjaySmarc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path fillRule="evenodd" 
                d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.489.5.091.682-.217.682-.482 
                0-.237-.009-.866-.014-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 
                1.003.07 1.532 1.03 1.532 1.03.892 1.53 2.34 1.09 2.91.833.091-.646.35-1.09.636-1.34-2.221-.252-4.555-1.11-4.555-4.933 
                0-1.09.39-1.984 1.03-2.682-.103-.253-.446-1.27.098-2.646 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.8c.85.004 
                1.705.114 2.504.334 1.91-1.295 2.75-1.025 2.75-1.025.544 1.376.201 2.393.098 2.646.641.698 1.03 1.592 
                1.03 2.682 0 3.833-2.337 4.677-4.564 4.923.36.309.678.919.678 1.85 0 1.335-.012 2.415-.012 2.742 
                0 .267.18.577.688.48C19.14 20.163 22 16.417 22 12c0-5.523-4.477-10-10-10z" 
                clipRule="evenodd"
              />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
