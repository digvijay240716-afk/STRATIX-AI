import React, { useRef, useState } from 'react';
import { analyzeBusinessImage, analyzeBusinessVideo } from '../services/geminiService';

export const UploadZone: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setAnalyzing(true);
    setResult(null);
    setMediaType(null);
    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        if (file.type.startsWith('image/')) {
            setMediaType('image');
            const analysis = await analyzeBusinessImage(base64Data, file.type);
            setResult(analysis);
        } else if (file.type.startsWith('video/')) {
            setMediaType('video');
             const analysis = await analyzeBusinessVideo(base64Data, file.type);
             setResult(analysis);
        } else {
            setResult("Unsupported file type. Please upload an Image or Video.");
        }
        setAnalyzing(false);
    };
  };

  return (
    <div className="p-8 h-full flex flex-col">
       <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Data Hub</h2>
          <p className="text-slate-400">Upload financial charts, documents, or site footage for instant analysis.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div 
            className={`glass-panel border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all ${
                dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleChange} 
                accept="image/*,video/*"
            />
            
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-2">Drag & Drop or Click to Upload</h3>
            <p className="text-slate-500 text-center max-w-sm mb-6">
                Supports PNG, JPG, MP4. <br/>
                Files are processed locally by the secure Vision agent.
            </p>
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
            >
                Select Files
            </button>
        </div>

        <div className="glass-panel border border-slate-700 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Analysis Output</h3>
            
            <div className="flex-1 bg-slate-900/50 rounded-xl p-6 overflow-y-auto">
                {analyzing ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 animate-pulse">Scanning visual data...</p>
                    </div>
                ) : result ? (
                    <div className="space-y-4">
                        {preview && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-slate-700 max-h-48 w-fit mx-auto">
                                {mediaType === 'image' ? (
                                    <img src={preview} alt="Upload preview" className="object-contain max-h-48" />
                                ) : (
                                    <video src={preview} controls className="max-h-48" />
                                )}
                            </div>
                        )}
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-slate-300">{result}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No document analyzed yet.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
