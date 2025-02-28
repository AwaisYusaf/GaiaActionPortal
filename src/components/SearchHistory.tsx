'use client';

import React from 'react';

interface SearchHistoryProps {
  history: string[];
  onSelectHistoryItem: (query: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelectHistoryItem }) => {
  if (history.length === 0) {
    return (
      <div className="p-4 border border-[#00ff7f] rounded">
        <h3 className="text-[#00ff7f] font-mono text-lg mb-2">search history</h3>
        <p className="text-[#00aa55] font-mono text-sm">No search history yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-[#00ff7f] rounded">
      <h3 className="text-[#00ff7f] font-mono text-lg mb-2">search history</h3>
      <ul className="space-y-2">
        {history.map((query, index) => (
          <li key={index} className="text-[#00ff7f] font-mono">
            <button
              onClick={() => onSelectHistoryItem(query)}
              className="text-left hover:text-[#00aa55] transition-colors w-full overflow-hidden text-ellipsis"
            >
              {index + 1}. {query}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;
