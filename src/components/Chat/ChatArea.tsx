import React, { useRef, useEffect } from 'react';
import { InfoCircleOutlined, RobotOutlined } from '@ant-design/icons';
import { Alert, Avatar } from 'antd';
import { Message } from '../../types';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  error,
  onSuggestionClick
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
    >
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        {messages.length === 0 && !isStreaming ? (
          <EmptyState onSuggestionClick={onSuggestionClick} />
        ) : (
          <div className="space-y-8">
            {messages.map((msg, i) => (
              <MessageItem 
                key={i} 
                message={msg} 
                isStreaming={isStreaming && i === messages.length - 1} 
              />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-4 md:gap-6">
                <Avatar 
                  icon={<RobotOutlined />} 
                  className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0 mt-1"
                />
                <div className="flex-1 pt-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="mt-6">
            <Alert
              title="Error"
              description={error}
              type="error"
              showIcon
              icon={<InfoCircleOutlined />}
              className="glass-card border-red-500/20 text-red-400"
            />
          </div>
        )}
      </div>
    </div>
  );
};
