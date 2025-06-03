
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { MoreVertical, Users, Crown } from 'lucide-react';

interface ChatAreaProps {
  contact?: DatabaseContact;
  groupChat?: DatabaseGroupChat;
  messages: DatabaseMessage[];
  currentUserId: string;
  onSendMessage: (content: string, messageType?: 'text' | 'image') => Promise<boolean>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ contact, groupChat, messages, currentUserId, onSendMessage }) => {
  const [isTyping, setIsTyping] = useState(false);

  const chatPartner = contact || groupChat;
  const isGroupChat = !!groupChat;
  const isUpdatesChat = groupChat && groupChat.name === 'Updates Chat';

  if (!chatPartner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50 backdrop-blur-xl">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 backdrop-blur-sm border border-white/10">
            💬
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to BlueTeck</h2>
          <p className="text-white/60 leading-relaxed">
            Select a conversation from the sidebar to start chatting, or create a new group to bring people together.
          </p>
        </div>
      </div>
    );
  }

  // If this is the updates chat, use the special component
  if (isUpdatesChat) {
    const UpdatesChatArea = React.lazy(() => import('./UpdatesChatArea'));
    return (
      <React.Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <UpdatesChatArea
          groupChat={groupChat}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={onSendMessage}
        />
      </React.Suspense>
    );
  }

  const chatName = isGroupChat ? groupChat.name : contact?.profiles.display_name;
  const chatAvatar = isGroupChat ? <Users className="h-8 w-8" /> : contact?.profiles.avatar_emoji;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50 backdrop-blur-xl">
      {/* Enhanced Chat Header */}
      <div className="p-4 bg-slate-800/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                {chatAvatar}
              </div>
              {isGroupChat && groupChat.is_general && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="h-2 w-2 text-yellow-800" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-lg truncate">{chatName}</h3>
                {isGroupChat && groupChat.is_general && (
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                    General
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60">
                {isGroupChat ? 'Group conversation' : 'Direct message'}
              </p>
              {isTyping && (
                <p className="text-xs text-blue-400 animate-pulse">Someone is typing...</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        contact={contact}
        groupChat={groupChat}
      />

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatArea;
