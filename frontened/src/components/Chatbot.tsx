import React, { useEffect, useState } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // import your ThemeContext

const Chatbot = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme(); // get dark mode status

  useEffect(() => {
    const injectBotpress = () => {
      try {
        const script1 = document.createElement('script');
        script1.src = 'https://cdn.botpress.cloud/webchat/v2.3/inject.js';
        script1.async = true;
        document.body.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://files.bpcontent.cloud/2025/02/20/19/20250220190059-RPLNBA9Z.js';
        script2.async = true;
        document.body.appendChild(script2);

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load chatbot. Please try again.');
        setIsLoading(false);
      }
    };

    injectBotpress();

    return () => {
      // Cleanup scripts when component unmounts
      const scripts = document.querySelectorAll('script[src*="botpress"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'dark' : ''}`} style={{minHeight: '100vh', minWidth: '100vw'}}>
      <div className={`w-full h-full flex flex-col justify-center items-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} style={{minHeight: '100vh', minWidth: '100vw'}}>
        {error ? (
          <div className="text-center text-red-600 px-4">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="text-lg font-semibold mb-2">Oops!</p>
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className="text-center px-4">
            <Bot className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className="text-xl font-semibold mb-2">Loading Legal Assistant...</h1>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Please wait while we initialize the chat interface.
            </p>
            <div className="mt-4 animate-pulse text-sm text-gray-400">Loading...</div>
          </div>
        ) : (
          <iframe
            src="https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/02/20/19/20250220190100-D53A0MQA.json"
            className="w-full h-full border-0"
            title="Legal Assistant Chat"
          />
        )}
      </div>
    </div>
  );
};

export default Chatbot;
