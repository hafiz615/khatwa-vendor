import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { getSocket } from "../../socket/connection";
import { resetUnreadCount, setActiveChat } from "../../slices/conversation";

function ChatDrawer({ open, onClose }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const socket = getSocket();
  const dispatch = useDispatch();

  // when user opens a chat
  const handleOpenChat = (chat) => {
    // console.log("Opening chat with:", chat);
    setSelectedChat(chat);
    dispatch(setActiveChat(chat._id));
    dispatch(resetUnreadCount(chat._id));

    // reset unread count locally
    // console.log("Resetting unread count for chat:", chat._id);
    dispatch(resetUnreadCount(chat._id));
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 
        ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex h-full">
        {/* Chat List */}
        <div className="w-4/12 lg:w-3/12 border-r bg-gray-50">
          <ChatList onSelect={handleOpenChat} selected={selectedChat} />
        </div>

        {/* Chat Window */}
        <div className="w-8/12 lg:w-9/12 flex-1">
          {selectedChat ? (
            <ChatWindow chat={selectedChat} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={()=>{
          onClose();
          setSelectedChat(null);
        }}
        className="absolute top-5 right-7 text-gray-500 hover:text-gray-800 z-50"
      >
        <X 
        />
      </button>
    </div>
  );
}

export default ChatDrawer;