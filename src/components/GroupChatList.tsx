
import React from 'react';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { Users, Crown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GroupChatListProps {
  groupChats: DatabaseGroupChat[];
  selectedGroupChatId: string | null;
  onSelectGroupChat: (groupChatId: string) => void;
}

const GroupChatList: React.FC<GroupChatListProps> = ({
  groupChats,
  selectedGroupChatId,
  onSelectGroupChat
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {groupChats.length === 0 ? (
          <div className="text-center text-white/60 py-12 px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
              <Users className="h-8 w-8 text-white/40" />
            </div>
            <p className="font-medium mb-1">No groups yet</p>
            <p className="text-sm text-white/40">Create a group to get started!</p>
          </div>
        ) : (
          groupChats.map((groupChat) => (
            <div
              key={groupChat.id}
              onClick={() => onSelectGroupChat(groupChat.id)}
              className={`
                group flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 hover:scale-[1.02]
                ${selectedGroupChatId === groupChat.id
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 border border-purple-400/30 shadow-lg'
                  : 'hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/10'
                }
              `}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:shadow-xl transition-shadow">
                  {groupChat.name === 'Updates Chat' ? '📢' : <Users className="h-6 w-6 text-white" />}
                </div>
                {groupChat.is_general && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Crown className="h-2 w-2 text-yellow-800" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white truncate">{groupChat.name}</h4>
                  {groupChat.name === 'Updates Chat' && (
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                      Protected
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 truncate">
                  {groupChat.description || 'Group conversation'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default GroupChatList;
