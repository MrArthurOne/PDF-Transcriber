import React, { useState, useCallback } from 'react';
import { ProcessingState, ProgressUpdate } from './types';
import { transcribePdf } from './services/transcriptionService';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import TranscriptionResult from './components/TranscriptionResult';
import PageSelection from './components/PageSelection';

declare const pdfjsLib: any;

const MAX_FILE_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function App() {
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [progress, setProgress] = useState<ProgressUpdate>({ page: 0, total: 0, message: '' });
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setProcessingState(ProcessingState.IDLE);
    setTranscribedText('');
    setCurrentFile(null);
    setPageCount(0);
    setProgress({ page: 0, total: 0, message: '' });
    setError(null);
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      setProcessingState(ProcessingState.ERROR);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      setProcessingState(ProcessingState.ERROR);
      return;
    }

    setCurrentFile(file);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      setPageCount(pdf.numPages);
      setProcessingState(ProcessingState.PAGE_SELECTION);
    } catch (err) {
      console.error(err);
      setError("Could not read the PDF file to determine the number of pages.");
      setProcessingState(ProcessingState.ERROR);
    }
  }, []);

  const handleStartTranscription = useCallback(async (pagesToProcess: number[]) => {
    if (!currentFile) return;

    setProcessingState(ProcessingState.PROCESSING);
    
    try {
      const text = await transcribePdf(currentFile, (update) => {
        setProgress(update);
      }, { pagesToProcess });
      setTranscribedText(text);
      setProcessingState(ProcessingState.DONE);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during transcription.');
      setProcessingState(ProcessingState.ERROR);
    }
  }, [currentFile]);

  const renderContent = () => {
    switch (processingState) {
      case ProcessingState.IDLE:
        return <FileUpload onFileSelect={handleFileSelect} maxFileSizeMB={MAX_FILE_SIZE_MB} />;
      case ProcessingState.PAGE_SELECTION:
        return (
          <PageSelection
            file={currentFile!}
            pageCount={pageCount}
            onStart={handleStartTranscription}
            onCancel={resetState}
          />
        );
      case ProcessingState.PROCESSING:
        return <ProcessingStatus file={currentFile} progress={progress} />;
      case ProcessingState.DONE:
        return <TranscriptionResult text={transcribedText} onReset={resetState} />;
      case ProcessingState.ERROR:
        return (
          <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Transcription Failed</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={resetState}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            PDF Transcriber
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Extract text from any PDF, including scanned pages and images.
          </p>
        </header>
        <main className="bg-gray-800/50 rounded-xl shadow-2xl p-4 sm:p-8 border border-gray-700">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by React, Tailwind CSS, and Google Gemini</p>
        </footer>
      </div>
    </div>
  );
}