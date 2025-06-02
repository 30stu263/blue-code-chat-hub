
import React, { useEffect, useRef } from 'react';
import { DatabaseMessage } from '../hooks/useMessages';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import MessageReactions from './MessageReactions';
import { Users, MessageCircle } from 'lucide-react';

interface MessageListProps {
  messages: DatabaseMessage[];
  currentUserId: string;
  contact?: DatabaseContact;
  groupChat?: DatabaseGroupChat;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, contact, groupChat }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (message: DatabaseMessage) => {
    if (message.message_type === 'image') {
      return (
        <div className="max-w-sm">
          <img
            src={message.content}
            alt="Shared image"
            className="rounded-xl max-w-full h-auto cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => window.open(message.content, '_blank')}
          />
        </div>
      );
    }
    return <p className="text-sm leading-relaxed">{message.content}</p>;
  };

  const isGroupChat = !!groupChat;
  const chatName = isGroupChat ? groupChat.name : contact?.profiles.display_name;
  const chatAvatar = isGroupChat ? <Users className="h-8 w-8" /> : contact?.profiles.avatar_emoji;

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto backdrop-blur-sm border border-white/10">
              {chatAvatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-white/60 leading-relaxed">
            {isGroupChat 
              ? `Start the conversation in ${chatName}! Share your thoughts and connect with the group.`
              : `Send a message to ${chatName} to start your conversation!`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      {messages.map((message, index) => {
        const isOwn = message.sender_id === currentUserId;
        const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
        
        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
              {!isOwn && (
                <div className={`w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                  {showAvatar && (
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-sm shadow-lg">
                      {isGroupChat ? '👤' : contact?.profiles.avatar_emoji}
                    </div>
                  )}
                </div>
              )}
              
              <div className={`
                px-4 py-3 rounded-2xl relative shadow-lg backdrop-blur-sm border transition-all duration-200 group-hover:shadow-xl
                ${isOwn 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/30 rounded-br-md' 
                  : 'bg-slate-800/80 text-white border-white/10 rounded-bl-md'
                }
              `}>
                {/* Show sender name in group chats for non-own messages */}
                {isGroupChat && !isOwn && showAvatar && (
                  <p className="text-xs text-white/70 mb-2 font-medium">
                    User {message.sender_id.slice(0, 8)}
                  </p>
                )}
                {renderMessageContent(message)}
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-white/50'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
                
                {/* Message reactions */}
                <MessageReactions messageId={message.id} />
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
