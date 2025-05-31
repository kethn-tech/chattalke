export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatMessages: [],
  selectedChatData: undefined,
  dmContacts: [],
  unreadMessages: {},
  onlineUsers: [],

  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setUnreadMessages: (unreadMessages) => set({ unreadMessages }),
  setSelectedChatData: (selectedChatData) => {
    // Clear unread messages when selecting a chat
    if (selectedChatData) {
      const unreadMessages = get().unreadMessages;
      set({
        selectedChatData,
        unreadMessages: {
          ...unreadMessages,
          [selectedChatData._id]: 0,
        },
      });
    } else {
      set({ selectedChatData });
    }
  },
  setDmContacts: (dmContacts) => set({ dmContacts }),

  closeChat: () => {
    set({
      selectedChatType: undefined,
      selectedChatMessages: [],
      selectedChatData: undefined,
    });
  },

  deleteMessage: (messageId) => {
    const selectedChatMessages = get().selectedChatMessages;
    const filteredMessages = selectedChatMessages.filter(
      (msg) => msg._id !== messageId
    );

    // If no messages left, remove contact from DM list
    if (filteredMessages.length === 0 && get().selectedChatData) {
      const dmContacts = get().dmContacts;
      const updatedContacts = dmContacts.filter(
        (contact) => contact._id !== get().selectedChatData._id
      );
      set({
        selectedChatMessages: [],
        dmContacts: updatedContacts,
        selectedChatData: undefined,
        selectedChatType: undefined,
      });
    } else {
      set({
        selectedChatMessages: filteredMessages,
      });
    }
  },

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;
    const dmContacts = get().dmContacts;
    const userInfo = get().userInfo;
    const unreadMessages = get().unreadMessages;

    // Determine the other user in the DM
    let otherUser = null;
    if (userInfo) {
      if (message.sender && message.sender._id !== userInfo._id) {
        otherUser = message.sender;
        // Increment unread count if this chat is not currently selected
        if (
          !get().selectedChatData ||
          get().selectedChatData._id !== message.sender._id
        ) {
          set({
            unreadMessages: {
              ...unreadMessages,
              [message.sender._id]:
                (unreadMessages[message.sender._id] || 0) + 1,
            },
          });
        }
      } else if (message.recipient && message.recipient._id !== userInfo._id) {
        otherUser = message.recipient;
      }
    }

    // Move the relevant contact to the top or add if not present
    let updatedContacts = dmContacts.slice();
    if (otherUser) {
      const existingIndex = dmContacts.findIndex(
        (c) => c._id === otherUser._id
      );
      if (existingIndex !== -1) {
        // Move to top
        const [contact] = updatedContacts.splice(existingIndex, 1);
        updatedContacts = [contact, ...updatedContacts];
      } else {
        // Add to top (for first-time message)
        updatedContacts = [otherUser, ...updatedContacts];
        // Trigger notification for new DM contact (both sender and receiver)
        if (typeof get().triggerNotification === "function") {
          get().triggerNotification({ type: "new_dm", user: otherUser });
        }
        // Optionally, trigger notification for the current user if they are the receiver
        if (
          userInfo &&
          message.recipient &&
          message.recipient._id === userInfo._id
        ) {
          if (typeof get().triggerNotification === "function") {
            get().triggerNotification({
              type: "new_dm_received",
              user: message.sender,
            });
          }
        }
        // Optionally, set selectedChatData to the new contact if desired
        set({ selectedChatData: otherUser, selectedChatType: "dm" });
      }
      set({ dmContacts: updatedContacts });
    }

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "group"
              ? message.recipient
              : message.recipient,
          sender:
            selectedChatType === "group" ? message.sender : message.sender,
        },
      ],
    });
  },
});