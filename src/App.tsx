import React, { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Layout/Header';
import { ChatArea } from './components/Chat/ChatArea';
import { ChatInput } from './components/Chat/ChatInput';
import { useChat } from './hooks/useChat';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    error,
    setCurrentSessionId,
    startNewChat,
    deleteSession,
    sendMessage
  } = useChat();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 12,
          colorBgContainer: 'transparent',
        },
      }}
    >
      <div className="flex h-screen bg-[#0f0f0f] text-[#ececec] font-sans overflow-hidden relative">
        {/* Background Decorative Elements for Glass Effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <Sidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          isSidebarOpen={isSidebarOpen}
          onSessionSelect={setCurrentSessionId}
          onNewChat={startNewChat}
          onDeleteSession={deleteSession}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col relative overflow-hidden">
          <Header 
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <ChatArea 
            messages={messages}
            isStreaming={isStreaming}
            error={error}
            onSuggestionClick={handleSuggestionClick}
          />

          <ChatInput 
            input={input}
            isStreaming={isStreaming}
            onInputChange={setInput}
            onSend={handleSend}
          />

          {/* Sidebar Toggle Overlay (Mobile) */}
          {isSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </main>
      </div>
    </ConfigProvider>
  );
}
