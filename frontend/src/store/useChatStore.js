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
      toast.error(error.response?.data?.message || "Failed to fetch users");
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
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, users } = get();
    if (!selectedUser?._id) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      set({
        users: users.map(u =>
          u._id === selectedUser._id
            ? { ...u, lastMessage: res.data, unreadCount: 0 }
            : u
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  addMessage: (newMessage) => {
    const { selectedUser, authUser } = useAuthStore.getState();
    const { messages, users } = get();

    // Check if the message belongs to the current chat
    const isInActiveChat =
      selectedUser &&
      ((newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser?._id) ||
        (newMessage.senderId === authUser?._id && newMessage.receiverId === selectedUser._id));

    if (isInActiveChat) {
      set({ messages: [...messages, newMessage] });
    }

    // Update last message and unread counts
    set({
      users: users.map(u => {
        if (u._id === newMessage.senderId || u._id === newMessage.receiverId) {
          return {
            ...u,
            lastMessage: newMessage,
            unreadCount: isInActiveChat ? 0 : (u.unreadCount || 0) + 1,
          };
        }
        return u;
      }),
    });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) return;

    // Always clean up first to prevent duplicates
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      // Just delegate to addMessage for consistent logic
      get().addMessage(newMessage);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

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
