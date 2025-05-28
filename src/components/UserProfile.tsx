
import React from 'react';
import { User } from '../types';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 border-b border-gray-700 bg-gray-750">
      <div className="flex items-center">
        <div className="relative">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
            {user.avatar}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}></div>
        </div>
        
        <div className="ml-3 flex-1">
          <h4 className="font-medium text-white">{user.name}</h4>
          <p className="text-sm text-gray-400">ID: {user.id}</p>
          <p className="text-xs text-blue-400 capitalize">{user.status}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
