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
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          size="sm"
          variant="ghost"
          className={`h-7 px-2 text-xs rounded-full transition-all duration-200 ${
            hasUserReacted(emoji)
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-400/50 text-white shadow-lg'
              : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm'
          }`}
        >
          <span className="mr-1">{emoji}</span>
          <span className="font-medium">{reactionList.length}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <Button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-white/50 hover:text-white/80 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
        >
          <Plus className="h-3 w-3" />
        </Button>

        {showEmojiPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl p-3 z-20 shadow-2xl">
              <div className="flex gap-2">
                {QUICK_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => {
                      handleReactionClick(emoji);
                      setShowEmojiPicker(false);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-white/10 rounded-xl transition-all duration-200 text-lg hover:scale-110"
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
