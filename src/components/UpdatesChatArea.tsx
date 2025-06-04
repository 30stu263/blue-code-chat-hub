
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Users, AlertTriangle } from 'lucide-react';
import { useUpdatesChatControl } from '../hooks/useUpdatesChatControl';
import UpdatesChatPasswordModal from './UpdatesChatPasswordModal';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { DatabaseMessage } from '../hooks/useMessages';

interface UpdatesChatAreaProps {
  groupChat: DatabaseGroupChat;
  messages: DatabaseMessage[];
  currentUserId: string;
  onSendMessage: (content: string, messageType?: 'text' | 'image') => Promise<boolean>;
}

const UpdatesChatArea: React.FC<UpdatesChatAreaProps> = ({
  groupChat,
  messages,
  currentUserId,
  onSendMessage
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { control, loading, attemptControl, forfeitControl, isUserInControl, isChatLocked } = useUpdatesChatControl();

  const handlePasswordSubmit = async (password: string) => {
    return await attemptControl(password);
  };

  const handleForfeit = async () => {
    await forfeitControl();
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50 backdrop-blur-xl">
      {/* Special Updates Chat Header */}
      <div className="p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl border-b border-yellow-400/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Lock className="h-2 w-2 text-yellow-800" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-lg">{groupChat.name}</h3>
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                  Protected
                </span>
              </div>
              <p className="text-sm text-white/60">
                {isUserInControl 
                  ? 'You are currently in control' 
                  : isChatLocked 
                    ? 'Chat is locked by another user' 
                    : 'Enter password to gain control'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isUserInControl ? (
              <Button
                onClick={handleForfeit}
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                disabled={loading}
              >
                Forfeit Control
              </Button>
            ) : !isChatLocked ? (
              <Button
                onClick={() => setShowPasswordModal(true)}
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
              >
                <Lock className="h-4 w-4 mr-1" />
                Take Control
              </Button>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Locked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isChatLocked && (
        <div className="p-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-400/20">
          <div className="flex items-center justify-center space-x-2 text-white/80">
            <Lock className="h-4 w-4" />
            <span className="text-sm">This chat is currently controlled by another user. You cannot send messages.</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        groupChat={groupChat}
      />

      {/* Message Input - Only show if user has control or chat is unlocked */}
      {(isUserInControl || !control?.is_active) && (
        <MessageInput onSendMessage={onSendMessage} />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <UpdatesChatPasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordSubmit}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default UpdatesChatArea;
