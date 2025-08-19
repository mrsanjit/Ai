import React, { useState, useCallback } from 'react';
import { parseFile } from '../services/dataProcessor';
import { DataRow } from '../types';
import ErrorMessage from './ErrorMessage';

interface FileUploadProps {
  onDataLoaded: (fileName: string, columns: string[], rows: DataRow[]) => void; 
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void; 
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, setLoading, setError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setLoading(true);
      try {
        const { columns, rows } = await parseFile(file);
        onDataLoaded(file.name, columns, rows);
      } catch (err) { 
        console.error("File parsing error in FileUpload:", err);
        const parseErrorMessage = err instanceof Error ? err.message : String(err);
        setError(parseErrorMessage); 
      } finally {
        setLoading(false);
      }
    }
  }, [onDataLoaded, setLoading, setError]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileChange(event.target.files[0]);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const onDragOverHandler = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const onDragLeaveHandler = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  return (
    <div className="mb-6 p-4 bg-slate-700/30 shadow-xl rounded-xl border border-slate-600/50">
      <label
        htmlFor="file-upload"
        onDrop={onDrop}
        onDragOver={onDragOverHandler}
        onDragLeave={onDragLeaveHandler}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
                    ${dragOver ? 'border-accent-500 bg-slate-600/50' : 'border-slate-500 hover:border-slate-400 bg-slate-600/30'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <p className="mb-2 text-sm text-slate-300">
            <span className="font-semibold text-primary-300">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400">CSV, Excel (XLS, XLSX), or JSON files</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          onChange={onInputChange} 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .json, application/json" 
        />
      </label>
      {selectedFile && (
        <p className="mt-3 text-sm text-slate-300 text-center">
          Selected: <span className="font-medium text-primary-300">{selectedFile.name}</span>
        </p>
      )}
    </div>
  );
};

export default FileUpload;