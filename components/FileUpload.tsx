
import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxFileSizeMB: number;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l0 6m0-6l-3-3m3 3l3-3" />
    </svg>
);


const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, maxFileSizeMB }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const dragClass = isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600';

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-10 sm:p-20 border-2 ${dragClass} border-dashed rounded-lg cursor-pointer transition-all duration-300 ease-in-out`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon />
            <p className="mb-2 text-lg text-gray-400">
                <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF only (MAX. {maxFileSizeMB}MB)</p>
        </div>
        <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="application/pdf"
            onChange={handleFileChange} 
        />
    </div>
  );
};

export default FileUpload;
