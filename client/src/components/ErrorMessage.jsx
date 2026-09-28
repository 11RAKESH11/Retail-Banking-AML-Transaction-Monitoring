import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => { 
  return (
    <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center justify-between text-rose-300 my-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
        <p className="text-sm font-medium">{message || 'An error occurred while fetching data.'}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-xs font-semibold rounded-lg text-rose-200 transition-all border border-rose-700/50"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
