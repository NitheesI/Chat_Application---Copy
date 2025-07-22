import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatChatDate } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [searchNavIndex, setSearchNavIndex] = useState(0);
  const searchedMessageRefs = useRef([]); // Array of refs for matching messages

  // Clear nav index on searchText change
  useEffect(() => {
    setSearchNavIndex(0);
  }, [searchText]);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    if (markMessagesAsRead) {
      markMessagesAsRead(selectedUser._id);
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, markMessagesAsRead]);

  useEffect(() => {
    if (messageEndRef.current && messages?.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Filter messages by searchText ---
  const filteredMessages = searchText.trim()
    ? messages.filter(
        msg =>
          (msg.text && msg.text.toLowerCase().includes(searchText.toLowerCase())) ||
          (msg.image && msg.image.toLowerCase().includes(searchText.toLowerCase()))
      )
    : messages;

  // Find ALL search matches in original messages for navigation
  const searchMatchIndexes = searchText.trim()
    ? messages.reduce((arr, msg, idx) => {
        if (
          (msg.text && msg.text.toLowerCase().includes(searchText.toLowerCase())) ||
          (msg.image && msg.image.toLowerCase().includes(searchText.toLowerCase()))
        ) {
          arr.push(idx);
        }
        return arr;
      }, [])
    : [];

  // On searchNavIndex, scroll to that message
  useEffect(() => {
    if (!searchText.trim() || searchMatchIndexes.length === 0) return;
    const ref = searchedMessageRefs.current[searchNavIndex];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchNavIndex, searchText, searchMatchIndexes]);

  // Keyboard: next (Enter), previous (Shift+Enter)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!searchText.trim() || searchMatchIndexes.length <= 1) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        setSearchNavIndex(i =>
          i + 1 < searchMatchIndexes.length ? i + 1 : 0
        );
      }
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        setSearchNavIndex(i =>
          i - 1 >= 0 ? i - 1 : searchMatchIndexes.length - 1
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchText, searchMatchIndexes.length]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader searchText={searchText} setSearchText={setSearchText} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader searchText={searchText} setSearchText={setSearchText} />

      {/* Search navigation controls */}
      {searchText.trim() && searchMatchIndexes.length > 1 && (
        <div className="flex items-center gap-3 px-4 pt-2 pb-1">
          <button
            className="px-2 py-1 rounded bg-base-300 hover:bg-base-400 text-sm"
            onClick={() =>
              setSearchNavIndex(i =>
                i - 1 >= 0 ? i - 1 : searchMatchIndexes.length - 1
              )
            }
          >
            Prev
          </button>
          <span className="text-xs text-zinc-500">
            {searchNavIndex + 1} / {searchMatchIndexes.length} match
            {searchMatchIndexes.length > 1 ? "es" : ""}
          </span>
          <button
            className="px-2 py-1 rounded bg-base-300 hover:bg-base-400 text-sm"
            onClick={() =>
              setSearchNavIndex(i =>
                i + 1 < searchMatchIndexes.length ? i + 1 : 0
              )
            }
          >
            Next
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, idx) => {
            const currentDate = formatChatDate(message.createdAt);
            const previousDate =
              idx > 0 ? formatChatDate(messages[idx - 1].createdAt) : null;
            const showDateSeparator = currentDate !== previousDate;

            // Is this message a search match?
            const matchIdx = searchMatchIndexes.indexOf(idx);

            return (
              <div key={message._id}>
                {showDateSeparator && (
                  <div className="text-center text-sm text-gray-500 my-4">
                    {currentDate}
                  </div>
                )}

                <div
                  className={
                    `chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} ` +
                    (matchIdx !== -1 && matchIdx === searchNavIndex && searchText.trim() ? "ring-2 ring-primary" : "")
                  }
                  ref={el => {
                    // Store a ref for each search match for navigation
                    if (matchIdx !== -1) searchedMessageRefs.current[matchIdx] = el;
                    // Always keep scrolling to end for the last message
                    if (idx === messages.length - 1) messageEndRef.current = el;
                  }}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={
                          message.senderId === authUser._id
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                  <div className="chat-bubble flex flex-col">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-zinc-500 py-4">No messages found</div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
