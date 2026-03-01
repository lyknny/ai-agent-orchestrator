import React from 'react';
import { MenuOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <header className="h-14 flex items-center px-4 justify-between sticky top-0 bg-transparent backdrop-blur-md z-10 border-b border-white/5">
      <div className="flex items-center gap-2">
        <Button 
          type="text"
          icon={<MenuOutlined />}
          onClick={onToggleSidebar}
          className="text-white/60 hover:text-white hover:bg-white/10 active:scale-90"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all group active:scale-95">
          <span className="font-semibold text-lg text-white/90">Assistant</span>
          <RightOutlined className="text-[10px] opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 glass-effect rounded-full text-[10px] font-medium tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-white/40">FastAPI</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-white/40">RAG</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span className="text-white/40">Electron</span>
          </div>
        </div>
      </div>
    </header>
  );
};
