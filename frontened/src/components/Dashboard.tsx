import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Scale } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Welcome to JustifAI</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">Your intelligent legal assistant powered by AI</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/chatbot" className="group transform hover:scale-105 transition-all duration-300 ease-in-out">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mb-6 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
              <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Legal Chatbot</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Get instant, AI-powered answers to your legal questions with our sophisticated chatbot assistant.</p>
          </div>
        </Link>

        <Link to="/summarization" className="group transform hover:scale-105 transition-all duration-300 ease-in-out">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mb-6 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Document Summarization</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Transform complex legal documents into clear, concise summaries with our advanced AI technology.</p>
          </div>
        </Link>

        <Link to="/prediction" className="group transform hover:scale-105 transition-all duration-300 ease-in-out">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mb-6 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
              <Scale className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Case Prediction</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Get data-driven insights and predictions for custody and compensation cases using AI analysis.</p>
          </div>
        </Link>
      </div>

      <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">How JustifAI Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Ask Questions</h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Interact with our AI chatbot to get accurate, instant answers to your legal queries.</p>
          </div>
          <div className="group">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Upload Documents</h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Let our AI analyze and summarize your legal documents for better understanding.</p>
          </div>
          <div className="group">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Get Predictions</h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Receive data-backed predictions and insights for your legal cases.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;