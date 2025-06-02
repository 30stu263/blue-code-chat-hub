
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from '@/components/ui/button';
import { Video, Phone, Users, Settings, Sparkles, MessageCircle } from 'lucide-react';

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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center px-6 max-w-md relative z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-2xl mb-6 animate-scale-in">
              <MessageCircle className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in">
            Welcome to Blueteck
          </h2>
          <p className="text-white/70 text-lg leading-relaxed animate-fade-in delay-200">
            Connect with friends and colleagues in beautiful conversations. Select a contact or group from the sidebar to start messaging.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in delay-300">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="text-white/60 text-sm">💬 Direct Messages</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="text-white/60 text-sm">👥 Group Chats</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400 shadow-emerald-400/50';
      case 'away': return 'bg-yellow-400 shadow-yellow-400/50';
      case 'offline': return 'bg-gray-400 shadow-gray-400/50';
      default: return 'bg-gray-400 shadow-gray-400/50';
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
  const chatAvatar = isGroupChat ? <Users className="h-7 w-7" /> : selectedContact!.profiles.avatar_emoji;

  return (
    <>
      <div className="flex-1 flex flex-col bg-slate-900/30 backdrop-blur-sm">
        {/* Enhanced Chat Header */}
        <div className="p-4 bg-gradient-to-r from-slate-800/80 to-blue-800/40 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-xl shadow-lg">
                  {chatAvatar}
                </div>
                {!isGroupChat && (
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-slate-800 ${getStatusColor(selectedContact!.profiles.status)} shadow-lg`}></div>
                )}
                {isGroupChat && selectedGroupChat!.is_general && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-3 w-3 text-yellow-800" />
                  </div>
                )}
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h3 className="font-bold text-white text-lg truncate flex items-center">
                  {chatName}
                  {isGroupChat && <Users className="h-4 w-4 ml-2 text-white/60" />}
                </h3>
                <p className="text-sm text-white/60 truncate">
                  {chatSubtitle}
                </p>
              </div>
            </div>
            
            {/* Enhanced Header Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <NotificationsDropdown />
              
              {/* Call Buttons - only show for direct messages */}
              {!isGroupChat && (
                <>
                  <Button
                    onClick={handleVoiceCall}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleVideoCall}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
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
