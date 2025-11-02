
import React from 'react';
import { ProgressUpdate } from '../types';

interface ProcessingStatusProps {
  file: File | null;
  progress: ProgressUpdate;
}

const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ file, progress }) => {
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const progressPercentage = progress.total > 0 ? Math.round((progress.page / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
        <SpinnerIcon />
        <h2 className="text-2xl font-bold mt-4 text-gray-200">Transcription in Progress...</h2>
        {file && (
            <p className="text-gray-400 mt-2 truncate max-w-full">
                {file.name} ({formatBytes(file.size)})
            </p>
        )}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-6">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
        <p className="text-indigo-300 mt-2 font-mono text-sm">{progress.message}</p>
    </div>
  );
};

export default ProcessingStatus;
