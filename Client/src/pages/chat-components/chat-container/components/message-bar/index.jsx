import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/apiClient";
import { motion } from "framer-motion";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";

const MessageContainer = () => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showActions, setShowActions] = useState({});

  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const scrollToBottom = () => {
    setIsScrolling(true);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => setIsScrolling(false), 1000);
  };

  const fetchMessages = async () => {
    try {
      const res = await apiClient.post(
        "/api/message/get-messages",
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (res.data.chat) {
        setSelectedChatMessages(res.data.chat);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages]);

  useEffect(() => {
    if (selectedChatData) {
      if (selectedChatType === "dm") {
        fetchMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  // Function to handle opening delete dialog
  const handleOpenDeleteDialog = (message) => {
    setSelectedMessage(message);
    setShowDeleteDialog(true);
  };

  const socket = useSocket();

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      // Emit delete message event to socket
      socket.emit("deleteMessage", {
        messageId: selectedMessage._id,
        sender: selectedMessage.sender._id,
        recipient: selectedMessage.recipient._id,
      });

      setShowDeleteDialog(false);
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleCopy = (messageId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast.success("Message copied to clipboard");

    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Toggle message actions for mobile
  const toggleMessageActions = (messageId) => {
    setShowActions((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Function to format message preview
  const formatMessagePreview = (content) => {
    if (!content) return "Empty message";
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("DD-MM-YYYY");
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;

      const isSender =
        selectedChatType === "dm"
          ? typeof message.sender === "object"
            ? message.sender._id === userInfo._id
            : message.sender === userInfo._id
          : message.sender._id === userInfo._id;
      const isCopied = copiedMessageId === message._id;
      const actionsVisible = showActions[message._id];

      return (
        <motion.div
          key={message._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          {showDate && (
            <div className="sticky top-2 bg-dark-accent/20 text-dark-muted py-1.5 px-4 text-center text-xs rounded-full my-4 backdrop-blur-sm z-10 w-fit">
              {messageDate}
            </div>
          )}
          <div
            className={`flex ${
              isSender ? "justify-end" : "justify-start"
            } w-full my-1 px-2 sm:px-4`}
          >
            <div
              className={`relative max-w-[85%] sm:max-w-[70%] group`}
              onMouseEnter={() =>
                !isMobile &&
                setShowActions((prev) => ({ ...prev, [message._id]: true }))
              }
              onMouseLeave={() =>
                !isMobile &&
                setShowActions((prev) => ({ ...prev, [message._id]: false }))
              }
              onTouchStart={() => isMobile && toggleMessageActions(message._id)}
            >
              {/* Message actions - responsive positioning */}
              {(actionsVisible || (!isMobile && showActions[message._id])) &&
                isSender && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute ${
                      isMobile
                        ? "top-full left-0 mt-2 flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border z-20"
                        : "-left-16 top-2 flex-col"
                    } flex gap-1`}
                  >
                    <button
                      onClick={() => handleCopy(message._id, message.content)}
                      className={`${
                        isMobile
                          ? "flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          : "p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                      } transition-colors`}
                    >
                      <Copy size={isMobile ? 16 : 14} />
                      {isMobile && <span>Copy</span>}
                    </button>
                    <button
                      onClick={() => handleOpenDeleteDialog(message)}
                      className={`${
                        isMobile
                          ? "flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          : "p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      } transition-colors`}
                    >
                      <Trash2 size={isMobile ? 16 : 14} />
                      {isMobile && <span>Delete</span>}
                    </button>
                  </motion.div>
                )}

              <div
                className={`px-3 sm:px-4 py-2.5 rounded-2xl ${
                  isSender
                    ? message.messageType === "code"
                      ? "bg-[#1E1E1E] text-white"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                    : message.messageType === "code"
                    ? "bg-[#1E1E1E] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                } shadow-sm hover:shadow-md transition-all duration-200`}
              >
                {/* Show sender name in group chats */}
                {selectedChatType === "group" && !isSender && (
                  <div className="text-xs text-dark-muted mb-1">
                    {message.sender.firstName} {message.sender.lastName}
                  </div>
                )}

                {/* Code message rendering */}
                {message.messageType === "code" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {message.language}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() =>
                            handleCopy(message._id, message.content)
                          }
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Copy
                        </button>
                        {isCopied && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded-md">
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                    <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words">
                      <code
                        dangerouslySetInnerHTML={{
                          __html: highlight(
                            message.content,
                            languages[message.language || "javascript"],
                            message.language || "javascript"
                          ),
                        }}
                      />
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}

                {/* Message timestamp */}
                <span
                  className={`block text-right text-xs mt-1 ${
                    isSender
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {moment(message.timeStamp).format("HH:mm")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-transparent text-dark-text flex flex-col p-3 sm:p-6 overflow-y-auto custom-scrollbar"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(99, 102, 241, 0.5) rgba(31, 41, 55, 0.2)",
      }}
    >
      {/* Messages Section */}
      <div className="flex flex-col space-y-2 min-h-0">
        {renderMessages()}
        <div ref={messagesEndRef} className="h-0" />
      </div>

      {/* Delete Dialog - Mobile optimized */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className={`bg-dark-primary border-dark-accent/30 text-dark-text ${
            isMobile ? "w-[95vw] max-w-md mx-auto" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Delete Message
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm sm:text-base">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMessage && (
              <div className="p-3 sm:p-4 rounded-lg bg-dark-accent/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
                    {selectedMessage.sender?.firstName?.charAt(0) ||
                      selectedMessage.sender?.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {selectedMessage.sender?.firstName &&
                      selectedMessage.sender?.lastName
                        ? `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}`
                        : selectedMessage.sender?.email?.split("@")[0] ||
                          "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(selectedMessage.timeStamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded bg-dark-accent/20 text-gray-300 text-sm">
                  {formatMessagePreview(selectedMessage.content)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter
            className={`${isMobile ? "flex-col gap-2" : "flex-row"}`}
          >
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className={`hover:bg-dark-accent/30 border border-dark-accent/30 bg-gray-800 text-slate-200 ${
                isMobile ? "w-full" : ""
              }`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMessage}
              className={`bg-red-600 hover:bg-red-700 ${
                isMobile ? "w-full" : ""
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageContainer;