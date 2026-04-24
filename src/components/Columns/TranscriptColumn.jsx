import React, { useEffect, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';

export default function TranscriptColumn({ isRecording, startRecording, stopRecording, transcript, isProcessing }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isProcessing]);

  return (
    <div className="w-1/4 h-full border-r border-slate-300 bg-slate-50 p-4 flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-300 mb-4 z-10 sticky top-0 bg-slate-50">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center">
          <span className="bg-blue-500 rounded-full w-2 h-2 mr-2"></span>
          Live Transcript
        </h2>
        {isRecording ? (
          <button 
            onClick={stopRecording}
            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors animate-pulse"
            title="Stop Recording"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={startRecording}
            className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-colors"
            title="Start Recording"
          >
            <Mic size={20} />
          </button>
        )}
      </div>

      {/* Transcript Text */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {!transcript ? (
          <p className="text-slate-500 italic text-sm text-center mt-10">
            {isRecording ? "Listening..." : "Click mic to start capturing"}
          </p>
        ) : (
          <div className="text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
            {transcript}
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center text-slate-400 text-sm italic mt-2 animate-pulse">
            <Loader size={12} className="mr-2 animate-spin" />
            Transcribing audio chunk...
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

    </div>
  );
}
