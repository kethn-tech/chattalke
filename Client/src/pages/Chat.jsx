import React, { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./chat-components/contacts-container";
import EmptyChatContainer from "./chat-components/empty-chat-container";
import ChatContainer from "./chat-components/chat-container";

const Chat = () => {
  const { userInfo, selectedChatType, selectedChatData } = useStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide sidebar on mobile when chat is selected
      if (mobile && selectedChatData) {
        setShowSidebar(false);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, [selectedChatData]);

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast.warning("Please complete profile to continue");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  // Mobile: Show contacts or chat based on selection
  // Desktop: Show both
  const showContacts = !isMobile || !selectedChatData || showSidebar;
  const showChat = !isMobile || selectedChatData;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-primary">
      {/* Mobile Overlay */}
      {isMobile && showSidebar && selectedChatData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Contacts Container */}
      <div
        className={`${
          isMobile
            ? showContacts
              ? "w-full"
              : selectedChatData
              ? showSidebar
                ? "fixed left-0 top-0 bottom-0 w-80 z-50"
                : "hidden"
              : "w-full"
            : "w-[280px] flex-shrink-0"
        } transition-all duration-300`}
      >
        <ContactsContainer
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          isMobile={isMobile}
          showSidebar={showSidebar}
        />
      </div>

      {/* Chat Container */}
      <div
        className={`${
          isMobile
            ? showChat && selectedChatData && !showSidebar
              ? "w-full"
              : "hidden"
            : "flex-1"
        } transition-all duration-300`}
      >
        {selectedChatType === undefined ? (
          <EmptyChatContainer />
        ) : (
          <ChatContainer
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
