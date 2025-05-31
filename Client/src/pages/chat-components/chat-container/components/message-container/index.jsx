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
import { Trash2 } from "lucide-react";

const MessageContainer = () => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
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
            } w-full my-1`}
          >
            <div
              className={`relative max-w-[70%] px-4 py-2.5 rounded-2xl ${
                isSender
                  ? message.messageType === "code"
                    ? "bg-[#1E1E1E] text-white"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                  : message.messageType === "code"
                  ? "bg-[#1E1E1E] text-white"
                  : "bg-dark-accent/30 text-dark-text backdrop-blur-sm"
              } transition-all duration-200 hover:shadow-lg group`}
            >
              {/* Delete button for sender's messages */}
              {isSender && (
                <button
                  onClick={() => handleOpenDeleteDialog(message)}
                  className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              )}

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
                        onClick={() => handleCopy(message._id, message.content)}
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
                  <pre className="text-sm font-mono overflow-x-auto">
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
                <p className="text-sm break-words leading-relaxed">
                  {message.content}
                </p>
              )}

              {/* Message timestamp */}
              <span className="block text-right text-xs opacity-70 mt-1">
                {moment(message.timeStamp).format("HH:mm")}
              </span>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-transparent text-dark-text flex flex-col p-6 overflow-y-auto custom-scrollbar"
    >
      {/* Messages Section */}
      <div className="flex flex-col space-y-2 min-h-0">
        {renderMessages()}
        <div ref={messagesEndRef} className="h-0" />
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-dark-primary border-dark-accent/30 text-dark-text">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMessage && (
              <div className="p-4 rounded-lg bg-dark-accent/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    {selectedMessage.sender?.firstName?.charAt(0) ||
                      selectedMessage.sender?.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </div>
                  <div>
                    <div className="font-medium">
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
                <div className="p-3 rounded bg-dark-accent/20 text-gray-300">
                  {formatMessagePreview(selectedMessage.content)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="hover:bg-dark-accent/30 border border-dark-accent/30 bg-gray-800 text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMessage}
              className="bg-red-600 hover:bg-red-700"
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
