import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = 'Loading details...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
