
import React from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { Button } from '@/components/ui/button';
import { X, Users, MessageCircle, Crown } from 'lucide-react';

interface ChatInfoModalProps {
  contact?: DatabaseContact;
  groupChat?: DatabaseGroupChat;
  onClose: () => void;
}

const ChatInfoModal: React.FC<ChatInfoModalProps> = ({
  contact,
  groupChat,
  onClose
}) => {
  const isGroupChat = !!groupChat;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {isGroupChat ? 'Group Info' : 'Contact Info'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Avatar/Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg relative">
              {isGroupChat ? (
                <Users className="h-10 w-10 text-white" />
              ) : (
                contact?.profiles.avatar_emoji
              )}
              {groupChat?.is_general && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-yellow-800" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Name</label>
              <p className="text-white font-medium">
                {isGroupChat ? groupChat.name : contact?.profiles.display_name}
              </p>
            </div>

            {isGroupChat ? (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Description</label>
                  <p className="text-white">
                    {groupChat.description || 'No description'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Created</label>
                  <p className="text-white">
                    {new Date(groupChat.created_at).toLocaleDateString()}
                  </p>
                </div>
                {groupChat.is_general && (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm font-medium">
                      This is the general chat for all members
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Username</label>
                  <p className="text-white">@{contact?.profiles.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      contact?.profiles.status === 'online' ? 'bg-emerald-400' :
                      contact?.profiles.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-white capitalize">{contact?.profiles.status}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfoModal;
