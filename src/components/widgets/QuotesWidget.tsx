import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';

export default function QuotesWidget() {
  const [quoteData, setQuoteData] = useState({ quote: '', author: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuote = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch from our local backend proxy
      const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quotes/random`);
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many requests. Please wait a moment.');
        throw new Error(data.error || 'Failed to fetch quote');
      }
      setQuoteData(data);
    } catch (err: any) {
      setError(err.message || 'Could not load motivation today.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
        <h3 className="text-sm font-semibold flex items-center text-gray-700">
          <Quote className="w-4 h-4 mr-2 text-indigo-500" />
          Daily Motivation
        </h3>
        <button 
          onClick={fetchQuote} 
          disabled={loading}
          className="text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
          title="Get new quote"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="min-h-[60px] flex flex-col justify-center">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : error ? (
          <p className="text-xs text-red-500 italic">{error}</p>
        ) : (
          <>
            <p className="text-sm italic text-gray-600 leading-relaxed mb-2">"{quoteData.quote}"</p>
            <p className="text-xs font-medium text-gray-500 text-right">- {quoteData.author}</p>
          </>
        )}
      </div>
    </div>
  );
}
