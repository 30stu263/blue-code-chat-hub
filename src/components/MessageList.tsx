import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type?: string;
  senderProfile?: {
    display_name: string | null;
    avatar_url?: string | null;
  };
}

interface MessageListProps {
  groupChatId: string;
  currentUserId: string;
  isGroupChat: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  groupChatId,
  currentUserId,
  isGroupChat,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch messages including sender's display name
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          senderProfile:profiles!messages_sender_id_fkey (
            display_name,
            avatar_url
          )
        `
        )
        .eq("group_chat_id", groupChatId)
        .order("created_at");
      if (error) {
        console.error("Error fetching messages:", error.message);
      } else {
        setMessages(data || []);
      }
    }
    fetchMessages();
  }, [groupChatId]);

  // Optionally scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col space-y-3 min-h-full justify-end">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center text-white/60">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 backdrop-blur-sm border border-white/10">
                  💬
                </div>
                <p className="font-medium mb-1">No messages yet</p>
                <p className="text-sm text-white/40">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentUserId;
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showAvatar =
                  !isOwnMessage &&
                  isGroupChat &&
                  (!previousMessage ||
                    previousMessage.sender_id !== message.sender_id);

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    } ${showAvatar ? "mt-4" : "mt-1"}`}
                  >
                    <div
                      className={`flex ${
                        isOwnMessage ? "flex-row-reverse" : "flex-row"
                      } items-end space-x-2 max-w-[75%]`}
                    >
                      {/* Avatar - can be added here if needed */}
                      {!isOwnMessage && isGroupChat && showAvatar && (
                        <div className="w-8 h-8 mb-1 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white">
                          {message.senderProfile?.display_name
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </div>
                      )}
                      {!showAvatar && !isOwnMessage && isGroupChat && (
                        <div className="w-8 h-8" />
                      )}
                      <div
                        className={`flex flex-col ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Display name for group chats */}
                        {!isOwnMessage && isGroupChat && showAvatar && (
                          <div className="text-xs text-white/60 mb-1 px-1">
                            {message.senderProfile?.display_name ||
                              "Unknown User"}
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 break-words whitespace-pre-wrap ${
                            isOwnMessage
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-slate-700 text-white rounded-bl-md"
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          {message.message_type === "image" && (
                            <img
                              src={message.content}
                              alt="Uploaded"
                              className="mt-2 rounded-md max-w-full"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
