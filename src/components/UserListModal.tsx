
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  display_name: string;
  username: string;
  avatar_emoji: string;
  status: string;
}

interface UserListModalProps {
  onClose: () => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_emoji, status')
        .order('display_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">All Users</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-lg">
                      {user.avatar_emoji}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}></div>
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{user.display_name}</h4>
                    <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                  </div>
                  
                  <span className="text-xs text-gray-500 capitalize">{user.status}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="pt-4 border-t border-gray-700 mt-4">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
