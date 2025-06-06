
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useMessages } from '../hooks/useMessages';
import { useGroupChats } from '../hooks/useGroupChats';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const { contacts, addContact } = useContacts();
  const { groupChats, createGroupChat } = useGroupChats();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedGroupChatId, setSelectedGroupChatId] = useState<string | null>(null);
  const { messages: directMessages, sendMessage: sendDirectMessage } = useMessages(selectedContactId);
  const { messages: groupMessages, sendMessage: sendGroupMessage } = useGroupMessages(selectedGroupChatId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user && !authError) {
      console.log('Redirecting to auth page...');
      navigate('/auth');
    }
  }, [user, authLoading, authError, navigate]);

  // Auto-select general chat on first load
  useEffect(() => {
    if (groupChats.length > 0 && !selectedContactId && !selectedGroupChatId) {
      const generalChat = groupChats.find(chat => chat.is_general);
      if (generalChat) {
        setSelectedGroupChatId(generalChat.id);
      }
    }
  }, [groupChats, selectedContactId, selectedGroupChatId]);

  // Show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg font-medium">Loading BlueTeck...</div>
          <div className="text-white/60 text-sm">Connecting to your conversations</div>
        </div>
      </div>
    );
  }

  // Show error screen
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <div className="text-white text-lg font-medium">Connection Error</div>
          <div className="text-white/60 text-sm">{authError}</div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    return null;
  }

  const selectedContact = contacts.find(c => c.contact_user_id === selectedContactId);
  const selectedGroupChat = groupChats.find(g => g.id === selectedGroupChatId);

  const handleAddContact = async (username: string) => {
    const success = await addContact(username);
    return success;
  };

  const handleCreateGroup = async (name: string, description?: string) => {
    const success = await createGroupChat(name, description);
    return success;
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setSelectedGroupChatId(null);
  };

  const handleSelectGroupChat = (groupChatId: string) => {
    setSelectedGroupChatId(groupChatId);
    setSelectedContactId(null);
  };

  const handleSendMessage = async (content: string, type?: 'text' | 'image') => {
    if (selectedContactId) {
      return await sendDirectMessage(content, type);
    } else if (selectedGroupChatId) {
      return await sendGroupMessage(content, type);
    }
    return false;
  };

  const currentMessages = selectedContactId ? directMessages : groupMessages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar
        contacts={contacts}
        groupChats={groupChats}
        selectedContactId={selectedContactId}
        selectedGroupChatId={selectedGroupChatId}
        onSelectContact={handleSelectContact}
        onSelectGroupChat={handleSelectGroupChat}
        currentUser={{
          id: user.id,
          name: user.email || 'User',
          avatar: '👤',
          status: 'online'
        }}
        onAddContact={handleAddContact}
        onCreateGroup={handleCreateGroup}
        onSignOut={signOut}
      />
      
      {/* Main chat area with responsive padding */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0 relative z-10">
        <ChatArea
          contact={selectedContact}
          groupChat={selectedGroupChat}
          messages={currentMessages}
          currentUserId={user.id}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Index;
