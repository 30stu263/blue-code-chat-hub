import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';

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
  groupChat,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isGroupChat = !!groupChat;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Unique chat key for correct scroll resetting
  const chatKey = React.useMemo(() => {
    if (isGroupChat && groupChat) {
      return `group-${groupChat.id}-${groupChat.name}`;
    } else if (contact) {
      return `dm-${contact.contact_user_id}-${contact.id}`;
    }
    return 'no-chat';
  }, [isGroupChat, groupChat, contact]);

  return (
    <div 
      key={`container-${chatKey}`}
      className="flex-1 flex flex-col overflow-hidden"
    >
      <ScrollArea 
        key={`scroll-${chatKey}`}
        className="flex-1 p-4" 
        ref={scrollAreaRef}
      >
        <div className="flex flex-col space-y-3 min-h-full justify-end">
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
            <>
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentUserId;
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showAvatar = !isOwnMessage && isGroupChat && 
                  (!previousMessage || previousMessage.sender_id !== message.sender_id);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                      showAvatar ? 'mt-4' : 'mt-1'
                    }`}
                  >
                    <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[75%]`}>
                      {/* Avatar - only show for first message in a sequence in group chats */}
                      {showAvatar && (
                        <Avatar className="w-8 h-8 mb-1">
                          <AvatarImage src={`https://avatar.vercel.sh/user${message.sender_id}.png`} />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                      )}
                      
                      {!showAvatar && !isOwnMessage && isGroupChat && (
                        <div className="w-8 h-8" /> // Spacer for alignment
                      )}

                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {/* Display name for group chats */}
                        {!isOwnMessage && isGroupChat && showAvatar && (
                          <div className="text-xs text-white/60 mb-1 px-1">
                            {message.senderProfile?.display_name || `User ${message.sender_id.slice(0, 8)}`}
                          </div>
                        )}

                        <div
                          className={`
                            rounded-2xl px-4 py-2 break-words whitespace-pre-wrap
                            ${isOwnMessage
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-slate-700 text-white rounded-bl-md'
                            }
                          `}
                        >
                          {message.content}
                        </div>
                        <div className="text-[10px] text-white/40 mt-1 px-1">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
