import React, { useEffect } from "react";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./chat-components/contacts-container";
import EmptyChatContainer from "./chat-components/empty-chat-container";
import ChatContainer from "./chat-components/chat-container";

const Chat = () => {
  const { userInfo, selectedChatType } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast.warning("Please complete profile to continue");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex w-full min-h-screen bg-dark-primary">
      <div className="flex-none lg:block">
        <ContactsContainer />
      </div>
      <div className="flex-1">
<<<<<<< HEAD
        {selectedChatType === undefined ? (
          <EmptyChatContainer />
        ) : (
          <ChatContainer />
        )}
=======
        {selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />}
>>>>>>> a8e3c83853af57c1e907180ab061af3e9b482959
      </div>
    </div>
  );
};

export default Chat;