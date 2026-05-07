import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Check, MessageSquare } from "lucide-react";
import { getChatList } from "../../services/chat.service";
import { setChatList } from "../../slices/conversation";
import { User2 } from "lucide-react";

function ChatList({ onSelect, selected }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const chatList = useSelector((state) => state.conversation.chatList);
  // console.log("chatList from state:", chatList);
  // console.log("ChatList render:", chatList);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const result = await getChatList(token);
        if (result.success) {
          console.log("Fetched chat list:", result.data);
          dispatch(setChatList(result.data));
        } else {
          toast.error("Failed to fetch chat");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch chat");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchChats();
  }, []);

  return (
    <div className="p-3">
      <h2 className="font-semibold mb-3">Messages</h2>
      <div className="space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="loader"> </div>
            <p>Loading chats...</p>
          </div>
        ) : chatList?.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p>No messages yet</p>
          </div>
        ) : (
          // Chat List
          chatList.map(({ user, unreadCount }) => (
            <div
              key={user._id}
              onClick={() => onSelect(user)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition
    ${selected?._id === user._id ? "bg-blue-50" : "hover:bg-gray-100"}`}
            >
              {/* Avatar */}
              {user.profile ? (
                <img
                  src={user.profile}
                  alt={user.name}
                  className="
          rounded-md object-cover ring-1 ring-black
          w-10 h-10 
          md:w-14 md:h-14
        "
                />
              ) : (
                <User2
                  className="
          text-gray-400 rounded-md ring-1 ring-black
          w-10 h-10
          md:w-14 md:h-14
        "
                />
              )}

              {/* Text Area */}
              <div className="flex-1 min-w-0">
                {/* Name (truncate long names) */}
                <p className="font-medium text-sm md:text-base truncate">
                  {user.name}
                </p>

                {/* Bio (hidden on mobile) */}
                <p className="text-xs text-gray-500 truncate hidden md:block">
                  {user.bio || "No bio available"}
                </p>

                {/* Unread Badge — only show if > 0 */}
                {unreadCount > 0 && (
                  <span className="inline-block sm:bg-blue-600 sm:text-white text-[10px] px-2 py-0.5 rounded-full mt-1">
                    {unreadCount}{" "}
                    {unreadCount === 1 ? (
                      <span className="">new message</span>
                    ) : (
                      <span className="">new messages</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;