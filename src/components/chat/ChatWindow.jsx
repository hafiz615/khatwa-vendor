import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatEndpoints } from "../../services/api";
import { setConversations } from "../../slices/conversation";
import apiConnector from "../../services/apiConnector";
import { getSocket } from "../../socket/connection";
import toast from "react-hot-toast";
import { Image as ImageIcon, X, Loader2, Send } from "lucide-react";
import ChatHeader from "./ChatHeader";
import Conversation from "./Conversation";

function ChatWindow({ chat }) {
  const token = useSelector((state) => state.auth.token);
  const { conversations, chatList } = useSelector((state) => state.conversation);
  const user = useSelector((state) => state.profile.user);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const socket = getSocket();
  const messagesRef = useRef(null);
  const shouldScrollBottom = useRef(true);
  const isFetchingRef = useRef(false);

  // Reset state when chat changes
  useEffect(() => {
    if (!chat?._id) return;
    
    console.log("Chat changed, resetting state");
    dispatch(setConversations([]));
    setPage(1);
    setHasMore(true);
    setInitialLoadComplete(false);
    isFetchingRef.current = false;
    shouldScrollBottom.current = true;
    
    fetchMessages(1, true);
  }, [chat?._id]);

  const fetchMessages = async (pageNum = 1, isInitialLoad = false) => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping...");
      return;
    }

    if (!hasMore && !isInitialLoad) {
      console.log("No more messages to fetch");
      return;
    }

    if (!chat?._id) {
      console.log("No chat ID");
      return;
    }

    console.log("Fetching messages for page:", pageNum);
    isFetchingRef.current = true;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const el = messagesRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;
    const prevScrollTop = el?.scrollTop || 0;

    try {
      const { data } = await apiConnector(
        "GET",
        `${chatEndpoints.CONVERSATION_API}/${chat._id}?page=${pageNum}&limit=20`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      const newMessages = Array.isArray(data?.messages) ? data.messages : [];
      const pagination = data.pagination || {};
      
      console.log("Fetched messages:", newMessages.length, "Has more:", pagination.hasMore);
      
      setHasMore(pagination.hasMore);

      // Messages come in reverse order from API, so reverse them
      const orderedMessages = [...newMessages].reverse();
      
      if (orderedMessages.length > 0 && isInitialLoad) {
        setChatId(orderedMessages[0].chatId);
      }

      dispatch(
        setConversations(
          isInitialLoad
            ? orderedMessages
            : [
                ...orderedMessages,
                ...(Array.isArray(conversations) ? conversations : []),
              ]
        )
      );

      setPage(pageNum + 1);

      // Handle scroll position
      if (isInitialLoad) {
        // For initial load, scroll to bottom after render
        setInitialLoadComplete(true);
        setTimeout(() => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        }, 100);
      } else {
        // For pagination (loading older messages), maintain scroll position
        setTimeout(() => {
          if (el) {
            const newScrollHeight = el.scrollHeight;
            const scrollDiff = newScrollHeight - prevScrollHeight;
            el.scrollTop = prevScrollTop + scrollDiff;
          }
        }, 100);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  // Handle scroll for pagination
  useEffect(() => {
    const el = messagesRef.current;
    if (!el || !initialLoadComplete) return;

    const handleScroll = () => {
      // Update shouldScrollBottom flag
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      shouldScrollBottom.current = isNearBottom;

      // Load more messages when scrolling near top
      if (el.scrollTop < 100 && hasMore && !isFetchingRef.current) {
        console.log("Near top, fetching more messages");
        fetchMessages(page, false);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, initialLoadComplete]);

  // Auto-scroll to bottom when new messages arrive (if user is near bottom)
  useEffect(() => {
    const el = messagesRef.current;
    if (!el || !initialLoadComplete) return;

    if (shouldScrollBottom.current) {
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [conversations.length]);

  const handleSend = async () => {
    if ((!newMessage.trim() && images.length === 0) || uploading) return;

    const urls = [];
    setUploading(true);
    try {
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img));
        const { data } = await apiConnector(
          "POST",
          chatEndpoints.CHAT_IMAGES_API,
          formData,
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          }
        );
        urls.push(...(data.urls || data.data || []));
      }

      socket.emit("send_message", {
        receiverId: chat._id,
        content: newMessage.trim(),
        images: urls,
      });

      setNewMessage("");
      setImages([]);
      shouldScrollBottom.current = true;
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      console.log("Received message:", msg, "Current chatId:", chatId);
      if (msg.chatId !== chatId) return;
      
      dispatch(setConversations([...conversations, msg]));
      shouldScrollBottom.current = true;
    };

    const handleMessageStatusUpdate = ({ id, status }) => {
      dispatch(
        setConversations(
          conversations.map((m) => (m._id === id ? { ...m, status } : m))
        )
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_status_update", handleMessageStatusUpdate);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_status_update", handleMessageStatusUpdate);
    };
  }, [socket, chatId, conversations, dispatch]);

  // Mark messages as read
  useEffect(() => {
    if (!socket || !chatId) return;

    const timer = setTimeout(() => {
      socket.emit("mark_as_read", { chatId });
    }, 250);

    return () => clearTimeout(timer);
  }, [socket, chatId, conversations.length]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {chat && <ChatHeader chat={chat} />}

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-2 relative"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e2e8f0" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {loadingMore && (
          <div className="absolute top-2 left-0 right-0 flex justify-center z-20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-medium bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200/60">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              Loading older messages...
            </div>
          </div>
        )}

        {loading && conversations.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="font-medium">Loading messages...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-16 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Send className="w-7 h-7 text-slate-300" />
            </div>
            <span className="font-medium">No messages yet</span>
            <span className="text-xs text-slate-300">
              Start the conversation
            </span>
          </div>
        ) : (
          conversations.map((msg, i) => {
            const isMe = msg.senderId === user?.id;
            const prevMsg = conversations[i - 1];
            const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
            const hasImages = msg.images?.length > 0;
            const hasText = msg.content && msg.content.trim();

            return (
              <Conversation
                key={msg._id || i}
                msg={msg}
                isSameSender={isSameSender}
                hasText={hasText}
                isMe={isMe}
                hasImages={hasImages}
              />
            );
          })
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-lg p-4 flex flex-col gap-3 shadow-lg border-t border-slate-200/60">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {images.map((img, index) => (
              <div key={index} className="relative w-20 h-20 group">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover rounded-xl border-2 border-slate-200 shadow-md group-hover:scale-105 transition-transform"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="w-6 h-6 border-3 border-t-transparent border-white rounded-full animate-spin" />
                  </div>
                )}
                {!uploading && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="cursor-pointer p-3 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full hover:from-emerald-100 hover:to-emerald-50 transition-all hover:scale-110 shadow-sm border border-slate-200/60">
            <ImageIcon className="w-5 h-5 text-slate-600" />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 border-2 border-slate-200/60 rounded-full px-5 py-3 text-sm bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400 shadow-sm"
            placeholder={
              images.length > 0 ? "Add caption (optional)" : "Type a message..."
            }
            disabled={uploading}
          />

          <button
            onClick={handleSend}
            disabled={uploading || (!newMessage.trim() && images.length === 0)}
            className={`p-3 rounded-full text-sm font-medium transition-all shadow-md ${
              uploading || (!newMessage.trim() && images.length === 0)
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:scale-110 shadow-emerald-200/50"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;