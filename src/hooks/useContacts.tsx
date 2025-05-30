
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
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    if (!username || username.trim() === '') {
      console.error('Username is required');
      return false;
    }

    const cleanUsername = username.trim().toLowerCase();
    console.log('Attempting to add contact with username:', cleanUsername);

    try {
      // First, find the user by username (case insensitive)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .single();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        if (profileError.code === 'PGRST116') {
          console.error('User not found with username:', cleanUsername);
          return false;
        }
        return false;
      }

      if (!profileData) {
        console.error('No profile found for username:', cleanUsername);
        return false;
      }

      console.log('Found profile:', profileData);

      // Check if user is trying to add themselves
      if (profileData.id === user.id) {
        console.error('Cannot add yourself as a contact');
        return false;
      }

      // Check if contact already exists
      const { data: existingContact, error: existingError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_user_id', profileData.id)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing contact:', existingError);
        return false;
      }

      if (existingContact) {
        console.error('Contact already exists');
        return false;
      }

      console.log('Adding contact relationship...');

      // Add the contact (user -> contact)
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

      console.log('Added forward contact relationship');

      // Add the reverse contact so both users see each other (contact -> user)
      const { error: error2 } = await supabase
        .from('contacts')
        .insert({
          user_id: profileData.id,
          contact_user_id: user.id
        });

      if (error2) {
        console.error('Error adding reverse contact:', error2);
        // Don't return false here, as the main contact was added successfully
        // But we should still try to clean up if possible
      } else {
        console.log('Added reverse contact relationship');
      }

      console.log('Contact addition completed successfully');
      return true;
    } catch (error) {
      console.error('Unexpected error in addContact:', error);
      return false;
    }
  };

  return { contacts, loading, addContact };
};
