
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DatabaseContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_emoji: string;
    status: 'online' | 'away' | 'offline';
  };
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<DatabaseContact[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    const fetchContacts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          profiles!contacts_contact_user_id_fkey (
            id,
            username,
            display_name,
            avatar_emoji,
            status
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching contacts:', error);
      } else {
        setContacts(data || []);
      }
      setLoading(false);
    };

    fetchContacts();

    // Set up real-time subscription for contacts
    const channel = supabase
      .channel('contacts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addContact = async (username: string) => {
    if (!user) return false;

    // First, find the user by username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      console.error('User not found:', profileError);
      return false;
    }

    // Check if contact already exists
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('contact_user_id', profileData.id)
      .single();

    if (existingContact) {
      console.error('Contact already exists');
      return false;
    }

    // Add the contact
    const { error } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        contact_user_id: profileData.id
      });

    if (error) {
      console.error('Error adding contact:', error);
      return false;
    }
    return true;
  };

  return { contacts, loading, addContact };
};
