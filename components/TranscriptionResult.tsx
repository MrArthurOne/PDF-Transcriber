
import React, { useState } from 'react';

interface TranscriptionResultProps {
  text: string;
  onReset: () => void;
}

const CopyIcon = ({ copied }: { copied: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {copied ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text, onReset }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcription.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-200">Transcription Complete</h2>
            <div className="flex justify-end space-x-2 mb-2">
                <button
                    onClick={handleCopy}
                    className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm font-medium rounded-md transition-colors"
                >
                    <CopyIcon copied={copied} />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm font-medium rounded-md transition-colors"
                >
                    <DownloadIcon />
                    Download .txt
                </button>
            </div>
            <textarea
                readOnly
                value={text}
                className="w-full h-96 p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Transcription result will appear here..."
            />
            <button
                onClick={onReset}
                className="mt-6 w-full sm:w-auto mx-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
            >
                Transcribe Another PDF
            </button>
        </div>
    );
};

export default TranscriptionResult;
