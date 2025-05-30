
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
      
      // Fetch contacts and profiles separately to avoid join issues
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        setContacts([]);
        setLoading(false);
        return;
      }

      if (!contactsData || contactsData.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all contact user IDs
      const contactIds = contactsData.map(c => c.contact_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', contactIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setContacts([]);
        setLoading(false);
        return;
      }

      // Combine contacts with their profiles
      const contactsWithProfiles: DatabaseContact[] = contactsData.map(contact => {
        const profile = profilesData?.find(p => p.id === contact.contact_user_id);
        
        return {
          id: contact.id,
          user_id: contact.user_id,
          contact_user_id: contact.contact_user_id,
          created_at: contact.created_at || new Date().toISOString(),
          profiles: {
            id: profile?.id || contact.contact_user_id,
            username: profile?.username || 'Unknown',
            display_name: profile?.display_name || 'Unknown User',
            avatar_emoji: profile?.avatar_emoji || '👤',
            status: (profile?.status as 'online' | 'away' | 'offline') || 'offline'
          }
        };
      });

      setContacts(contactsWithProfiles);
      setLoading(false);
    };

    fetchContacts();

    // Set up real-time subscription for contacts with better filtering
    const contactsChannel = supabase
      .channel(`contacts-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Contact change detected:', payload);
          // Refetch contacts when any contact changes
          fetchContacts();
        }
      )
      .subscribe();

    // Also listen for profile updates that might affect our contacts
    const profilesChannel = supabase
      .channel(`profiles-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile update detected:', payload);
          // Only refetch if the updated profile is one of our contacts
          const updatedProfileId = payload.new?.id;
          const isContactProfile = contacts.some(c => c.contact_user_id === updatedProfileId);
          if (isContactProfile) {
            fetchContacts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user]);

  const addContact = async (username: string) => {
    if (!user) return false;

    try {
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

      // Add the contact (bidirectional)
      const { error: error1 } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_user_id: profileData.id
        });

      if (error1) {
        console.error('Error adding contact:', error1);
        return false;
      }

      // Add the reverse contact so both users see each other
      const { error: error2 } = await supabase
        .from('contacts')
        .insert({
          user_id: profileData.id,
          contact_user_id: user.id
        });

      if (error2) {
        console.error('Error adding reverse contact:', error2);
        // Don't return false here, as the main contact was added successfully
      }

      return true;
    } catch (error) {
      console.error('Error in addContact:', error);
      return false;
    }
  };

  return { contacts, loading, addContact };
};
