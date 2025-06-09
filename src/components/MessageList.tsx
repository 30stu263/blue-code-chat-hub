import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatabaseMessage } from '../hooks/useMessages';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface MessageListProps {
  messages: DatabaseMessage[];
  currentUserId: string;
  contact?: DatabaseContact;
  groupChat?: DatabaseGroupChat;
}

interface UserProfile {
  id: string;
  display_name?: string;
  avatar_emoji?: string;
  avatar_url?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  contact,
  groupChat
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGroupChat = !!groupChat;
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  // Defensive: Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Fetch all user profiles for the senders in the messages
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const uniqueSenderIds = [
        ...new Set(safeMessages.map((msg) => msg?.sender_id).filter(Boolean)),
      ];
      if (uniqueSenderIds.length === 0) {
        setUserProfiles({});
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_emoji, avatar_url')
        .in('id', uniqueSenderIds);

      if (!error && Array.isArray(data)) {
        const profiles: Record<string, UserProfile> = {};
        data.forEach((profile) => {
          profiles[profile.id] = profile;
        });
        setUserProfiles(profiles);
      } else {
        setUserProfiles({});
      }
    };

    fetchUserProfiles();
    // Only depend on safeMessages here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeMessages]);

  const getUserDisplayName = (userId?: string) => {
    if (!userId) return 'Unknown User';
    const profile = userProfiles[userId];
    return profile?.display_name || `User ${userId.slice(0, 8)}`;
  };

  const getUserAvatar = (userId?: string) => {
    if (!userId) return { emoji: '👤', url: '' };
    const profile = userProfiles[userId];
    return {
      emoji: profile?.avatar_emoji || '👤',
      url: profile?.avatar_url || ''
    };
  };

  // Defensive: parse date only if valid
  const formatDateTime = (created_at?: string) => {
    if (!created_at) return 'Unknown time';
    const d = new Date(created_at);
    if (isNaN(d.getTime())) return 'Unknown time';
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 130px)' }}>
      <ScrollArea 
        className="flex-1" 
        ref={scrollAreaRef}
      >
        <div className="p-4 flex flex-col justify-end min-h-full">
          {safeMessages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center text-white/60">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 backdrop-blur-sm border border-white/10">
                  💭
                </div>
                <p className="font-medium mb-1">No messages yet</p>
                <p className="text-sm text-white/40">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {safeMessages.map((message, index) => {
                if (!message) return null;
                const isOwnMessage = message.sender_id === currentUserId;
                const prevMessage = index > 0 ? safeMessages[index - 1] : null;
                const showAvatar = !isOwnMessage && isGroupChat && 
                  (!prevMessage || prevMessage.sender_id !== message.sender_id);

                const userAvatar = getUserAvatar(message.sender_id);

                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                      showAvatar ? 'mt-4' : 'mt-1'
                    }`}
                  >
                    <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[75%]`}>
                      {/* Avatar - only show for first message in a sequence in group chats */}
                      {showAvatar && (
                        <Avatar className="w-8 h-8 mb-1">
                          {userAvatar.url ? (
                            <AvatarImage src={userAvatar.url} />
                          ) : null}
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {userAvatar.emoji}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {!showAvatar && !isOwnMessage && isGroupChat && (
                        <div className="w-8 h-8" /> 
                      )}

                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {/* Display name for group chats */}
                        {!isOwnMessage && isGroupChat && showAvatar && (
                          <div className="text-xs text-white/60 mb-1 px-1">
                            {getUserDisplayName(message.sender_id)}
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
                          <p className="leading-relaxed">{message.content}</p>
                          <div className="text-xs text-white/60 mt-1">
                            {formatDateTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
