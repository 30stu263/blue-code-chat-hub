
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DatabaseMessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactions = (messageId: string | null) => {
  const [reactions, setReactions] = useState<DatabaseMessageReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!messageId) {
      setReactions([]);
      return;
    }

    const fetchReactions = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        console.error('Error fetching message reactions:', error);
      } else {
        setReactions(data || []);
      }
      setLoading(false);
    };

    fetchReactions();

    // Set up real-time subscription for reactions
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        (payload) => {
          const newReaction = payload.new as DatabaseMessageReaction;
          setReactions(prev => [...prev, newReaction]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        (payload) => {
          const deletedReaction = payload.old as DatabaseMessageReaction;
          setReactions(prev => prev.filter(r => r.id !== deletedReaction.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const addReaction = async (emoji: string) => {
    if (!messageId || !user) return false;

    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji
      });

    if (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
    return true;
  };

  const removeReaction = async (emoji: string) => {
    if (!messageId || !user) return false;

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
    return true;
  };

  const toggleReaction = async (emoji: string) => {
    if (!user) return false;

    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      return await removeReaction(emoji);
    } else {
      return await addReaction(emoji);
    }
  };

  return { reactions, loading, addReaction, removeReaction, toggleReaction };
};
