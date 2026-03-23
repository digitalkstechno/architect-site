"use client";

import { messages } from "@/lib/dummy-data";
import { MessageSquare, Send, Search, MoreVertical, CheckCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(messages[0]?.id || null);
  const [showList, setShowList] = useState(true);

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setShowList(false);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in duration-500 relative">
      {/* Sidebar - Chat List */}
      <Card className={cn(
        "w-full lg:w-80 flex flex-col overflow-hidden transition-all duration-300",
        !showList && "hidden lg:flex"
      )}>
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
          <Input placeholder="Search chats..." icon={Search} size={32} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => handleSelectChat(msg.id)}
              className={cn(
                "p-5 flex gap-4 cursor-pointer transition-all border-l-4",
                activeChat === msg.id 
                  ? "bg-indigo-50/50 border-indigo-600" 
                  : "bg-white border-transparent hover:bg-slate-50"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner">
                {msg.from.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{msg.from}</h3>
                  <span className="text-[10px] font-bold text-slate-400">{msg.date}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{msg.text}</p>
              </div>
              {msg.unread && (
                <div className="w-2 h-2 bg-indigo-600 rounded-full self-center" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className={cn(
        "flex-1 flex flex-col overflow-hidden relative transition-all duration-300",
        showList && "hidden lg:flex"
      )}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden" 
                  onClick={() => setShowList(true)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {messages.find(m => m.id === activeChat)?.from.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {messages.find(m => m.id === activeChat)?.from}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>


            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              <div className="flex flex-col items-center justify-center py-4">
                <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                  Today
                </span>
              </div>

              {/* Sample Received Message */}
              <div className="flex gap-4 max-w-[80%] animate-in slide-in-from-left-4 duration-500">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                  {messages.find(m => m.id === activeChat)?.from.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none shadow-sm">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {messages.find(m => m.id === activeChat)?.text}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">10:30 AM</span>
                </div>
              </div>

              {/* Sample Sent Message */}
              <div className="flex flex-row-reverse gap-4 max-w-[80%] ml-auto animate-in slide-in-from-right-4 duration-500">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  SC
                </div>
                <div className="space-y-1 text-right">
                  <div className="p-4 bg-indigo-600 rounded-[1.5rem] rounded-tr-none shadow-lg shadow-indigo-100">
                    <p className="text-sm text-white leading-relaxed font-medium">
                      We've scheduled the next site inspection for tomorrow morning at 9:00 AM. Does that work for you?
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mr-1">
                    <span className="text-[10px] font-bold text-slate-400">10:32 AM</span>
                    <CheckCheck className="w-3 h-3 text-indigo-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button size="icon" variant="primary" className="w-10 h-10 rounded-xl">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-indigo-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Select a conversation</h3>
              <p className="text-sm text-slate-500 max-w-[240px]">Choose a chat from the sidebar to start messaging with clients or team members.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
