
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from '@/components/ui/button';
import { Video, Phone, Users, Settings } from 'lucide-react';

interface ChatAreaProps {
  selectedContact?: DatabaseContact;
  selectedGroupChat?: DatabaseGroupChat;
  messages: DatabaseMessage[];
  currentUserId: string;
  onSendMessage: (content: string, type?: 'text' | 'image') => Promise<boolean>;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedContact,
  selectedGroupChat,
  messages,
  currentUserId,
  onSendMessage
}) => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  const currentChat = selectedContact || selectedGroupChat;

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg">
            💬
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to Blueteck Message
          </h2>
          <p className="text-gray-400 max-w-md leading-relaxed">
            Select a contact or group chat from the sidebar to start messaging, or add new contacts using their username.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleVideoCall = () => {
    setIsVideoCallActive(true);
  };

  const handleVoiceCall = () => {
    setIsVideoCallActive(true);
  };

  const handleEndCall = () => {
    setIsVideoCallActive(false);
    setIsIncomingCall(false);
  };

  const isGroupChat = !!selectedGroupChat;
  const chatName = isGroupChat 
    ? selectedGroupChat!.name 
    : selectedContact!.profiles.display_name;
  const chatSubtitle = isGroupChat
    ? selectedGroupChat!.description || 'Group Chat'
    : `${selectedContact!.profiles.status === 'online' ? 'Online' : 
       selectedContact!.profiles.status === 'away' ? 'Away' : 'Offline'} • @${selectedContact!.profiles.username}`;
  const chatAvatar = isGroupChat ? '👥' : selectedContact!.profiles.avatar_emoji;

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Enhanced Chat Header */}
        <div className="p-3 md:p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg md:text-xl shadow-md">
                  {chatAvatar}
                </div>
                {!isGroupChat && (
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-gray-800 ${getStatusColor(selectedContact!.profiles.status)} shadow-sm`}></div>
                )}
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h3 className="font-semibold text-white text-base md:text-lg truncate flex items-center">
                  {chatName}
                  {isGroupChat && <Users className="h-4 w-4 ml-2 text-gray-400" />}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  {chatSubtitle}
                </p>
              </div>
            </div>
            
            {/* Enhanced Header Actions */}
            <div className="flex items-center space-x-2 ml-2">
              <NotificationsDropdown />
              
              {/* Call Buttons - only show for direct messages */}
              {!isGroupChat && (
                <>
                  <Button
                    onClick={handleVoiceCall}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleVideoCall}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          contact={selectedContact}
          groupChat={selectedGroupChat}
        />

        {/* Message Input */}
        <MessageInput onSendMessage={onSendMessage} />
      </div>

      {/* Video Call Component - only for direct messages */}
      {!isGroupChat && (
        <VideoCall
          isActive={isVideoCallActive}
          isIncoming={isIncomingCall}
          contactName={selectedContact?.profiles.display_name || 'Contact'}
          onAccept={() => setIsIncomingCall(false)}
          onDecline={handleEndCall}
          onEnd={handleEndCall}
        />
      )}
    </>
  );
};

export default ChatArea;
