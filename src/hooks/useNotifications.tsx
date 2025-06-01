
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DatabaseNotification {
  id: string;
  user_id: string;
  type: 'message' | 'reaction' | 'group_invite' | 'system';
  title: string;
  message: string | null;
  data: any;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        // Type assertion to ensure proper typing
        const typedNotifications = (data || []).map(notification => ({
          ...notification,
          type: notification.type as 'message' | 'reaction' | 'group_invite' | 'system'
        }));
        setNotifications(typedNotifications);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = {
            ...payload.new,
            type: payload.new.type as 'message' | 'reaction' | 'group_invite' | 'system'
          } as DatabaseNotification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = {
            ...payload.new,
            type: payload.new.type as 'message' | 'reaction' | 'group_invite' | 'system'
          } as DatabaseNotification;
          setNotifications(prev => 
            prev.map(notif => notif.id === updatedNotification.id ? updatedNotification : notif)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    return true;
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    return true;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  };
};
