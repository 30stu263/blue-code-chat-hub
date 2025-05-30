
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DatabaseGroupChat {
  id: string;
  name: string;
  description: string | null;
  is_general: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  last_message?: string;
  last_message_time?: string;
}

export const useGroupChats = () => {
  const [groupChats, setGroupChats] = useState<DatabaseGroupChat[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGroupChats([]);
      return;
    }

    const fetchGroupChats = async () => {
      setLoading(true);
      
      // First, get all group chats the user is a member of or general chats
      const { data: groupChatsData, error: groupChatsError } = await supabase
        .from('group_chats')
        .select('*')
        .or(`is_general.eq.true,id.in.(${await getUserGroupChatIds()})`);

      if (groupChatsError) {
        console.error('Error fetching group chats:', groupChatsError);
        setGroupChats([]);
        setLoading(false);
        return;
      }

      // Auto-join general chat if not already a member
      if (groupChatsData) {
        for (const chat of groupChatsData) {
          if (chat.is_general) {
            await joinGeneralChatIfNeeded(chat.id);
          }
        }
      }

      setGroupChats(groupChatsData || []);
      setLoading(false);
    };

    const getUserGroupChatIds = async () => {
      const { data } = await supabase
        .from('group_chat_members')
        .select('group_chat_id')
        .eq('user_id', user.id);
      
      return data?.map(m => m.group_chat_id).join(',') || '';
    };

    const joinGeneralChatIfNeeded = async (groupChatId: string) => {
      const { data: existingMember } = await supabase
        .from('group_chat_members')
        .select('id')
        .eq('group_chat_id', groupChatId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingMember) {
        await supabase
          .from('group_chat_members')
          .insert({
            group_chat_id: groupChatId,
            user_id: user.id
          });
      }
    };

    fetchGroupChats();

    // Set up real-time subscription for group chats
    const groupChatsChannel = supabase
      .channel(`group-chats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_chats'
        },
        () => {
          fetchGroupChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_chat_members'
        },
        () => {
          fetchGroupChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupChatsChannel);
    };
  }, [user]);

  const createGroupChat = async (name: string, description?: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('group_chats')
        .insert({
          name,
          description,
          created_by: user.id,
          is_general: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group chat:', error);
        return false;
      }

      // Add creator as a member
      await supabase
        .from('group_chat_members')
        .insert({
          group_chat_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      return true;
    } catch (error) {
      console.error('Error in createGroupChat:', error);
      return false;
    }
  };

  return { groupChats, loading, createGroupChat };
};
