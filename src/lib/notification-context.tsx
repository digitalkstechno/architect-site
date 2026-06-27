"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { api } from "@/services/api";
import endPointApi from "@/lib/endpoints";
import toast from "react-hot-toast";

export interface Notification {
  _id: string;
  recipient: string;
  text: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  unreadMessageCount: number;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<number>>;
  refreshUnreadMessageCount: () => Promise<void>;
  onlineUsers: Set<string>;
  setActiveChatId: (id: string | null) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const activeChatIdRef = React.useRef<string | null>(null);

  const setActiveChatId = React.useCallback((id: string | null) => {
    activeChatIdRef.current = id;
  }, []);

  useEffect(() => {
    if (!user || user.role === "guest") {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.IO
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(API_URL);

    newSocket.on("connect", () => {
      newSocket.emit("join", user.id);
    });

    newSocket.on("new_notification", (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.text, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    });

    newSocket.on("online_users", (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    newSocket.on("user_status", ({ userId, isOnline }: { userId: string, isOnline: boolean }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    newSocket.on("receive_message", (message: any) => {
      // Check if message is for us and we are not the sender
      if (message.receiverId === user.id) {
        // Only increment if we are not actively viewing this chat
        if (activeChatIdRef.current !== message.senderId) {
          setUnreadMessageCount(prev => prev + 1);
          // Toast for message
          toast.success("New message received", {
            icon: '💬',
            style: {
              borderRadius: '10px',
              background: '#4f46e5',
              color: '#fff',
            },
          });
        }
      }
    });

    setSocket(newSocket);

    // Fetch history
    fetchNotifications();
    fetchUnreadMessageCount();

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await api.get(endPointApi.messageConversations);
      if (Array.isArray(response)) {
        const total = response.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadMessageCount(total);
      }
    } catch (error) {
      console.error("Failed to fetch unread messages count", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(endPointApi.notifications);
      setNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      await api.patch(endPointApi.notificationRead(id));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.patch(endPointApi.notificationReadAll);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications: notifications || [], 
      unreadCount, 
      unreadMessageCount, 
      setUnreadMessageCount, 
      refreshUnreadMessageCount: fetchUnreadMessageCount,
      onlineUsers,
      setActiveChatId,
      markAsRead, 
      markAllAsRead, 
      socket 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
