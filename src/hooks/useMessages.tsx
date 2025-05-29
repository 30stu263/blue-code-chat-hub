
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DatabaseMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
}

export const useMessages = (contactId: string | null) => {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!contactId || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription with proper filter
    const channel = supabase
      .channel(`messages-${user.id}-${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as DatabaseMessage;
          // Only add messages that are part of this conversation
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === contactId) ||
            (newMessage.sender_id === contactId && newMessage.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, user]);

  const sendMessage = async (content: string) => {
    if (!contactId || !user) return false;

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: contactId,
        content,
        message_type: 'text'
      });

    if (error) {
      console.error('Error sending message:', error);
      return false;
    }
    return true;
  };

  return { messages, loading, sendMessage };
};
