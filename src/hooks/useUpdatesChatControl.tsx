
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UpdatesChatControl {
  id: string;
  current_user_id: string | null;
  controlled_at: string | null;
  password_hash: string;
  is_active: boolean;
}

export const useUpdatesChatControl = () => {
  const [control, setControl] = useState<UpdatesChatControl | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchControlStatus();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('updates-chat-control')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'updates_chat_control'
        },
        () => {
          fetchControlStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchControlStatus = async () => {
    const { data, error } = await supabase
      .from('updates_chat_control')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching control status:', error);
    } else {
      setControl(data);
    }
  };

  const attemptControl = async (password: string) => {
    if (!user || !control) return false;

    setLoading(true);

    try {
      // Check if password is correct and no one else is in control
      if (password !== control.password_hash) {
        setLoading(false);
        return false;
      }

      if (control.is_active && control.current_user_id && control.current_user_id !== user.id) {
        setLoading(false);
        return false;
      }

      // Take control
      const { error } = await supabase
        .from('updates_chat_control')
        .update({
          current_user_id: user.id,
          controlled_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', control.id);

      setLoading(false);
      return !error;
    } catch (error) {
      console.error('Error attempting control:', error);
      setLoading(false);
      return false;
    }
  };

  const forfeitControl = async () => {
    if (!user || !control || control.current_user_id !== user.id) return false;

    setLoading(true);

    const { error } = await supabase
      .from('updates_chat_control')
      .update({
        current_user_id: null,
        is_active: false
      })
      .eq('id', control.id);

    setLoading(false);
    return !error;
  };

  const isUserInControl = user && control?.current_user_id === user.id && control?.is_active;
  const isChatLocked = control?.is_active && control?.current_user_id && control?.current_user_id !== user?.id;

  return {
    control,
    loading,
    attemptControl,
    forfeitControl,
    isUserInControl,
    isChatLocked
  };
};
