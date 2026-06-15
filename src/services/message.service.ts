import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string; // contact ID
  contactName: string;
  contactRole?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const messageService = {
  getConversations: async (): Promise<Conversation[]> => {
    return api.get<Conversation[]>(endPointApi.messageConversations);
  },

  getMessages: async (contactId: string): Promise<Message[]> => {
    return api.get<Message[]>(endPointApi.messagesByContact(contactId));
  },

  sendMessage: async (receiverId: string, text: string): Promise<Message> => {
    return api.post<Message>(endPointApi.messages, { receiverId, text });
  },

  markAsRead: async (contactId: string): Promise<void> => {
    return api.patch(endPointApi.markMessagesRead(contactId));
  },

  deleteMessage: async (id: string): Promise<void> => {
    return api.delete(endPointApi.deleteMessage(id));
  }
};
