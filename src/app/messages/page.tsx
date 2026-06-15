"use client";

import { MessageSquare, Send, Search, MoreVertical, CheckCheck, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useNotification } from "@/lib/notification-context";
import { messageService, Conversation, Message as ApiMessage } from "@/services/message.service";
import { staffService, StaffMember } from "@/services/staff.service";
import { clientService, Client } from "@/services/client.service";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUsers, setActiveChatId: setContextActiveChatId, refreshUnreadMessageCount } = useNotification();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [showList, setShowList] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New Chat State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [usersList, setUsersList] = useState<{ id: string, name: string, role: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const activeChat = conversations.find(c => c._id === activeChatId);
  const filteredChats = conversations.filter(c => 
    c.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.contactRole && c.contactRole.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Update context when activeChatId changes
  useEffect(() => {
    setContextActiveChatId(activeChatId);
    return () => setContextActiveChatId(null);
  }, [activeChatId, setContextActiveChatId]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!activeChatId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await messageService.getMessages(activeChatId);
        setMessages(data || []);
        
        // Mark as read
        await messageService.markAsRead(activeChatId);
        await refreshUnreadMessageCount();
        setConversations(prev => prev.map(c => c._id === activeChatId ? { ...c, unreadCount: 0 } : c));
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeChatId]);

  // Listen to socket
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: ApiMessage) => {
      // If message is for the active chat (either sent by us or received from active contact)
      if (
        newMessage.senderId === activeChatId || 
        (newMessage.senderId === user?.id && newMessage.receiverId === activeChatId)
      ) {
        setMessages(prev => [...prev, newMessage]);
        
        // Mark as read if it's from them and we are active
        if (newMessage.senderId === activeChatId) {
          messageService.markAsRead(activeChatId).catch(console.error);
        }
      }

      // Update conversations list for new message
      setConversations(prev => {
        const contactId = newMessage.senderId === user?.id ? newMessage.receiverId : newMessage.senderId;
        const chatExists = prev.find(c => c._id === contactId);
        
        const timestamp = new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (chatExists) {
          return prev.map(c => c._id === contactId ? { 
            ...c, 
            unreadCount: (newMessage.senderId !== user?.id && activeChatId !== contactId) ? (c.unreadCount || 0) + 1 : c.unreadCount,
            lastMessage: newMessage.text,
            lastMessageTime: timestamp
          } : c);
        } else {
          // If we don't have this conversation in state, refetch
          fetchConversations();
          return prev;
        }
      });
    };

    const handleDeleteMessage = (messageId: string) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("delete_message", handleDeleteMessage);
    
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("delete_message", handleDeleteMessage);
    };
  }, [socket, activeChatId, user]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setShowList(false);
  };

  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    setLoadingUsers(true);
    try {
      const [staff, clients] = await Promise.all([
        staffService.getAllStaff().catch(() => []),
        clientService.getAllClients().catch(() => [])
      ]);
      const mappedStaff = staff.map((s: StaffMember) => ({ 
        id: s._id, 
        name: s.name, 
        role: s.role?.name || s.role || "Staff" 
      }));
      const mappedClients = clients.map((c: Client) => ({ 
        id: c._id, 
        name: c.name, 
        role: "Client" 
      }));
      
      const allUsers = [...mappedStaff, ...mappedClients].filter(u => u.id !== user?.id);
      setUsersList(allUsers);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChat = (selectedUserId: string, name: string, role: string) => {
    setShowNewChatModal(false);
    
    // Check if it's already in conversations
    const existing = conversations.find(c => c._id === selectedUserId);
    if (!existing) {
      // Add to conversations locally
      const newConv: Conversation = {
        _id: selectedUserId,
        contactName: name,
        contactRole: String(role),
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
      };
      setConversations(prev => [newConv, ...prev]);
    }
    
    // Open chat
    setActiveChatId(selectedUserId);
    setShowList(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeChatId || !user) return;

    const text = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      const newMessage = await messageService.sendMessage(activeChatId, text);
      
      // Update local state (if socket doesn't echo back our own messages)
      setMessages(prev => {
        if (prev.find(m => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
      
      setConversations(prev => prev.map(chat => {
        if (chat._id === activeChatId) {
          return {
            ...chat,
            lastMessage: text,
            lastMessageTime: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return chat;
      }));
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Failed to send message");
      setMessageInput(text); // restore input
    } finally {
      setSending(false);
    }
  };

  const onDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in duration-500 relative">
        {/* Sidebar - Chat List */}
        <Card className={cn(
          "w-full lg:w-80 flex flex-col overflow-hidden transition-all duration-300",
          !showList && "hidden lg:flex"
        )}>
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
              <Button size="icon" variant="primary" className="rounded-full w-8 h-8 shadow-sm hover:shadow-md transition-shadow" onClick={openNewChatModal}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Input 
              placeholder="Search chats..." 
              icon={Search} 
              size={32} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : filteredChats.map((chat) => (
              <div 
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={cn(
                  "p-5 flex gap-4 cursor-pointer transition-all border-l-4",
                  activeChatId === chat._id 
                    ? "bg-indigo-50/50 border-indigo-600" 
                    : "bg-white border-transparent hover:bg-slate-50"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner relative">
                  {chat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || "U"}
                  {onlineUsers.has(chat._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{chat.contactName || "Unknown User"}</h3>
                    <span className="text-[10px] font-bold text-slate-400">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {chat.contactRole && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium truncate max-w-[80px]">
                        {chat.contactRole}
                      </span>
                    )}
                    <p className={cn(
                      "text-xs truncate font-medium flex-1",
                      chat.unreadCount > 0 ? "text-indigo-600 font-bold" : "text-slate-500"
                    )}>
                      {chat.lastMessage || "Started a conversation"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {!loadingChats && filteredChats.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No conversations found.
              </div>
            )}
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
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                      {activeChat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || "U"}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeChat.contactName || "Unknown User"}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        onlineUsers.has(activeChat._id) ? "bg-green-500 animate-pulse" : "bg-slate-300"
                      )} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {onlineUsers.has(activeChat._id) ? "Online" : "Offline"} {activeChat.contactRole && activeChat.contactRole !== "User" ? `• ${activeChat.contactRole}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-50/30 relative">
                {loadingMessages ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center py-4">
                      <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                        Conversation Started
                      </span>
                    </div>

                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div 
                          key={msg._id || Math.random().toString()}
                          className={cn(
                            "flex gap-4 max-w-[85%] lg:max-w-[70%] animate-in fade-in duration-300",
                            isMe ? "flex-row-reverse ml-auto slide-in-from-right-4" : "slide-in-from-left-4"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                            isMe ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                          )}>
                            {isMe ? "ME" : activeChat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || "U"}
                          </div>
                          <div className={cn(
                            "space-y-1",
                            isMe ? "text-right" : "text-left"
                          )}>
                            <div className={cn(
                              "p-3.5 lg:p-4 rounded-[1.5rem] shadow-sm",
                              isMe 
                                ? "bg-indigo-600 rounded-tr-none shadow-indigo-100 text-white" 
                                : "bg-white border border-slate-100 rounded-tl-none text-slate-700"
                            )}>
                              <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                                {msg.text}
                              </p>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1.5 mt-1",
                              isMe && "justify-end mr-1",
                              !isMe && "ml-1"
                            )}>
                              <span className="text-[10px] font-bold text-slate-400">
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                              </span>
                              {isMe && <CheckCheck className={cn("w-3 h-3", msg.isRead ? "text-indigo-500" : "text-slate-300")} />}
                              {isMe && msg._id && (
                                <button 
                                  onClick={() => onDeleteMessage(msg._id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="relative group">
                  <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..." 
                    className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium disabled:opacity-70"
                    disabled={sending || loadingMessages}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button 
                      type="submit"
                      size="icon" 
                      variant="primary" 
                      className="w-10 h-10 rounded-xl disabled:opacity-50"
                      disabled={!messageInput.trim() || sending || loadingMessages}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </form>
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

      <Modal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} title="New Chat">
        <div className="space-y-4 min-h-[300px]">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {usersList.length === 0 ? (
                <div className="text-center p-8 space-y-2">
                  <p className="text-slate-500 text-sm font-medium">No users found.</p>
                  <p className="text-xs text-slate-400">There are no clients or staff members available to message right now.</p>
                </div>
              ) : usersList.map(u => (
                <div 
                  key={u.id}
                  onClick={() => handleStartChat(u.id, u.name, u.role)}
                  className="p-3 flex items-center gap-4 cursor-pointer hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 group"
                >
                  <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {u.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</h4>
                    <p className="text-xs font-medium text-slate-500">{String(u.role)}</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
