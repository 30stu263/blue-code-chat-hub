
import React, { useState, useEffect } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';
import { useVideoCall } from '../hooks/useVideoCall';
import { Button } from '@/components/ui/button';
import { Video, Phone, MoreVertical, Users, Crown } from 'lucide-react';

interface ChatAreaProps {
  contact?: DatabaseContact;
  groupChat?: DatabaseGroupChat;
  messages: DatabaseMessage[];
  currentUserId: string;
  onSendMessage: (content: string, messageType?: 'text' | 'image') => Promise<boolean>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ contact, groupChat, messages, currentUserId, onSendMessage }) => {
  const [isTyping, setIsTyping] = useState(false);
  const videoCall = useVideoCall();

  const chatPartner = contact || groupChat;
  const isGroupChat = !!groupChat;

  const handleStartVideoCall = () => {
    const name = isGroupChat ? groupChat.name : contact?.profiles.display_name || 'Unknown';
    videoCall.startCall(name);
  };

  const handleStartAudioCall = () => {
    // For now, start video call but could be implemented separately
    handleStartVideoCall();
  };

  // Simulate incoming call (for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.9 && !videoCall.isCallActive) {
        const name = isGroupChat ? groupChat?.name : contact?.profiles.display_name || 'Unknown';
        videoCall.receiveCall(name);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [contact, groupChat, videoCall]);

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

  const chatName = isGroupChat ? groupChat.name : contact?.profiles.display_name;
  const chatAvatar = isGroupChat ? <Users className="h-8 w-8" /> : contact?.profiles.avatar_emoji;

  return (
    <>
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
                onClick={handleStartAudioCall}
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleStartVideoCall}
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
              >
                <Video className="h-5 w-5" />
              </Button>
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

      {/* Video Call Component */}
      <VideoCall
        isActive={videoCall.isCallActive}
        isIncoming={videoCall.isIncomingCall}
        contactName={videoCall.contactName}
        localStream={videoCall.localStream}
        remoteStream={videoCall.remoteStream}
        isVideoEnabled={videoCall.isVideoEnabled}
        isAudioEnabled={videoCall.isAudioEnabled}
        onAccept={videoCall.acceptCall}
        onDecline={videoCall.declineCall}
        onEnd={videoCall.endCall}
        onToggleVideo={videoCall.toggleVideo}
        onToggleAudio={videoCall.toggleAudio}
      />
    </>
  );
};

export default ChatArea;
