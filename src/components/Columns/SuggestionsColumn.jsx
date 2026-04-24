import React from 'react';
import SuggestionCard from '../SuggestionCard';
import { Sparkles, Loader } from 'lucide-react';

export default function SuggestionsColumn({ suggestionsBatches, isGenerating, onSuggestionClick, onRefresh }) {
  // suggestionsBatches is an array of arrays of suggestions: [[s1, s2, s3], [s4, s5, s6]]
  
  return (
    <div className="w-1/2 h-full bg-white p-6 flex flex-col relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-300 mb-6 z-10 w-full">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center">
          <Sparkles size={24} className="text-slate-800 mr-2" />
          Live Suggestions
        </h2>
        <div className="flex items-center space-x-3">
          {isGenerating && (
            <span className="flex items-center text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 animate-pulse">
              <Loader size={12} className="mr-2 animate-spin" />
              Analyzing context...
            </span>
          )}
          <button 
            onClick={onRefresh}
            disabled={isGenerating}
            className="flex items-center text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            title="Force refresh context and get new suggestions"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Suggestion Feed */}
      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 relative z-10">
        {suggestionsBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-slate-300" />
            </div>
            <p className="text-sm">Suggestions will appear here as the meeting progresses</p>
          </div>
        ) : (
          suggestionsBatches.map((batchObj, batchIdx) => (
            <div 
              key={batchIdx} 
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500 relative`}
            >
              <div className="col-span-full text-xs text-slate-400 font-mono mb-1 text-right border-b border-slate-100 pb-1">
                {new Date(batchObj.timestamp).toLocaleTimeString()}
              </div>
              {batchObj.items.map((sug, i) => (
                <SuggestionCard 
                  key={i} 
                  suggestion={sug} 
                  onClick={onSuggestionClick} 
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
