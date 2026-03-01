import React, { useEffect, useState } from 'react';
import { RobotOutlined, BulbOutlined, CodeOutlined, CompassOutlined, BookOutlined, FireOutlined, LoadingOutlined } from '@ant-design/icons';
import { trendingService, TrendingTopic } from '../../services/trendingService';

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      setIsLoading(true);
      const topics = await trendingService.fetchTrendingTopics();
      setSuggestions(topics);
      setIsLoading(false);
    };
    loadTrending();
  }, []);

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('model')) return <BulbOutlined className="text-yellow-400" />;
    if (cat.includes('code') || cat.includes('engineering')) return <CodeOutlined className="text-blue-400" />;
    if (cat.includes('agent') || cat.includes('industry')) return <CompassOutlined className="text-emerald-400" />;
    return <BookOutlined className="text-purple-400" />;
  };

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className="w-20 h-20 rounded-3xl glass-effect flex items-center justify-center shadow-2xl">
        <RobotOutlined className="text-4xl text-white/80" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">How can I help you today?</h2>
        <div className="flex items-center justify-center gap-2">
          <FireOutlined className="text-orange-500 text-xs animate-pulse" />
          <p className="text-white/40 text-sm">Trending AI topics updated just now</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
        {isLoading ? (
          <div className="col-span-full py-10 flex flex-col items-center gap-3">
            <LoadingOutlined className="text-2xl text-white/20" />
            <span className="text-xs text-white/20 uppercase tracking-widest">Fetching latest trends...</span>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div 
              key={index}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="glass-card p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all text-left border border-white/5 hover:border-white/20 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  {getIcon(suggestion.category)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{suggestion.category}</span>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">{suggestion.text}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
