import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import axios from 'axios';

interface PredictionResult {
  custody: string;
  compensation: number;
  similar_cases?: Array<{
    title: string;
    outcome: string;
  }>;
}

const PredictiveAnalysis = () => {
  const [fatherSalary, setFatherSalary] = useState('');
  const [motherSalary, setMotherSalary] = useState('');
  const [divorceStatus, setDivorceStatus] = useState('');
  const [reasonForDivorce, setReasonForDivorce] = useState('');
  const [childAge, setChildAge] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/predict', {
        father_salary: parseFloat(fatherSalary),
        mother_salary: parseFloat(motherSalary),
        divorce_status: divorceStatus,
        reason_for_divorce: reasonForDivorce,
        child_age: parseInt(childAge)
      });
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Case Outcome Prediction</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Father's Salary
            </label>
            <input
              type="number"
              value={fatherSalary}
              onChange={(e) => setFatherSalary(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              placeholder="Enter father's annual salary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mother's Salary
            </label>
            <input
              type="number"
              value={motherSalary}
              onChange={(e) => setMotherSalary(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              placeholder="Enter mother's annual salary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Divorce Status
            </label>
            <select
              value={divorceStatus}
              onChange={(e) => setDivorceStatus(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              required
            >
              <option value="">Select Divorce Status</option>
              <option value="Divorced">Divorced</option>
              <option value="Not Divorced">Not Divorced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Divorce
            </label>
            <select
              value={reasonForDivorce}
              onChange={(e) => setReasonForDivorce(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              required
            >
              <option value="">Select Reason</option>
              <option value="Adultery">Adultery</option>
              <option value="Abandonment">Abandonment</option>
              <option value="Incompatibility">Incompatibility</option>
              <option value="Domestic Violence">Domestic Violence</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Child's Age
            </label>
            <input
              type="number"
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              placeholder="Enter child's age"
              min="1"
              max="18"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? 'Analyzing...' : 'Get Prediction'}
          </button>
        </form>

        {prediction && (
          <div className="mt-8 border rounded-lg p-6 bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Prediction Results</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Likely Custody Outcome:</h3>
                <p className="text-lg text-gray-900 dark:text-white">{prediction.custody}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Estimated Compensation:</h3>
                <p className="text-lg text-gray-900 dark:text-white">${prediction.compensation.toLocaleString()}</p>
              </div>
              {prediction.similar_cases && prediction.similar_cases.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Similar Cases:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-900 dark:text-white">
                    {prediction.similar_cases.map((caseItem, index) => (
                      <li key={index}>
                        {caseItem.title} - {caseItem.outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalysis;