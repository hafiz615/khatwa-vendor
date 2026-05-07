import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { MailOpen, MessageSquare, User2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import SideBar from "../components/SideBar";
import ChatDrawer from "../components/chat/ChatDrawer";
import { getSocket } from "../socket/connection";
import { incrementUnreadCount, updateChatList } from "../slices/conversation";
import { setSubscription } from "../slices/subscription";
import { getSubscriptionData } from "../services/subscription.service";
import {
  hasChatAccess,
  hasDesignKitAccess,
  getSubscriptionPermissionObject,
} from "../utils/subscriptionAccess";

function Dashboard() {
  const [openChat, setOpenChat] = useState(false);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const socket = getSocket();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const subscriptionRepairRef = useRef(false);

  const user = useSelector((state) => state.profile.user);
  const subscriptionState = useSelector((state) => state.subscription);
  const showInvitations = hasDesignKitAccess(subscriptionState);
  const showChat = hasChatAccess(subscriptionState);
  const activeChatUserId = useSelector(
    (state) => state.conversation.activeChatUserId
  );
  const chatList = useSelector((state) => state.conversation.chatList);

  // One-time refetch if Redux has an active sub but plan permissions are missing (stale client or old API shape).
  useEffect(() => {
    if (subscriptionRepairRef.current || !token) return;
    const sub = subscriptionState?.subscription;
    if (!sub || sub.status !== "active") return;
    if (getSubscriptionPermissionObject(subscriptionState) != null) return;
    subscriptionRepairRef.current = true;
    getSubscriptionData(token)
      .then((data) => {
        if (data) dispatch(setSubscription(data));
      })
      .catch(() => {
        subscriptionRepairRef.current = false;
      });
  }, [token, dispatch, subscriptionState?.subscription]);

  useEffect(() => {
    if (location.pathname === "/dashboard/chat" && showChat) {
      setOpenChat(true);
    } else {
      setOpenChat(false);
    }
  }, [location.pathname, showChat]);

  useEffect(() => {
    if (!showChat) setOpenChat(false);
  }, [showChat]);

  useEffect(() => {
    if (!socket || !showChat) return;

    const handleUnread = ({ message }) => {
      console.log("Received unread message update:", message);
      if (activeChatUserId === message.senderId) return;
      dispatch(incrementUnreadCount(message.senderId));
    };

    const handleReceiveChatList = (chatListData) => {
      if (!chatList || chatList.length === 0) {
        dispatch(updateChatList(chatListData));
        return;
      }

      const exists = chatList.some(
        (chat) => chat.user._id === chatListData.user._id
      );

      if (!exists) {
        dispatch(updateChatList(chatListData));
      } else {
        // still dispatch to update unread count if needed
        dispatch(updateChatList(chatListData));
      }
    };

    socket.on("chat_unread_update", handleUnread);
    socket.on("update_chat_list", handleReceiveChatList);

    return () => {
      socket.off("chat_unread_update", handleUnread);
      socket.off("update_chat_list", handleReceiveChatList);
    };
  }, [socket, dispatch, activeChatUserId, showChat]);

  // Listen for real-time project invitation events
  useEffect(() => {
    const handleNewInvitation = (e) => {
      const { projectName } = e.detail || {};
      toast(
        (t) => (
          <div>
            <p className="font-semibold text-sm">New project invitation</p>
            {projectName && (
              <p className="text-xs text-gray-600 mt-0.5">"{projectName}"</p>
            )}
            <button
              className="mt-2 text-xs text-blue-600 hover:underline"
              onClick={() => {
                navigate("/dashboard/invitations");
                toast.dismiss(t.id);
              }}
            >
              View Invitations →
            </button>
          </div>
        ),
        { duration: 8000, icon: "📋" }
      );
      setPendingInvitationsCount((n) => n + 1);
    };

    window.addEventListener("new_project_invitation", handleNewInvitation);
    return () =>
      window.removeEventListener("new_project_invitation", handleNewInvitation);
  }, [navigate]);

  // Clear badge when vendor navigates to invitations
  useEffect(() => {
    if (location.pathname.includes("/dashboard/invitations")) {
      setPendingInvitationsCount(0);
    }
  }, [location.pathname]);

  const unreadTotal = chatList.reduce((acc, chat) => acc + chat.unreadCount, 0);
  const isInvitationActive = location.pathname.includes("/dashboard/invitations");
  const isChatActive = openChat;

  const handleChatClick = () => {
    if (!showChat) return;
    setOpenChat(true);
    navigate("/dashboard/chat");
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50 relative">
      <SideBar />

      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <header className="flex justify-end items-center gap-4 bg-white border border-b-1 px-6 py-2 sticky top-0 z-40">
          {showInvitations && (
            <Link
              to="/dashboard/invitations"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                isInvitationActive
                  ? "bg-blue-100 text-blue-600"
                  : "hover:scale-105 text-gray-600"
              }`}
            >
              <MailOpen
                className={`w-6 h-6 transition-colors duration-200 ${
                  isInvitationActive ? "text-blue-600" : "text-gray-600"
                }`}
              />
              <span className="text-sm font-medium hidden sm:block">
                Invitations
              </span>
              {isInvitationActive && (
                <span className="absolute top-2 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
              {!isInvitationActive && pendingInvitationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[11px] font-semibold text-white bg-red-500 rounded-full shadow-md">
                  {pendingInvitationsCount > 9 ? "9+" : pendingInvitationsCount}
                </span>
              )}
            </Link>
          )}

          {showChat && (
            <button
              type="button"
              onClick={handleChatClick}
              className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                isChatActive
                  ? "bg-blue-100 text-blue-600"
                  : "hover:scale-105 text-gray-600"
              }`}
            >
              <MessageSquare
                className={`w-6 h-6 transition-colors duration-200 ${
                  isChatActive ? "text-blue-600" : "text-gray-600"
                }`}
              />
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[11px] font-semibold text-white bg-red-500 rounded-full shadow-md">
                  {unreadTotal}
                </span>
              )}
            </button>
          )}

          {/* Profile Section */}
          <div className="flex items-center cursor-pointer border-[2px] rounded-full hover:shadow-md transition">
            <Link to={"/dashboard/profile"}>
              {user.profile ? (
                <img
                  src={user.profile}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <User2 className="w-7 h-7" />
                </div>
              )}
            </Link>
          </div>
        </header>

        <div className="px-6 pb-6 max-w-7xl mx-auto mt-4">
          <Outlet />
        </div>
      </main>

      {showChat && (
        <ChatDrawer
          open={openChat}
          onClose={() => {
            setOpenChat(false);
            navigate(-1);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;