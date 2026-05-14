"use client";

import ReactMarkdown from "react-markdown";
import { useMemo } from "react";

export default function LegalResponse({ content }) {
  const formattedContent = useMemo(() => {
    if (!content) return "";
    return content;
  }, [content]);

  const isPasalList = (text) => {
    if (typeof text !== 'string') return false;
    const pasalMatches = text.match(/\[Pasal\s+\d+\]/gi);
    if (!pasalMatches) return false;
    return pasalMatches.length >= 2;
  };

  const components = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mt-10 mb-6 border-b-2 border-blue-100 dark:border-slate-700 pb-3 tracking-tight flex items-center gap-3 transition-colors">
        <div className="w-2 h-8 bg-blue-600 rounded-full" />
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mt-8 mb-4 tracking-tight flex items-center gap-2 transition-colors">
        <span className="text-blue-500 dark:text-blue-400">§</span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mt-6 mb-3 tracking-tight transition-colors">
        {children}
      </h3>
    ),
    
    p: ({ children }) => {
      const contentText = Array.isArray(children) 
        ? children.map(c => typeof c === 'string' ? c : '').join('')
        : typeof children === 'string' ? children : '';

      if (contentText) {
        if (isPasalList(contentText)) {
          const pasals = contentText.match(/\[Pasal\s+\d+\]/gi) || [];
          const otherText = contentText.replace(/\[Pasal\s+\d+\]/gi, '').trim();
          
          return (
            <div className="mb-8 p-5 bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-inner transition-colors">
              {otherText && <p className="mb-4 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest transition-colors">{otherText}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {pasals.map((p, idx) => (
                  <span key={idx} className="flex items-center justify-center px-3 py-2 bg-white dark:bg-slate-700 border border-blue-100 dark:border-slate-600 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-default group">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1 text-blue-400">#</span>
                    {p.replace(/[\[\]]/g, '')}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (contentText.trim().toUpperCase() === "CUKUP JELAS") {
          return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-[11px] tracking-widest uppercase inline-flex items-center gap-2 mb-6 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Informasi: Cukup Jelas
            </div>
          );
        }
      }

      const citationPattern = /(\(Sumber:[^)]+\)|\[\s*DOKUMEN[^\]]+\])/gi;
      
      return (
        <p className="leading-[1.8] text-[#374151] dark:text-slate-300 mb-6 last:mb-0 text-[15.5px] transition-colors">
          {Array.isArray(children) ? children.map((child, i) => {
            if (typeof child === 'string' && citationPattern.test(child)) {
              const parts = child.split(citationPattern);
              return parts.map((part, index) => {
                if (citationPattern.test(part)) {
                  return <Citation key={`${i}-${index}`} text={part} />;
                }
                return part;
              });
            }
            return child;
          }) : children}
        </p>
      );
    },

    ul: ({ children }) => (
      <ul className="space-y-4 mb-8 list-none pl-0">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-4 mb-8 list-decimal pl-8 text-gray-700 dark:text-slate-300 transition-colors">
        {children}
      </ol>
    ),
    li: ({ children }) => {
      return (
        <li className="flex items-start gap-4 group">
          <div className="min-w-[8px] h-[8px] rounded-sm bg-blue-200 dark:bg-blue-700 mt-2.5 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors" />
          <div className="flex-1 text-gray-700 dark:text-slate-300 leading-[1.75] transition-colors">{children}</div>
        </li>
      );
    },

    blockquote: ({ children }) => (
      <div className="relative bg-white dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 mb-8 shadow-sm overflow-hidden group transition-colors">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
        <div className="absolute top-2 right-4 text-blue-50/50 dark:text-blue-900/30 text-6xl font-serif pointer-events-none select-none">"</div>
        <div className="relative z-10 flex gap-4">
          <div className="text-gray-700 dark:text-slate-300 italic leading-[1.8] text-[15.5px] font-medium transition-colors">
            {children}
          </div>
        </div>
      </div>
    ),

    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-slate-100 border-b-2 border-blue-200/50 dark:border-blue-700/50 pb-0.5 transition-colors">
        {children}
      </strong>
    ),

    code: ({ children }) => (
      <code className="bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-sm font-mono border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
        {children}
      </code>
    )
  };

  return (
    <div className="legal-response-container select-text animate-fadeIn">
      <ReactMarkdown components={components}>
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}

function Citation({ text }) {
  const cleanText = text.replace(/[()[\]]/g, '').replace(/Sumber:\s*/i, '');
  const parts = cleanText.split(/,\s*/);
  
  return (
    <span className="inline-flex flex-wrap gap-1 items-center align-middle mx-1 my-1">
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const isHal = lowerPart.includes('hal') || lowerPart.includes('hlm');
        return (
          <span 
            key={i}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-tight shadow-sm border ${
              isHal 
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" 
                : "bg-blue-600 dark:bg-blue-700 text-white border-blue-700 dark:border-blue-600"
            } transition-colors`}
          >
            {part.trim()}
          </span>
        );
      })}
    </span>
  );
}
