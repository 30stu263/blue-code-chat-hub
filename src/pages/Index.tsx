
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useMessages } from '../hooks/useMessages';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { contacts, addContact } = useContacts();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const { messages, sendMessage } = useMessages(selectedContactId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedContact = contacts.find(c => c.contact_user_id === selectedContactId);

  const handleAddContact = async (username: string) => {
    const success = await addContact(username);
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar
        contacts={contacts}
        selectedContactId={selectedContactId}
        onSelectContact={setSelectedContactId}
        currentUser={{
          id: user.id,
          name: user.email || 'User',
          avatar: '👤',
          status: 'online'
        }}
        onAddContact={handleAddContact}
        onSignOut={signOut}
      />
      <ChatArea
        selectedContact={selectedContact}
        messages={messages}
        currentUserId={user.id}
        onSendMessage={sendMessage}
      />
    </div>
  );
};

export default Index;
