
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        variant="ghost"
        className="relative text-gray-400 hover:text-white hover:bg-gray-700 p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-600 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  size="sm"
                  variant="ghost"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                      !notification.read ? 'bg-gray-750' : ''
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">
                          {notification.title}
                        </h4>
                        {notification.message && (
                          <p className="text-xs text-gray-400 mb-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsDropdown;
