import React from "react";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";
import { useStore } from "@/store/store";
import DMList from "./components/dm-list/DMList";
import AdminLink from "./components/admin-link";
import { motion } from "framer-motion";
import { MessageSquare, Users, X } from "lucide-react";

const ContactsContainer = ({ onToggleSidebar, isMobile, showSidebar }) => {
  const { dmContacts, setDmContacts, selectedChatData } = useStore();

  useEffect(() => {
    const getDMContacts = async () => {
      try {
        const response = await apiClient.get("/api/contact/get-dm-list", {
          withCredentials: true,
        });
        if (response.data.contacts) {
          setDmContacts(response.data.contacts);
        }
      } catch (error) {
        console.error("Error in getDMContacts:", error);
      }
    };
    getDMContacts();
  }, []);

  return (
    <motion.div
      initial={{ x: isMobile ? 0 : -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`${
        isMobile ? "w-full h-screen" : "w-full md:w-[280px] h-screen"
      } bg-dark-primary/95 border-r border-dark-accent/30 backdrop-blur-sm shadow-glow flex flex-col relative overflow-hidden`}
    >
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-violet-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-primary/80 to-transparent pointer-events-none" />

      <div className="flex-1 overflow-hidden relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between h-16 border-b border-dark-accent/30 bg-dark-accent/5 px-4"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text">
            Messages
          </h1>

          {/* Close button for mobile when chat is selected */}
          {isMobile && selectedChatData && showSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-dark-accent/30 rounded-lg transition-colors"
            >
              <X size={20} className="text-dark-text" />
            </button>
          )}
        </motion.div>

        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-3 mt-4"
          >
            <div className="flex items-center gap-2 text-dark-text/80">
              <MessageSquare size={18} className="text-blue-500" />
              <span className="text-sm font-medium">Direct Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <AdminLink />
              <NewDm />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DMList isMobile={isMobile} />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto border-t border-dark-accent/30 bg-dark-accent/5 backdrop-blur-sm relative z-10"
      >
        <ProfileInfo />
      </motion.div>
    </motion.div>
  );
};

export default ContactsContainer;