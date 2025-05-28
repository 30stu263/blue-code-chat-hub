
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            style={{ minHeight: '48px' }}
          />
          
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
