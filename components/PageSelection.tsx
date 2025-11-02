import React, { useState, useCallback } from 'react';

interface PageSelectionProps {
  file: File;
  pageCount: number;
  onStart: (pages: number[]) => void;
  onCancel: () => void;
}

const parsePageRanges = (input: string, maxPage: number): number[] => {
  if (!input.trim()) {
    throw new Error('Page range input cannot be empty.');
  }

  const pageSet = new Set<number>();
  const ranges = input.split(',');

  for (const range of ranges) {
    const trimmedRange = range.trim();
    if (!trimmedRange) continue;

    if (trimmedRange.includes('-')) {
      const parts = trimmedRange.split('-');
      if (parts.length !== 2) {
        throw new Error(`Invalid range format: "${trimmedRange}"`);
      }

      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid numbers in range: "${trimmedRange}"`);
      }
      if (start > end) {
        throw new Error(`Start page cannot be greater than end page in range: "${trimmedRange}"`);
      }
      if (start < 1 || end > maxPage) {
        throw new Error(`Pages must be between 1 and ${maxPage}. Invalid range: "${trimmedRange}"`);
      }

      for (let i = start; i <= end; i++) {
        pageSet.add(i);
      }
    } else {
      const pageNum = parseInt(trimmedRange, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${trimmedRange}"`);
      }
      if (pageNum < 1 || pageNum > maxPage) {
        throw new Error(`Page number must be between 1 and ${maxPage}. Invalid page: "${trimmedRange}"`);
      }
      pageSet.add(pageNum);
    }
  }

  if (pageSet.size === 0) {
    throw new Error('No valid pages were specified.');
  }

  return Array.from(pageSet).sort((a, b) => a - b);
};


const PageSelection: React.FC<PageSelectionProps> = ({ file, pageCount, onStart, onCancel }) => {
  const [rangesInput, setRangesInput] = useState(`1-${pageCount}`);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(() => {
    setError(null);
    try {
      const pagesToProcess = parsePageRanges(rangesInput, pageCount);
      onStart(pagesToProcess);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  }, [rangesInput, pageCount, onStart]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-200">Select Pages to Transcribe</h2>
      <p className="text-gray-400 mb-6 truncate max-w-full">
        <span className="font-semibold">{file.name}</span> ({formatBytes(file.size)}) - <span className="font-semibold">{pageCount} pages</span> detected.
      </p>
      
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-4">
          <label htmlFor="page-ranges" className="block text-lg font-medium text-gray-300">
            Page Ranges
          </label>
          <p className="text-sm text-gray-500">
            Enter page numbers or ranges separated by commas.
            <br />
            For example: <code className="bg-gray-700 px-1 rounded">1-5, 8, 12-15</code>
          </p>
          <input
            id="page-ranges"
            type="text"
            value={rangesInput}
            onChange={(e) => setRangesInput(e.target.value)}
            className="w-full p-3 text-center bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
            aria-label="Page ranges"
            placeholder="e.g., 1-10, 15, 20-22"
          />
        </div>

        {error && <p className="mt-4 text-red-400 font-semibold">{error}</p>}

        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4">
            <button
                onClick={onCancel}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors order-2 sm:order-1"
            >
                Cancel
            </button>
            <button
                onClick={handleStart}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors order-1 sm:order-2"
            >
                Start Transcription
            </button>
        </div>
      </div>
    </div>
  );
};

export default PageSelection;