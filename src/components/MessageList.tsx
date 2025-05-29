
import React, { useEffect, useRef } from 'react';
import { DatabaseMessage } from '../hooks/useMessages';
import { DatabaseContact } from '../hooks/useContacts';

interface MessageListProps {
  messages: DatabaseMessage[];
  currentUserId: string;
  contact: DatabaseContact;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, contact }) => {
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
        <div className="max-w-xs">
          <img
            src={message.content}
            alt="Shared image"
            className="rounded-lg max-w-full h-auto cursor-pointer"
            onClick={() => window.open(message.content, '_blank')}
          />
        </div>
      );
    }
    return <p className="text-sm">{message.content}</p>;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
            {contact.profiles.avatar_emoji}
          </div>
          <p className="text-gray-400">No messages yet</p>
          <p className="text-sm text-gray-500">Send a message to start the conversation!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        
        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isOwn && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm mr-2">
                  {contact.profiles.avatar_emoji}
                </div>
              )}
              
              <div className={`
                px-4 py-2 rounded-lg
                ${isOwn 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-gray-700 text-white rounded-bl-sm'
                }
              `}>
                {renderMessageContent(message)}
                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatTime(message.created_at)}
                </p>
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
