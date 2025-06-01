import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile, Plus } from 'lucide-react';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useAuth } from '@/hooks/useAuth';

interface MessageReactionsProps {
  messageId: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId }) => {
  const { reactions, toggleReaction } = useMessageReactions(messageId);
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, typeof reactions>);

  const handleReactionClick = async (emoji: string) => {
    await toggleReaction(emoji);
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.emoji === emoji && r.user_id === user?.id);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          size="sm"
          variant="ghost"
          className={`h-6 px-2 text-xs rounded-full border ${
            hasUserReacted(emoji)
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span className="mr-1">{emoji}</span>
          <span>{reactionList.length}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <Button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded-full"
        >
          <Plus className="h-3 w-3" />
        </Button>

        {showEmojiPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-2 z-20 shadow-lg">
              <div className="flex gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => {
                      handleReactionClick(emoji);
                      setShowEmojiPicker(false);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-gray-700 rounded"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
