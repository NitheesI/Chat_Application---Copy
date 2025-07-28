import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { MdPersonSearch } from "react-icons/md";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users by online status and search query with safe checks
  const filteredUsers = users
    .filter((user) =>
      showOnlineOnly ? onlineUsers.includes(user?._id) : true
    )
    .filter((user) =>
      user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isUsersLoading) return <SidebarSkeleton />;

  // Helper function to get last message preview safely
  const getLastMessagePreview = (user) => {
    if (!user?.lastMessage) return "No messages yet";
    const fromMe = user.lastMessage.senderId === authUser?._id;
    if (user.lastMessage.text) {
      return (fromMe ? "You: " : "") + user.lastMessage.text;
    }
    if (user.lastMessage.image) {
      return fromMe ? "You sent an attachment" : "Sent an attachment";
    }
    return "No messages yet";
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <div className="relative flex items-center w-full">
            <span className="absolute left-3 text-zinc-400 pointer-events-none">
              <MdPersonSearch size={20} />
            </span>
            <input
              type="text"
              id="searchContact"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-lg bg-base-200 border border-base-300 focus:border-primary focus:bg-white outline-none transition-all duration-200 w-full text-sm placeholder:text-zinc-400"
            />
            <button
              className="ml-2 px-3 py-2 rounded-lg bg-base-300 hover:bg-base-400 transition text-sm"
              title="Search"
              tabIndex={-1}
              type="button"
            >
              <MdPersonSearch size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user?._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user?._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              ${onlineUsers.includes(user?._id) ? "ring-2 ring-green-500" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user?.profilePic || "/avatar.png"}
                alt={user?.fullName || "User avatar"}
                className="size-12 object-cover rounded-full"
              />
              {/* Online indicator */}
              {onlineUsers.includes(user?._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                  title="Online"
                  aria-label="Online"
                />
              )}
              {/* Unread message badge */}
              {user?.unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-4 flex items-center justify-center shadow"
                  title={`${user.unreadCount} unread message${user.unreadCount === 1 ? "" : "s"}`}
                >
                  {user.unreadCount > 99 ? "99+" : user.unreadCount}
                </span>
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className={`font-medium truncate ${user?.unreadCount > 0 ? "font-bold" : ""}`}>
                {user?.fullName}
                {onlineUsers.includes(user?._id) && (
                  <span className="ml-2 text-xs text-green-500 font-semibold">Online</span>
                )}
              </div>
              <div className="text-xs text-zinc-400 truncate">
                {getLastMessagePreview(user)}
              </div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

