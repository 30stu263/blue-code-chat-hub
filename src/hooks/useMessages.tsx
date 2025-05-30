
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
      console.log('Fetching messages between:', user.id, 'and', contactId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        console.log('Fetched messages:', data);
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription with broader channel name to ensure cross-network sync
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          const newMessage = payload.new as DatabaseMessage;
          
          // Only add messages that are part of this conversation
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === contactId) ||
            (newMessage.sender_id === contactId && newMessage.receiver_id === user.id)
          ) {
            console.log('Adding message to conversation:', newMessage);
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message updated via realtime:', payload);
          const updatedMessage = payload.new as DatabaseMessage;
          
          // Update message if it's part of this conversation
          if (
            (updatedMessage.sender_id === user.id && updatedMessage.receiver_id === contactId) ||
            (updatedMessage.sender_id === contactId && updatedMessage.receiver_id === user.id)
          ) {
            setMessages(prev => 
              prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [contactId, user]);

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text') => {
    if (!contactId || !user) {
      console.error('Cannot send message: missing contactId or user');
      return false;
    }

    console.log('Sending message:', { content, messageType, from: user.id, to: contactId });

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: contactId,
        content,
        message_type: messageType
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return false;
    }
    
    console.log('Message sent successfully:', data);
    return true;
  };

  return { messages, loading, sendMessage };
};
