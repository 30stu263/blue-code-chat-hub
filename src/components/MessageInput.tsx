
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile } from 'lucide-react';
import ImageUpload from './ImageUpload';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image') => Promise<boolean>;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      setSending(true);
      const success = await onSendMessage(message.trim(), 'text');
      if (success) {
        setMessage('');
      }
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = async (imageUrl: string) => {
    setSending(true);
    const success = await onSendMessage(imageUrl, 'image');
    if (success) {
      setShowImageUpload(false);
    }
    setSending(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  return (
    <>
      <div className="p-4 bg-gradient-to-r from-slate-800/80 to-blue-800/40 backdrop-blur-xl border-t border-white/10 relative">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full bg-slate-700/50 text-white placeholder-white/50 rounded-2xl px-4 py-4 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-slate-700/70 max-h-32 backdrop-blur-sm border border-white/10 transition-all"
              style={{ minHeight: '56px' }}
              disabled={sending}
            />
            
            <div className="absolute right-3 bottom-3 flex space-x-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowImageUpload(true)}
                className="h-10 w-10 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-10 w-10 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!message.trim() || sending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 px-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>

      {showImageUpload && (
        <ImageUpload
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </>
  );
};

export default MessageInput;
