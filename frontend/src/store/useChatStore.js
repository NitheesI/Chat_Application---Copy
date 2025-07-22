import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, users } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      // Update users' lastMessage for this user
      set({
        users: users.map(u =>
          u._id === selectedUser._id
            ? {
                ...u,
                lastMessage: res.data, // assumes response is message doc with {text, image, createdAt, senderId, ...}
                unreadCount: 0 // reset unread for the open chat
              }
            : u
        ),
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages, users } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // append to current chat messages if from this contact
      const isMessageFromActiveChat = newMessage.senderId === selectedUser._id;
      if (isMessageFromActiveChat) {
        set({
          messages: [...get().messages, newMessage],
        });
      }

      // Update users' lastMessage for this user; increment unread (if not selected)
      set({
        users: users.map(u =>
          u._id === newMessage.senderId || u._id === newMessage.receiverId // either peer
            ? {
                ...u,
                lastMessage: newMessage,
                unreadCount:
                  isMessageFromActiveChat
                    ? 0
                    : (u.unreadCount || 0) + 1 // only increment unread if NOT viewing this chat
              }
            : u
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // 👇 add markMessagesAsRead to reset unreadCount when chat is opened
  markMessagesAsRead: (userId) => {
    set(state => ({
      users: state.users.map(u =>
        u._id === userId
          ? { ...u, unreadCount: 0 }
          : u
      )
    }));
  },
}));
