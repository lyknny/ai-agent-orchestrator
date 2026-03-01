import React from 'react';
import { PlusOutlined, MessageOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Avatar, Tooltip } from 'antd';
import { motion } from 'motion/react';
import { Session } from '../../types';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string;
  isSidebarOpen: boolean;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  isSidebarOpen,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onClose
}) => {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
      className="glass-sidebar flex flex-col relative z-30 overflow-hidden h-full"
    >
      <div className="p-3 flex flex-col h-full w-[260px]">
        <div className="flex items-center justify-between mb-4">
          <Button 
            type="default"
            icon={<PlusOutlined />}
            onClick={onNewChat}
            className="flex-1 glass-effect text-white border-white/10 hover:border-white/30 hover:bg-white/10"
            style={{ height: '40px' }}
          >
            New Chat
          </Button>
          <Button 
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="md:hidden text-white/60 hover:text-white ml-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar mt-2">
          <div className="text-[10px] font-semibold text-white/30 px-3 py-2 uppercase tracking-wider">Recent History</div>
          {sessions.map(s => (
            <div 
              key={s.id}
              onClick={() => onSessionSelect(s.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm ${
                currentSessionId === s.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
              } active:scale-[0.98]`}
            >
              <MessageOutlined className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100" />
              <span className="truncate flex-1 text-white/80 group-hover:text-white">
                {s.title || 'New Chat'}
              </span>
              <Tooltip title="Delete Chat">
                <Button 
                  type="text"
                  size="small"
                  icon={<DeleteOutlined className="text-xs" />}
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400"
                />
              </Tooltip>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all active:scale-95">
            <Avatar 
              size="small"
              className="bg-gradient-to-tr from-zinc-700 to-zinc-500 shadow-lg border border-white/10"
            >
              CL
            </Avatar>
            <span className="text-sm font-medium truncate text-white/80">Client</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
