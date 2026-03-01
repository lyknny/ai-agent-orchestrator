import React from 'react';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 md:gap-3 ${!isAssistant ? 'justify-end' : ''}`}>
      {isAssistant && (
        <Avatar 
          icon={<RobotOutlined />} 
          className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0 mt-1"
        />
      )}
      <div className={`max-w-[85%] md:max-w-[85%] px-5 py-3.5 rounded-2xl transition-all ${
        !isAssistant 
          ? 'bg-blue-600/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/5' 
          : 'glass-card text-[#ececec] leading-relaxed'
      }`}>
        <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-code:text-emerald-400 prose-code:bg-black/20 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-base">
          {isAssistant && message.content === '' && isStreaming ? (
            <div className="flex gap-1.5 py-2">
              <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce"></span>
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
      {!isAssistant && (
        <Avatar 
          icon={<UserOutlined />} 
          className="bg-zinc-700 text-white border border-white/10 shrink-0 mt-1"
        />
      )}
    </div>
  );
};
