import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  chatList: [],
  activeChatUserId: null,
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload || [];
    },
    setChatList: (state, action) => {
      state.chatList = action.payload;
    },
    incrementUnreadCount: (state, action) => {
      const senderId = action.payload;
      const chat = state.chatList.find( c => c.user._id === senderId);
      if(chat){
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
    },
    setActiveChat:(state, action) => {
      state.activeChatUserId =  action.payload;
    },
    resetUnreadCount: (state, action) => {
      const senderId = action.payload;
      const chat = state.chatList.find( c => c.user._id === senderId && state.activeChatUserId === senderId);
      console.log(state.chatList.find( c => c.user._id === senderId && state.activeChatUserId === senderId));
      if(chat){
        chat.unreadCount = 0;
      }
    },
    updateChatList: (state, action) => {
  const updatedChat = action.payload;
  const existingIndex = state.chatList.findIndex(
    (chat) => chat.user._id === updatedChat.user._id
  );

  if (existingIndex !== -1) {
    // 🔄 Update existing chat (merge new data)
    state.chatList[existingIndex] = {
      ...state.chatList[existingIndex],
      ...updatedChat,
      unreadCount: updatedChat.unreadCount ?? state.chatList[existingIndex].unreadCount,
    };
  } else {
    // ➕ Add new chat if not found
    state.chatList.unshift(updatedChat);
  }
},

  },
});

export const { setConversations, setChatList, incrementUnreadCount, resetUnreadCount, setActiveChat, updateChatList } = conversationSlice.actions;
export default conversationSlice.reducer;
