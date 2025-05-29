
import React from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseMessage } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  selectedContact: DatabaseContact | undefined;
  messages: DatabaseMessage[];
  currentUserId: string;
  onSendMessage: (content: string, type?: 'text' | 'image') => Promise<boolean>;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedContact,
  messages,
  currentUserId,
  onSendMessage
}) => {
  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
            💬
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Blueteck Message</h2>
          <p className="text-gray-400 max-w-md">
            Select a contact from the sidebar to start messaging, or add new contacts using their username.
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

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg">
              {selectedContact.profiles.avatar_emoji}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(selectedContact.profiles.status)}`}></div>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-white">{selectedContact.profiles.display_name}</h3>
            <p className="text-sm text-gray-400">
              {selectedContact.profiles.status === 'online' ? 'Online' : 
               selectedContact.profiles.status === 'away' ? 'Away' : 'Offline'} • @{selectedContact.profiles.username}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        contact={selectedContact}
      />

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatArea;
