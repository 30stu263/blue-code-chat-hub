
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatabaseMessage } from '../hooks/useMessages';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageListProps {
  messages: DatabaseMessage[];
  currentUserId: string;
  contact?: DatabaseContact;
  groupChat?: DatabaseGroupChat;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  contact,
  groupChat
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isGroupChat = !!groupChat;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-white/60">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 backdrop-blur-sm border border-white/10">
                💭
              </div>
              <p className="font-medium mb-1">No messages yet</p>
              <p className="text-sm text-white/40">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Avatar - only show for first message in a group in group chats */}
                  {!isOwnMessage && isGroupChat && (
                    <Avatar className="w-6 h-6 mb-1">
                      <AvatarImage src={`https://avatar.vercel.sh/user.png`} />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`
                      rounded-2xl px-4 py-2 max-w-[75%] break-words
                      ${isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-700 text-white rounded-bl-none'
                      }
                    `}
                  >
                    <p>{message.content}</p>
                    {message.message_type === 'image' && (
                      <img src={message.content} alt="Uploaded" className="mt-2 rounded-md max-w-full" />
                    )}
                    <div className="text-xs text-white/60 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
