import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { MdSearch } from "react-icons/md";

const ChatHeader = ({ searchText, setSearchText }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between gap-2">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative overflow-hidden">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Spacer to push search and close button to the right */}
        <div className="flex items-center gap-2">
          {/* Styled Search Box */}
          <div className="relative flex items-center w-40 md:w-56">
            <span className="absolute left-2 text-zinc-400 pointer-events-none">
              <MdSearch size={20} />
            </span>
            <input
              type="text"
              placeholder="Search messages"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-base-200 focus:bg-white border border-base-300 focus:border-primary outline-none transition-all duration-200 w-full text-sm placeholder:text-zinc-400"
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 rounded-full hover:bg-base-200 transition"
            title="Close"
          >
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
