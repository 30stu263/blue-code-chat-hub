import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useMessages } from '../hooks/useMessages';
import { useGroupChats } from '../hooks/useGroupChats';
import { useGroupMessages } from '../hooks/useGroupMessages';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { contacts, addContact } = useContacts();
  const { groupChats, createGroupChat } = useGroupChats();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedGroupChatId, setSelectedGroupChatId] = useState<string | null>(null);
  const { messages: directMessages, sendMessage: sendDirectMessage } = useMessages(selectedContactId);
  const { messages: groupMessages, sendMessage: sendGroupMessage } = useGroupMessages(selectedGroupChatId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-select general chat on first load
  useEffect(() => {
    if (groupChats.length > 0 && !selectedContactId && !selectedGroupChatId) {
      const generalChat = groupChats.find(chat => chat.is_general);
      if (generalChat) {
        setSelectedGroupChatId(generalChat.id);
      }
    }
  }, [groupChats, selectedContactId, selectedGroupChatId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg font-medium">Loading your conversations...</div>
        </div>
      </div>
    );
  }

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
    return false

