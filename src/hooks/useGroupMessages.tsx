
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { DatabaseMessage } from './useMessages';

export const useGroupMessages = (groupChatId: string | null) => {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!groupChatId || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      console.log('Fetching group messages for:', groupChatId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_chat_id', groupChatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching group messages:', error);
      } else {
        console.log('Fetched group messages:', data);
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription for group messages
    const channel = supabase
      .channel(`group-messages-${groupChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_chat_id=eq.${groupChatId}`
        },
        (payload) => {
          console.log('New group message received:', payload);
          const newMessage = payload.new as DatabaseMessage;
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `group_chat_id=eq.${groupChatId}`
        },
        (payload) => {
          console.log('Group message updated:', payload);
          const updatedMessage = payload.new as DatabaseMessage;
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupChatId, user]);

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text') => {
    if (!groupChatId || !user) {
      console.error('Cannot send group message: missing groupChatId or user');
      return false;
    }

    console.log('Sending group message:', { content, messageType, groupChatId });

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: user.id, // Required field, using sender_id as placeholder for group messages
        group_chat_id: groupChatId,
        content,
        message_type: messageType
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending group message:', error);
      return false;
    }
    
    console.log('Group message sent successfully:', data);
    return true;
  };

  return { messages, loading, sendMessage };
};
