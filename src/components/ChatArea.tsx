
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';
import { Button } from '@/components/ui/button';
import { Video, Phone, Users } from 'lucide-react';

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
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
            💬
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Welcome to Blueteck Message</h2>
          <p className="text-gray-400 max-w-md">
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
        {/* Chat Header */}
        <div className="p-3 md:p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm md:text-lg">
                  {chatAvatar}
                </div>
                {!isGroupChat && (
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-gray-800 ${getStatusColor(selectedContact!.profiles.status)}`}></div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm md:text-base truncate flex items-center">
                  {chatName}
                  {isGroupChat && <Users className="h-3 w-3 ml-2 text-gray-400" />}
                </h3>
                <p className="text-xs md:text-sm text-gray-400 truncate">
                  {chatSubtitle}
                </p>
              </div>
            </div>
            
            {/* Call Buttons - only show for direct messages */}
            {!isGroupChat && (
              <div className="flex space-x-2 ml-2">
                <Button
                  onClick={handleVoiceCall}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleVideoCall}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            )}
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
