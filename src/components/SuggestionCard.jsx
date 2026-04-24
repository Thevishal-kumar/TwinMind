import React from 'react';
import { Target, Search, CheckSquare } from 'lucide-react';

const typeIcons = {
  'Follow-up Question': <Search size={16} className="text-slate-600" />,
  'Action Item': <CheckSquare size={16} className="text-slate-600" />,
  'Fact Check': <Target size={16} className="text-slate-600" />
};

export default function SuggestionCard({ suggestion, onClick }) {
  // If exact type doesn't match keys, fallback to searching for keywords
  let IconObj = <Target size={16} className="text-slate-600" />;
  const t = (suggestion.type || '').toLowerCase();
  
  if (t.includes('question')) IconObj = typeIcons['Follow-up Question'];
  else if (t.includes('action')) IconObj = typeIcons['Action Item'];
  else if (t.includes('fact') || t.includes('check')) IconObj = typeIcons['Fact Check'];

  return (
    <div 
      onClick={() => onClick(suggestion)}
      className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm cursor-pointer hover:border-slate-500 hover:shadow-md transition-all group overflow-hidden relative"
    >
      <div className="flex flex-col items-start gap-2 relative z-10">
        <span className="flex-shrink-0 flex items-center bg-slate-50 px-2 py-1 rounded-md text-xs font-medium border border-slate-300">
          {IconObj}
          <span className="ml-1.5 text-slate-600 whitespace-nowrap">{suggestion.type}</span>
        </span>
        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 w-full">
          {suggestion.title}
        </h4>
      </div>
      <p className="text-slate-600 text-sm mt-3 leading-relaxed relative z-10">
        {suggestion.preview}
      </p>
    </div>
  );
}
