
import React from 'react';
import { Contact, Message } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  selectedContact: Contact | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
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
            Select a contact from the sidebar to start messaging, or add new contacts using their unique ID numbers.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Contact['status']) => {
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
              {selectedContact.avatar}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(selectedContact.status)}`}></div>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-white">{selectedContact.name}</h3>
            <p className="text-sm text-gray-400">
              {selectedContact.status === 'online' ? 'Online' : 
               selectedContact.status === 'away' ? 'Away' : 'Offline'} • ID: {selectedContact.id}
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
