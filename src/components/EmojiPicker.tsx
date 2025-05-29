
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const customEmojis = [
    // Faces & People
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '😍', '🤩', '😘', '😗', '😚', '😙', '😋',
    '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
    
    // Messenger specific
    '💬', '💭', '🗨️', '🗯️', '💡', '💯', '🔥', '⚡', '💎', '🌟',
    '🎯', '🎨', '🎵', '🎮', '📱', '💻', '🛸', '🎪', '🎭', '🌈',
    
    // Nature & Objects
    '🦄', '🐸', '🦋', '🌺', '🌸', '🌼', '🌻', '🌹', '🌷', '🌾',
    '🍕', '🍔', '🍰', '🎂', '☕', '🍺', '🎊', '🎉', '🎈', '✨',
    
    // Hearts & Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '💕', '💖', '💗', '💘', '💝', '💞', '💟', '☮️', '✌️', '🤟',
  ];

  return (
    <div className="absolute bottom-16 right-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 w-80 max-h-64 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">Choose Emoji</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
        >
          ×
        </Button>
      </div>
      
      <div className="grid grid-cols-8 gap-1">
        {customEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors text-lg"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
