
import React from 'react';
import { User } from '../types';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-400 shadow-emerald-400/50';
      case 'away': return 'bg-yellow-400 shadow-yellow-400/50';
      case 'offline': return 'bg-gray-400 shadow-gray-400/50';
      default: return 'bg-gray-400 shadow-gray-400/50';
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-slate-800/60 to-transparent">
      <div className="flex items-center">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-lg shadow-lg">
            {user.avatar}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${getStatusColor(user.status)} shadow-lg`}></div>
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{user.name}</h4>
          <p className="text-xs text-white/60 truncate">@{user.name?.toLowerCase().replace(/\s+/g, '')}</p>
          <p className="text-xs text-blue-400 capitalize font-medium">{user.status}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
