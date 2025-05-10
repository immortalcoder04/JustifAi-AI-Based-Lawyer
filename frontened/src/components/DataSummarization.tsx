import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const DataSummarization = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file only');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSummary(response.data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to process the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Legal Document Summarization
        </h1>

        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors duration-300">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <span className="text-gray-600 dark:text-gray-300">
                {file ? file.name : 'Upload your legal document'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PDF files only
              </span>
            </label>
          </div>

          {error && (
            <div className="flex items-center text-red-600 dark:text-red-400 mt-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? 'Analyzing Document...' : 'Generate Summary'}
          </button>
        </div>

        {summary && (
          <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Document Summary
              </h2>
            </div>
            <div className="prose max-w-none dark:prose-invert">
              {summary.split('\n').map((line, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSummarization;
