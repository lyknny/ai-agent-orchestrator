import React from 'react';
import { SendOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';

const { TextArea } = Input;

interface ChatInputProps {
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  isStreaming,
  onInputChange,
  onSend
}) => {
  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent">
      <form 
        onSubmit={onSend}
        className="max-w-3xl mx-auto relative flex justify-between gap-6"
      >
        <TextArea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
          placeholder="Message Assistant..."
          disabled={isStreaming}
          autoSize={{ minRows: 1, maxRows: 6 }}
          className="glass-effect border-none rounded-2xl pl-4 pr-12 py-3 text-white placeholder-white/30 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] transition-all custom-scrollbar"
          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          disabled={isStreaming || !input.trim()}
          onClick={(e) => onSend(e as any)}
          className="absolute right-2 bottom-0.5 flex items-center justify-center shadow-lg"
          style={{ width: '36px', height: '36px' }}
        />
      </form>
      <p className="text-center text-[11px] text-white/20 mt-3 tracking-tight">
        Assistant can make mistakes. Check important info.
      </p>
    </div>
  );
};
